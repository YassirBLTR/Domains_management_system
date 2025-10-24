from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Account(Base):
    """Provider accounts with API credentials"""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_name = Column(String, unique=True, index=True, nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    
    # Credentials
    api_key = Column(String, nullable=False)  # Mandatory
    username = Column(String)  # Optional
    email = Column(String)  # Optional
    password = Column(String)  # Optional (used for API secret or IP whitelist)
    
    # Relationships
    provider = relationship("Provider", back_populates="accounts")
    domains = relationship("Domain", back_populates="account")
    
    def __repr__(self):
        return f"<Account(id={self.id}, account_name='{self.account_name}')>"
