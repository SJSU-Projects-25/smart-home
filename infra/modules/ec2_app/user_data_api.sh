#!/bin/bash
set -e

# Update and install Docker
yum update -y
amazon-linux-extras install docker -y
service docker start
usermod -a -G docker ec2-user

# Authenticate with ECR
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin $(echo ${ecr_repo} | cut -d/ -f1)

# Pull and run API container
docker pull ${ecr_repo}:latest

docker run -d \
  --name smart-home-api \
  --restart always \
  -p 8000:8000 \
  -e DATABASE_URL="${database_url}" \
  -e MONGO_URI="${mongo_uri}" \
  -e S3_BUCKET="${s3_bucket}" \
  -e SQS_QUEUE_URL="${sqs_queue}" \
  -e AWS_REGION="${aws_region}" \
  ${ecr_repo}:latest
