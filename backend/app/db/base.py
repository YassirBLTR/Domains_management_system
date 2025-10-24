from app.models.base import Base
from app.models import User, Provider, Account, ISP, Team, Mailer, Domain

# Import all models here to ensure they are registered with SQLAlchemy
# This is important for Alembic migrations
