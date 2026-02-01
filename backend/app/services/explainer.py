def generate_ai_feedback(matched, missing, score):

    if score >= 80:
        return "Excellent fit for the role. Strong alignment with required skills."

    if score >= 50:
        return (
            "Candidate meets many core requirements but lacks "
            + ", ".join(missing)
            + ". Recommend targeted upskilling."
        )

    return (
        "Candidate lacks "
        + ", ".join(missing)
        + ". Recommend cloud exposure and real-world project experience."
    )
