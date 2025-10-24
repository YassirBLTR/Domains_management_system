import aiohttp
from typing import List, Dict
from .base import ProviderAPIBase


class DynadotAPI(ProviderAPIBase):
    """Dynadot API integration"""
    
    BASE_URL = "https://api.dynadot.com/api3.json"
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
    
    async def list_domains(self) -> List[Dict]:
        """Fetch all domains from Dynadot"""
        try:
            params = {
                "key": self.api_key,
                "command": "list_domain"
            }
            
            print(f"[Dynadot] Requesting domains from {self.BASE_URL}")
            print(f"[Dynadot] API Key: {self.api_key[:10]}...{self.api_key[-5:]}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.BASE_URL, params=params) as response:
                    if response.status == 200:
                        # Get response as text first to handle content type issues
                        text_response = await response.text()
                        print(f"[Dynadot] Response status: {response.status}")
                        print(f"[Dynadot] Content-Type: {response.headers.get('Content-Type')}")
                        print(f"[Dynadot] Response (first 500 chars): {text_response[:500]}")
                        
                        # Try to parse as JSON
                        try:
                            import json
                            data = json.loads(text_response)
                        except json.JSONDecodeError as e:
                            # If not JSON, it might be an error message in plain text
                            print(f"[Dynadot] JSON decode error: {str(e)}")
                            raise Exception(f"Dynadot returned non-JSON response: {text_response[:200]}")
                        
                        # Check for API errors
                        response_code = data.get("ListDomainInfoResponse", {}).get("ResponseCode")
                        print(f"[Dynadot] Response code: {response_code}")
                        
                        if response_code != 0:
                            error_msg = data.get("ListDomainInfoResponse", {}).get("Error", "Unknown error")
                            print(f"[Dynadot] API Error: {error_msg}")
                            raise Exception(f"Dynadot API error (Code {response_code}): {error_msg}")
                        
                        # Dynadot returns domains under "MainDomains" key
                        domain_list = data.get("ListDomainInfoResponse", {}).get("MainDomains", [])
                        
                        # Fallback to DomainInfoList if MainDomains is not present
                        if not domain_list:
                            domain_list = data.get("ListDomainInfoResponse", {}).get("DomainInfoList", [])
                        
                        # Handle None case
                        if domain_list is None:
                            domain_list = []
                        
                        print(f"[Dynadot] Found {len(domain_list)} domains")
                        
                        domains = []
                        for domain in domain_list:
                            # Convert timestamp to readable date if present
                            expiration = domain.get("Expiration")
                            if expiration and isinstance(expiration, str) and expiration.isdigit():
                                # Dynadot returns timestamp in milliseconds
                                from datetime import datetime
                                expiration = datetime.fromtimestamp(int(expiration) / 1000).strftime('%Y-%m-%d')
                            
                            domains.append({
                                "domain_name": domain.get("Name"),
                                "status": "active" if domain.get("Disabled") == "no" else "disabled",
                                "expiration_date": expiration,
                                "nameservers": [],  # Dynadot structure is different, would need separate parsing
                            })
                        
                        print(f"[Dynadot] Successfully fetched {len(domains)} domains")
                        return domains
                    else:
                        error_text = await response.text()
                        raise Exception(f"Dynadot API error: {response.status} - {error_text}")
        except Exception as e:
            raise Exception(f"Failed to fetch domains from Dynadot: {str(e)}")
    
    async def get_domain_info(self, domain_name: str) -> Dict:
        """Get detailed information about a specific domain"""
        try:
            params = {
                "key": self.api_key,
                "command": "domain_info",
                "domain": domain_name
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.BASE_URL, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("DomainInfoResponse", {})
                    else:
                        raise Exception(f"Failed to get domain info: {response.status}")
        except Exception as e:
            raise Exception(f"Failed to get domain info from Dynadot: {str(e)}")
    
    def test_connection(self) -> bool:
        """Test if API credentials are valid"""
        import requests
        try:
            params = {
                "key": self.api_key,
                "command": "list_domain"
            }
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("ListDomainInfoResponse", {}).get("ResponseCode") == 0
            return False
        except:
            return False
