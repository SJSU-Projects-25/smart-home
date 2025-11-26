# Smart Home Cloud Platform

A comprehensive cloud-based platform for managing smart home devices, monitoring alerts, and processing audio events using AI/ML models.

## 🏗️ Architecture

This project consists of three main components:

- **Backend API** (FastAPI) - RESTful API for device management, alerts, ingestion, and admin operations
- **Frontend** (Next.js 14) - React-based dashboard with role-based access control
- **Worker** (Python) - Background worker for processing audio events via SQS

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Docker** and **Docker Compose** (v2 recommended)
- **AWS CLI** (for LocalStack setup)
- **Node.js** 18+ (for local frontend development, optional)
- **Python** 3.11+ (for local backend development, optional)

## Quick Start

### One-Command Setup

Run the setup script to start all services and configure the environment:

```bash
./setup-local.sh
```

This script will:
1. Start all Docker services (Postgres, MongoDB, LocalStack, API, Worker, Frontend)
2. Wait for services to be ready
3. Create SQS queue (`ingest-queue`)
4. Create S3 bucket (`smart-home-audio`)
5. Configure CORS for S3 bucket
6. Run database migrations
7. Seed initial data (users, homes, devices, alerts, etc.)

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Start services
docker-compose -f docker-compose.local.yml up -d

# 2. Wait for LocalStack to be ready
curl http://localhost:4566/_localstack/health

# 3. Create SQS queue
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 sqs create-queue \
    --queue-name ingest-queue --region us-west-2

# 4. Create S3 bucket
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 s3 mb \
    s3://smart-home-audio --region us-west-2

# 5. Configure CORS for S3
cat > /tmp/cors-config.json << 'EOF'
{
  "CORSRules": [{
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:8000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }]
}
EOF
AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test \
aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket smart-home-audio --cors-configuration file:///tmp/cors-config.json

# 6. Run migrations
docker-compose -f docker-compose.local.yml exec api uv run alembic upgrade head

# 7. Seed data
docker-compose -f docker-compose.local.yml exec api uv run python scripts/seed_data.py
```

## Project Structure

```
smart-home/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Configuration and security
│   │   ├── db/              # Database models and session
│   │   ├── routers/         # API route handlers
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app entry point
│   ├── worker/              # Background worker
│   ├── migrations/          # Alembic migrations
│   ├── scripts/             # Utility scripts (seed, etc.)
│   ├── pyproject.toml       # Python dependencies
│   └── Dockerfile.api        # API Docker image
│   └── Dockerfile.worker     # Worker Docker image
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js App Router pages
│   ├── src/
│   │   ├── api/             # RTK Query API endpoints
│   │   ├── components/      # React components
│   │   ├── store/           # Redux store
│   │   ├── theme/           # MUI theme
│   │   ├── types/           # TypeScript types
│   │   └── ws/              # WebSocket hooks
│   ├── package.json
│   └── Dockerfile.frontend   # Frontend Docker image
├── docker-compose.local.yml  # Local development setup
├── setup-local.sh           # One-command setup script
└── README.md                 # This file
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for PostgreSQL
- **Alembic** - Database migrations
- **PostgreSQL** - Primary database
- **MongoDB** - Event storage
- **Boto3** - AWS SDK (S3, SQS)
- **PyJWT** - JWT authentication
- **bcrypt** - Password hashing
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Material UI (MUI v5)** - UI component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **MUI DataGrid** - Data tables

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **LocalStack** - Local AWS services (S3, SQS)

## Environment Variables

### Backend API & Worker

Create a `.env` file in the `backend/` directory or set these in `docker-compose.local.yml`:

```bash
# Database
DATABASE_URL=postgresql+psycopg2://postgres:postgres@postgres:5432/smart_home

# MongoDB
MONGO_URI=mongodb://mongo:27017/smart_home

# AWS Configuration
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET=smart-home-audio
SQS_QUEUE_URL=http://localstack:4566/000000000000/ingest-queue

# LocalStack endpoints (for internal Docker communication)
AWS_SQS_ENDPOINT_URL=http://localstack:4566
AWS_S3_ENDPOINT_URL=http://localstack:4566

# Frontend-accessible S3 endpoint (for presigned URLs)
AWS_S3_ENDPOINT_URL_FRONTEND=http://localhost:4566

# JWT
JWT_SECRET=changeme-in-production
JWT_ALGORITHM=HS256

# CORS
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development Setup

### Running Services

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Stop all services
docker-compose -f docker-compose.local.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.local.yml down -v
```

### Backend Development

```bash
# Run migrations
docker-compose -f docker-compose.local.yml exec api uv run alembic upgrade head

# Create new migration
docker-compose -f docker-compose.local.yml exec api uv run alembic revision --autogenerate -m "description"

# Seed data
docker-compose -f docker-compose.local.yml exec api uv run python scripts/seed_data.py

# Re-seed (clears existing data)
docker-compose -f docker-compose.local.yml exec api uv run python scripts/seed_data.py --force

# Access API shell
docker-compose -f docker-compose.local.yml exec api bash

# View API logs
docker-compose -f docker-compose.local.yml logs -f api
```

### Frontend Development

```bash
# Run locally (outside Docker)
cd frontend
npm install
npm run dev

# Or run in Docker
docker-compose -f docker-compose.local.yml up frontend
```

### Database Access

```bash
# PostgreSQL
docker-compose -f docker-compose.local.yml exec postgres psql -U postgres -d smart_home

# MongoDB
docker-compose -f docker-compose.local.yml exec mongo mongosh smart_home
```

#### MongoDB Web UI (Mongo Express)

Mongo Express provides a web-based interface to inspect MongoDB data locally.

- **URL**: http://localhost:8081
- **Username**: `admin`
- **Password**: `admin`

**MongoDB Collections:**

The application uses the `smart_home` database with the following collections:

- **events** - Audio ingestion events, processing status, and results
  - Stores event documents with fields: `timestamp`, `home_id`, `device_id`, `s3_key`, `duration_ms`, `scores`, `decision`, `status`
  - Used by the ingestion service and worker for tracking audio uploads and processing

Additional collections (telemetry, audit_logs) may be added as the platform evolves.

## API Documentation

Once the API is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login

#### Devices
- `GET /devices?home_id={id}` - List devices
- `POST /devices` - Create device
- `PATCH /devices/{id}` - Update device
- `DELETE /devices/{id}` - Delete device
- `POST /devices/{id}/heartbeat` - Device heartbeat

#### Alerts
- `GET /alerts?home_id={id}&status={status}` - List alerts
- `GET /alerts/{id}` - Get alert details
- `POST /alerts/{id}/ack` - Acknowledge alert
- `POST /alerts/{id}/escalate` - Escalate alert
- `POST /alerts/{id}/close` - Close alert

#### Ingestion
- `POST /ingest` - Get presigned S3 URL
- `POST /ingest/confirm` - Confirm upload and enqueue job

#### Admin (Admin role only)
- `GET /admin/users` - List all users
- `POST /admin/users` - Create user
- `PATCH /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/homes` - List all homes
- `POST /admin/homes` - Create home
- `PATCH /admin/homes/{id}` - Update home
- `DELETE /admin/homes/{id}` - Delete home

#### Operations (Staff/Admin role)
- `GET /ops/overview` - Operations overview statistics
- `GET /ops/houses` - List all homes with statistics
- `GET /ops/audit` - Audit logs

## Database Schema

### Core Tables

- **users** - User accounts (owner, technician, staff, admin)
- **homes** - Smart homes
- **rooms** - Rooms within homes
- **devices** - IoT devices (microphones, cameras)
- **alerts** - Security alerts
- **contacts** - Emergency contacts
- **policies** - Alert policies (quiet hours, escalation)
- **model_configs** - ML model configurations per home
- **assignments** - User-home assignments (for technicians/staff)

See `backend/migrations/versions/` for the complete schema.

## Login Credentials

After running the seed script, you can login with:

| Email | Password | Role |
|-------|----------|------|
| admin@gmail.com | admin123 | Admin |
| owner@example.com | owner123 | Owner |
| tech@example.com | tech123 | Technician |
| staff@example.com | staff123 | Staff |

## Role-Based Access

### Owner
- View own home's alerts, devices, models
- Manage alert contacts and policies
- Configure detection models

### Technician
- View assigned homes
- Manage devices (CRUD)
- Upload test clips
- View device network status

### Staff (Operations)
- View all homes and alerts
- Manage escalated alerts
- View audit logs
- Configure global model defaults

### Admin
- Full access to all features
- User management
- Home management
- All Owner and Staff features

## Troubleshooting

### Services won't start
```bash
# Check service status
docker-compose -f docker-compose.local.yml ps

# View logs
docker-compose -f docker-compose.local.yml logs

# Restart services
docker-compose -f docker-compose.local.yml restart
```

### Database connection errors
```bash
# Check if Postgres is running
docker-compose -f docker-compose.local.yml ps postgres

# Test connection
docker-compose -f docker-compose.local.yml exec api python -c "from app.db.session import get_session_local; from app.core.config import Settings; db = get_session_local(Settings())(); print('Connected!')"
```

### LocalStack issues
```bash
# Check LocalStack health
curl http://localhost:4566/_localstack/health

# Recreate S3 bucket and CORS
./setup-local.sh
```

### Frontend can't connect to API
- Verify `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`
- Check if API is running: `curl http://localhost:8000/healthz`
- Check browser console for CORS errors

### Presigned URL issues
- Ensure CORS is configured on S3 bucket
- Verify `AWS_S3_ENDPOINT_URL_FRONTEND=http://localhost:4566` is set
- Check that LocalStack is accessible on `localhost:4566`

## Development Workflow

1. **Make changes** to backend or frontend code
2. **Restart services** if needed: `docker-compose -f docker-compose.local.yml restart api`
3. **Run migrations** if schema changed: `docker-compose -f docker-compose.local.yml exec api uv run alembic upgrade head`
4. **Test** via API docs or frontend UI

## Production Deployment

For production deployment:

1. Update environment variables (use real AWS credentials, not LocalStack)
2. Set strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use production-grade databases (managed Postgres/MongoDB)
5. Set up proper monitoring and logging
6. Configure SSL/TLS certificates
7. Use environment-specific docker-compose files

## License

This project is for educational purposes (CMPE 281).

## Support

For issues or questions, please refer to the project documentation or contact the development team.
