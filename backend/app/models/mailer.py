from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from .base import Base


# Association table for many-to-many relationship between mailers and domains
mailer_domains = Table(
    'mailer_domains',
    Base.metadata,
    Column('mailer_id', Integer, ForeignKey('mailers.id'), primary_key=True),
    Column('domain_id', Integer, ForeignKey('domains.id'), primary_key=True)
)


class Mailer(Base):
    __tablename__ = "mailers"

    id = Column(Integer, primary_key=True, index=True)
    mailer_name = Column(String, unique=True, index=True, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Relationships
    team = relationship("Team", back_populates="mailers")
    domains = relationship("Domain", secondary=mailer_domains, back_populates="mailers")
    
    def __repr__(self):
        return f"<Mailer(id={self.id}, mailer_name='{self.mailer_name}')>"
