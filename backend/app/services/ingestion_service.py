"""Data ingestion service."""
import uuid
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

import boto3
from botocore.exceptions import ClientError
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from app.core.config import Settings


class EventsRepository:
    """Repository for storing ingestion events in MongoDB."""

    def __init__(self, mongo_uri: str, database_name: str = "smart_home"):
        """Initialize MongoDB connection."""
        self.client = MongoClient(mongo_uri)
        self.db: Database = self.client[database_name]
        self.events: Collection = self.db["events"]

    def insert_event(
        self,
        timestamp: datetime,
        home_id: str,
        device_id: str,
        s3_key: str,
        duration_ms: Optional[int] = None,
        scores: Optional[dict] = None,
        decision: Optional[str] = None,
    ) -> str:
        """Insert an event document."""
        event_doc = {
            "timestamp": timestamp,
            "home_id": home_id,
            "device_id": device_id,
            "s3_key": s3_key,
            "duration_ms": duration_ms,
            "scores": scores,
            "decision": decision,
            "status": "pending" if duration_ms is None else "uploaded",
        }
        result = self.events.insert_one(event_doc)
        return str(result.inserted_id)

    def update_event(self, event_id: str, duration_ms: Optional[int] = None, **kwargs) -> bool:
        """Update an event document."""
        from bson import ObjectId

        update_data = {}
        if duration_ms is not None:
            update_data["duration_ms"] = duration_ms
            update_data["status"] = "uploaded"
        update_data.update(kwargs)
        result = self.events.update_one({"_id": ObjectId(event_id)}, {"$set": update_data})
        return result.modified_count > 0

    def get_event_by_s3_key(self, s3_key: str) -> Optional[dict]:
        """Get an event by S3 key."""
        return self.events.find_one({"s3_key": s3_key})


def get_mongo_client(settings: Settings) -> MongoClient:
    """Get MongoDB client."""
    return MongoClient(settings.mongo_uri)


def create_presigned_url(
    settings: Settings,
    device_id: UUID,
    home_id: UUID,
    mime: str,
    expiration: int = 3600,
) -> tuple[str, str]:
    """Create a presigned S3 URL for upload."""
    # Generate S3 key
    now = datetime.utcnow()
    file_uuid = str(uuid.uuid4())
    extension = "wav"  # Default, could be derived from mime type
    s3_key = f"audio-clips/{device_id}/{now.year}/{now.month:02d}/{now.day:02d}/{file_uuid}.{extension}"

    # Create S3 client
    s3_client_kwargs = {
        "region_name": settings.aws_region,
        "aws_access_key_id": settings.aws_access_key_id,
        "aws_secret_access_key": settings.aws_secret_access_key,
    }
    if settings.aws_s3_endpoint_url:
        s3_client_kwargs["endpoint_url"] = settings.aws_s3_endpoint_url

    s3_client = boto3.client("s3", **s3_client_kwargs)

    # Generate presigned URL
    try:
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={"Bucket": settings.s3_bucket, "Key": s3_key, "ContentType": mime},
            ExpiresIn=expiration,
        )
        return url, s3_key
    except ClientError as e:
        raise Exception(f"Failed to generate presigned URL: {str(e)}")


def insert_pending_event(
    events_repo: EventsRepository,
    home_id: UUID,
    device_id: UUID,
    s3_key: str,
) -> str:
    """Insert a pending event in MongoDB."""
    return events_repo.insert_event(
        timestamp=datetime.utcnow(),
        home_id=str(home_id),
        device_id=str(device_id),
        s3_key=s3_key,
    )


def confirm_upload(
    events_repo: EventsRepository,
    s3_key: str,
    device_id: UUID,
    home_id: UUID,
    duration_ms: Optional[int] = None,
) -> str:
    """Confirm upload and update event in MongoDB."""
    from bson import ObjectId

    event = events_repo.get_event_by_s3_key(s3_key)
    if not event:
        # Create new event if not found
        event_id = events_repo.insert_event(
            timestamp=datetime.utcnow(),
            home_id=str(home_id),
            device_id=str(device_id),
            s3_key=s3_key,
            duration_ms=duration_ms,
        )
    else:
        event_id = str(event["_id"])
        events_repo.update_event(event_id, duration_ms=duration_ms)

    return event_id
