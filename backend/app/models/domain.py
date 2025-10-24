from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from .team import team_domains
from .mailer import mailer_domains


# Domain status constants (using strings instead of enum to avoid PostgreSQL permission issues)
class DomainStatus:
    FREE = "free"
    ASSIGNED = "assigned"


class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, index=True)
    domain_name = Column(String, unique=True, index=True, nullable=False)
    server = Column(String)
    status = Column(String, default=DomainStatus.FREE, nullable=False)  # "free" or "assigned"
    rotation = Column(Integer, default=0)  # Number of times assigned
    account_id = Column(Integer, ForeignKey("accounts.id"))
    
    # Relationships
    account = relationship("Account", back_populates="domains")
    teams = relationship("Team", secondary=team_domains, back_populates="domains")
    mailers = relationship("Mailer", secondary=mailer_domains, back_populates="domains")
    assignment_history = relationship("AssignmentTracker", back_populates="domain", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Domain(id={self.id}, domain_name='{self.domain_name}', status='{self.status}', rotation={self.rotation})>"
