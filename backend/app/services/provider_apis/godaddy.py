import aiohttp
from typing import List, Dict, Optional
from .base import ProviderAPIBase


class GoDaddyAPI(ProviderAPIBase):
    """GoDaddy API integration"""
    
    BASE_URL = "https://api.godaddy.com/v1"
    
    def __init__(self, api_key: str, api_secret: str):
        super().__init__(api_key, api_secret)
        self.headers = {
            "Authorization": f"sso-key {api_key}:{api_secret}",
            "Content-Type": "application/json"
        }
    
    async def list_domains(self) -> List[Dict]:
        """Fetch all domains from GoDaddy"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.BASE_URL}/domains",
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        domains_data = await response.json()
                        return [
                            {
                                "domain_name": domain.get("domain"),
                                "status": domain.get("status", "active").lower(),
                                "expiration_date": domain.get("expires"),
                                "nameservers": domain.get("nameServers", []),
                            }
                            for domain in domains_data
                        ]
                    else:
                        error_text = await response.text()
                        raise Exception(f"GoDaddy API error: {response.status} - {error_text}")
        except Exception as e:
            raise Exception(f"Failed to fetch domains from GoDaddy: {str(e)}")
    
    async def get_domain_info(self, domain_name: str) -> Dict:
        """Get detailed information about a specific domain"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.BASE_URL}/domains/{domain_name}",
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get domain info: {response.status}")
        except Exception as e:
            raise Exception(f"Failed to get domain info from GoDaddy: {str(e)}")
    
    def test_connection(self) -> bool:
        """Test if API credentials are valid"""
        import requests
        try:
            response = requests.get(
                f"{self.BASE_URL}/domains",
                headers=self.headers,
                timeout=10
            )
            return response.status_code == 200
        except:
            return False
