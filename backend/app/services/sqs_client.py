"""SQS client for enqueueing inference jobs."""
import json
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from app.core.config import Settings

# Singleton SQS client
_sqs_client: Optional[object] = None


def get_sqs_client(settings: Settings):
    """Get or create singleton SQS client."""
    global _sqs_client
    if _sqs_client is None:
        client_kwargs = {
            "region_name": settings.aws_region,
            "aws_access_key_id": settings.aws_access_key_id,
            "aws_secret_access_key": settings.aws_secret_access_key,
        }
        if settings.aws_sqs_endpoint_url:
            client_kwargs["endpoint_url"] = settings.aws_sqs_endpoint_url

        _sqs_client = boto3.client("sqs", **client_kwargs)
    return _sqs_client


def enqueue_inference_job(
    settings: Settings,
    s3_key: str,
    home_id: str,
    device_id: str,
    ts: str,
) -> None:
    """Enqueue an inference job to SQS."""
    sqs = get_sqs_client(settings)

    message_body = {
        "s3_key": s3_key,
        "home_id": home_id,
        "device_id": device_id,
        "timestamp": ts,
    }

    try:
        sqs.send_message(
            QueueUrl=settings.sqs_queue_url,
            MessageBody=json.dumps(message_body),
        )
    except ClientError as e:
        raise Exception(f"Failed to enqueue job to SQS: {str(e)}")

