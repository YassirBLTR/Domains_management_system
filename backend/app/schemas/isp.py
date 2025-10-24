from pydantic import BaseModel
from typing import Optional


class ISPBase(BaseModel):
    isp_name: str


class ISPCreate(ISPBase):
    pass


class ISPUpdate(BaseModel):
    isp_name: Optional[str] = None


class ISPInDB(ISPBase):
    id: int
    
    class Config:
        from_attributes = True


class ISP(ISPInDB):
    pass
