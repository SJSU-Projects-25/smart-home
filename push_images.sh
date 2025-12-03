#!/bin/bash
set -e

REGION="us-west-2"
ACCOUNT_ID="272751719929"
ECR_URL="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Authenticate
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ECR_URL}

# Tag and Push API
docker tag smart-home-api:latest ${ECR_URL}/smart-home-api-dev:latest
docker push ${ECR_URL}/smart-home-api-dev:latest

# Tag and Push Worker
docker tag smart-home-worker:latest ${ECR_URL}/smart-home-worker-dev:latest
docker push ${ECR_URL}/smart-home-worker-dev:latest

# Tag and Push Frontend
docker tag smart-home-frontend:latest ${ECR_URL}/smart-home-frontend-dev:latest
docker push ${ECR_URL}/smart-home-frontend-dev:latest

echo "All images pushed successfully!"
