"""Settings management service."""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Contact, Policy
from app.schemas.settings import ContactCreate, PolicyUpdate


def list_contacts(db: Session, home_id: UUID) -> list[Contact]:
    """List contacts for a home."""
    return db.query(Contact).filter(Contact.home_id == home_id).all()


def create_contact(db: Session, contact_data: ContactCreate) -> Contact:
    """Create a new contact."""
    contact = Contact(
        home_id=contact_data.home_id,
        name=contact_data.name,
        channel=contact_data.channel,
        value=contact_data.value,
        priority=contact_data.priority,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact_id: UUID) -> None:
    """Delete a contact."""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    db.delete(contact)
    db.commit()


def get_policy(db: Session, home_id: UUID) -> Optional[Policy]:
    """Get policy for a home."""
    return db.query(Policy).filter(Policy.home_id == home_id).first()


def create_or_update_policy(db: Session, home_id: UUID, policy_data: PolicyUpdate) -> Policy:
    """Create or update policy for a home."""
    policy = get_policy(db, home_id)

    if policy:
        # Update existing
        if policy_data.quiet_start_time is not None:
            from datetime import datetime

            policy.quiet_start_time = datetime.strptime(policy_data.quiet_start_time, "%H:%M:%S").time()
        if policy_data.quiet_end_time is not None:
            from datetime import datetime

            policy.quiet_end_time = datetime.strptime(policy_data.quiet_end_time, "%H:%M:%S").time()
        if policy_data.auto_escalate_after_seconds is not None:
            policy.auto_escalate_after_seconds = policy_data.auto_escalate_after_seconds
    else:
        # Create new
        from datetime import datetime

        quiet_start = (
            datetime.strptime(policy_data.quiet_start_time, "%H:%M:%S").time()
            if policy_data.quiet_start_time
            else None
        )
        quiet_end = (
            datetime.strptime(policy_data.quiet_end_time, "%H:%M:%S").time() if policy_data.quiet_end_time else None
        )
        policy = Policy(
            home_id=home_id,
            quiet_start_time=quiet_start,
            quiet_end_time=quiet_end,
            auto_escalate_after_seconds=policy_data.auto_escalate_after_seconds,
        )
        db.add(policy)

    db.commit()
    db.refresh(policy)
    return policy
