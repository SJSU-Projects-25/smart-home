# SQS Module - Message Queue for Ingestion Jobs

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "queue_name" {
  description = "SQS queue name"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# SQS Queue
resource "aws_sqs_queue" "main" {
  name = "${var.queue_name}-${var.environment}"

  # TODO: Configure visibility timeout based on job processing time
  visibility_timeout_seconds = 60

  # TODO: Configure message retention period
  message_retention_seconds = 345600 # 4 days

  # TODO: Configure dead letter queue
  # redrive_policy = jsonencode({
  #   deadLetterTargetArn = aws_sqs_queue.dlq.arn
  #   maxReceiveCount     = 3
  # })

  # TODO: Enable encryption
  # kms_master_key_id = aws_kms_key.sqs.id

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-${var.queue_name}"
    }
  )
}

# TODO: Create dead letter queue
# resource "aws_sqs_queue" "dlq" {
#   name = "${var.queue_name}-dlq-${var.environment}"
#   message_retention_seconds = 1209600 # 14 days
# }

# TODO: Configure queue policy for IAM access
# resource "aws_sqs_queue_policy" "main" { ... }

# Outputs
output "queue_url" {
  description = "SQS queue URL"
  value       = aws_sqs_queue.main.url
}

output "queue_arn" {
  description = "SQS queue ARN"
  value       = aws_sqs_queue.main.arn
}

output "queue_name" {
  description = "SQS queue name"
  value       = aws_sqs_queue.main.name
}

