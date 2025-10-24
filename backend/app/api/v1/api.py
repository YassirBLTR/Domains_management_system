from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, providers, accounts, isps, teams, mailers, domains, sync

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(providers.router, prefix="/providers", tags=["providers"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(isps.router, prefix="/isps", tags=["isps"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(mailers.router, prefix="/mailers", tags=["mailers"])
api_router.include_router(domains.router, prefix="/domains", tags=["domains"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
