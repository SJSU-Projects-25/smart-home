# MongoDB Events Data Guide

This guide explains how to add events data to MongoDB for analytics dashboards.

## Overview

The analytics dashboards use MongoDB to store and query event data. Events represent audio processing activities from devices in homes.

## Event Structure

Each event document in MongoDB has the following structure:

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "home_id": "uuid-of-home",
  "device_id": "uuid-of-device",
  "s3_key": "audio-clips/device-id/2025/01/15/file-uuid.wav",
  "duration_ms": 5000,
  "scores": {
    "scream": 0.85,
    "smoke_alarm": 0.12,
    "glass_break": 0.03
  },
  "decision": "scream",
  "status": "processed"
}
```

## Methods to Add Events

### Method 1: Automatic via Device Ingestion (Recommended)

Events are automatically created when devices upload audio files:

1. **Device uploads audio** → Calls `POST /ingest/presigned-url`
2. **Device confirms upload** → Calls `POST /ingest/confirm-upload`
3. **Event is created** in MongoDB with status "uploaded"
4. **Worker processes** the audio and updates event with scores/decision

**To simulate this via API:**

```bash
# Step 1: Get presigned URL
curl -X POST http://localhost:8000/ingest/presigned-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "device-uuid",
    "home_id": "home-uuid",
    "mime": "audio/wav"
  }'

# Response includes presigned_url and s3_key

# Step 2: Upload file to S3 (using presigned URL)
# ... upload file using presigned URL ...

# Step 3: Confirm upload
curl -X POST http://localhost:8000/ingest/confirm-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "s3_key": "audio-clips/...",
    "device_id": "device-uuid",
    "home_id": "home-uuid",
    "duration_ms": 5000
  }'
```

### Method 2: Seed Script (For Development)

Use the seed script to populate MongoDB with sample events:

```bash
cd backend
uv run python scripts/seed_mongo_events.py
```

This creates events for the last 30 days across all homes and devices.

**To force re-seed:**
```bash
uv run python scripts/seed_mongo_events.py --force
```

### Method 3: Direct MongoDB Insert (For Testing)

You can directly insert events into MongoDB using `mongosh`:

```bash
# Connect to MongoDB
docker exec -it smart-home-mongo mongosh

# Switch to database
use smart_home

# Insert a sample event
db.events.insertOne({
  timestamp: new Date(),
  home_id: "your-home-uuid",
  device_id: "your-device-uuid",
  s3_key: "audio-clips/test/test.wav",
  duration_ms: 5000,
  scores: {
    scream: 0.85,
    smoke_alarm: 0.12,
    glass_break: 0.03
  },
  decision: "scream",
  status: "processed"
})
```

### Method 4: Using MongoDB Compass or GUI Tool

1. Connect to MongoDB at `mongodb://localhost:27017`
2. Select database: `smart_home`
3. Select collection: `events`
4. Click "Insert Document"
5. Paste JSON event structure (see above)
6. Click "Insert"

## Adding Events via Frontend UI (Future Enhancement)

Currently, events are created automatically via device ingestion. To add events manually through the UI:

1. **Create an Admin/Dev Tools page** with a form to:
   - Select home and device
   - Upload audio file or specify S3 key
   - Set duration, scores, decision
   - Submit to create event

2. **Or extend the Device Management page** to:
   - Show "Simulate Event" button for each device
   - Generate test events with random data
   - Useful for testing dashboards

## Viewing Events

### Via MongoDB Shell

```bash
docker exec -it smart-home-mongo mongosh

use smart_home

# Count all events
db.events.countDocuments({})

# Find events for a specific home
db.events.find({ home_id: "your-home-uuid" }).limit(10)

# Find events in last 24 hours
db.events.find({
  timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
})

# Aggregate events by home
db.events.aggregate([
  { $group: { _id: "$home_id", count: { $sum: 1 } } }
])
```

### Via API Endpoints

- `GET /owner/overview?home_id=...` - Shows `eventsLast24h` count
- `GET /ops/overview` - Shows `eventsByHomeLast24h` list
- Events are aggregated in analytics queries

## Event Status Values

- `pending` - Event created, waiting for upload
- `uploaded` - File uploaded to S3, queued for processing
- `processed` - Audio processed, scores and decision added

## Best Practices

1. **Use seed script for development** - Quick way to populate test data
2. **Use device ingestion for production** - Real events from actual devices
3. **Monitor event volume** - Too many events can slow down queries
4. **Index timestamps** - MongoDB automatically indexes `_id`, but consider indexing `timestamp` and `home_id` for faster queries

## Troubleshooting

### No events showing in dashboard

1. Check if events exist:
   ```bash
   docker exec -it smart-home-mongo mongosh
   use smart_home
   db.events.countDocuments({})
   ```

2. Check event timestamps (should be within last 24h for dashboard):
   ```bash
   db.events.find().sort({ timestamp: -1 }).limit(5)
   ```

3. Verify home_id matches:
   ```bash
   db.events.find({ home_id: "your-home-uuid" })
   ```

### Events not appearing in analytics

- Ensure events have `timestamp` field (required for time-based queries)
- Ensure `home_id` matches the home you're viewing
- Check that events are within the query time window (last 24h or 7d)

### Seed script fails

- Ensure Postgres is seeded first (homes and devices must exist)
- Check MongoDB connection string in `.env`
- Verify MongoDB container is running: `docker ps | grep mongo`

## Example: Creating Realistic Test Data

To create realistic test data that shows up in dashboards:

```python
# Example Python script to add events
from pymongo import MongoClient
from datetime import datetime, timedelta
import random

client = MongoClient("mongodb://localhost:27017")
db = client["smart_home"]
events = db["events"]

# Create events for last 7 days
now = datetime.utcnow()
for day in range(7):
    for hour in range(24):
        timestamp = now - timedelta(days=day, hours=23-hour)
        events.insert_one({
            "timestamp": timestamp,
            "home_id": "your-home-uuid",
            "device_id": "your-device-uuid",
            "s3_key": f"audio-clips/test/{timestamp.isoformat()}.wav",
            "duration_ms": random.randint(1000, 10000),
            "scores": {
                "scream": random.uniform(0.1, 0.9),
                "smoke_alarm": random.uniform(0.1, 0.9),
                "glass_break": random.uniform(0.1, 0.9),
            },
            "decision": random.choice(["scream", "smoke_alarm", "glass_break", "normal"]),
            "status": "processed"
        })
```

This creates 168 events (24 per day × 7 days) that will show up in analytics.


