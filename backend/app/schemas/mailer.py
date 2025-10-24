from pydantic import BaseModel
from typing import Optional


class MailerBase(BaseModel):
    mailer_name: str
    team_id: int


class MailerCreate(MailerBase):
    pass


class MailerUpdate(BaseModel):
    mailer_name: Optional[str] = None
    team_id: Optional[int] = None


class MailerInDB(MailerBase):
    id: int
    
    class Config:
        from_attributes = True


class Mailer(MailerInDB):
    pass


class MailerWithDetails(MailerInDB):
    """Mailer with team name and domain count"""
    team_name: Optional[str] = None
    domain_count: int = 0
