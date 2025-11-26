output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_database_url" {
  description = "RDS database connection URL"
  value       = module.rds.database_url
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for audio storage"
  value       = module.s3.bucket_name
}

output "sqs_queue_url" {
  description = "SQS queue URL"
  value       = module.sqs.queue_url
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.dns_name
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = module.alb.arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.domain_name
}

