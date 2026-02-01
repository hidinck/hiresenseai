from app.services.matcher import match_resume_to_jd

def rank_resumes(resumes, jd_skills):

    ranked = []

    for r in resumes:
        result = match_resume_to_jd(r["skills"], jd_skills)

        ranked.append({
            "filename": r["filename"],
            "score": result["match_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
            "explanation": result.get("explanation", ""),
            "recommendations": result.get("recommendations", [])
        })

    ranked.sort(key=lambda x: x["score"], reverse=True)

    return ranked
