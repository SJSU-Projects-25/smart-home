"""Seed script to populate MongoDB with network telemetry (RSSI) data."""
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from pymongo import MongoClient
from app.core.config import Settings
from app.db.models import Device
from app.db.session import get_session_local


def seed_network_telemetry(force: bool = False):
    """Create sample network telemetry data in MongoDB."""
    settings = Settings()
    
    # Connect to MongoDB
    mongo_client = MongoClient(settings.mongo_uri)
    db = mongo_client["smart_home"]
    telemetry_collection = db.get_collection("device_telemetry")
    
    # Connect to Postgres to get devices
    SessionLocal = get_session_local(settings)
    db_session = SessionLocal()
    
    try:
        # Check if telemetry already exists
        existing_count = telemetry_collection.count_documents({})
        if existing_count > 0 and not force:
            print("⚠️  Network telemetry already exists in MongoDB.")
            print("   To re-seed, run: uv run python scripts/seed_network_telemetry.py --force")
            return
        
        if force and existing_count > 0:
            print("🗑️  Force mode: Clearing existing telemetry...")
            telemetry_collection.delete_many({})
            print("   ✅ Cleared existing telemetry")
        
        print("🌱 Seeding network telemetry data...")
        
        # Get all devices
        devices = db_session.query(Device).all()
        
        if not devices:
            print("⚠️  No devices found. Please seed devices first.")
            return
        
        telemetry_docs = []
        for device in devices:
            # Generate RSSI based on device status
            if device.status == "online":
                # Online devices: good signal (-30 to -70 dBm)
                rssi = random.randint(-70, -30)
            else:
                # Offline devices: poor signal (-90 to -100 dBm)
                rssi = random.randint(-100, -90)
            
            # Create telemetry entry for current time
            telemetry_doc = {
                "device_id": str(device.id),
                "home_id": str(device.home_id),
                "rssi": rssi,
                "timestamp": datetime.utcnow(),
                "status": device.status,
            }
            telemetry_docs.append(telemetry_doc)
        
        if telemetry_docs:
            telemetry_collection.insert_many(telemetry_docs)
            print(f"   ✅ Created {len(telemetry_docs)} network telemetry entries")
        
        mongo_client.close()
        db_session.close()
        
    except Exception as e:
        print(f"❌ Error seeding network telemetry: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed network telemetry data in MongoDB")
    parser.add_argument("--force", action="store_true", help="Force re-seed (clear existing data)")
    args = parser.parse_args()
    
    seed_network_telemetry(force=args.force)


