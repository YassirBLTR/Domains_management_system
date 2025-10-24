from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.mailer import mailer as mailer_crud
from app.schemas.mailer import Mailer, MailerCreate, MailerUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Mailer])
def read_mailers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve mailers.
    """
    mailers = mailer_crud.get_multi(db, skip=skip, limit=limit)
    return mailers


@router.post("/", response_model=Mailer)
def create_mailer(
    *,
    db: Session = Depends(get_db),
    mailer_in: MailerCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new mailer. Admin only.
    """
    mailer = mailer_crud.get_by_name(db, mailer_name=mailer_in.mailer_name)
    if mailer:
        raise HTTPException(
            status_code=400,
            detail="A mailer with this name already exists.",
        )
    mailer = mailer_crud.create(db, obj_in=mailer_in)
    return mailer


@router.get("/{mailer_id}", response_model=Mailer)
def read_mailer(
    *,
    db: Session = Depends(get_db),
    mailer_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get mailer by ID.
    """
    mailer = mailer_crud.get(db, id=mailer_id)
    if not mailer:
        raise HTTPException(status_code=404, detail="Mailer not found")
    return mailer


@router.put("/{mailer_id}", response_model=Mailer)
def update_mailer(
    *,
    db: Session = Depends(get_db),
    mailer_id: int,
    mailer_in: MailerUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a mailer. Admin only.
    """
    mailer = mailer_crud.get(db, id=mailer_id)
    if not mailer:
        raise HTTPException(status_code=404, detail="Mailer not found")
    mailer = mailer_crud.update(db, db_obj=mailer, obj_in=mailer_in)
    return mailer


@router.delete("/{mailer_id}", response_model=Mailer)
def delete_mailer(
    *,
    db: Session = Depends(get_db),
    mailer_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a mailer. Admin only.
    """
    mailer = mailer_crud.get(db, id=mailer_id)
    if not mailer:
        raise HTTPException(status_code=404, detail="Mailer not found")
    mailer = mailer_crud.delete(db, id=mailer_id)
    return mailer
