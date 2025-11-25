"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # MongoDB
    mongo_uri: str

    # AWS Configuration
    aws_region: str = "us-west-2"
    aws_access_key_id: str
    aws_secret_access_key: str
    s3_bucket: str
    sqs_queue_url: str

    # LocalStack endpoints (optional, for local development)
    aws_sqs_endpoint_url: str | None = None
    aws_s3_endpoint_url: str | None = None

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"

    # Frontend
    frontend_origin: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


