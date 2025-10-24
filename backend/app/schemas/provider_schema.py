from pydantic import BaseModel, field_validator
from typing import Optional, Literal


class ProviderBase(BaseModel):
    provider_name: Literal["godaddy", "namecheap", "dynadot"]


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    provider_name: Optional[Literal["godaddy", "namecheap", "dynadot"]] = None


class ProviderInDB(ProviderBase):
    id: int
    
    class Config:
        from_attributes = True


class Provider(ProviderInDB):
    pass


class ProviderWithAccounts(ProviderInDB):
    """Provider with account count"""
    account_count: int = 0
