import re

SKILL_KEYWORDS = [
    "python", "java", "c++", "sql", "fastapi",
    "machine learning", "ml", "deep learning",
    "pytorch", "tensorflow", "docker", "aws"
]

def extract_skills(text: str):
    text = text.lower()
    found = []

    for skill in SKILL_KEYWORDS:
        if re.search(rf"\b{re.escape(skill)}\b", text):
            found.append(skill)

    return list(set(found))
