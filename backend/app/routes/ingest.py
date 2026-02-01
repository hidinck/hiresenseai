from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import shutil
from typing import List

from app.services.matcher import match_resume_to_jd
from app.services.text_extractor import extract_text
from app.services.skill_extractor import extract_skills
from app.db import SessionLocal, ResumeResult
from app.services.ranker import rank_resumes


router = APIRouter(prefix="/ingest", tags=["ingest"])

UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# =====================================================
# ---------------- RESUME UPLOAD ----------------------
# works for SINGLE + MULTIPLE files
# frontend hits: /ingest/resume
# =====================================================

@router.post("/resume")
async def upload_resume(files: List[UploadFile] = File(...)):

    results = []

    for file in files:
        save_path = UPLOAD_DIR / file.filename

        # Save uploaded file
        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract raw text
        text = extract_text(save_path)

        # Extract skills
        skills = extract_skills(text)

        results.append({
            "filename": file.filename,
            "skills": skills,
            "preview": text[:500],
        })

    return {
        "status": "uploaded",
        "count": len(results),
        "resumes": results,
    }


# =====================================================
# ---------------- JD UPLOAD --------------------------
# =====================================================

@router.post("/jd")
async def upload_jd(file: UploadFile = File(...)):

    save_path = UPLOAD_DIR / f"jd_{file.filename}"

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(save_path)
    skills = extract_skills(text)

    return {
        "status": "uploaded",
        "filename": file.filename,
        "skills": skills,
        "preview": text[:500],
    }


# =====================================================
# ---------------- MATCH + SAVE TO DB -----------------
# =====================================================

@router.post("/match")
async def match_resume(payload: dict):

    resume_skills = payload["resume_skills"]
    jd_skills = payload["jd_skills"]

    # --- run matcher ---
    result = match_resume_to_jd(resume_skills, jd_skills)

    # --- save to DB ---
    db = SessionLocal()

    row = ResumeResult(
        resume_name="uploaded_resume",
        jd_name="uploaded_jd",
        resume_skills=resume_skills,
        jd_skills=jd_skills,
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        score=result["match_score"],
        explanation=result.get("explanation", ""),
    )

    db.add(row)
    db.commit()
    db.close()

    return result


# =====================================================
# ---------------- RANKING ----------------------------
# =====================================================

@router.post("/rank")
async def rank_uploaded_resumes(payload: dict):

    resumes = payload["resumes"]
    jd_skills = payload["jd_skills"]

    leaderboard = rank_resumes(resumes, jd_skills)

    return leaderboard
