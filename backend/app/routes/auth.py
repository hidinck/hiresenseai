from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import SessionLocal
from app.models.user import User

from app.services.auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


# ===============================
# 📦 SCHEMA
# ===============================

class AuthPayload(BaseModel):
    email: str
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===============================
# REGISTER
# ===============================

@router.post("/register")
def register(payload: AuthPayload, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=payload.email,
        password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()

    return {"message": "Registered successfully"}


# ===============================
# LOGIN
# ===============================

@router.post("/login")
def login(payload: AuthPayload, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": user.email})

    return {"access_token": token, "token_type": "bearer"}
