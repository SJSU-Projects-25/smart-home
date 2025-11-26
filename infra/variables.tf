variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

# RDS Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "smart_home"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# S3 Variables
variable "s3_bucket_name" {
  description = "S3 bucket name for audio storage"
  type        = string
  default     = "smart-home-audio"
}

# SQS Variables
variable "sqs_queue_name" {
  description = "SQS queue name for ingestion jobs"
  type        = string
  default     = "ingest-queue"
}

# EC2/ECS Variables
variable "app_instance_type" {
  description = "EC2 instance type for application"
  type        = string
  default     = "t3.medium"
}

variable "app_min_size" {
  description = "Minimum number of instances in Auto Scaling Group"
  type        = number
  default     = 1
}

variable "app_max_size" {
  description = "Maximum number of instances in Auto Scaling Group"
  type        = number
  default     = 3
}

variable "app_desired_capacity" {
  description = "Desired number of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

# MongoDB Variables
variable "mongo_uri" {
  description = "MongoDB connection URI (can be DocumentDB or external MongoDB)"
  type        = string
  default     = ""
  sensitive   = true
}

# Tags
variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

