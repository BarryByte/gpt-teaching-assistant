from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.db.database import get_users_collection
from app.models.schemas import Token, UserCreate

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, user: UserCreate):
    users_collection = get_users_collection()
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    user_dict = {
        "username": user.username,
        "hashed_password": hashed_password,
        "disabled": False,
        "created_at": datetime.now(),
    }
    users_collection.insert_one(user_dict)
    return {"message": "User created successfully"}


@router.post("/token", response_model=Token)
@limiter.limit("10/minute")
async def login_for_access_token(
    request: Request, form_data: OAuth2PasswordRequestForm = Depends()
):
    users_collection = get_users_collection()
    user_doc = users_collection.find_one({"username": form_data.username})
    if not user_doc or not verify_password(
        form_data.password, user_doc["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}  # nosec B105


@router.get("/users/me")
async def read_users_me(current_user=Depends(get_current_user)):
    return {"username": current_user.username}
