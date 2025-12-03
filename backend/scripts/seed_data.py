"""Comprehensive seed script to create initial data for development/testing."""
import sys
from pathlib import Path
from datetime import datetime, timedelta
import random

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

        owner_user3 = User(
            email="owner3@example.com",
            password_hash=hash_password("owner123"),
            role="owner",
            first_name="Robert",
            last_name="Brown",
            contact_number="+1-555-0105",
        )
        db.add(owner_user3)
        db.flush()

        owner_user4 = User(
            email="owner4@example.com",
            password_hash=hash_password("owner123"),
            role="owner",
            first_name="Emily",
            last_name="Davis",
            contact_number="+1-555-0106",
        )
        db.add(owner_user4)
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

        print("   ✅ Created 7 users (1 admin, 4 owners, 1 tech, 1 staff)")

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

        owner_home3 = Home(
            name="Brown Residence",
            owner_id=owner_user3.id,
            timezone="America/Los_Angeles",
            address="321 Elm Street, Fremont, CA 94536",
            contact_number="+1-555-0105",
            home_size="2800",
            number_of_rooms=5,
            house_type="Single-family home",
            status="Devices Installed and Configured",
        )
        db.add(owner_home3)
        db.flush()

        owner_home4 = Home(
            name="Davis Estate",
            owner_id=owner_user4.id,
            timezone="America/Los_Angeles",
            address="654 Maple Drive, Palo Alto, CA 94301",
            contact_number="+1-555-0106",
            home_size="4200",
            number_of_rooms=8,
            house_type="Single-family home",
            status="Devices Installed and Configured",
        )
        db.add(owner_home4)
        db.flush()

        print("   ✅ Created 5 homes")

        # 3. Create Rooms
        print("\n🚪 Creating rooms...")
        rooms_data = [
            # Rooms for owner_home
            ("Living Room", "living", owner_home.id),
            ("Kitchen", "kitchen", owner_home.id),
            ("Bedroom", "bedroom", owner_home.id),
            ("Bathroom", "bathroom", owner_home.id),
            ("Master Bedroom", "bedroom", owner_home.id),
            ("Dining Room", "dining", owner_home.id),
            # Rooms for owner_home2
            ("Living Room", "living", owner_home2.id),
            ("Kitchen", "kitchen", owner_home2.id),
            ("Bedroom", "bedroom", owner_home2.id),
            ("Bathroom", "bathroom", owner_home2.id),
            # Rooms for owner_home3
            ("Living Room", "living", owner_home3.id),
            ("Kitchen", "kitchen", owner_home3.id),
            ("Master Bedroom", "bedroom", owner_home3.id),
            ("Guest Bedroom", "bedroom", owner_home3.id),
            ("Bathroom", "bathroom", owner_home3.id),
            # Rooms for owner_home4
            ("Living Room", "living", owner_home4.id),
            ("Kitchen", "kitchen", owner_home4.id),
            ("Master Bedroom", "bedroom", owner_home4.id),
            ("Guest Bedroom 1", "bedroom", owner_home4.id),
            ("Guest Bedroom 2", "bedroom", owner_home4.id),
            ("Bathroom 1", "bathroom", owner_home4.id),
            ("Bathroom 2", "bathroom", owner_home4.id),
            ("Home Office", "office", owner_home4.id),
            # Rooms for admin_home
            ("Living Room", "living", admin_home.id),
            ("Office", "office", admin_home.id),
            ("Kitchen", "kitchen", admin_home.id),
            ("Bedroom", "bedroom", admin_home.id),
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
        # Devices for owner_home (rooms 0-5)
        devices_data = [
            ("Living Room Microphone", "microphone", owner_home.id, rooms[0].id, "online"),
            ("Living Room Camera", "camera", owner_home.id, rooms[0].id, "online"),
            ("Kitchen Camera", "camera", owner_home.id, rooms[1].id, "online"),
            ("Kitchen Microphone", "microphone", owner_home.id, rooms[1].id, "online"),
            ("Bedroom Microphone", "microphone", owner_home.id, rooms[2].id, "offline"),
            ("Bathroom Camera", "camera", owner_home.id, rooms[3].id, "online"),
            ("Master Bedroom Camera", "camera", owner_home.id, rooms[4].id, "online"),
            ("Dining Room Microphone", "microphone", owner_home.id, rooms[5].id, "online"),
            # Devices for owner_home2 (rooms 6-9)
            ("Living Room Microphone", "microphone", owner_home2.id, rooms[6].id, "online"),
            ("Kitchen Camera", "camera", owner_home2.id, rooms[7].id, "online"),
            ("Bedroom Camera", "camera", owner_home2.id, rooms[8].id, "online"),
            ("Bathroom Microphone", "microphone", owner_home2.id, rooms[9].id, "online"),
            # Devices for owner_home3 (rooms 10-14)
            ("Living Room Camera", "camera", owner_home3.id, rooms[10].id, "online"),
            ("Kitchen Microphone", "microphone", owner_home3.id, rooms[11].id, "online"),
            ("Master Bedroom Camera", "camera", owner_home3.id, rooms[12].id, "online"),
            ("Guest Bedroom Microphone", "microphone", owner_home3.id, rooms[13].id, "offline"),
            ("Bathroom Camera", "camera", owner_home3.id, rooms[14].id, "online"),
            # Devices for owner_home4 (rooms 15-22)
            ("Living Room Camera", "camera", owner_home4.id, rooms[15].id, "online"),
            ("Living Room Microphone", "microphone", owner_home4.id, rooms[15].id, "online"),
            ("Kitchen Camera", "camera", owner_home4.id, rooms[16].id, "online"),
            ("Master Bedroom Camera", "camera", owner_home4.id, rooms[17].id, "online"),
            ("Guest Bedroom 1 Camera", "camera", owner_home4.id, rooms[18].id, "online"),
            ("Guest Bedroom 2 Microphone", "microphone", owner_home4.id, rooms[19].id, "online"),
            ("Bathroom 1 Camera", "camera", owner_home4.id, rooms[20].id, "online"),
            ("Bathroom 2 Microphone", "microphone", owner_home4.id, rooms[21].id, "offline"),
            ("Home Office Camera", "camera", owner_home4.id, rooms[22].id, "online"),
            # Devices for admin_home (rooms 23-26)
            ("Living Room Camera", "camera", admin_home.id, rooms[23].id, "online"),
            ("Office Microphone", "microphone", admin_home.id, rooms[24].id, "online"),
            ("Kitchen Camera", "camera", admin_home.id, rooms[25].id, "online"),
            ("Bedroom Microphone", "microphone", admin_home.id, rooms[26].id, "online"),
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

        # Homes and their associated room/device slices for generating alerts
        homes_for_alerts = [
            (owner_home, rooms[0:6], devices[0:8]),
            (owner_home2, rooms[6:10], devices[8:12]),
            (owner_home3, rooms[10:15], devices[12:17]),
            (owner_home4, rooms[15:23], devices[17:26]),
            (admin_home, rooms[23:27], devices[26:]),
        ]

        base_types = ["scream", "smoke_alarm", "glass_break", "footsteps", "door_knock", "water_running"]
        severity_weights = [0.6, 0.3, 0.1]  # low, medium, high
        status_weights = [0.5, 0.25, 0.15, 0.1]  # open, acked, escalated, closed
        severities = ["low", "medium", "high"]
        statuses = ["open", "acked", "escalated", "closed"]

        now = datetime.utcnow()

        # Choose a few random spike days where alert volume is higher
        spike_days = {random.randint(0, 29) for _ in range(4)}

        total_generated = 0

        for day_offset in range(30):
            # More alerts on recent days, fewer further back
            recency_factor = max(0.4, 1.2 - (day_offset / 40.0))
            for home, home_rooms, home_devices in homes_for_alerts:
                # Base rate differs slightly per home to create variation
                base_rate = 1 + homes_for_alerts.index((home, home_rooms, home_devices)) % 3
                # Randomize count with some noise
                count = max(
                    0,
                    int(
                        random.gauss(
                            mu=base_rate * recency_factor, sigma=0.75
                        )
                    ),
                )
                # Spike days: add a burst of alerts for this home
                if day_offset in spike_days:
                    count += random.randint(3, 7)

                if count == 0:
                    continue

                for i in range(count):
                    severity = random.choices(severities, weights=severity_weights, k=1)[0]
                    status = random.choices(statuses, weights=status_weights, k=1)[0]
                    alert_type = random.choice(base_types)
                    room = random.choice(home_rooms)
                    device = random.choice(home_devices)

                    # Score loosely tied to severity with some jitter
                    base_score = {"low": 0.4, "medium": 0.6, "high": 0.8}[severity]
                    score = max(0.0, min(1.0, base_score + random.uniform(-0.1, 0.1)))

                    created_at = now - timedelta(
                        days=day_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59)
                    )

                    alert = Alert(
                        type=alert_type,
                        severity=severity,
                        status=status,
                        score=score,
                        home_id=home.id,
                        room_id=room.id,
                        device_id=device.id,
                        created_at=created_at,
                    )
                    if status == "acked":
                        alert.acked_at = created_at + timedelta(minutes=random.randint(5, 30))
                    elif status == "escalated":
                        alert.escalated_at = created_at + timedelta(minutes=random.randint(10, 60))
                    elif status == "closed":
                        alert.closed_at = created_at + timedelta(minutes=random.randint(15, 90))

                    db.add(alert)
                    total_generated += 1

        db.flush()
        print(f"   ✅ Created ~{total_generated} realistic alerts across multiple homes")

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
        # Technician assigned to multiple homes (owner_home, owner_home2, owner_home3)
        tech_assignment1 = Assignment(
            user_id=tech_user.id,
            home_id=owner_home.id,
            role="technician",
        )
        db.add(tech_assignment1)

        tech_assignment2 = Assignment(
            user_id=tech_user.id,
            home_id=owner_home2.id,
            role="technician",
        )
        db.add(tech_assignment2)

        tech_assignment3 = Assignment(
            user_id=tech_user.id,
            home_id=owner_home3.id,
            role="technician",
        )
        db.add(tech_assignment3)

        # Staff assigned to owner_home
        staff_assignment = Assignment(
            user_id=staff_user.id,
            home_id=owner_home.id,
            role="staff",
        )
        db.add(staff_assignment)
        db.flush()
        print("   ✅ Created 4 assignments (tech to 3 homes, staff to 1 home)")

        db.commit()
        print("\n✅ Successfully seeded all data!")
        print("\n📋 Login Credentials:")
        print("   - admin@gmail.com / admin123 (admin) → Admin Home")
        print("   - owner@example.com / owner123 (owner) → Owner Home")
        print("   - owner2@example.com / owner123 (owner) → Owner 2 Home")
        print("   - owner3@example.com / owner123 (owner) → Brown Residence")
        print("   - owner4@example.com / owner123 (owner) → Davis Estate")
        print("   - tech@example.com / tech123 (technician) → assigned to 3 homes (Owner Home, Owner 2 Home, Brown Residence)")
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

