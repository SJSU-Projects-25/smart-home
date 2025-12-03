# Development Environment Variables

environment = "dev"
aws_region  = "us-west-2"

vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-west-2a", "us-west-2b"]

# RDS Configuration
db_instance_class    = "db.t3.micro"
db_allocated_storage  = 20
db_name              = "smart_home"
db_username          = "postgres"
# db_password should be set via environment variable or secrets manager
db_password = "d6FgLLecP7MjD6M1oibr0Q"

# S3 Configuration
s3_bucket_name = "smart-home-audio-dev-ganeshthampi"

# SQS Configuration
sqs_queue_name = "ingest-queue-dev"

# EC2/Application Configuration
app_instance_type  = "m7i-flex.large"
app_min_size       = 1
app_max_size       = 3
app_desired_capacity = 2

# MongoDB (TODO: Use DocumentDB or external MongoDB)
mongo_uri = "mongodb://10.0.1.173:27017" # Currently running on worker instance i-0af0d8de9286bb55a

# Additional Tags
tags = {
  Environment = "dev"
  Project     = "smart-home-cloud"
}

