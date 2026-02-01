from sqlalchemy import Column, Integer, String, Float
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)
