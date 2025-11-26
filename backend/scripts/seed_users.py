"""Seed script to create initial users for development/testing."""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

import bcrypt

from app.core.config import Settings
from app.db.models import Home, User
from app.db.session import get_session_local


def seed_users():
    """Create initial users for testing."""
    settings = Settings()
    SessionLocal = get_session_local(settings)
    db: Session = SessionLocal()

    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@gmail.com").first()
        if admin_user:
            print("Admin user already exists. Skipping seed.")
            return

        # Helper to hash password using bcrypt directly
        def hash_password(password: str) -> str:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
            return hashed.decode("utf-8")

        # Create admin user
        admin_user = User(
            email="admin@gmail.com",
            password_hash=hash_password("admin123"),
            role="admin",
        )
        db.add(admin_user)
        db.flush()  # Get the user ID

        # Create a home for the admin user
        admin_home = Home(
            name="Admin Home",
            owner_id=admin_user.id,
            timezone="America/Los_Angeles",
        )
        db.add(admin_home)

        # Create owner user
        owner_user = User(
            email="owner@example.com",
            password_hash=hash_password("owner123"),
            role="owner",
        )
        db.add(owner_user)
        db.flush()

        # Create a home for the owner
        owner_home = Home(
            name="Owner Home",
            owner_id=owner_user.id,
            timezone="America/Los_Angeles",
        )
        db.add(owner_home)

        # Create technician user
        tech_user = User(
            email="tech@example.com",
            password_hash=hash_password("tech123"),
            role="technician",
        )
        db.add(tech_user)

        # Create staff user
        staff_user = User(
            email="staff@example.com",
            password_hash=hash_password("staff123"),
            role="staff",
        )
        db.add(staff_user)

        db.commit()
        print("✅ Successfully seeded users:")
        print("   - admin@gmail.com / admin123 (admin)")
        print("   - owner@example.com / owner123 (owner)")
        print("   - tech@example.com / tech123 (technician)")
        print("   - staff@example.com / staff123 (staff)")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding users: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()

