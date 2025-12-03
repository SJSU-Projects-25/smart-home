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
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    s3_bucket: str
    sqs_queue_url: str

    # LocalStack endpoints (optional, for local development)
    aws_sqs_endpoint_url: str | None = None
    aws_s3_endpoint_url: str | None = None
    # Frontend-accessible S3 endpoint (for presigned URLs in browser)
    aws_s3_endpoint_url_frontend: str | None = None

    # JWT
    jwt_secret: str = "dev-secret"
    jwt_algorithm: str = "HS256"

    # Frontend
    frontend_origin: str = "http://d3fe6gbiiqsn3r.cloudfront.net"

    # Email/SMTP (optional, for email notifications)
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_from_email: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


