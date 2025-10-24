from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.services.domain_sync import DomainSyncService
from app.crud.account import account as account_crud

router = APIRouter()


@router.post("/domains/sync-all")
async def sync_all_domains(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Sync domains from all accounts (Admin only).
    Runs in background.
    """
    async def run_sync():
        results = await DomainSyncService.sync_all_accounts(db)
        return results
    
    # Run sync in background
    background_tasks.add_task(run_sync)
    
    return {
        "message": "Domain sync started in background for all accounts",
        "status": "processing"
    }


@router.post("/domains/sync/{account_id}")
async def sync_account_domains(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Sync domains from a specific account (Admin only).
    """
    account = account_crud.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    try:
        result = await DomainSyncService.sync_account_domains(db, account_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/accounts/test-connection/{account_id}")
def test_account_connection(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Test connection to an account's API (Admin only).
    """
    account = account_crud.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    result = DomainSyncService.test_account_connection(account)
    return result


@router.get("/accounts/test-all-connections")
def test_all_account_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Test connections to all accounts' APIs (Admin only).
    """
    accounts = account_crud.get_multi(db)
    results = []
    
    for account in accounts:
        result = DomainSyncService.test_account_connection(account)
        results.append(result)
    
    return results
