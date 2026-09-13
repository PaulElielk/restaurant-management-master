from __future__ import annotations

from pathlib import Path
from docx import Document

DOCX = Path("final_capstone_report_submission_ready.docx")


REPLACEMENTS = {
    "Figure 4.3 - Customer ordering workflow": "Figure 4.4 - Customer ordering workflow",
    "Figure 4.4 - Frontend, API, and database interaction flow": "Figure 4.3 - Frontend, API, and database interaction flow",
    "Figure 4.3 illustrates the customer ordering workflow": "Figure 4.4 illustrates the customer ordering workflow",
    "Figure 4.4 shows the request-response path": "Figure 4.3 shows the request-response path",
}


def main():
    doc = Document(DOCX)
    for para in doc.paragraphs:
        text = para.text
        for old, new in REPLACEMENTS.items():
            text = text.replace(old, new)
        if text != para.text:
            para.text = text
    doc.save(DOCX)
    print(f"Updated {DOCX}")


if __name__ == "__main__":
    main()
