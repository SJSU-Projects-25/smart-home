# EC2 Application Module - Auto Scaling Group for API and Worker

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "min_size" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of instances"
  type        = number
  default     = 3
}

variable "desired_capacity" {
  description = "Desired number of instances"
  type        = number
  default     = 2
}

variable "api_ecr_repo" {
  description = "ECR repository URL for API"
  type        = string
}

variable "worker_ecr_repo" {
  description = "ECR repository URL for Worker"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "mongo_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS queue URL"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# TODO: Create IAM role for EC2 instances
# resource "aws_iam_role" "ec2" {
#   name = "${var.environment}-ec2-role"
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Action = "sts:AssumeRole"
#       Effect = "Allow"
#       Principal = {
#         Service = "ec2.amazonaws.com"
#       }
#     }]
#   })
# }

# TODO: Attach policies for ECR, S3, SQS access
# resource "aws_iam_role_policy_attachment" "ecr" { ... }
# resource "aws_iam_role_policy_attachment" "s3" { ... }
# resource "aws_iam_role_policy_attachment" "sqs" { ... }

# TODO: Create instance profile
# resource "aws_iam_instance_profile" "ec2" { ... }

# TODO: Get latest AMI (Amazon Linux 2 or Ubuntu)
data "aws_ami" "latest" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Launch Template for API
resource "aws_launch_template" "api" {
  name_prefix   = "${var.environment}-api-"
  image_id      = data.aws_ami.latest.id
  instance_type = var.instance_type

  vpc_security_group_ids = var.security_group_ids

  # TODO: Configure user data script to:
  # - Install Docker
  # - Login to ECR
  # - Pull and run API container
  # - Set environment variables
  # user_data = base64encode(templatefile("${path.module}/user_data_api.sh", {
  #   ecr_repo     = var.api_ecr_repo
  #   database_url = var.database_url
  #   mongo_uri   = var.mongo_uri
  #   s3_bucket   = var.s3_bucket_name
  #   sqs_queue   = var.sqs_queue_url
  #   aws_region  = var.aws_region
  # }))

  # TODO: Add IAM instance profile
  # iam_instance_profile {
  #   name = aws_iam_instance_profile.ec2.name
  # }

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.tags,
      {
        Name = "${var.environment}-api"
        Type = "api"
      }
    )
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-api-launch-template"
    }
  )
}

# Launch Template for Worker
resource "aws_launch_template" "worker" {
  name_prefix   = "${var.environment}-worker-"
  image_id      = data.aws_ami.latest.id
  instance_type = var.instance_type

  vpc_security_group_ids = var.security_group_ids

  # TODO: Configure user data script for worker
  # user_data = base64encode(templatefile("${path.module}/user_data_worker.sh", {
  #   ecr_repo     = var.worker_ecr_repo
  #   database_url = var.database_url
  #   mongo_uri   = var.mongo_uri
  #   sqs_queue   = var.sqs_queue_url
  #   aws_region  = var.aws_region
  # }))

  tag_specifications {
    resource_type = "instance"
    tags = merge(
      var.tags,
      {
        Name = "${var.environment}-worker"
        Type = "worker"
      }
    )
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-worker-launch-template"
    }
  )
}

# Auto Scaling Group for API
resource "aws_autoscaling_group" "api" {
  name                = "${var.environment}-api-asg"
  vpc_zone_identifier = var.subnet_ids
  target_group_arns   = [aws_lb_target_group.api.arn]
  health_check_type   = "ELB"
  health_check_grace_period = 300

  min_size         = var.min_size
  max_size         = var.max_size
  desired_capacity = var.desired_capacity

  launch_template {
    id      = aws_launch_template.api.id
    version = "$Latest"
  }

  # TODO: Configure scaling policies
  # resource "aws_autoscaling_policy" "api_scale_up" { ... }
  # resource "aws_autoscaling_policy" "api_scale_down" { ... }

  tag {
    key                 = "Name"
    value               = "${var.environment}-api"
    propagate_at_launch = true
  }
}

# Auto Scaling Group for Worker
resource "aws_autoscaling_group" "worker" {
  name                = "${var.environment}-worker-asg"
  vpc_zone_identifier = var.subnet_ids
  health_check_type   = "EC2"
  health_check_grace_period = 300

  min_size         = var.min_size
  max_size         = var.max_size
  desired_capacity = var.desired_capacity

  launch_template {
    id      = aws_launch_template.worker.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.environment}-worker"
    propagate_at_launch = true
  }
}

# Target Group for API (used by ALB)
resource "aws_lb_target_group" "api" {
  name     = "${var.environment}-api-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/healthz"
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-api-target-group"
    }
  )
}

# Outputs
output "api_asg_id" {
  description = "API Auto Scaling Group ID"
  value       = aws_autoscaling_group.api.id
}

output "worker_asg_id" {
  description = "Worker Auto Scaling Group ID"
  value       = aws_autoscaling_group.worker.id
}

output "target_group_arn" {
  description = "Target group ARN for API"
  value       = aws_lb_target_group.api.arn
}

