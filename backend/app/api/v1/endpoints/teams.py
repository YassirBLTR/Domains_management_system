from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.team import team as team_crud
from app.schemas.team import Team, TeamCreate, TeamUpdate
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[Team])
def read_teams(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve teams.
    """
    teams = team_crud.get_multi(db, skip=skip, limit=limit)
    return teams


@router.post("/", response_model=Team)
def create_team(
    *,
    db: Session = Depends(get_db),
    team_in: TeamCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new team. Admin only.
    """
    team = team_crud.get_by_name(db, team_name=team_in.team_name)
    if team:
        raise HTTPException(
            status_code=400,
            detail="A team with this name already exists.",
        )
    team = team_crud.create(db, obj_in=team_in)
    return team


@router.get("/{team_id}", response_model=Team)
def read_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get team by ID.
    """
    team = team_crud.get(db, id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.put("/{team_id}", response_model=Team)
def update_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    team_in: TeamUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a team. Admin only.
    """
    team = team_crud.get(db, id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team = team_crud.update(db, db_obj=team, obj_in=team_in)
    return team


@router.delete("/{team_id}", response_model=Team)
def delete_team(
    *,
    db: Session = Depends(get_db),
    team_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a team. Admin only.
    """
    team = team_crud.get(db, id=team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team = team_crud.delete(db, id=team_id)
    return team
