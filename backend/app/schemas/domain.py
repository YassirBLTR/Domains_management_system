from pydantic import BaseModel
from typing import Optional, Literal
from app.models.domain import DomainStatus


class DomainBase(BaseModel):
    domain_name: str
    server: Optional[str] = None
    status: Literal["free", "assigned"] = "free"
    account_id: Optional[int] = None


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
    domain_name: Optional[str] = None
    server: Optional[str] = None
    status: Optional[Literal["free", "assigned"]] = None
    account_id: Optional[int] = None


class DomainInDB(DomainBase):
    id: int
    rotation: int = 0
    
    class Config:
        from_attributes = True


class Domain(DomainInDB):
    pass


class DomainWithDetails(DomainInDB):
    """Domain with account/provider name and assignment details"""
    account_name: Optional[str] = None
    provider_name: Optional[str] = None
    assigned_to_team: Optional[str] = None
    assigned_to_mailer: Optional[str] = None


class DomainAssignment(BaseModel):
    """Schema for assigning domains to teams or mailers"""
    domain_id: int
    team_id: Optional[int] = None
    mailer_id: Optional[int] = None
