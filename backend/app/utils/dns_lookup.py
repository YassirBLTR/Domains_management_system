"""
DNS lookup utilities for domain A record resolution
"""
import socket
from typing import Optional

def get_a_record(domain_name: str) -> Optional[str]:
    """
    Get the A record (IP address) for a domain name.
    
    Args:
        domain_name: The domain name to lookup
        
    Returns:
        IP address as string, or None if lookup fails
    """
    try:
        # Remove any protocol prefix if present
        clean_domain = domain_name.replace('http://', '').replace('https://', '').split('/')[0]
        
        # Get the IP address
        ip_address = socket.gethostbyname(clean_domain)
        return ip_address
    except socket.gaierror:
        # DNS lookup failed
        return None
    except Exception as e:
        # Other errors
        print(f"Error looking up A record for {domain_name}: {str(e)}")
        return None


def get_multiple_a_records(domain_name: str) -> list:
    """
    Get all A records for a domain (if multiple IPs exist).
    
    Args:
        domain_name: The domain name to lookup
        
    Returns:
        List of IP addresses, or empty list if lookup fails
    """
    try:
        clean_domain = domain_name.replace('http://', '').replace('https://', '').split('/')[0]
        
        # Get all IP addresses
        result = socket.getaddrinfo(clean_domain, None, socket.AF_INET)
        ip_addresses = list(set([addr[4][0] for addr in result]))
        return ip_addresses
    except Exception as e:
        print(f"Error looking up A records for {domain_name}: {str(e)}")
        return []
