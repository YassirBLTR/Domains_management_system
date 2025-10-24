from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.crud.domain import domain as domain_crud
from app.schemas.domain import Domain, DomainCreate, DomainUpdate, DomainAssignment, DomainWithDetails
from app.schemas.assignment_tracker import AssignmentTrackerResponse
from app.models.user import User
from app.models.domain import DomainStatus
from app.models.assignment_tracker import AssignmentTracker
from app.models.team import Team
from app.models.mailer import Mailer
from app.utils.dns_lookup import get_a_record

router = APIRouter()


@router.get("/", response_model=List[DomainWithDetails])
def read_domains(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 1000,
    status: Optional[str] = Query(None, description="Filter by status: 'free' or 'assigned'"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve domains with account and provider information. Can filter by status.
    Limit increased to 1000 to support large domain portfolios.
    """
    domains = domain_crud.get_domains_with_details(db, skip=skip, limit=limit, status=status)
    return domains


@router.post("/", response_model=Domain)
def create_domain(
    *,
    db: Session = Depends(get_db),
    domain_in: DomainCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new domain. Admin only.
    """
    domain = domain_crud.get_by_name(db, domain_name=domain_in.domain_name)
    if domain:
        raise HTTPException(
            status_code=400,
            detail="A domain with this name already exists.",
        )
    domain = domain_crud.create(db, obj_in=domain_in)
    return domain


@router.get("/{domain_id}", response_model=Domain)
def read_domain(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get domain by ID.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


@router.put("/{domain_id}", response_model=Domain)
def update_domain(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    domain_in: DomainUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update a domain. Admin only.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    domain = domain_crud.update(db, db_obj=domain, obj_in=domain_in)
    return domain


@router.delete("/{domain_id}", response_model=Domain)
def delete_domain(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete a domain. Admin only.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    domain = domain_crud.delete(db, id=domain_id)
    return domain


@router.post("/assign", response_model=Domain)
def assign_domain(
    *,
    db: Session = Depends(get_db),
    assignment: DomainAssignment,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Assign a domain to a team or mailer.
    Both Admin and Operator can assign domains.
    """
    domain = domain_crud.get(db, id=assignment.domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    if assignment.team_id and assignment.mailer_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot assign domain to both team and mailer. Choose one.",
        )
    
    if not assignment.team_id and not assignment.mailer_id:
        raise HTTPException(
            status_code=400,
            detail="Must specify either team_id or mailer_id.",
        )
    
    # Track assignment history
    assigned_to_type = ""
    assigned_to_id = None
    assigned_to_name = ""
    
    if assignment.team_id:
        team = db.query(Team).filter(Team.id == assignment.team_id).first()
        if not team:
            raise HTTPException(status_code=404, detail="Team not found")
        assigned_to_type = "team"
        assigned_to_id = team.id
        assigned_to_name = team.team_name
        domain = domain_crud.assign_to_team(db, domain_id=assignment.domain_id, team_id=assignment.team_id)
    elif assignment.mailer_id:
        mailer = db.query(Mailer).filter(Mailer.id == assignment.mailer_id).first()
        if not mailer:
            raise HTTPException(status_code=404, detail="Mailer not found")
        assigned_to_type = "mailer"
        assigned_to_id = mailer.id
        assigned_to_name = mailer.mailer_name
        domain = domain_crud.assign_to_mailer(db, domain_id=assignment.domain_id, mailer_id=assignment.mailer_id)
    
    # Create assignment tracker record
    tracker = AssignmentTracker(
        domain_id=domain.id,
        domain_name=domain.domain_name,
        assigned_to_type=assigned_to_type,
        assigned_to_id=assigned_to_id,
        assigned_to_name=assigned_to_name,
        rotation=domain.rotation,
        assigned_by_user_id=current_user.id,
        assigned_by_username=current_user.username
    )
    db.add(tracker)
    db.commit()
    
    return domain


@router.post("/{domain_id}/unassign", response_model=Domain)
def unassign_domain(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Unassign a domain from all teams and mailers.
    Both Admin and Operator can unassign domains.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    domain = domain_crud.unassign_domain(db, domain_id=domain_id)
    return domain


@router.get("/history/all", response_model=List[AssignmentTrackerResponse])
def get_assignment_history(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all assignment history records.
    Returns the most recent assignments first.
    """
    history = db.query(AssignmentTracker)\
        .order_by(AssignmentTracker.assigned_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return history


@router.get("/history/{domain_id}", response_model=List[AssignmentTrackerResponse])
def get_domain_assignment_history(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get assignment history for a specific domain.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    history = db.query(AssignmentTracker)\
        .filter(AssignmentTracker.domain_id == domain_id)\
        .order_by(AssignmentTracker.assigned_at.desc())\
        .all()
    return history


@router.post("/{domain_id}/refresh-dns", response_model=Domain)
def refresh_domain_dns(
    *,
    db: Session = Depends(get_db),
    domain_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Refresh the A record (DNS) for a specific domain. Admin only.
    """
    domain = domain_crud.get(db, id=domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    
    # Lookup A record
    a_record = get_a_record(domain.domain_name)
    if a_record:
        domain.server = a_record
        db.commit()
        db.refresh(domain)
        return domain
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Could not resolve A record for domain {domain.domain_name}"
        )


@router.post("/refresh-all-dns")
def refresh_all_domains_dns(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Refresh A records for all domains. Admin only.
    This may take some time for large domain lists.
    """
    from app.models.domain import Domain as DomainModel
    
    domains = db.query(DomainModel).all()
    updated_count = 0
    failed_count = 0
    results = []
    
    for domain in domains:
        a_record = get_a_record(domain.domain_name)
        if a_record:
            domain.server = a_record
            updated_count += 1
            results.append({
                "domain_name": domain.domain_name,
                "status": "updated",
                "server": a_record
            })
        else:
            failed_count += 1
            results.append({
                "domain_name": domain.domain_name,
                "status": "failed",
                "server": None
            })
    
    db.commit()
    
    return {
        "total_domains": len(domains),
        "updated": updated_count,
        "failed": failed_count,
        "results": results
    }
