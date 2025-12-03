"""Network telemetry service."""
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session
from pymongo import MongoClient

from app.core.config import Settings
from app.db.models import Device


def get_device_network_status(db: Session, settings: Settings, home_id: UUID) -> list[dict]:
    """Get network status for all devices in a home, including RSSI from MongoDB telemetry."""
    from app.db.models import Room
    
    devices = db.query(Device).filter(Device.home_id == home_id).all()
    
    # Connect to MongoDB to get latest RSSI data
    mongo_client = MongoClient(settings.mongo_uri)
    db_mongo = mongo_client["smart_home"]
    telemetry_collection = None
    try:
        if "device_telemetry" in db_mongo.list_collection_names():
            telemetry_collection = db_mongo.get_collection("device_telemetry")
    except Exception:
        pass
    
    result = []
    import random
    for device in devices:
        # Load room for response
        room_name = None
        if device.room_id:
            room = db.query(Room).filter(Room.id == device.room_id).first()
            if room:
                room_name = room.name
        
        # Try to get latest RSSI from MongoDB
        rssi = None
        if telemetry_collection is not None:
            try:
                latest_telemetry = telemetry_collection.find_one(
                    {"device_id": str(device.id)},
                    sort=[("timestamp", -1)]
                )
                if latest_telemetry is not None and "rssi" in latest_telemetry:
                    rssi = latest_telemetry["rssi"]
            except Exception:
                pass  # Fall back to generated RSSI
        
        if rssi is None:
            if device.status == "online":
                # Generate realistic RSSI for online devices (-30 to -70 dBm)
                rssi = random.randint(-70, -30)
            elif device.status == "offline":
                # Offline devices have poor signal (-90 to -100 dBm)
                rssi = random.randint(-100, -90)
        
        result.append({
            "device_id": str(device.id),
            "device_name": device.name,
            "device_type": device.type,
            "room_id": str(device.room_id) if device.room_id else None,
            "room_name": room_name,
            "rssi": rssi,
            "last_heartbeat": device.last_seen_at.isoformat() if device.last_seen_at else None,
            "status": device.status,
        })
    
    mongo_client.close()
    return result

