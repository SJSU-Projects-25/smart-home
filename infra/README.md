# Infrastructure as Code - Terraform

Terraform configuration for deploying the Smart Home Cloud Platform to AWS.

## 📋 Structure

```
infra/
├── main.tf              # Main configuration wiring modules
├── variables.tf          # Root variables
├── outputs.tf           # Root outputs
├── envs/
│   └── dev.tfvars       # Development environment variables
├── modules/
│   ├── network/         # VPC, subnets, security groups
│   ├── rds/             # PostgreSQL database
│   ├── s3/              # S3 buckets (audio, frontend)
│   ├── sqs/             # SQS queue
│   ├── ecr/             # ECR repositories
│   ├── ec2_app/         # EC2 Auto Scaling Groups
│   ├── alb/             # Application Load Balancer
│   └── cloudfront/      # CloudFront distribution
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Terraform** >= 1.5.0
- **AWS CLI** configured with credentials
- **AWS Account** with appropriate permissions

### Setup

1. **Configure AWS credentials:**

```bash
aws configure
# Or set environment variables:
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

2. **Set variables:**

Edit `envs/dev.tfvars` with your values:

```hcl
db_password = "your-secure-password"
mongo_uri   = "mongodb://..."
```

3. **Initialize Terraform:**

```bash
cd infra
terraform init
```

4. **Plan changes:**

```bash
terraform plan -var-file=envs/dev.tfvars
```

5. **Apply (when ready):**

```bash
terraform apply -var-file=envs/dev.tfvars
```

## 📦 Modules

### Network Module

Creates:
- VPC with public and private subnets
- Internet Gateway
- Security groups (ALB, App, RDS)
- Route tables

**TODO:**
- Add NAT Gateway for private subnets
- Configure additional security groups
- Add VPC endpoints for AWS services

### RDS Module

Creates:
- PostgreSQL RDS instance
- DB subnet group
- Security group rules

**TODO:**
- Enable Multi-AZ for production
- Configure automated backups
- Enable Performance Insights
- Add read replicas

### S3 Module

Creates:
- Audio storage bucket
- Frontend static website bucket
- CORS configuration

**TODO:**
- Enable versioning
- Configure lifecycle policies
- Add bucket policies
- Enable encryption

### SQS Module

Creates:
- SQS queue for ingestion jobs

**TODO:**
- Configure dead letter queue
- Add queue policies
- Enable encryption

### ECR Module

Creates:
- ECR repositories for API, Worker, Frontend

**TODO:**
- Configure lifecycle policies
- Add repository policies

### EC2 App Module

Creates:
- Launch templates for API and Worker
- Auto Scaling Groups
- Target group for ALB

**TODO:**
- Create IAM roles and policies
- Configure user data scripts
- Add scaling policies
- Configure health checks

### ALB Module

Creates:
- Application Load Balancer
- HTTP and HTTPS listeners
- Target group integration

**TODO:**
- Add ACM certificate
- Configure access logs
- Add WAF rules

### CloudFront Module

Creates:
- CloudFront distribution
- Origin Access Identity
- S3 origin configuration

**TODO:**
- Add custom domain
- Configure SSL certificate
- Add custom error pages for SPA

## 🔐 Security Considerations

**Before production deployment:**

1. **Secrets Management:**
   - Use AWS Secrets Manager for passwords
   - Store sensitive variables securely
   - Never commit secrets to git

2. **Network Security:**
   - Enable VPC Flow Logs
   - Configure WAF on ALB
   - Restrict security group rules

3. **Encryption:**
   - Enable encryption at rest (RDS, S3)
   - Enable encryption in transit (TLS)
   - Use KMS for key management

4. **Access Control:**
   - Use IAM roles, not users
   - Enable MFA
   - Follow least privilege principle

## 🚢 Deployment Workflow

### Development

```bash
terraform workspace select dev
terraform plan -var-file=envs/dev.tfvars
terraform apply -var-file=envs/dev.tfvars
```

### Production

```bash
terraform workspace select prod
terraform plan -var-file=envs/prod.tfvars
terraform apply -var-file=envs/prod.tfvars
```

## 📝 State Management

**TODO: Configure remote state:**

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "smart-home-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

## 🔄 CI/CD Integration

GitHub Actions workflow (`.github/workflows/infra.yml`) includes:

- **terraform fmt** - Format check
- **terraform validate** - Syntax validation
- **terraform plan** - Plan generation

**TODO:**
- Add terraform apply (with manual approval)
- Add state locking
- Add plan comments on PRs

## 💰 Cost Estimation

Run cost estimation:

```bash
terraform plan -var-file=envs/dev.tfvars
# Review the plan output for resource costs
```

**Estimated monthly costs (dev environment):**
- RDS (db.t3.micro): ~$15
- EC2 (t3.medium x2): ~$60
- ALB: ~$20
- S3: ~$5
- CloudFront: ~$5
- **Total: ~$105/month**

## 🛠️ Common Commands

```bash
# Initialize
terraform init

# Format code
terraform fmt -recursive

# Validate
terraform validate

# Plan
terraform plan -var-file=envs/dev.tfvars

# Apply
terraform apply -var-file=envs/dev.tfvars

# Destroy (careful!)
terraform destroy -var-file=envs/dev.tfvars

# Show state
terraform show

# List resources
terraform state list
```

## 📚 Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/language/modules/develop/index.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## ⚠️ Important Notes

1. **This is a skeleton** - Most resources have TODO comments
2. **Not production-ready** - Requires completion of TODOs
3. **Test thoroughly** - Before deploying to production
4. **Cost monitoring** - Set up billing alerts
5. **Backup strategy** - Configure RDS backups and S3 versioning

## License

Educational project for CMPE 281.

