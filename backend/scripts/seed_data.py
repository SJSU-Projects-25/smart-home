"""Comprehensive seed script to create initial data for development/testing."""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

import bcrypt

from app.core.config import Settings
from app.db.models import (
    Alert,
    Assignment,
    Contact,
    Device,
    Home,
    ModelConfig,
    Policy,
    Room,
    User,
)
from app.db.session import get_session_local


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def seed_all_data(force: bool = False):
    """Create comprehensive initial data for testing."""
    settings = Settings()
    SessionLocal = get_session_local(settings)
    db: Session = SessionLocal()

    try:
        # Check if data already exists
        existing_user = db.query(User).first()
        if existing_user and not force:
            print("⚠️  Data already exists.")
            print("   To re-seed, run: uv run python scripts/seed_data.py --force")
            print("   Or reset the database first with: alembic downgrade base && alembic upgrade head")
            print("   Skipping seed to avoid duplicates.")
            return

        if force and existing_user:
            print("🗑️  Force mode: Clearing existing data...")
            # Delete in reverse order of dependencies
            db.query(Alert).delete()
            db.query(Assignment).delete()
            db.query(Contact).delete()
            db.query(Policy).delete()
            db.query(ModelConfig).delete()
            db.query(Device).delete()
            db.query(Room).delete()
            db.query(Home).delete()
            db.query(User).delete()
            db.commit()
            print("   ✅ Cleared existing data")

        print("🌱 Starting comprehensive data seed...")

        # 1. Create Users
        print("\n📝 Creating users...")
        admin_user = User(
            email="admin@gmail.com",
            password_hash=hash_password("admin123"),
            role="admin",
            first_name="Admin",
            last_name="User",
            contact_number="+1-555-0100",
        )
        db.add(admin_user)
        db.flush()

        owner_user = User(
            email="owner@example.com",
            password_hash=hash_password("owner123"),
            role="owner",
            first_name="John",
            last_name="Doe",
            contact_number="+1-555-0101",
        )
        db.add(owner_user)
        db.flush()

        owner_user2 = User(
            email="owner2@example.com",
            password_hash=hash_password("owner123"),
            role="owner",
            first_name="Jane",
            last_name="Smith",
            contact_number="+1-555-0102",
        )
        db.add(owner_user2)
        db.flush()

        tech_user = User(
            email="tech@example.com",
            password_hash=hash_password("tech123"),
            role="technician",
            first_name="Mike",
            last_name="Johnson",
            contact_number="+1-555-0103",
            operational_area="San Francisco Bay Area",
            experience_level="Senior",
            certifications="Smart Home Installation, Network Security",
        )
        db.add(tech_user)
        db.flush()

        staff_user = User(
            email="staff@example.com",
            password_hash=hash_password("staff123"),
            role="staff",
            first_name="Sarah",
            last_name="Williams",
            contact_number="+1-555-0104",
        )
        db.add(staff_user)
        db.flush()

        print("   ✅ Created 5 users (1 admin, 2 owners, 1 tech, 1 staff)")

        # 2. Create Homes
        print("\n🏠 Creating homes...")
        admin_home = Home(
            name="Admin Home",
            owner_id=admin_user.id,
            timezone="America/Los_Angeles",
            address="123 Admin Street, San Francisco, CA 94102",
            contact_number="+1-555-0100",
            home_size="2500",
            number_of_rooms=5,
            house_type="Single-family home",
            status="Devices Installed and Configured",
        )
        db.add(admin_home)
        db.flush()

        owner_home = Home(
            name="Owner Home",
            owner_id=owner_user.id,
            timezone="America/Los_Angeles",
            address="456 Oak Avenue, San Jose, CA 95110",
            contact_number="+1-555-0101",
            home_size="3200",
            number_of_rooms=6,
            house_type="Single-family home",
            status="Devices Installed and Configured",
        )
        db.add(owner_home)
        db.flush()

        owner_home2 = Home(
            name="Owner 2 Home",
            owner_id=owner_user2.id,
            timezone="America/Los_Angeles",
            address="789 Pine Road, Oakland, CA 94601",
            contact_number="+1-555-0102",
            home_size="1800",
            number_of_rooms=4,
            house_type="Townhouse",
            status="Device Installation In Progress",
        )
        db.add(owner_home2)
        db.flush()

        print("   ✅ Created 3 homes")

        # 3. Create Rooms
        print("\n🚪 Creating rooms...")
        rooms_data = [
            ("Living Room", "living", owner_home.id),
            ("Kitchen", "kitchen", owner_home.id),
            ("Bedroom", "bedroom", owner_home.id),
            ("Bathroom", "bathroom", owner_home.id),
            # Rooms for owner_home2
            ("Living Room", "living", owner_home2.id),
            ("Kitchen", "kitchen", owner_home2.id),
            # Rooms for admin_home
            ("Living Room", "living", admin_home.id),
            ("Office", "office", admin_home.id),
        ]
        rooms = []
        for name, room_type, home_id in rooms_data:
            room = Room(name=name, type=room_type, home_id=home_id)
            db.add(room)
            rooms.append(room)
        db.flush()
        print(f"   ✅ Created {len(rooms)} rooms")

        # 4. Create Devices
        print("\n📱 Creating devices...")
        # Devices for owner_home (first 4 rooms)
        devices_data = [
            ("Living Room Microphone", "microphone", owner_home.id, rooms[0].id, "online"),
            ("Kitchen Camera", "camera", owner_home.id, rooms[1].id, "online"),
            ("Bedroom Microphone", "microphone", owner_home.id, rooms[2].id, "offline"),
            ("Bathroom Camera", "camera", owner_home.id, rooms[3].id, "online"),
            # Devices for owner_home2
            ("Living Room Microphone", "microphone", owner_home2.id, rooms[4].id, "online"),
            ("Kitchen Camera", "camera", owner_home2.id, rooms[5].id, "online"),
            # Devices for admin_home
            ("Living Room Camera", "camera", admin_home.id, rooms[6].id, "online"),
            ("Office Microphone", "microphone", admin_home.id, rooms[7].id, "online"),
        ]
        devices = []
        for name, device_type, home_id, room_id, status in devices_data:
            device = Device(
                name=name,
                type=device_type,
                home_id=home_id,
                room_id=room_id,
                status=status,
                last_seen_at=datetime.utcnow() - timedelta(minutes=5) if status == "online" else None,
                firmware_version="1.0.0",
            )
            db.add(device)
            devices.append(device)
        db.flush()
        print(f"   ✅ Created {len(devices)} devices")

        # 5. Create Alerts
        print("\n🚨 Creating alerts...")
        alerts_data = [
            ("scream", "high", "open", 0.95, owner_home.id, rooms[0].id, devices[0].id),
            ("smoke_alarm", "high", "acked", 0.88, owner_home.id, rooms[1].id, devices[1].id),
            ("glass_break", "medium", "escalated", 0.72, owner_home.id, rooms[2].id, devices[2].id),
            ("scream", "low", "closed", 0.45, owner_home.id, rooms[3].id, devices[3].id),
        ]
        for alert_type, severity, alert_status, score, home_id, room_id, device_id in alerts_data:
            alert = Alert(
                type=alert_type,
                severity=severity,
                status=alert_status,
                score=score,
                home_id=home_id,
                room_id=room_id,
                device_id=device_id,
                created_at=datetime.utcnow() - timedelta(hours=2),
            )
            if alert_status == "acked":
                alert.acked_at = datetime.utcnow() - timedelta(hours=1)
            elif alert_status == "escalated":
                alert.escalated_at = datetime.utcnow() - timedelta(minutes=30)
            elif alert_status == "closed":
                alert.closed_at = datetime.utcnow() - timedelta(minutes=15)
            db.add(alert)
        db.flush()
        print(f"   ✅ Created {len(alerts_data)} alerts")

        # 6. Create Contacts
        print("\n📞 Creating contacts...")
        contacts_data = [
            ("John Doe", "email", "john@example.com", 1, owner_home.id),
            ("Jane Smith", "sms", "+1234567890", 2, owner_home.id),
            ("Emergency Contact", "email", "emergency@example.com", 0, owner_home.id),
        ]
        for name, channel, value, priority, home_id in contacts_data:
            contact = Contact(
                name=name,
                channel=channel,
                value=value,
                priority=priority,
                home_id=home_id,
            )
            db.add(contact)
        db.flush()
        print(f"   ✅ Created {len(contacts_data)} contacts")

        # 7. Create Policy
        print("\n📋 Creating policies...")
        policy = Policy(
            home_id=owner_home.id,
            quiet_start_time=datetime.strptime("22:00:00", "%H:%M:%S").time(),
            quiet_end_time=datetime.strptime("07:00:00", "%H:%M:%S").time(),
            auto_escalate_after_seconds=3600,
        )
        db.add(policy)
        db.flush()
        print("   ✅ Created 1 policy")

        # 8. Create Model Configs
        print("\n🤖 Creating model configs...")
        model_configs_data = [
            ("scream", True, 0.7, {"sensitivity": "high"}),
            ("smoke_alarm", True, 0.8, {"sensitivity": "medium"}),
            ("glass_break", False, 0.6, {"sensitivity": "low"}),
        ]
        # Add configs for all homes
        homes_with_configs = [owner_home, owner_home2, admin_home]
        for home in homes_with_configs:
            for model_key, enabled, threshold, params in model_configs_data:
                config = ModelConfig(
                    home_id=home.id,
                    model_key=model_key,
                    enabled=enabled,
                    threshold=threshold,
                    params_json=params,
                )
                db.add(config)
        db.flush()
        print(f"   ✅ Created {len(model_configs_data) * len(homes_with_configs)} model configs")

        # 9. Create Assignments
        print("\n👥 Creating assignments...")
        # Technician assigned to owner_home
        tech_assignment = Assignment(
            user_id=tech_user.id,
            home_id=owner_home.id,
            role="technician",
        )
        db.add(tech_assignment)

        # Staff assigned to owner_home
        staff_assignment = Assignment(
            user_id=staff_user.id,
            home_id=owner_home.id,
            role="staff",
        )
        db.add(staff_assignment)
        db.flush()
        print("   ✅ Created 2 assignments (tech and staff to owner_home)")

        db.commit()
        print("\n✅ Successfully seeded all data!")
        print("\n📋 Login Credentials:")
        print("   - admin@gmail.com / admin123 (admin) → Admin Home")
        print("   - owner@example.com / owner123 (owner) → Owner Home")
        print("   - owner2@example.com / owner123 (owner) → Owner 2 Home")
        print("   - tech@example.com / tech123 (technician) → assigned to Owner Home")
        print("   - staff@example.com / staff123 (staff) → assigned to Owner Home")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding data: {e}")
        import traceback

        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed database with initial data")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force re-seeding by clearing existing data first",
    )
    args = parser.parse_args()
    seed_all_data(force=args.force)

