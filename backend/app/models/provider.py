from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Provider(Base):
    """Provider companies (GoDaddy, Namecheap, Dynadot)"""
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String, unique=True, nullable=False)  # "godaddy", "namecheap", "dynadot"
    
    # Relationship to accounts
    accounts = relationship("Account", back_populates="provider", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Provider(id={self.id}, provider_name='{self.provider_name}')>"
