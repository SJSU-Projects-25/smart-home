# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### Backend CI/CD (`backend.yml`)

**Triggers:**
- Push to `main` or `develop` branches (when `backend/` files change)
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

1. **Lint** - Code quality checks
   - Runs Ruff linter
   - Checks code formatting (Ruff format, Black)

2. **Type Check** - Type safety
   - Runs MyPy for type checking

3. **Test** - Unit and integration tests
   - Sets up PostgreSQL and MongoDB services
   - Runs database migrations
   - Executes pytest with coverage
   - Uploads coverage to Codecov

4. **Security Scan** - Security checks
   - Runs Bandit (security linter)
   - Runs Safety (dependency vulnerability check)
   - Uploads security reports as artifacts

5. **Build API** - Docker image build
   - Builds API Docker image
   - Tags with commit SHA and environment tag (`latest` for main, `develop` for develop)
   - Pushes to Amazon ECR

6. **Build Worker** - Docker image build
   - Builds Worker Docker image
   - Tags with commit SHA and environment tag
   - Pushes to Amazon ECR

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key for ECR
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for ECR

**Optional Secrets:**
- `CODECOV_TOKEN` - For coverage reporting

### Frontend CI/CD (`frontend.yml`)

**Triggers:**
- Push to `main` or `develop` branches (when `frontend/` files change)
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

1. **Lint** - Code quality checks
   - Runs ESLint
   - Checks code formatting

2. **Type Check** - Type safety
   - Runs TypeScript compiler (`tsc --noEmit`)

3. **Build** - Next.js build
   - Installs dependencies
   - Builds Next.js application
   - Uploads build artifacts

4. **Test** - Unit tests
   - Runs test suite with coverage
   - Uploads coverage to Codecov

5. **Security Scan** - Security checks
   - Runs `npm audit` for dependency vulnerabilities
   - Runs Snyk security scan (if token provided)

6. **Build Docker** - Docker image build
   - Builds Frontend Docker image
   - Tags with commit SHA and environment tag
   - Pushes to Amazon ECR

**Required Secrets:**
- `AWS_ACCESS_KEY_ID` - AWS access key for ECR
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for ECR
- `NEXT_PUBLIC_API_URL` - API URL for frontend build (optional, defaults to localhost)

**Optional Secrets:**
- `CODECOV_TOKEN` - For coverage reporting
- `SNYK_TOKEN` - For Snyk security scanning

### Infrastructure CI (`infra.yml`)

**Triggers:**
- Push to `main` or `develop` branches (when `infra/` files change)
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

1. **Terraform Format Check** - Code formatting
2. **Terraform Validate** - Syntax validation
3. **Terraform Plan** - Infrastructure plan generation

See `infra/README.md` for more details.

## Setup Instructions

### 1. Configure AWS Credentials

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `NEXT_PUBLIC_API_URL` - Your API URL (e.g., `https://api.example.com`)

### 2. Create ECR Repositories

The workflows expect the following ECR repositories:

- `smart-home-api` (for backend API)
- `smart-home-worker` (for backend worker)
- `smart-home-frontend` (for frontend)

Create these using Terraform (see `infra/modules/ecr/`) or manually:

```bash
aws ecr create-repository --repository-name smart-home-api --region us-west-2
aws ecr create-repository --repository-name smart-home-worker --region us-west-2
aws ecr create-repository --repository-name smart-home-frontend --region us-west-2
```

### 3. Optional: Configure Code Coverage

1. Sign up for [Codecov](https://codecov.io)
2. Add your repository
3. Add `CODECOV_TOKEN` secret to GitHub

### 4. Optional: Configure Snyk Security Scanning

1. Sign up for [Snyk](https://snyk.io)
2. Get your API token
3. Add `SNYK_TOKEN` secret to GitHub

## Workflow Behavior

### Branch Strategy

- **`main` branch**: Production builds tagged as `latest`
- **`develop` branch**: Development builds tagged as `develop`
- **Other branches**: Only lint, type-check, and test jobs run (no Docker builds)

### Docker Image Tagging

Images are tagged with:
- Commit SHA: `{repository}:{sha}`
- Environment tag: `{repository}:latest` (main) or `{repository}:develop` (develop)

Example:
- `smart-home-api:abc123def456` (commit SHA)
- `smart-home-api:latest` (main branch)
- `smart-home-api:develop` (develop branch)

### Conditional Execution

- Docker builds only run on `push` or `workflow_dispatch` events
- Tests and security scans run on all events (push, PR, manual)
- Deployment jobs are commented out (TODO: implement)

## Troubleshooting

### Build Failures

1. **ECR Authentication Issues**
   - Verify AWS credentials are correct
   - Check IAM permissions for ECR push

2. **Test Failures**
   - Check service health (Postgres, MongoDB)
   - Verify environment variables are set correctly

3. **Type Check Failures**
   - Run `mypy` or `tsc` locally to see errors
   - Fix type annotations

### Performance

- Workflows use caching for dependencies (Node.js npm cache, Python uv cache)
- Docker builds use Buildx for multi-platform support
- Artifacts are retained for 7-30 days

## Future Enhancements

- [ ] Add deployment jobs (Terraform apply, ECS service updates)
- [ ] Add notification on failures (Slack, email)
- [ ] Add performance testing
- [ ] Add E2E testing
- [ ] Add automated rollback on deployment failure
- [ ] Add staging environment deployment

## License

Educational project for CMPE 281.

