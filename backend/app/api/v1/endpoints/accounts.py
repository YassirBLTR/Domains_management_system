from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.account import account as account_crud
from app.schemas.account import Account, AccountCreate, AccountUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Account])
def read_accounts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve accounts. Both Admin and Operator can access.
    """
    accounts = account_crud.get_multi(db, skip=skip, limit=limit)
    return accounts


@router.post("/", response_model=Account)
def create_account(
    *,
    db: Session = Depends(get_db),
    account_in: AccountCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new account. Admin only.
    """
    account = account_crud.get_by_account_name(db, account_name=account_in.account_name)
    if account:
        raise HTTPException(
            status_code=400,
            detail="An account with this name already exists.",
        )
    account = account_crud.create(db, obj_in=account_in)
    return account


@router.get("/{account_id}", response_model=Account)
def read_account(
    *,
    db: Session = Depends(get_db),
    account_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get account by ID.
    """
    account = account_crud.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=Account)
def update_account(
    *,
    db: Session = Depends(get_db),
    account_id: int,
    account_in: AccountUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update an account. Admin only.
    """
    account = account_crud.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account = account_crud.update(db, db_obj=account, obj_in=account_in)
    return account


@router.delete("/{account_id}", response_model=Account)
def delete_account(
    *,
    db: Session = Depends(get_db),
    account_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete an account. Admin only.
    """
    account = account_crud.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    account = account_crud.delete(db, id=account_id)
    return account
