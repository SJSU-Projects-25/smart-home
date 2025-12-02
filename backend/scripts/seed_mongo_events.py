"""Seed script to populate MongoDB with events data for analytics."""
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from pymongo import MongoClient
from app.core.config import Settings
from app.db.models import Device, Home
from app.db.session import get_session_local


def seed_mongo_events(force: bool = False):
    """Create sample events in MongoDB for analytics."""
    settings = Settings()
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.mongo_uri)
    db = mongo_client["smart_home"]
    events_collection = db["events"]
    
    # Connect to Postgres to get homes and devices
    SessionLocal = get_session_local(settings)
    db_session = SessionLocal()
    
    try:
        # Check if events already exist
        existing_count = events_collection.count_documents({})
        if existing_count > 0 and not force:
            print("⚠️  Events already exist in MongoDB.")
            print("   To re-seed, run: uv run python scripts/seed_mongo_events.py --force")
            print("   Or clear MongoDB first")
            return
        
        if force and existing_count > 0:
            print("🗑️  Force mode: Clearing existing events...")
            events_collection.delete_many({})
            print("   ✅ Cleared existing events")
        
        print("🌱 Seeding MongoDB events (last 30 days)...")
        
        # Get all homes and devices
        homes = db_session.query(Home).all()
        devices_by_home = {}
        
        for home in homes:
            devices = db_session.query(Device).filter(Device.home_id == home.id).all()
            devices_by_home[str(home.id)] = [str(d.id) for d in devices]
        
        if not devices_by_home:
            print("⚠️  No homes or devices found. Please run seed_data.py first.")
            return
        
        # Generate events for the last 30 days
        now = datetime.utcnow()
        events_to_insert = []
        
        for home_id, device_ids in devices_by_home.items():
            if not device_ids:
                continue
                
            # Generate events over the last 30 days
            for day_offset in range(30):
                event_date = now - timedelta(days=day_offset)
                
                # Generate 5-20 events per day per device
                events_per_device = random.randint(5, 20)
                
                for device_id in device_ids:
                    for event_num in range(events_per_device):
                        # Random time during the day
                        hour = random.randint(0, 23)
                        minute = random.randint(0, 59)
                        second = random.randint(0, 59)
                        
                        event_timestamp = event_date.replace(hour=hour, minute=minute, second=second)
                        
                        # Random duration (1-10 seconds)
                        duration_ms = random.randint(1000, 10000)
                        
                        # Random decision types
                        decision_types = ["scream", "smoke_alarm", "glass_break", "normal", "background_noise"]
                        decision = random.choice(decision_types)
                        
                        # Random scores
                        scores = {
                            "scream": round(random.uniform(0.1, 0.9), 3),
                            "smoke_alarm": round(random.uniform(0.1, 0.9), 3),
                            "glass_break": round(random.uniform(0.1, 0.9), 3),
                        }
                        
                        # Generate S3 key
                        s3_key = f"audio-clips/{device_id}/{event_timestamp.year}/{event_timestamp.month:02d}/{event_timestamp.day:02d}/{random.randint(1000, 9999)}.wav"
                        
                        event_doc = {
                            "timestamp": event_timestamp,
                            "home_id": home_id,
                            "device_id": device_id,
                            "s3_key": s3_key,
                            "duration_ms": duration_ms,
                            "scores": scores,
                            "decision": decision,
                            "status": "processed",
                        }
                        
                        events_to_insert.append(event_doc)
        
        # Insert in batches of 1000
        batch_size = 1000
        total_inserted = 0
        
        for i in range(0, len(events_to_insert), batch_size):
            batch = events_to_insert[i:i + batch_size]
            events_collection.insert_many(batch)
            total_inserted += len(batch)
            print(f"   ✅ Inserted {total_inserted}/{len(events_to_insert)} events...")
        
        print(f"\n✅ Successfully seeded {total_inserted} events in MongoDB!")
        print(f"   Events span the last 30 days")
        print(f"   Events per home: ~{total_inserted // len(devices_by_home)}")
        
    except Exception as e:
        print(f"\n❌ Error seeding MongoDB events: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db_session.close()
        mongo_client.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed MongoDB with events data")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-seeding by clearing existing events first",
    )
    args = parser.parse_args()
    seed_mongo_events(force=args.force)

