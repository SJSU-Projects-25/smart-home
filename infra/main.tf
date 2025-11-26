terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO: Configure backend (S3 + DynamoDB for state locking)
  # backend "s3" {
  #   bucket         = "smart-home-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "us-west-2"
  #   dynamodb_table = "terraform-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "smart-home-cloud"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Network Module
module "network" {
  source = "./modules/network"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  availability_zones = var.availability_zones

  tags = var.tags
}

# RDS Module (PostgreSQL)
module "rds" {
  source = "./modules/rds"

  environment           = var.environment
  vpc_id               = module.network.vpc_id
  subnet_ids           = module.network.private_subnet_ids
  security_group_ids    = [module.network.rds_security_group_id]
  db_instance_class     = var.db_instance_class
  db_allocated_storage  = var.db_allocated_storage
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password

  tags = var.tags
}

# S3 Module (Audio Storage)
module "s3" {
  source = "./modules/s3"

  environment = var.environment
  bucket_name = var.s3_bucket_name

  tags = var.tags
}

# SQS Module (Ingestion Queue)
module "sqs" {
  source = "./modules/sqs"

  environment = var.environment
  queue_name  = var.sqs_queue_name

  tags = var.tags
}

# ECR Module (Container Registries)
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  repositories = [
    "smart-home-api",
    "smart-home-worker",
    "smart-home-frontend"
  ]

  tags = var.tags
}

# EC2 Application Module (API + Worker)
module "ec2_app" {
  source = "./modules/ec2_app"

  environment         = var.environment
  vpc_id             = module.network.vpc_id
  subnet_ids         = module.network.private_subnet_ids
  security_group_ids = [module.network.app_security_group_id]
  instance_type      = var.app_instance_type
  min_size           = var.app_min_size
  max_size           = var.app_max_size
  desired_capacity   = var.app_desired_capacity

  # ECR repository URLs
  api_ecr_repo    = module.ecr.repository_urls["smart-home-api"]
  worker_ecr_repo = module.ecr.repository_urls["smart-home-worker"]

  # Database connection
  database_url = module.rds.database_url
  mongo_uri    = var.mongo_uri # TODO: Add MongoDB module or use DocumentDB

  # AWS services
  s3_bucket_name     = module.s3.bucket_name
  sqs_queue_url      = module.sqs.queue_url
  aws_region         = var.aws_region

  tags = var.tags
}

# Application Load Balancer Module (API)
module "alb" {
  source = "./modules/alb"

  environment      = var.environment
  vpc_id          = module.network.vpc_id
  subnet_ids      = module.network.public_subnet_ids
  security_groups = [module.network.alb_security_group_id]
  target_group_arn = module.ec2_app.target_group_arn

  tags = var.tags
}

# CloudFront + S3 Module (Frontend)
module "cloudfront" {
  source = "./modules/cloudfront"

  environment = var.environment
  bucket_name = module.s3.frontend_bucket_name

  tags = var.tags
}

