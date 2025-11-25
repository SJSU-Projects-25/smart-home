"""SQS message receiving and processing loop."""
import json
from typing import Optional

import boto3
from botocore.exceptions import ClientError

from app.core.config import Settings


def get_sqs_client(settings: Settings):
    """Get SQS client."""
    client_kwargs = {
        "region_name": settings.aws_region,
        "aws_access_key_id": settings.aws_access_key_id,
        "aws_secret_access_key": settings.aws_secret_access_key,
    }
    if settings.aws_sqs_endpoint_url:
        client_kwargs["endpoint_url"] = settings.aws_sqs_endpoint_url

    return boto3.client("sqs", **client_kwargs)


def receive_messages(settings: Settings) -> list[dict]:
    """Receive messages from SQS queue."""
    sqs = get_sqs_client(settings)

    try:
        response = sqs.receive_message(
            QueueUrl=settings.sqs_queue_url,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,
            VisibilityTimeout=60,
        )
        return response.get("Messages", [])
    except ClientError as e:
        print(f"Error receiving messages from SQS: {str(e)}")
        return []


def delete_message(settings: Settings, receipt_handle: str) -> None:
    """Delete a message from SQS queue."""
    sqs = get_sqs_client(settings)

    try:
        sqs.delete_message(QueueUrl=settings.sqs_queue_url, ReceiptHandle=receipt_handle)
    except ClientError as e:
        print(f"Error deleting message from SQS: {str(e)}")


def parse_job(message: dict) -> Optional[dict]:
    """Parse job from SQS message."""
    try:
        body = json.loads(message["Body"])
        return {
            "receipt_handle": message["ReceiptHandle"],
            "s3_key": body["s3_key"],
            "home_id": body["home_id"],
            "device_id": body["device_id"],
            "timestamp": body["timestamp"],
        }
    except (KeyError, json.JSONDecodeError) as e:
        print(f"Error parsing job from message: {str(e)}")
        return None
