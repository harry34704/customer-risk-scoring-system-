from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.reports import ImportResult
from app.services.imports import import_applicants_csv, import_payment_histories_csv

router = APIRouter()


@router.post("/applicants", response_model=ImportResult)
async def upload_applicants_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ImportResult:
    result = import_applicants_csv(session, current_user.id, await file.read())
    session.commit()
    return result


@router.post("/payment-histories", response_model=ImportResult)
async def upload_payment_history_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> ImportResult:
    result = import_payment_histories_csv(session, current_user.id, await file.read())
    session.commit()
    return result

