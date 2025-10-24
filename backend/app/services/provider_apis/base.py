from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class ProviderAPIBase(ABC):
    """Base class for provider API integrations"""
    
    def __init__(self, api_key: str, api_secret: Optional[str] = None):
        self.api_key = api_key
        self.api_secret = api_secret
    
    @abstractmethod
    async def list_domains(self) -> List[Dict]:
        """
        Fetch all domains from the provider.
        
        Returns:
            List of domain dictionaries with keys:
            - domain_name: str
            - status: str (active, expired, etc.)
            - expiration_date: str (optional)
            - nameservers: List[str] (optional)
        """
        pass
    
    @abstractmethod
    async def get_domain_info(self, domain_name: str) -> Dict:
        """Get detailed information about a specific domain"""
        pass
    
    @abstractmethod
    def test_connection(self) -> bool:
        """Test if API credentials are valid"""
        pass
