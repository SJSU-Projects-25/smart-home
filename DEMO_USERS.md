# Demo Users & Home Assignments

This document lists all demo users created by the seed script and their home assignments.

## Demo Users

### 1. Admin User
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Home**: Admin Home (owned)
- **Description**: Admin user with their own home. Can access all sections (Admin, Owner, Operations).

### 2. Owner User 1
- **Email**: `owner@example.com`
- **Password**: `owner123`
- **Role**: `owner`
- **Home**: Owner Home (owned)
- **Description**: Primary owner user with a fully configured home including:
  - 4 rooms (Living Room, Kitchen, Bedroom, Bathroom)
  - 4 devices (microphones and cameras)
  - Model configurations
  - Contacts and policies
  - Alerts

### 3. Owner User 2
- **Email**: `owner2@example.com`
- **Password**: `owner123`
- **Role**: `owner`
- **Home**: Owner 2 Home (owned)
- **Description**: Second owner user with their own home including:
  - 2 rooms (Living Room, Kitchen)
  - 2 devices
  - Model configurations

### 4. Technician User
- **Email**: `tech@example.com`
- **Password**: `tech123`
- **Role**: `technician`
- **Home Assignment**: Assigned to Owner Home (via Assignment)
- **Description**: Technician assigned to work on Owner Home. Can access Tech section with assignments, devices, tests, and network views.

### 5. Staff (Ops) User
- **Email**: `staff@example.com`
- **Password**: `staff123`
- **Role**: `staff`
- **Home Assignment**: Assigned to Owner Home (via Assignment)
- **Description**: Operations staff member assigned to Owner Home. Can access Operations section with overview, alerts, houses, audit, and models.

## Home Details

### Admin Home
- **Owner**: admin@gmail.com
- **Rooms**: 2 (Living Room, Office)
- **Devices**: 2 (Living Room Camera, Office Microphone)
- **Model Configs**: 3 (scream, smoke_alarm, glass_break)

### Owner Home
- **Owner**: owner@example.com
- **Rooms**: 4 (Living Room, Kitchen, Bedroom, Bathroom)
- **Devices**: 4 (various microphones and cameras)
- **Model Configs**: 3 (scream, smoke_alarm, glass_break)
- **Alerts**: 4 sample alerts with different statuses
- **Contacts**: 3 emergency contacts
- **Policy**: 1 alert policy configured
- **Assigned Users**: tech@example.com (technician), staff@example.com (staff)

### Owner 2 Home
- **Owner**: owner2@example.com
- **Rooms**: 2 (Living Room, Kitchen)
- **Devices**: 2 (Living Room Microphone, Kitchen Camera)
- **Model Configs**: 3 (scream, smoke_alarm, glass_break)

## Navigation Structure

### Owner Navigation
- Overview (Owner-specific)
- Alerts
- Devices
- Models
- Settings

### Technician Navigation
- Assignments (Tech section)
- Devices
- Tests
- Network

### Staff (Ops) Navigation
- Overview (Operations section)
- Alerts
- Houses
- Audit
- Models

### Admin Navigation
- Users (Admin section)
- Homes
- Alerts (from Owner section)
- Devices (from Owner section)
- Models (from Owner section)
- Settings (from Owner section)
- Overview (from Operations section)
- Alerts (from Operations section)
- Houses (from Operations section)
- Audit (from Operations section)
- Models (from Operations section)

**Note**: Admin users see all sections but without duplicate "Overview" labels. The Owner Overview is hidden for admins to avoid confusion.

## Testing Scenarios

1. **Owner Login**: Log in as `owner@example.com` to see a fully populated dashboard with alerts, devices, and model configurations.

2. **Ops Login**: Log in as `staff@example.com` to see the Operations overview with access to all homes and escalated alerts.

3. **Tech Login**: Log in as `tech@example.com` to see assignments and device management for Owner Home.

4. **Admin Login**: Log in as `admin@gmail.com` to see all sections including user and home management.

## Seed Script

To regenerate all demo data, run:

```bash
cd backend
uv run python scripts/seed_data.py --force
```

This will:
- Clear existing data (if `--force` is used)
- Create all users with proper home assignments
- Create homes, rooms, devices, alerts, contacts, policies, and model configs
- Create assignments for technician and staff users

