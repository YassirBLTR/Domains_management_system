from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.isp import isp as isp_crud
from app.schemas.isp import ISP, ISPCreate, ISPUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ISP])
def read_isps(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve ISPs.
    """
    isps = isp_crud.get_multi(db, skip=skip, limit=limit)
    return isps


@router.post("/", response_model=ISP)
def create_isp(
    *,
    db: Session = Depends(get_db),
    isp_in: ISPCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new ISP. Admin only.
    """
    isp = isp_crud.get_by_name(db, isp_name=isp_in.isp_name)
    if isp:
        raise HTTPException(
            status_code=400,
            detail="An ISP with this name already exists.",
        )
    isp = isp_crud.create(db, obj_in=isp_in)
    return isp


@router.get("/{isp_id}", response_model=ISP)
def read_isp(
    *,
    db: Session = Depends(get_db),
    isp_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get ISP by ID.
    """
    isp = isp_crud.get(db, id=isp_id)
    if not isp:
        raise HTTPException(status_code=404, detail="ISP not found")
    return isp


@router.put("/{isp_id}", response_model=ISP)
def update_isp(
    *,
    db: Session = Depends(get_db),
    isp_id: int,
    isp_in: ISPUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update an ISP. Admin only.
    """
    isp = isp_crud.get(db, id=isp_id)
    if not isp:
        raise HTTPException(status_code=404, detail="ISP not found")
    isp = isp_crud.update(db, db_obj=isp, obj_in=isp_in)
    return isp


@router.delete("/{isp_id}", response_model=ISP)
def delete_isp(
    *,
    db: Session = Depends(get_db),
    isp_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete an ISP. Admin only.
    """
    isp = isp_crud.get(db, id=isp_id)
    if not isp:
        raise HTTPException(status_code=404, detail="ISP not found")
    isp = isp_crud.delete(db, id=isp_id)
    return isp
