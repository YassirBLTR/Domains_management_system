from pydantic import BaseModel
from typing import Optional, List


class TeamBase(BaseModel):
    team_name: str
    isp_id: int


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    team_name: Optional[str] = None
    isp_id: Optional[int] = None


class TeamInDB(TeamBase):
    id: int
    
    class Config:
        from_attributes = True


class Team(TeamInDB):
    pass


class TeamWithDetails(TeamInDB):
    """Team with ISP name and domain count"""
    isp_name: Optional[str] = None
    domain_count: int = 0
    mailer_count: int = 0
