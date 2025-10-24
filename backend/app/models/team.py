from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import Base


# Association table for many-to-many relationship between teams and domains
team_domains = Table(
    'team_domains',
    Base.metadata,
    Column('team_id', Integer, ForeignKey('teams.id'), primary_key=True),
    Column('domain_id', Integer, ForeignKey('domains.id'), primary_key=True)
)


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, unique=True, index=True, nullable=False)
    isp_id = Column(Integer, ForeignKey("isps.id"), nullable=False)
    
    # Relationships
    isp = relationship("ISP", back_populates="teams")
    mailers = relationship("Mailer", back_populates="team")
    domains = relationship("Domain", secondary=team_domains, back_populates="teams")
    
    def __repr__(self):
        return f"<Team(id={self.id}, team_name='{self.team_name}')>"
