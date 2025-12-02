#!/bin/bash
# Setup script for local development with Docker Compose

set -e

echo "🚀 Setting up Smart Home Cloud Platform (Local Development)"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ Error: docker-compose or docker is not installed"
    exit 1
fi

# Use docker compose (v2) if available, otherwise docker-compose (v1)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "📦 Starting Docker Compose services..."
$COMPOSE_CMD -f docker-compose.local.yml up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "📋 Setting up LocalStack (SQS queue and S3 bucket)..."

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
        echo "✅ LocalStack is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Waiting for LocalStack... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️  LocalStack did not become ready in time. Continuing anyway..."
fi

# Configure AWS CLI for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-west-2
export AWS_ENDPOINT_URL=http://localhost:4566

# Create SQS queue
echo "Creating SQS queue: ingest-queue"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name ingest-queue \
    --region us-west-2 2>/dev/null || echo "Queue may already exist"

# Get queue URL
QUEUE_URL=$(aws --endpoint-url=http://localhost:4566 sqs get-queue-url \
    --queue-name ingest-queue \
    --region us-west-2 \
    --query 'QueueUrl' \
    --output text 2>/dev/null || echo "")

if [ -n "$QUEUE_URL" ]; then
    echo "✅ SQS Queue created: $QUEUE_URL"
else
    echo "⚠️  Could not get queue URL (may need to wait for LocalStack)"
fi

# Create S3 bucket
echo "Creating S3 bucket: smart-home-audio"
aws --endpoint-url=http://localhost:4566 s3 mb \
    s3://smart-home-audio \
    --region us-west-2 2>/dev/null && echo "✅ S3 Bucket created: smart-home-audio" || echo "⚠️  Bucket may already exist or creation failed"

# Configure CORS for the S3 bucket
echo "📋 Configuring CORS for S3 bucket..."
CORS_CONFIG='{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:8000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'
echo "$CORS_CONFIG" > /tmp/cors-config.json
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket smart-home-audio \
    --cors-configuration file:///tmp/cors-config.json \
    && echo "✅ CORS configured for S3 bucket" \
    || echo "⚠️  Failed to configure CORS (may already be set)"

echo ""
echo "🗄️  Running database migrations..."
$COMPOSE_CMD -f docker-compose.local.yml exec api uv run alembic upgrade head

echo ""
echo "🌱 Seeding initial data..."
$COMPOSE_CMD -f docker-compose.local.yml exec api uv run python scripts/seed_data.py || echo "⚠️  Seed script failed or data already exists"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Services are running:"
echo "  - API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Postgres: localhost:5432"
echo "  - MongoDB: localhost:27017"
echo "  - LocalStack: http://localhost:4566"
echo ""
echo "To view logs: $COMPOSE_CMD -f docker-compose.local.yml logs -f"
echo "To stop: $COMPOSE_CMD -f docker-compose.local.yml down"
echo ""
echo "📋 Login Credentials (from seed data):"
echo "  - admin@gmail.com / admin123 (admin)"
echo "  - owner@example.com / owner123 (owner)"
echo "  - tech@example.com / tech123 (technician)"
echo "  - staff@example.com / staff123 (staff)"

