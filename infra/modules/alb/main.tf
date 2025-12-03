# ALB Module - Application Load Balancer for API

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

variable "security_groups" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "target_group_arn" {
  description = "Target group ARN"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = var.security_groups
  subnets            = var.subnet_ids

  enable_deletion_protection = false # TODO: Enable for production

  # TODO: Enable access logs
  # access_logs {
  #   bucket  = aws_s3_bucket.alb_logs.id
  #   enabled = true
  # }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-alb"
    }
  )
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = var.target_group_arn
  }
}

# HTTPS Listener
# HTTPS Listener (Disabled for dev without cert)
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = "443"
#   protocol          = "HTTPS"
#   # TODO: Add SSL certificate ARN
#   # ssl_policy      = "ELBSecurityPolicy-TLS-1-2-2017-01"
#   # certificate_arn = aws_acm_certificate.main.arn
# 
#   default_action {
#     type             = "forward"
#     target_group_arn = var.target_group_arn
#   }
# }

# TODO: Create ACM certificate for HTTPS
# resource "aws_acm_certificate" "main" {
#   domain_name       = "api.example.com"
#   validation_method = "DNS"
#   lifecycle {
#     create_before_destroy = true
#   }
# }

# Outputs
output "arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

# output "https_listener_arn" {
#   description = "HTTPS listener ARN"
#   value       = aws_lb_listener.https.arn
# }

