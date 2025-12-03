# ECR Module - Container Registries

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "repositories" {
  description = "List of ECR repository names"
  type        = list(string)
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

# ECR Repositories
resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)

  name                 = "${each.value}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  # TODO: Configure image scanning
  image_scanning_configuration {
    scan_on_push = true
  }

  # TODO: Configure lifecycle policy
  # lifecycle_policy {
  #   policy = jsonencode({
  #     rules = [{
  #       rulePriority = 1
  #       description  = "Keep last 10 images"
  #       selection = {
  #         tagStatus   = "any"
  #         countType   = "imageCountMoreThan"
  #         countNumber = 10
  #       }
  #       action = {
  #         type = "expire"
  #       }
  #     }]
  #   })
  # }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-${each.value}"
    }
  )
}

# TODO: Configure repository policies for cross-account access if needed
# resource "aws_ecr_repository_policy" "repos" { ... }

# Outputs
output "repository_urls" {
  description = "Map of repository names to repository URLs"
  value = {
    for repo in var.repositories : repo => aws_ecr_repository.repos[repo].repository_url
  }
}

output "repository_arns" {
  description = "Map of repository names to repository ARNs"
  value = {
    for repo in var.repositories : repo => aws_ecr_repository.repos[repo].arn
  }
}

