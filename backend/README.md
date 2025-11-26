# Smart Home Cloud Platform - Backend API

FastAPI-based backend service for the Smart Home Cloud Platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Authentication](#authentication)
- [Services](#services)

## Overview

The backend provides a RESTful API for:
- User authentication and authorization (JWT-based)
- Device management (CRUD operations)
- Alert management (create, acknowledge, escalate, close)
- Audio ingestion (presigned S3 URLs, SQS job queuing)
- Settings management (contacts, policies)
- Model configuration management
- Admin operations (user and home management)
- Operations dashboard (statistics, audit logs)

## Technology Stack

- **FastAPI** 0.104+ - Modern, fast web framework
- **SQLAlchemy** 2.0+ - ORM for PostgreSQL
- **Alembic** - Database migrations
- **PostgreSQL** - Primary relational database
- **MongoDB** - Event storage (NoSQL)
- **Boto3** - AWS SDK for S3 and SQS
- **PyJWT** - JWT token handling
- **bcrypt** - Password hashing
- **Pydantic** - Data validation and settings
- **Uvicorn** - ASGI server

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings and configuration
│   │   └── security.py        # Password hashing, JWT
│   ├── db/
│   │   ├── base.py            # SQLAlchemy Base
│   │   ├── models.py          # Database models
│   │   └── session.py         # Database session factory
│   ├── routers/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── devices.py         # Device CRUD
│   │   ├── alerts.py          # Alert management
│   │   ├── ingest.py          # Audio ingestion
│   │   ├── settings.py        # Contacts and policies
│   │   ├── models_cfg.py     # Model configurations
│   │   ├── admin.py          # Admin operations
│   │   ├── ops.py            # Operations dashboard
│   │   ├── users.py          # User endpoints
│   │   ├── assignments.py   # Assignment endpoints
│   │   └── ws.py             # WebSocket endpoints
│   ├── schemas/
│   │   ├── auth.py           # Auth request/response schemas
│   │   ├── devices.py        # Device schemas
│   │   ├── alerts.py         # Alert schemas
│   │   ├── ingest.py         # Ingestion schemas
│   │   ├── settings.py      # Settings schemas
│   │   ├── models_cfg.py    # Model config schemas
│   │   ├── users.py         # User schemas
│   │   └── homes.py         # Home schemas
│   ├── services/
│   │   ├── auth_service.py      # Authentication logic
│   │   ├── device_service.py    # Device business logic
│   │   ├── alert_service.py      # Alert business logic
│   │   ├── ingestion_service.py # S3 presigned URLs, MongoDB events
│   │   ├── settings_service.py   # Contacts and policies
│   │   ├── model_config_service.py # Model configs
│   │   ├── user_service.py       # User management
│   │   ├── home_service.py      # Home management
│   │   ├── ops_service.py       # Operations statistics
│   │   └── sqs_client.py        # SQS client wrapper
│   ├── deps.py              # FastAPI dependencies (auth, DB)
│   └── main.py              # FastAPI app entry point
├── worker/
│   ├── main.py              # Worker entry point
│   ├── sqs_loop.py         # SQS message receiving
│   └── model_runner.py     # ML model execution
├── migrations/              # Alembic migration files
├── scripts/
│   ├── seed_users.py       # Basic user seeding
│   └── seed_data.py        # Comprehensive data seeding
├── pyproject.toml          # Python dependencies
├── alembic.ini             # Alembic configuration
├── Dockerfile.api          # API Docker image
└── Dockerfile.worker       # Worker Docker image
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- MongoDB 7+
- Docker and Docker Compose (recommended)

### Local Development

1. **Install dependencies** (using `uv` or `pip`):

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -e .
```

2. **Set up environment variables**:

Create a `.env` file in the `backend/` directory:

```bash
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/smart_home
MONGO_URI=mongodb://localhost:27017/smart_home
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET=smart-home-audio
SQS_QUEUE_URL=http://localhost:4566/000000000000/ingest-queue
AWS_SQS_ENDPOINT_URL=http://localhost:4566
AWS_S3_ENDPOINT_URL=http://localhost:4566
AWS_S3_ENDPOINT_URL_FRONTEND=http://localhost:4566
JWT_SECRET=changeme-in-production
JWT_ALGORITHM=HS256
FRONTEND_ORIGIN=http://localhost:3000
```

3. **Run database migrations**:

```bash
alembic upgrade head
```

4. **Seed initial data**:

```bash
python scripts/seed_data.py
```

5. **Start the API server**:

```bash
# Using uv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Development

```bash
# Build and start
docker-compose -f docker-compose.local.yml up -d api

# View logs
docker-compose -f docker-compose.local.yml logs -f api

# Run migrations
docker-compose -f docker-compose.local.yml exec api uv run alembic upgrade head

# Seed data
docker-compose -f docker-compose.local.yml exec api uv run python scripts/seed_data.py
```

## Development

### Running Tests

```bash
# Install test dependencies
uv add --dev pytest pytest-asyncio httpx

# Run tests
uv run pytest
```

### Code Quality

```bash
# Format code
uv run black app/

# Lint code
uv run ruff check app/

# Type checking
uv run mypy app/
```

### Database Migrations

```bash
# Create a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

### Adding New Endpoints

1. Create Pydantic schemas in `app/schemas/`
2. Implement business logic in `app/services/`
3. Create route handlers in `app/routers/`
4. Register router in `app/main.py`
5. Add tests (if applicable)

## API Endpoints

### Authentication

- `POST /auth/login` - Login and get JWT token

### Devices

- `GET /devices?home_id={id}&room_id={id}&status={status}` - List devices
- `POST /devices` - Create device
- `GET /devices/{id}` - Get device details
- `PATCH /devices/{id}` - Update device
- `DELETE /devices/{id}` - Delete device
- `POST /devices/{id}/heartbeat` - Update device heartbeat

### Alerts

- `GET /alerts?home_id={id}&status={status}` - List alerts
- `GET /alerts/{id}` - Get alert details
- `POST /alerts/{id}/ack` - Acknowledge alert
- `POST /alerts/{id}/escalate` - Escalate alert
- `POST /alerts/{id}/close` - Close alert

### Ingestion

- `POST /ingest` - Get presigned S3 URL for audio upload
- `POST /ingest/confirm` - Confirm upload and enqueue processing job

### Settings

- `GET /settings/contacts?home_id={id}` - List contacts
- `POST /settings/contacts` - Create contact
- `DELETE /settings/contacts/{id}` - Delete contact
- `GET /settings/policies?home_id={id}` - Get policy
- `PATCH /settings/policies/{home_id}` - Update policy

### Model Configurations

- `GET /model-config?home_id={id}` - List model configs
- `PATCH /model-config/{model_key}?home_id={id}` - Update model config

### Admin (Admin role only)

- `GET /admin/users` - List all users
- `POST /admin/users` - Create user
- `PATCH /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/homes` - List all homes
- `POST /admin/homes` - Create home
- `PATCH /admin/homes/{id}` - Update home
- `DELETE /admin/homes/{id}` - Delete home

### Operations (Staff/Admin role)

- `GET /ops/overview` - Operations overview statistics
- `GET /ops/houses` - List all homes with statistics
- `GET /ops/audit` - Audit logs

### Users

- `GET /users/me` - Get current user info

### Assignments

- `GET /assignments` - List assignments for current user

### WebSocket

- `WS /ws/alerts?homeId={id}` - Real-time alert updates

## Database

### PostgreSQL (Primary Database)

Stores:
- Users, homes, rooms, devices
- Alerts, contacts, policies
- Model configurations
- Assignments

### MongoDB (Event Storage)

Stores:
- Audio ingestion events
- Processing status and results
- Telemetry data

### Running Migrations

```bash
# In Docker
docker-compose -f docker-compose.local.yml exec api uv run alembic upgrade head

# Locally
alembic upgrade head
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow

1. Client sends `POST /auth/login` with email and password
2. Server validates credentials
3. Server returns JWT token and user info
4. Client includes token in `Authorization: Bearer <token>` header for subsequent requests

### Role-Based Access Control (RBAC)

Roles:
- **owner** - Can access own home's data
- **technician** - Can access assigned homes
- **staff** - Can access all homes (operations)
- **admin** - Full access

Use `require_role()` dependency in routers to restrict access.

## Services

### Authentication Service

- `authenticate_user()` - Validate email/password
- `create_access_token_for_user()` - Generate JWT token
- `get_user_home_id()` - Get user's primary home ID

### Device Service

- `list_devices()` - Query devices with filters
- `create_device()` - Create new device
- `update_device()` - Update device
- `delete_device()` - Delete device
- `heartbeat_device()` - Update device status

### Alert Service

- `list_alerts()` - Query alerts with filters
- `get_alert()` - Get alert by ID
- `ack_alert()` - Acknowledge alert
- `escalate_alert()` - Escalate alert
- `close_alert()` - Close alert

### Ingestion Service

- `create_presigned_url()` - Generate S3 presigned URL
- `insert_pending_event()` - Create MongoDB event document
- `confirm_upload()` - Update event and enqueue SQS job

### SQS Client

- `enqueue_inference_job()` - Send job to SQS queue

## Worker

The worker process (`worker/main.py`) runs separately and:

1. Polls SQS queue for jobs
2. Processes audio files (currently stub implementation)
3. Updates MongoDB events with results
4. Creates alerts in PostgreSQL when needed

### Running the Worker

```bash
# In Docker
docker-compose -f docker-compose.local.yml up worker

# Locally
uv run python -m worker.main
```

## Seed Scripts

### Basic User Seeding

```bash
python scripts/seed_users.py
```

Creates:
- Admin user
- Owner user with home
- Technician user
- Staff user

### Comprehensive Data Seeding

```bash
python scripts/seed_data.py
```

Creates:
- 4 users (admin, owner, technician, staff)
- 2 homes
- 4 rooms
- 4 devices
- 4 alerts
- 3 contacts
- 1 policy
- 3 model configs
- 2 assignments

Use `--force` flag to clear existing data first:

```bash
python scripts/seed_data.py --force
```

## API Documentation

Once the server is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

See the main README.md for complete list of environment variables.

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d smart_home

# Test MongoDB connection
mongosh mongodb://localhost:27017/smart_home
```

### Migration Issues

```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Rollback if needed
alembic downgrade -1
```

### LocalStack Issues

```bash
# Check LocalStack health
curl http://localhost:4566/_localstack/health

# List S3 buckets
aws --endpoint-url=http://localhost:4566 s3 ls

# List SQS queues
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

## License

Educational project for CMPE 281.

