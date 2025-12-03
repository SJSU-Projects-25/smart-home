Files Changed
Created
AWS_CONFIGURATION_JUSTIFICATION.md - Documentation for AWS S3/SQS configuration
Modified
backend/.env - Updated to use real AWS endpoints (S3, SQS) instead of LocalStack
backend/app/services/ingestion_service.py - S3 presigned URL generation with endpoint flexibility
backend/app/services/sqs_client.py - SQS client with configurable endpoints
