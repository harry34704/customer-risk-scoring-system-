from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import User
from app.schemas.reports import SettingsRead, WorkspaceBootstrapRead
from app.services.features import APPLICANT_IMPORT_HEADERS, PAYMENT_IMPORT_HEADERS
from app.services.scoring import ensure_default_rules
from app.services.workspace import bootstrap_demo_workspace, build_workspace_summary, seeded_demo_credentials

router = APIRouter()


@router.get("", response_model=SettingsRead)
def read_settings(current_user: User = Depends(get_current_user), session: Session = Depends(get_db)) -> SettingsRead:
    ensure_default_rules(session, owner_user_id=current_user.id, actor_user_id=current_user.id)
    session.flush()
    return SettingsRead(
        app_name=settings.app_name,
        frontend_url=settings.frontend_url,
        demo_credentials=seeded_demo_credentials(session),
        workspace_summary=build_workspace_summary(session, current_user.id),
        expected_applicant_csv_headers=APPLICANT_IMPORT_HEADERS,
        expected_payment_csv_headers=PAYMENT_IMPORT_HEADERS,
        scoring_modes=[
            {"id": "deterministic", "label": "Deterministic rules", "description": "Configurable weighted policy rules."},
            {"id": "logistic", "label": "Logistic baseline", "description": "Synthetic baseline default model."},
        ],
    )


@router.post("/bootstrap-demo", response_model=WorkspaceBootstrapRead)
def bootstrap_demo(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> WorkspaceBootstrapRead:
    result = bootstrap_demo_workspace(session, current_user)
    session.commit()
    return result
