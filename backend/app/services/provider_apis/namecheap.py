import aiohttp
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional
from .base import ProviderAPIBase


class NamecheapAPI(ProviderAPIBase):
    """Namecheap API integration
    
    Note: Namecheap has two environments:
    - Production: https://api.namecheap.com/xml.response
    - Sandbox: https://api.sandbox.namecheap.com/xml.response
    
    This implementation uses PRODUCTION by default.
    For sandbox testing, you need a separate sandbox account.
    """
    
    BASE_URL = "https://api.namecheap.com/xml.response"
    
    def __init__(self, api_key: str, api_user: str, username: str, client_ip: str, use_sandbox: bool = False):
        super().__init__(api_key)
        self.api_user = api_user
        self.username = username
        self.client_ip = client_ip
        if use_sandbox:
            self.BASE_URL = "https://api.sandbox.namecheap.com/xml.response"
    
    def _build_params(self, command: str, extra_params: Dict = None) -> Dict:
        """Build common API parameters"""
        params = {
            "ApiUser": self.api_user,
            "ApiKey": self.api_key,
            "UserName": self.username,
            "ClientIp": self.client_ip,
            "Command": command,
        }
        if extra_params:
            params.update(extra_params)
        return params
    
    async def list_domains(self) -> List[Dict]:
        """Fetch all domains from Namecheap with pagination"""
        try:
            all_domains = []
            page = 1
            page_size = 100  # Max allowed by Namecheap
            
            print(f"[Namecheap] Starting domain fetch with pagination...")
            
            async with aiohttp.ClientSession() as session:
                while True:
                    # Build params with pagination
                    params = self._build_params("namecheap.domains.getList", {
                        "Page": str(page),
                        "PageSize": str(page_size)
                    })
                    
                    if page == 1:
                        # Debug logging for first request only
                        print(f"[Namecheap] Requesting domains with params:")
                        print(f"  ApiUser: {params.get('ApiUser')}")
                        print(f"  UserName: {params.get('UserName')}")
                        print(f"  ClientIp: {params.get('ClientIp')}")
                        print(f"  ApiKey: {params.get('ApiKey')[:10]}..." if params.get('ApiKey') else "  ApiKey: None")
                    
                    async with session.get(self.BASE_URL, params=params) as response:
                        if response.status == 200:
                            xml_data = await response.text()
                            
                            if page == 1:
                                print(f"[Namecheap] Response received (first 500 chars):")
                                print(xml_data[:500])
                            
                            root = ET.fromstring(xml_data)
                            
                            # Check for API errors
                            if root.get("Status") != "OK":
                                errors = root.findall(".//{http://api.namecheap.com/xml.response}Error")
                                error_msg = errors[0].text if errors else "Unknown error"
                                print(f"[Namecheap] API Error: {error_msg}")
                                raise Exception(f"Namecheap API error: {error_msg}")
                            
                            # Get pagination info
                            paging = root.find(".//{http://api.namecheap.com/xml.response}Paging")
                            if paging is not None:
                                total_items = int(paging.find(".//{http://api.namecheap.com/xml.response}TotalItems").text)
                                current_page = int(paging.find(".//{http://api.namecheap.com/xml.response}CurrentPage").text)
                                page_size_actual = int(paging.find(".//{http://api.namecheap.com/xml.response}PageSize").text)
                                
                                print(f"[Namecheap] Page {current_page}: Total domains = {total_items}, Page size = {page_size_actual}")
                            
                            # Parse domains from current page
                            domain_list = root.findall(".//{http://api.namecheap.com/xml.response}Domain")
                            
                            if not domain_list:
                                # No more domains, break the loop
                                break
                            
                            for domain in domain_list:
                                all_domains.append({
                                    "domain_name": domain.get("Name"),
                                    "status": "active" if domain.get("IsExpired") == "false" else "expired",
                                    "expiration_date": domain.get("Expires"),
                                    "nameservers": [],
                                })
                            
                            # Check if we've fetched all domains
                            if paging is not None and len(all_domains) >= total_items:
                                break
                            
                            # Move to next page
                            page += 1
                        else:
                            raise Exception(f"Namecheap API error: {response.status}")
                
                print(f"[Namecheap] Fetched total of {len(all_domains)} domains across {page} page(s)")
                return all_domains
        except Exception as e:
            raise Exception(f"Failed to fetch domains from Namecheap: {str(e)}")
    
    async def get_domain_info(self, domain_name: str) -> Dict:
        """Get detailed information about a specific domain"""
        try:
            params = self._build_params("namecheap.domains.getInfo", {
                "DomainName": domain_name
            })
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.BASE_URL, params=params) as response:
                    if response.status == 200:
                        xml_data = await response.text()
                        root = ET.fromstring(xml_data)
                        
                        if root.get("Status") != "OK":
                            raise Exception("Failed to get domain info")
                        
                        return {"domain_name": domain_name, "status": "active"}
                    else:
                        raise Exception(f"Failed to get domain info: {response.status}")
        except Exception as e:
            raise Exception(f"Failed to get domain info from Namecheap: {str(e)}")
    
    def test_connection(self) -> bool:
        """Test if API credentials are valid"""
        import requests
        try:
            params = self._build_params("namecheap.domains.getList")
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                root = ET.fromstring(response.text)
                status = root.get("Status")
                if status == "OK":
                    return True
                else:
                    # Log the error for debugging
                    errors = root.findall(".//{http://api.namecheap.com/xml.response}Error")
                    if errors:
                        error_msg = errors[0].text
                        print(f"Namecheap API Error: {error_msg}")
                    return False
            return False
        except Exception as e:
            print(f"Namecheap connection test exception: {str(e)}")
            return False
