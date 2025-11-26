# CloudFront Module - CDN for Frontend

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name for frontend"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "OAI for ${var.environment} frontend"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.environment} frontend distribution"
  default_root_object = "index.html"

  # S3 Origin
  origin {
    domain_name = data.aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${var.bucket_name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.bucket_name}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # TODO: Configure custom error responses for SPA routing
  # custom_error_response {
  #   error_code         = 404
  #   response_code      = 200
  #   response_page_path = "/index.html"
  # }

  # TODO: Add custom domain and SSL certificate
  # aliases = ["app.example.com"]
  # viewer_certificate {
  #   acm_certificate_arn      = aws_acm_certificate.main.arn
  #   ssl_support_method       = "sni-only"
  #   minimum_protocol_version = "TLSv1.2_2021"
  # }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # TODO: Configure price class
  price_class = "PriceClass_100" # Use only North America and Europe

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-cloudfront"
    }
  )
}

# S3 Bucket Policy for CloudFront OAI
# TODO: Create bucket policy to allow CloudFront access
# data "aws_iam_policy_document" "s3_policy" {
#   statement {
#     actions   = ["s3:GetObject"]
#     resources = ["${aws_s3_bucket.frontend.arn}/*"]
#     principals {
#       type        = "AWS"
#       identifiers = [aws_cloudfront_origin_access_identity.main.iam_arn]
#     }
#   }
# }
# resource "aws_s3_bucket_policy" "frontend" {
#   bucket = aws_s3_bucket.frontend.id
#   policy = data.aws_iam_policy_document.s3_policy.json
# }

# Reference to S3 bucket (should be created in S3 module)
# TODO: Import or reference the frontend bucket from S3 module
data "aws_s3_bucket" "frontend" {
  bucket = var.bucket_name
}

# Outputs
output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

