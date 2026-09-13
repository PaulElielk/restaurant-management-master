from pathlib import Path

from docx import Document
from docx.oxml.ns import qn

DOCX = Path("final_capstone_report_submission_ready.docx")


def paragraph_has_page_break(para) -> bool:
    for br in para._p.iter(qn("w:br")):
        if br.get(qn("w:type")) == "page":
            return True
    return False


def main():
    doc = Document(DOCX)
    for idx, para in enumerate(doc.paragraphs):
        if para.text.strip() == "Chapter 1 - Introduction" and para.style.name.startswith("Heading"):
            prev = doc.paragraphs[idx - 1] if idx > 0 else None
            if prev is not None and paragraph_has_page_break(prev):
                prev._element.getparent().remove(prev._element)
            break
    doc.save(DOCX)
    print(f"Removed page break before Chapter 1 in {DOCX}")


if __name__ == "__main__":
    main()
