# AWS S3 & SQS Configuration Justification

## Summary
Your application is configured to use **REAL AWS** (not LocalStack). The environment variables are set to use actual AWS services in the `us-west-2` region.

---

## 1. Environment Configuration (.env)

### S3 Bucket Configuration
```dotenv
AWS_REGION=us-west-2
S3_BUCKET=cmpe281-smart-home-audio
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>

# NO LocalStack endpoint - pointing to real AWS
AWS_S3_ENDPOINT_URL=         # ← Empty = use real AWS S3
AWS_S3_ENDPOINT_URL_FRONTEND= # ← Empty = use real AWS S3
```

### SQS Queue Configuration
```dotenv
AWS_REGION=us-west-2
SQS_QUEUE_URL=https://sqs.us-west-2.amazonaws.com/<account-id>/ingest-queue

# NO LocalStack endpoint - pointing to real AWS
AWS_SQS_ENDPOINT_URL=         # ← Empty = use real AWS SQS
```

**Why empty?** When `endpoint_url` is empty/None in boto3, it automatically uses AWS regional endpoints.

---

## 2. S3 Client Configuration (ingestion_service.py)

```python
def create_presigned_url(
    settings: Settings,
    device_id: UUID,
    home_id: UUID,
    mime: str,
    expiration: int = 3600,
) -> tuple[str, str]:
    """Create a presigned S3 URL for upload."""
    
    # S3 client configuration
    s3_client_kwargs = {
        "region_name": settings.aws_region,                    # ← us-west-2
        "aws_access_key_id": settings.aws_access_key_id,       # ← Real AWS key
        "aws_secret_access_key": settings.aws_secret_access_key, # ← Real AWS secret
    }
    
    # ONLY add endpoint_url if it exists (for LocalStack override)
    if settings.aws_s3_endpoint_url:
        s3_client_kwargs["endpoint_url"] = settings.aws_s3_endpoint_url
    
    # settings.aws_s3_endpoint_url is EMPTY, so this is skipped
    # Result: boto3 uses REAL AWS S3 endpoints
    s3_client = boto3.client("s3", **s3_client_kwargs)
```

---

## 3. SQS Client Configuration (sqs_client.py)

```python
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
```

---

## 4. Configuration Architecture

```
┌─────────────────────────────────────────────────────┐
│            APPLICATION CODE                         │
│  (ingestion_service.py, sqs_client.py)             │
└──────────────────┬──────────────────────────────────┘
                   │
          Uses boto3 clients with:
          • region: us-west-2
          • credentials: from environment
          • NO endpoint_url override
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         AWS DEFAULT ENDPOINTS                       │
│                                                     │
│  S3: s3.us-west-2.amazonaws.com                   │
│  SQS: sqs.us-west-2.amazonaws.com                 │
│                                                     │
│  ✅ Real AWS (not LocalStack)                      │
└─────────────────────────────────────────────────────┘
```

---

## 5. Summary Table

| Service | Endpoint | Status |
|---------|----------|--------|
| **S3** | Real AWS (no override) | ✅ Connected |
| **SQS** | Real AWS (no override) | ✅ Connected |
| **LocalStack** | N/A | ❌ Not used |
| **PostgreSQL** | postgres:5432 | ✅ Local Docker |
| **MongoDB** | mongo:27017 | ✅ Local Docker |

---

## Verification Commands

```bash
# Confirm AWS credentials work
aws sts get-caller-identity --region us-west-2

# List S3 bucket contents
aws s3 ls s3://cmpe281-smart-home-audio/ --region us-west-2

# List SQS queues
aws sqs list-queues --region us-west-2
```
