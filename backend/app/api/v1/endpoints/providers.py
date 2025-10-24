from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.provider import provider as provider_crud
from app.schemas.provider_schema import Provider, ProviderCreate, ProviderUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Provider])
def read_providers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve providers (GoDaddy, Namecheap, Dynadot). Both Admin and Operator can access.
    """
    providers = provider_crud.get_multi(db, skip=skip, limit=limit)
    return providers


@router.post("/", response_model=Provider)
def create_provider(
    *,
    db: Session = Depends(get_db),
    provider_in: ProviderCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new provider. Admin only.
    """
    provider = provider_crud.get_by_name(db, provider_name=provider_in.provider_name)
    if provider:
        raise HTTPException(
            status_code=400,
            detail="A provider with this name already exists.",
        )
    provider = provider_crud.create(db, obj_in=provider_in)
    return provider


@router.get("/{provider_id}", response_model=Provider)
def read_provider(
    *,
    db: Session = Depends(get_db),
    provider_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get provider by ID.
    """
    provider = provider_crud.get(db, id=provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.put("/{provider_id}", response_model=Provider)
def update_provider(
    *,
    db: Session = Depends(get_db),
    provider_id: int,
    provider_in: ProviderUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a provider. Admin only.
    """
    provider = provider_crud.get(db, id=provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider = provider_crud.update(db, db_obj=provider, obj_in=provider_in)
    return provider


@router.delete("/{provider_id}", response_model=Provider)
def delete_provider(
    *,
    db: Session = Depends(get_db),
    provider_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a provider. Admin only.
    """
    provider = provider_crud.get(db, id=provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    provider = provider_crud.delete(db, id=provider_id)
    return provider
