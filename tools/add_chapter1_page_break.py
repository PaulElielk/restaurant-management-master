from pathlib import Path

from docx import Document
from docx.enum.text import WD_BREAK

DOCX = Path("final_capstone_report_submission_ready.docx")


def main():
    doc = Document(DOCX)
    for para in doc.paragraphs:
        if para.text.strip() == "Chapter 1 - Introduction" and para.style.name.startswith("Heading"):
            prev = para.insert_paragraph_before()
            prev.add_run().add_break(WD_BREAK.PAGE)
            break
    doc.save(DOCX)
    print(f"Inserted page break before Chapter 1 in {DOCX}")


if __name__ == "__main__":
    main()
