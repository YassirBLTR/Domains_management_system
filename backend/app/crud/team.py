from typing import Optional, List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate


class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    def get_by_name(self, db: Session, *, team_name: str) -> Optional[Team]:
        return db.query(Team).filter(Team.team_name == team_name).first()
    
    def get_by_isp(self, db: Session, *, isp_id: int) -> List[Team]:
        return db.query(Team).filter(Team.isp_id == isp_id).all()


team = CRUDTeam(Team)
