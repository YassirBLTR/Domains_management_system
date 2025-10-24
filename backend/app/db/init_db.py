from sqlalchemy.orm import Session

from app.crud.user import user as user_crud
from app.crud.provider import provider as provider_crud
from app.crud.account import account as account_crud
from app.schemas.user import UserCreate
from app.schemas.provider_schema import ProviderCreate
from app.schemas.account import AccountCreate
from app.core.config import settings


def init_db(db: Session) -> None:
    """
    Initialize database with default data.
    """
    # Create default admin user if not exists
    user = user_crud.get_by_username(db, username="admin")
    if not user:
        user_in = UserCreate(
            username="admin",
            email="admin@gestiondomains.com",
            password="admin123",  # Change this in production!
            full_name="System Administrator",
            is_admin=True,
            is_active=True,
        )
        user_crud.create(db, obj_in=user_in)
        print("✓ Created default admin user")
    
    # Create default operator user if not exists
    operator = user_crud.get_by_username(db, username="operator")
    if not operator:
        operator_in = UserCreate(
            username="operator",
            email="operator@gestiondomains.com",
            password="operator123",  # Change this in production!
            full_name="Domain Operator",
            is_admin=False,
            is_active=True,
        )
        user_crud.create(db, obj_in=operator_in)
        print("✓ Created default operator user")
    
    # Create default providers: GoDaddy, Namecheap, Dynadot
    providers_data = ["godaddy", "namecheap", "dynadot"]
    
    created_providers = {}
    for provider_name in providers_data:
        existing_provider = provider_crud.get_by_name(db, provider_name=provider_name)
        if not existing_provider:
            provider_in = ProviderCreate(provider_name=provider_name)
            provider = provider_crud.create(db, obj_in=provider_in)
            created_providers[provider_name] = provider
            print(f"✓ Created provider: {provider_name}")
        else:
            created_providers[provider_name] = existing_provider
    
    # Create sample accounts for each provider
    sample_accounts = [
        {
            "account_name": "GoDaddy Main Account",
            "provider_type": "godaddy",
            "api_key": "your_godaddy_api_key_here",
            "password": "your_godaddy_api_secret_here",
        },
        {
            "account_name": "Namecheap Main Account",
            "provider_type": "namecheap",
            "api_key": "your_namecheap_api_key_here",
            "email": "your_namecheap_username",
            "password": "your_whitelisted_ip",
        },
        {
            "account_name": "Dynadot Main Account",
            "provider_type": "dynadot",
            "api_key": "your_dynadot_api_key_here",
        },
    ]
    
    for account_data in sample_accounts:
        provider_type = account_data.pop("provider_type")
        provider = created_providers.get(provider_type)
        
        if provider:
            existing_account = account_crud.get_by_account_name(
                db, account_name=account_data["account_name"]
            )
            if not existing_account:
                account_in = AccountCreate(
                    provider_id=provider.id,
                    **account_data
                )
                account_crud.create(db, obj_in=account_in)
                print(f"✓ Created account: {account_data['account_name']}")
    
    print("\n✓ Database initialization completed!")
