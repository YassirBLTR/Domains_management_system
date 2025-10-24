from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.user import user as user_crud
from app.schemas.user import User, UserCreate, UserUpdate
from app.models.user import User as UserModel

router = APIRouter()


@router.get("/", response_model=List[User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = user_crud.get_multi(db, skip=skip, limit=limit)
    return users


@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: UserModel = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new user. Admin only.
    """
    user = user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )
    user = user_crud.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists.",
        )
    user = user_crud.create(db, obj_in=user_in)
    return user


@router.get("/me", response_model=User)
def read_user_me(
    current_user: UserModel = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.get("/{user_id}", response_model=User)
def read_user_by_id(
    user_id: int,
    current_user: UserModel = Depends(deps.get_current_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id. Admin only.
    """
    user = user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    return user


@router.put("/{user_id}", response_model=User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: UserModel = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a user. Admin only.
    """
    user = user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    user = user_crud.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/{user_id}", response_model=User)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: UserModel = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a user. Admin only.
    """
    user = user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )
    user = user_crud.delete(db, id=user_id)
    return user
