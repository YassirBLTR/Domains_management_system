from sqlalchemy.orm import Session
from typing import List, Dict
import logging
from datetime import datetime

from app.models.account import Account
from app.models.domain import Domain, DomainStatus
from app.crud.domain import domain as domain_crud
from app.crud.account import account as account_crud
from app.services.provider_apis.godaddy import GoDaddyAPI
from app.services.provider_apis.namecheap import NamecheapAPI
from app.services.provider_apis.dynadot import DynadotAPI

logger = logging.getLogger(__name__)


class DomainSyncService:
    """Service to sync domains from account APIs"""
    
    @staticmethod
    def get_provider_api(account: Account):
        """Get the appropriate API client for an account"""
        provider_type = account.provider.provider_name.lower()
        
        if provider_type == "godaddy":
            if not account.api_key or not account.password:
                raise ValueError(f"GoDaddy account '{account.account_name}' missing API key or secret")
            return GoDaddyAPI(account.api_key, account.password)
        
        elif provider_type == "namecheap":
            if not account.api_key or not account.email:
                raise ValueError(f"Namecheap account '{account.account_name}' missing API key or email")
            if not account.password:
                raise ValueError(f"Namecheap account '{account.account_name}' missing Client IP. Please add your whitelisted IP address in the Password field")
            # For Namecheap: api_key, api_user (email), username (email), client_ip (password field used for IP)
            return NamecheapAPI(
                api_key=account.api_key,
                api_user=account.email or account.username,
                username=account.email or account.username,
                client_ip=account.password
            )
        
        elif provider_type == "dynadot":
            if not account.api_key:
                raise ValueError(f"Dynadot account '{account.account_name}' missing API key")
            return DynadotAPI(account.api_key)
        
        else:
            raise ValueError(f"Unknown provider type: {provider_type}")
    
    @staticmethod
    async def sync_account_domains(db: Session, account_id: int) -> Dict:
        """
        Sync domains from a specific account
        
        Returns:
            Dict with sync statistics: added, updated, errors
        """
        stats = {
            "account_id": account_id,
            "account_name": "",
            "provider_name": "",
            "added": 0,
            "updated": 0,
            "total_fetched": 0,
            "errors": []
        }
        
        try:
            # Get account
            account = account_crud.get(db, id=account_id)
            if not account:
                stats["errors"].append(f"Account {account_id} not found")
                return stats
            
            stats["account_name"] = account.account_name
            stats["provider_name"] = account.provider.provider_name
            
            # Get API client
            try:
                api_client = DomainSyncService.get_provider_api(account)
            except ValueError as e:
                stats["errors"].append(str(e))
                return stats
            
            # Fetch domains from provider API
            try:
                fetched_domains = await api_client.list_domains()
                stats["total_fetched"] = len(fetched_domains)
                logger.info(f"Fetched {len(fetched_domains)} domains from {account.account_name}")
            except Exception as e:
                error_msg = f"Failed to fetch domains: {str(e)}"
                stats["errors"].append(error_msg)
                logger.error(f"Account {account.account_name}: {error_msg}")
                return stats
            
            # Process each domain
            for domain_data in fetched_domains:
                try:
                    domain_name = domain_data.get("domain_name")
                    if not domain_name:
                        continue
                    
                    # Check if domain already exists
                    existing_domain = domain_crud.get_by_name(db, domain_name=domain_name)
                    
                    if existing_domain:
                        # Update existing domain
                        if existing_domain.account_id != account_id:
                            existing_domain.account_id = account_id
                            db.commit()
                            stats["updated"] += 1
                            logger.info(f"Updated domain: {domain_name}")
                    else:
                        # Create new domain
                        new_domain = Domain(
                            domain_name=domain_name,
                            account_id=account_id,
                            status=DomainStatus.FREE,
                            rotation=0,
                            server=""
                        )
                        db.add(new_domain)
                        db.commit()
                        stats["added"] += 1
                        logger.info(f"Added new domain: {domain_name}")
                
                except Exception as e:
                    error_msg = f"Error processing domain {domain_data.get('domain_name', 'unknown')}: {str(e)}"
                    stats["errors"].append(error_msg)
                    logger.error(error_msg)
                    continue
            
            logger.info(f"Sync completed for {account.account_name}: {stats['added']} added, {stats['updated']} updated")
            
        except Exception as e:
            error_msg = f"Unexpected error during sync: {str(e)}"
            stats["errors"].append(error_msg)
            logger.error(error_msg)
        
        return stats
    
    @staticmethod
    async def sync_all_accounts(db: Session) -> List[Dict]:
        """
        Sync domains from all accounts
        
        Returns:
            List of sync statistics for each account
        """
        accounts = account_crud.get_multi(db)
        results = []
        
        for account in accounts:
            logger.info(f"Starting sync for account: {account.account_name}")
            result = await DomainSyncService.sync_account_domains(db, account.id)
            results.append(result)
        
        return results
    
    @staticmethod
    def test_account_connection(account: Account) -> Dict:
        """
        Test connection to account API
        
        Returns:
            Dict with status and message
        """
        try:
            api_client = DomainSyncService.get_provider_api(account)
            is_connected = api_client.test_connection()
            
            return {
                "account_id": account.id,
                "account_name": account.account_name,
                "provider_name": account.provider.provider_name,
                "connected": is_connected,
                "message": "Connection successful" if is_connected else "Connection failed"
            }
        except ValueError as e:
            return {
                "account_id": account.id,
                "account_name": account.account_name,
                "provider_name": account.provider.provider_name if account.provider else "Unknown",
                "connected": False,
                "message": str(e)
            }
        except Exception as e:
            return {
                "account_id": account.id,
                "account_name": account.account_name,
                "provider_name": account.provider.provider_name if account.provider else "Unknown",
                "connected": False,
                "message": f"Error: {str(e)}"
            }
