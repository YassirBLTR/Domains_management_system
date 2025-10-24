from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


class CRUDAccount(CRUDBase[Account, AccountCreate, AccountUpdate]):
    def get_by_account_name(self, db: Session, *, account_name: str) -> Optional[Account]:
        return db.query(Account).filter(Account.account_name == account_name).first()
    
    def get_by_provider(self, db: Session, *, provider_id: int) -> List[Account]:
        return db.query(Account).filter(Account.provider_id == provider_id).all()


account = CRUDAccount(Account)
