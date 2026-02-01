from typing import List, Dict


def generate_explanation(matched: List[str], missing: List[str]) -> str:
    explanation = ""

    if len(matched) > len(missing):
        explanation += "Candidate matches most of the required skills. "
    else:
        explanation += "Candidate is missing several key requirements. "

    if missing:
        explanation += (
            "Missing skills include: "
            + ", ".join(missing)
            + ". "
        )

    if matched:
        explanation += (
            "Strong areas: "
            + ", ".join(matched)
            + "."
        )

    return explanation


def generate_recommendations(missing: List[str]) -> List[str]:
    recs = []

    for skill in missing:
        if skill.lower() in ["aws", "azure", "gcp"]:
            recs.append(
                "Gain cloud experience by building projects on AWS or Azure."
            )
        elif skill.lower() in ["docker", "kubernetes"]:
            recs.append(
                "Practice containerization using Docker and Kubernetes."
            )
        elif skill.lower() in ["machine learning", "deep learning"]:
            recs.append(
                "Strengthen ML/DL fundamentals and showcase projects."
            )
        else:
            recs.append(f"Improve proficiency in {skill}.")

    return recs


def match_resume_to_jd(
    resume_skills: List[str],
    jd_skills: List[str],
) -> Dict:

    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)

    matched = sorted(resume_set & jd_set)
    missing = sorted(jd_set - resume_set)

    score = round((len(matched) / max(len(jd_set), 1)) * 100, 2)

    explanation = generate_explanation(matched, missing)
    recommendations = generate_recommendations(missing)

    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "explanation": explanation,
        "recommendations": recommendations,
    }
