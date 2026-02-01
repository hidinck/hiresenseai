from sqlalchemy import create_engine, Column, Integer, String, Float, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./hiresense.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


class ResumeResult(Base):
    __tablename__ = "resume_results"

    id = Column(Integer, primary_key=True, index=True)

    resume_name = Column(String)
    jd_name = Column(String)

    resume_skills = Column(JSON)
    jd_skills = Column(JSON)

    matched_skills = Column(JSON)
    missing_skills = Column(JSON)

    score = Column(Float)

    explanation = Column(String)


def create_tables():
    Base.metadata.create_all(bind=engine)
