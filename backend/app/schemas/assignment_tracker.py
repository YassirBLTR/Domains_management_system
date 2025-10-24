from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssignmentTrackerBase(BaseModel):
    domain_name: str
    assigned_to_type: str  # 'team' or 'mailer'
    assigned_to_name: str
    rotation: int = 0

class AssignmentTrackerCreate(AssignmentTrackerBase):
    domain_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    assigned_by_user_id: Optional[int] = None
    assigned_by_username: str

class AssignmentTrackerResponse(AssignmentTrackerBase):
    id: int
    domain_id: Optional[int]
    assigned_to_id: Optional[int]
    assigned_by_username: str
    assigned_at: datetime

    class Config:
        from_attributes = True
