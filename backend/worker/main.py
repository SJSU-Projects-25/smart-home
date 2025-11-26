"""Worker entry point for processing SQS messages."""
import sys
from datetime import datetime
from uuid import UUID

import boto3
from app.core.config import Settings
from app.db.models import Alert, Device
from app.db.session import get_session_local
from app.services.ingestion_service import EventsRepository
from worker.model_runner import ModelRunner
from worker.sqs_loop import delete_message, parse_job, receive_messages


def process_job(
    job: dict,
    db_session,
    events_repo: EventsRepository,
    model_runner: ModelRunner,
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

    try:
        # Download audio from S3
        print(f"Downloading audio from S3: {settings.s3_bucket}/{s3_key}")
        response = s3_client.get_object(Bucket=settings.s3_bucket, Key=s3_key)
        wav_bytes = response["Body"].read()
        
        # Run inference
        decision_result = model_runner.predict(wav_bytes)
        
    except Exception as e:
        print(f"Error downloading or processing audio: {e}")
        # We might want to mark event as failed here
        return

    # Update event in MongoDB with scores and decision
    event_id = str(event["_id"])
    events_repo.update_event(
        event_id,
        scores=decision_result.get("scores"),
        decision=decision_result.get("type"),
        status="processed",
    )

    # Create alert in Postgres
    device = db_session.query(Device).filter(Device.id == device_id).first()
    if not device:
        print(f"Warning: Device not found: {device_id}")
        return

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

    print(f"Created alert {alert.id} for device {device_id}")


def main_loop(settings: Settings, db_session_factory, events_repo: EventsRepository, model_runner: ModelRunner):
    """Main worker loop."""
    print("Worker started. Listening for messages...")

    # Initialize S3 client
    s3_client = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        endpoint_url=settings.aws_s3_endpoint_url,
    )

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
                    process_job(job, db_session_factory(), events_repo, model_runner, settings, s3_client)

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


if __name__ == "__main__":
    # Initialize settings
    settings = Settings()

    # Initialize database session
    SessionLocal = get_session_local(settings)

    # Initialize MongoDB
    events_repo = EventsRepository(settings.mongo_uri)

    # Initialize model runner
    model_runner = ModelRunner()
    model_runner.load()

    # Start main loop
    try:
        main_loop(settings, SessionLocal, events_repo, model_runner)
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        sys.exit(1)
