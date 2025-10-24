from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class AssignmentTracker(Base):
    __tablename__ = "assignment_tracker"

    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("domains.id", ondelete="SET NULL"), nullable=True)
    domain_name = Column(String, nullable=False)  # Store domain name for history even if domain is deleted
    assigned_to_type = Column(String, nullable=False)  # 'team' or 'mailer'
    assigned_to_id = Column(Integer, nullable=True)  # ID of team or mailer
    assigned_to_name = Column(String, nullable=False)  # Name of team or mailer for history
    rotation = Column(Integer, default=0)
    assigned_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_by_username = Column(String, nullable=False)  # Store username for history
    assigned_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    domain = relationship("Domain", back_populates="assignment_history")
    assigned_by = relationship("User")
