from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.isp import ISP
from app.schemas.isp import ISPCreate, ISPUpdate


class CRUDISP(CRUDBase[ISP, ISPCreate, ISPUpdate]):
    def get_by_name(self, db: Session, *, isp_name: str) -> Optional[ISP]:
        return db.query(ISP).filter(ISP.isp_name == isp_name).first()


isp = CRUDISP(ISP)
