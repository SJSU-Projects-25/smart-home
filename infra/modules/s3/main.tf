# S3 Module - Audio Storage Bucket

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# S3 Bucket for Audio Storage
resource "aws_s3_bucket" "audio" {
  bucket = "${var.bucket_name}-${var.environment}"

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-audio-bucket"
    }
  )
}

# TODO: Enable versioning
# resource "aws_s3_bucket_versioning" "audio" {
#   bucket = aws_s3_bucket.audio.id
#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# TODO: Enable encryption
# resource "aws_s3_bucket_server_side_encryption_configuration" "audio" {
#   bucket = aws_s3_bucket.audio.id
#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }

# TODO: Configure CORS
resource "aws_s3_bucket_cors_configuration" "audio" {
  bucket = aws_s3_bucket.audio.id

  cors_rule {
    allowed_origins = ["*"] # TODO: Restrict to specific origins in production
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# TODO: Configure lifecycle policies
# resource "aws_s3_bucket_lifecycle_configuration" "audio" {
#   bucket = aws_s3_bucket.audio.id
#   rule {
#     id     = "delete_old_files"
#     status = "Enabled"
#     expiration {
#       days = 365
#     }
#   }
# }

# TODO: Configure bucket policy for restricted access
# resource "aws_s3_bucket_policy" "audio" { ... }

# S3 Bucket for Frontend (Static Website)
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.bucket_name}-frontend-${var.environment}"

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-frontend-bucket"
    }
  )
}

# TODO: Enable static website hosting
# resource "aws_s3_bucket_website_configuration" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#   index_document {
#     suffix = "index.html"
#   }
#   error_document {
#     key = "error.html"
#   }
# }

# Outputs
output "bucket_name" {
  description = "Audio bucket name"
  value       = aws_s3_bucket.audio.id
}

output "bucket_arn" {
  description = "Audio bucket ARN"
  value       = aws_s3_bucket.audio.arn
}

output "frontend_bucket_name" {
  description = "Frontend bucket name"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_arn" {
  description = "Frontend bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}

