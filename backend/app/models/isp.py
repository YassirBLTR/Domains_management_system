from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class ISP(Base):
    __tablename__ = "isps"

    id = Column(Integer, primary_key=True, index=True)
    isp_name = Column(String, unique=True, index=True, nullable=False)  # gmail, yahoo, etc.
    
    # Relationship to teams
    teams = relationship("Team", back_populates="isp")
    
    def __repr__(self):
        return f"<ISP(id={self.id}, isp_name='{self.isp_name}')>"
