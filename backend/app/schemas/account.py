from pydantic import BaseModel
from typing import Optional


class AccountBase(BaseModel):
    account_name: str
    provider_id: int
    api_key: str
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    account_name: Optional[str] = None
    provider_id: Optional[int] = None
    api_key: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class AccountInDB(AccountBase):
    id: int
    
    class Config:
        from_attributes = True


class Account(AccountInDB):
    pass


class AccountWithProvider(AccountInDB):
    """Account with provider name"""
    provider_name: Optional[str] = None
