"""Settings router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, get_user_home_access
from app.db.models import User
from app.schemas.settings import ContactCreate, ContactResponse, PolicyResponse, PolicyUpdate
from app.services.settings_service import (
    create_contact,
    create_or_update_policy,
    delete_contact,
    get_policy,
    list_contacts,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/contacts", response_model=list[ContactResponse])
async def list_contacts_endpoint(
    home_id: Annotated[UUID, Query()],
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List contacts for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    contacts = list_contacts(db, UUID(validated_home_id))
    return contacts


@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_endpoint(
    contact_data: ContactCreate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new contact."""
    _, validated_home_id = get_user_home_access(current_user, db, str(contact_data.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    contact_data.home_id = UUID(validated_home_id)
    contact = create_contact(db, contact_data)
    return contact


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_endpoint(
    contact_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a contact."""
    from app.db.models import Contact

    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(contact.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    delete_contact(db, contact_id)


@router.get("/policies", response_model=PolicyResponse)
async def get_policy_endpoint(
    home_id: Annotated[UUID, Query()],
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get policy for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    policy = get_policy(db, UUID(validated_home_id))
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    return policy


@router.patch("/policies/{home_id}", response_model=PolicyResponse)
async def update_policy_endpoint(
    home_id: UUID,
    policy_data: PolicyUpdate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update policy for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    policy = create_or_update_policy(db, UUID(validated_home_id), policy_data)
    return policy
