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
$COMPOSE_CMD -f docker-compose.local.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "📋 Setting up LocalStack (SQS queue and S3 bucket)..."

# Configure AWS CLI for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-west-2
export AWS_ENDPOINT_URL=http://localhost:4566

# Create SQS queue
echo "Creating SQS queue: ingest-queue"
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name ingest-queue \
    --region us-west-2 || echo "Queue may already exist"

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
    --region us-west-2 || echo "Bucket may already exist"

echo "✅ S3 Bucket created: smart-home-audio"

echo ""
echo "🗄️  Running database migrations..."
$COMPOSE_CMD -f docker-compose.local.yml exec api uv run alembic upgrade head

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

