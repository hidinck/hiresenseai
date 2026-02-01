import pdfplumber
from docx import Document


def extract_text(path):
    suffix = path.suffix.lower()

    # PDF
    if suffix == ".pdf":
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text

    # DOCX
    elif suffix == ".docx":
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)

    # TXT fallback
    else:
        return path.read_text(errors="ignore")
