from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.dashboard import DashboardOverview
from app.services.dashboard import fetch_dashboard_overview

router = APIRouter()


@router.get("/overview", response_model=DashboardOverview)
def read_dashboard_overview(
    mode: str = Query(default="deterministic"),
    _: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> DashboardOverview:
    return fetch_dashboard_overview(session, mode)

