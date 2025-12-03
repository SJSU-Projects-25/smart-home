"""Worker entry point for processing SQS messages."""
import sys
import multiprocessing
from multiprocessing.pool import TimeoutError
from datetime import datetime
from uuid import UUID

import boto3
from app.core.config import Settings
from app.db.models import Alert, Device, ModelConfig
from app.db.session import get_session_local
from app.services.ingestion_service import EventsRepository
from app.utils.model_mapping import ml_type_to_config_key
from worker.sqs_loop import delete_message, parse_job, receive_messages

# TensorFlow model is kept in a separate process to avoid memory corruption
_model_runner = None


def _init_model_runner():
    """Initialize TensorFlow model runner in the subprocess."""
    global _model_runner
    if _model_runner is None:
        from worker.model_runner import ModelRunner

        _model_runner = ModelRunner()
        _model_runner.load()


def _run_inference(wav_bytes: bytes) -> dict:
    """Run inference using the subprocess-held model runner."""
    global _model_runner
    if _model_runner is None:
        _init_model_runner()
    return _model_runner.predict(wav_bytes)


def process_job(
    job: dict,
    db_session_factory,
    events_repo: EventsRepository,
    inference_pool,
    settings: Settings,
    s3_client,
) -> None:
    """Process a single inference job."""
    print(f"Processing job: {job}")

    s3_key = job["s3_key"]
    home_id = UUID(job["home_id"])
    device_id = UUID(job["device_id"])

    # Get the event from MongoDB
    event = events_repo.get_event_by_s3_key(s3_key)
    if not event:
        print(f"Warning: Event not found for s3_key: {s3_key}")
        return

    # Create a session for this job
    db_session = db_session_factory()

    try:
        # Download audio from S3
        print(f"Downloading audio from S3: {settings.s3_bucket}/{s3_key}", flush=True)
        response = s3_client.get_object(Bucket=settings.s3_bucket, Key=s3_key)
        wav_bytes = response["Body"].read()
        
        # Run inference in isolated subprocess
        print(f"Running inference on {len(wav_bytes)} bytes (subprocess)...", flush=True)
        async_result = inference_pool.apply_async(_run_inference, (wav_bytes,))
        decision_result = async_result.get(timeout=60)
        print(f"Inference complete. Result: {decision_result}", flush=True)
    except TimeoutError:
        print("Error: Inference timed out", flush=True)
        return
    except Exception as e:
        print(f"Error downloading or processing audio: {e}", flush=True)
        # We might want to mark event as failed here
        return

    # Update event in MongoDB with scores and decision
    print(f"Updating event in MongoDB...", flush=True)
    event_id = str(event["_id"])
    events_repo.update_event(
        event_id,
        scores=decision_result.get("scores"),
        decision=decision_result.get("type"),
        status="processed",
    )
    print(f"Event updated in MongoDB", flush=True)

    # CRITICAL: Close the old database session to avoid TensorFlow memory corruption
    print("Closing old database session after TensorFlow inference...", flush=True)
    try:
        db_session.close()
    except:
        pass
    
    # Create a fresh database session
    print("Creating fresh database session...", flush=True)
    db_session = db_session_factory()
    print("Fresh database session created", flush=True)

    # Get device
    print(f"Looking up device {device_id}...", flush=True)
    try:
        device = db_session.query(Device).filter(Device.id == device_id).first()
    except Exception as e:
        print(f"Error querying device {device_id}: {e}", flush=True)
        db_session.close()
        return

    if not device:
        print(f"Warning: Device not found: {device_id}", flush=True)
        db_session.close()
        return
    print(f"Device found: {device.name if hasattr(device, 'name') else device_id}", flush=True)

    # Check model configuration before creating alert
    print(f"Checking model configuration...", flush=True)
    ml_type = decision_result["type"]
    config_key = ml_type_to_config_key(ml_type)
    
    if config_key:
        # Get model config for this detection type
        model_config = db_session.query(ModelConfig).filter(
            ModelConfig.home_id == home_id,
            ModelConfig.model_key == config_key
        ).first()
        
        # Check if model is enabled (TEMPORARILY DISABLED FOR TESTING)
        print(f"Checking model config for {config_key}: enabled={model_config.enabled if model_config else 'N/A'}", flush=True)
        # if model_config and not model_config.enabled:
        #     print(f"Model {config_key} is disabled, skipping alert creation")
        #     return
        
        # Check threshold (FORCED to 0.0 for testing, ignoring database config)
        threshold = 0.0  # model_config.threshold if model_config and model_config.threshold is not None else 0.0
        score = decision_result["score"]
        
        if score < threshold:
            print(f"Score {score:.3f} below threshold {threshold:.3f} for {config_key}, skipping alert")
            return
    else:
        # Unknown ML type, log warning but still create alert (backward compatibility)
        print(f"Warning: Unknown ML type '{ml_type}', no config check performed")

    # Create alert in Postgres
    alert = Alert(
        home_id=home_id,
        room_id=device.room_id,
        device_id=device_id,
        type=decision_result["type"],
        severity=decision_result["severity"],
        status="open",
        score=decision_result["score"],
        created_at=datetime.utcnow(),
    )

    db_session.add(alert)
    db_session.commit()
    db_session.refresh(alert)

    print(f"Created alert {alert.id} for device {device_id} (type: {ml_type}, score: {decision_result['score']:.3f})")

    # Send email notifications for high-severity alerts
    if decision_result["severity"] == "high":
        from app.services.email_service import notify_contacts_for_alert
        notifications_sent = notify_contacts_for_alert(db_session, alert, settings)
        if notifications_sent > 0:
            print(f"Sent {notifications_sent} email notification(s) for critical alert {alert.id}")
    
    # Close the database session
    db_session.close()
    print("Database session closed", flush=True)


def main_loop(settings: Settings, db_session_factory, events_repo: EventsRepository):
    """Main worker loop."""
    print("Worker started. Listening for messages...")

    # Create a dedicated process pool for TensorFlow inference
    mp_ctx = multiprocessing.get_context("spawn")
    inference_pool = mp_ctx.Pool(processes=1, initializer=_init_model_runner)

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        endpoint_url=settings.aws_s3_endpoint_url,
    )

    try:
        while True:
            try:
                messages = receive_messages(settings)
                if not messages:
                    continue

                for message in messages:
                    job = parse_job(message)
                    if not job:
                        # Delete malformed message
                        delete_message(settings, message["ReceiptHandle"])
                        continue

                    try:
                        # Process the job
                        process_job(job, db_session_factory, events_repo, inference_pool, settings, s3_client)

                        # Delete message after successful processing
                        delete_message(settings, job["receipt_handle"])
                    except Exception as e:
                        print(f"Error processing job: {str(e)}")
                        # Message will become visible again after VisibilityTimeout
                        # In production, you might want to track retry counts

            except KeyboardInterrupt:
                print("\nWorker stopped by user")
                break
            except Exception as e:
                print(f"Error in main loop: {str(e)}")
                import time

                time.sleep(5)  # Wait before retrying
    finally:
        inference_pool.terminate()
        inference_pool.join()


if __name__ == "__main__":
    print("Worker: Starting initialization...")
    # Initialize settings
    settings = Settings()
    print("Worker: Settings loaded")

    # Initialize database session
    SessionLocal = get_session_local(settings)
    print("Worker: Database session initialized")

    # Initialize MongoDB
    events_repo = EventsRepository(settings.mongo_uri)
    print("Worker: MongoDB repository initialized")

    # Start main loop
    try:
        main_loop(settings, SessionLocal, events_repo)
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)
