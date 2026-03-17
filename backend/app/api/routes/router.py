from fastapi import APIRouter

from app.api.routes import applicants, dashboard, imports, me, reports, rules, settings

api_router = APIRouter()
api_router.include_router(me.router, tags=["me"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(applicants.router, prefix="/applicants", tags=["applicants"])
api_router.include_router(rules.router, prefix="/rules", tags=["rules"])
api_router.include_router(imports.router, prefix="/imports", tags=["imports"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

