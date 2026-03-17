from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models import User
from app.schemas.common import UserProfileRead

router = APIRouter()


@router.get("/me", response_model=UserProfileRead)
async def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

