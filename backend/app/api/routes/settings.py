from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import settings
from app.models import User
from app.schemas.reports import SettingsRead
from app.services.demo_data import demo_credentials
from app.services.features import APPLICANT_IMPORT_HEADERS, PAYMENT_IMPORT_HEADERS

router = APIRouter()


@router.get("", response_model=SettingsRead)
def read_settings(_: User = Depends(get_current_user)) -> SettingsRead:
    return SettingsRead(
        app_name=settings.app_name,
        frontend_url=settings.frontend_url,
        demo_credentials=demo_credentials(),
        expected_applicant_csv_headers=APPLICANT_IMPORT_HEADERS,
        expected_payment_csv_headers=PAYMENT_IMPORT_HEADERS,
        scoring_modes=[
            {"id": "deterministic", "label": "Deterministic rules", "description": "Configurable weighted policy rules."},
            {"id": "logistic", "label": "Logistic baseline", "description": "Synthetic baseline default model."},
        ],
    )

