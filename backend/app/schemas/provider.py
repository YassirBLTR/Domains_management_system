from pydantic import BaseModel
from typing import Optional


class ProviderBase(BaseModel):
    account_name: str
    api_key: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    account_name: Optional[str] = None
    api_key: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class ProviderInDB(ProviderBase):
    id: int
    
    class Config:
        from_attributes = True


class Provider(ProviderInDB):
    pass
