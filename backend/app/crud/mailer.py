from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.mailer import Mailer
from app.schemas.mailer import MailerCreate, MailerUpdate


class CRUDMailer(CRUDBase[Mailer, MailerCreate, MailerUpdate]):
    def get_by_name(self, db: Session, *, mailer_name: str) -> Optional[Mailer]:
        return db.query(Mailer).filter(Mailer.mailer_name == mailer_name).first()
    
    def get_by_team(self, db: Session, *, team_id: int) -> List[Mailer]:
        return db.query(Mailer).filter(Mailer.team_id == team_id).all()


mailer = CRUDMailer(Mailer)
