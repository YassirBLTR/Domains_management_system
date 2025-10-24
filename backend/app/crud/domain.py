from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from app.crud.base import CRUDBase
from app.models.domain import Domain, DomainStatus
from app.models.account import Account
from app.models.provider import Provider
from app.schemas.domain import DomainCreate, DomainUpdate
from app.utils.dns_lookup import get_a_record


class CRUDDomain(CRUDBase[Domain, DomainCreate, DomainUpdate]):
    def create(self, db: Session, *, obj_in: DomainCreate) -> Domain:
        """Create domain and automatically lookup A record"""
        # Lookup A record if server not provided
        if not obj_in.server:
            a_record = get_a_record(obj_in.domain_name)
            if a_record:
                obj_in.server = a_record
                print(f"[DNS] Resolved A record for {obj_in.domain_name}: {a_record}")
            else:
                print(f"[DNS] Could not resolve A record for {obj_in.domain_name}")
        
        return super().create(db, obj_in=obj_in)
    
    def update(self, db: Session, *, db_obj: Domain, obj_in: DomainUpdate) -> Domain:
        """Update domain and optionally refresh A record"""
        # If server is explicitly set to None or empty, lookup A record
        if hasattr(obj_in, 'server') and obj_in.server == "":
            a_record = get_a_record(db_obj.domain_name)
            if a_record:
                obj_in.server = a_record
                print(f"[DNS] Refreshed A record for {db_obj.domain_name}: {a_record}")
        
        return super().update(db, db_obj=db_obj, obj_in=obj_in)
    
    def get_by_name(self, db: Session, *, domain_name: str) -> Optional[Domain]:
        return db.query(Domain).filter(Domain.domain_name == domain_name).first()
    
    def get_by_status(self, db: Session, *, status: DomainStatus) -> List[Domain]:
        return db.query(Domain).filter(Domain.status == status).all()
    
    def get_by_account(self, db: Session, *, account_id: int) -> List[Domain]:
        return db.query(Domain).filter(Domain.account_id == account_id).all()
    
    def assign_to_team(self, db: Session, *, domain_id: int, team_id: int) -> Domain:
        domain = self.get(db, domain_id)
        from app.models.team import Team
        team = db.query(Team).filter(Team.id == team_id).first()
        if domain and team:
            domain.teams.append(team)
            domain.status = DomainStatus.ASSIGNED
            domain.rotation += 1
            db.commit()
            db.refresh(domain)
        return domain
    
    def assign_to_mailer(self, db: Session, *, domain_id: int, mailer_id: int) -> Domain:
        domain = self.get(db, domain_id)
        from app.models.mailer import Mailer
        mailer = db.query(Mailer).filter(Mailer.id == mailer_id).first()
        if domain and mailer:
            domain.mailers.append(mailer)
            domain.status = DomainStatus.ASSIGNED
            domain.rotation += 1
            db.commit()
            db.refresh(domain)
        return domain
    
    def unassign_domain(self, db: Session, *, domain_id: int) -> Domain:
        domain = self.get(db, domain_id)
        if domain:
            domain.teams.clear()
            domain.mailers.clear()
            domain.status = DomainStatus.FREE
            db.commit()
            db.refresh(domain)
        return domain
    
    def get_domains_with_details(self, db: Session, *, skip: int = 0, limit: int = 1000, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get domains with account and provider information"""
        query = db.query(Domain).options(
            joinedload(Domain.account).joinedload(Account.provider),
            joinedload(Domain.teams),
            joinedload(Domain.mailers)
        )
        
        if status:
            query = query.filter(Domain.status == status)
        
        # Get all domains (increased limit to 1000)
        domains = query.offset(skip).limit(limit).all()
        
        print(f"[CRUD] Fetched {len(domains)} domains from database")
        
        result = []
        for domain in domains:
            try:
                # Get provider name safely
                provider_name = None
                if domain.account:
                    if hasattr(domain.account, 'provider') and domain.account.provider:
                        provider_name = domain.account.provider.provider_name
                
                domain_dict = {
                    "id": domain.id,
                    "domain_name": domain.domain_name,
                    "server": domain.server,
                    "status": domain.status,
                    "rotation": domain.rotation,
                    "account_id": domain.account_id,
                    "account_name": domain.account.account_name if domain.account else None,
                    "provider_name": provider_name,
                    "assigned_to_team": domain.teams[0].team_name if domain.teams else None,
                    "assigned_to_mailer": domain.mailers[0].mailer_name if domain.mailers else None,
                }
                result.append(domain_dict)
                
                # Debug log for first few domains
                if len(result) <= 3:
                    print(f"[CRUD] Domain: {domain.domain_name}, Provider: {provider_name}, Account: {domain.account.account_name if domain.account else 'None'}")
            except Exception as e:
                print(f"[CRUD] Error processing domain {domain.id}: {str(e)}")
                continue
        
        print(f"[CRUD] Returning {len(result)} domains to API")
        return result


domain = CRUDDomain(Domain)
