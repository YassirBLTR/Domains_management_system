from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.provider import Provider
from app.schemas.provider_schema import ProviderCreate, ProviderUpdate


class CRUDProvider(CRUDBase[Provider, ProviderCreate, ProviderUpdate]):
    def get_by_name(self, db: Session, *, provider_name: str) -> Optional[Provider]:
        return db.query(Provider).filter(Provider.provider_name == provider_name).first()


provider = CRUDProvider(Provider)
