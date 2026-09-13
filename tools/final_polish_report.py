from __future__ import annotations

import sys
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

DOCX = ROOT / "final_capstone_report_submission_ready.docx"


TABLE_LIST = [
    "Table 1.1 - Project objectives and verification methods",
    "Table 1.2 - Definition of terms",
    "Table 4.1 - Functional requirements",
    "Table 4.2 - Non-functional requirements",
    "Table 4.3 - Database schema overview",
    "Table 4.4 - Main API domains",
    "Table 5.1 - Model selection, training, and fine-tuning summary",
    "Table 6.1 - Functional validation summary",
    "Table 6.2 - Original and expanded recommendation evaluation dataset characteristics",
    "Table 6.3 - Recommendation metric comparison before and after synthetic dataset expansion",
    "Table 6.4 - Chatbot training and validation dataset summary",
    "Table 6.5 - Chatbot per-intent validation performance",
    "Table 6.6 - Forecast confidence distribution from forecast-seeded development database",
    "Table 6.7 - Highest forecast outputs using the moving-average velocity formula",
    "Table 6.8 - Evaluation limitations and recommended validation improvements",
    "Table 7.1 - Short-term future work",
    "Table 7.2 - Medium-term future work",
    "Table 7.3 - Long-term future work",
]


def paragraph_text(element) -> str:
    return "".join(t.text or "" for t in element.iter(base.qn("w:t"))).strip()


def replace_section_list(doc: Document, heading: str, next_heading: str, items: list[str]):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = paragraph_text(child)
            if text == heading:
                start = idx
            elif start is not None and text == next_heading:
                end = idx
                break
    if start is None or end is None:
        raise RuntimeError(f"Could not locate {heading}")
    for child in children[start + 1 : end]:
        body.remove(child)
    anchor = children[start]
    for item in items:
        anchor = base.add_paragraph_after(doc, anchor, item, "List Bullet")


def remove_toc_note(doc: Document):
    body = doc._body._element
    for child in list(body):
        if child.tag.endswith("}p") and paragraph_text(child).startswith("Note: Page numbers should be updated"):
            body.remove(child)


def remove_appendix_e(doc: Document):
    body = doc._body._element
    children = list(body)
    start = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p") and paragraph_text(child) == "Appendix E - Suggested Figures to Insert Before Final PDF Export":
            start = idx
            break
    if start is None:
        return
    for child in children[start:]:
        body.remove(child)


def replace_paragraph(doc: Document, startswith: str, new_text: str):
    for para in doc.paragraphs:
        if para.text.strip().startswith(startswith):
            para.text = new_text
            return


def add_after_paragraph(doc: Document, startswith: str, text: str):
    if any(p.text.strip() == text for p in doc.paragraphs):
        return
    for para in doc.paragraphs:
        if para.text.strip().startswith(startswith):
            base.add_paragraph_after(doc, para._p, text)
            return
    raise RuntimeError(f"Anchor not found: {startswith}")


def update_table_cells(doc: Document):
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                txt = cell.text.strip()
                if txt == "5000":
                    cell.text = "5,000"
                elif txt == "11738":
                    cell.text = "11,738"


def main():
    doc = Document(DOCX)
    remove_toc_note(doc)
    replace_section_list(doc, "List of Tables", "Chapter 1 - Introduction", TABLE_LIST)
    remove_appendix_e(doc)
    update_table_cells(doc)

    add_after_paragraph(
        doc,
        "The expanded synthetic development dataset evaluated 298 users",
        "The expanded dataset loaded into the development database contained 300 synthetic users, 5,000 completed synthetic orders, and 11,738 order line items. These values describe the development evaluation dataset only and should not be interpreted as production restaurant transaction data.",
    )
    add_after_paragraph(
        doc,
        "To evaluate the implemented confidence indicator more realistically",
        "The final forecast-seeded database contained 519 recent completed synthetic forecast orders. The resulting confidence distribution was 12 low-confidence items, 16 medium-confidence items, and 14 high-confidence items across the 42 menu items.",
    )
    add_after_paragraph(
        doc,
        "No production chatbot transcript dataset, forecast-versus-actual benchmark table",
        "A future real-world validation study should define measurable outcomes before deployment and should use controlled experimental or quasi-experimental methods where appropriate; controlled online experimentation is commonly recommended when evaluating production system changes (Kohavi et al., 2020).",
    )

    replace_paragraph(
        doc,
        "The project includes test_recs.js",
        "The project includes database-backed recommendation evaluation scripts in the tools directory, including tools/load_synthetic_recommendation_seed.mjs and tools/evaluate_recommendations_from_db_fast.mjs. These scripts support reproducible development evaluation of Precision@K and Recall@K using the seeded database.",
    )
    replace_paragraph(
        doc,
        "The project includes backend/sql/fake_transactions_seed.sql",
        "The project includes backend/sql/synthetic_recommendation_eval_seed.sql and backend/sql/synthetic_forecast_eval_seed.sql for bootstrapping recommendation and forecasting signals during development. These seeded transactions support functional and model-oriented validation but should not be treated as a substitute for real restaurant deployment data.",
    )

    doc.save(DOCX)
    print(f"Polished {DOCX}")


if __name__ == "__main__":
    main()
