from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.shared import Inches

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

DOCX = ROOT / "final_capstone_report_submission_ready.docx"


TOC_ITEMS = [
    ("Declaration", 2),
    ("Dedication", 2),
    ("Acknowledgements", 2),
    ("Abstract", 2),
    ("List of Figures", 3),
    ("List of Tables", 3),
    ("Chapter 1 - Introduction", 4),
    ("Chapter 2 - Restaurant Management Systems", 8),
    ("Chapter 3 - Artificial Intelligence Techniques Used in the Project", 10),
    ("Chapter 4 - System Analysis and Design", 15),
    ("Chapter 5 - System Implementation", 22),
    ("Chapter 6 - System Evaluation", 31),
    ("Chapter 7 - Conclusion and Future Work", 41),
    ("References", 45),
    ("Appendices", 46),
]

FIGURE_ITEMS = [
    ("Figure 4.1 - Overall system architecture", 17),
    ("Figure 4.2 - Database entity relationship diagram", 18),
    ("Figure 4.3 - Frontend, API, and database interaction flow", 20),
    ("Figure 4.4 - Customer ordering workflow", 21),
    ("Figure 5.1 - Recommendation engine workflow", 25),
    ("Figure 5.2 - Chatbot and NLP processing pipeline", 27),
    ("Figure 5.3 - Demand forecasting workflow", 28),
    ("Figure 5.4 - Customer menu and recommendation interface", 26),
    ("Figure 5.5 - Chatbot interface showing a drink recommendation response", 27),
    ("Figure 5.6 - Admin dashboard order-status and action controls", 29),
    ("Figure 5.7 - Admin dashboard with demand forecast output", 30),
    ("Figure 6.1 - Precision@K for the recommendation engine using the expanded synthetic development dataset", 34),
    ("Figure 6.2 - Recall@K for the recommendation engine using the expanded synthetic development dataset", 35),
    ("Figure 6.3 - Expanded dataset precision and recall comparison across recommendation cutoffs", 35),
    ("Figure 6.4 - Chatbot intent classification confusion matrix", 37),
    ("Figure 6.5 - Chatbot intent classification performance metrics", 38),
    ("Figure 6.6 - Forecast confidence distribution based on activity-day regularity", 39),
]

TABLE_ITEMS = [
    ("Table 1.1 - Project objectives and verification methods", 5),
    ("Table 1.2 - Definition of terms", 6),
    ("Table 4.1 - Functional requirements", 15),
    ("Table 4.2 - Non-functional requirements", 16),
    ("Table 4.3 - Database schema overview", 18),
    ("Table 4.4 - Main API domains", 19),
    ("Table 5.1 - Model selection, training, and fine-tuning summary", 23),
    ("Table 6.1 - Functional validation summary", 32),
    ("Table 6.2 - Original and expanded recommendation evaluation dataset characteristics", 32),
    ("Table 6.3 - Recommendation metric comparison before and after synthetic dataset expansion", 34),
    ("Table 6.4 - Chatbot training and validation dataset summary", 36),
    ("Table 6.5 - Chatbot per-intent validation performance", 37),
    ("Table 6.6 - Forecast confidence distribution from forecast-seeded development database", 39),
    ("Table 6.7 - Highest forecast outputs using the moving-average velocity formula", 40),
    ("Table 6.8 - Evaluation limitations and recommended validation improvements", 41),
    ("Table 7.1 - Short-term future work", 42),
    ("Table 7.2 - Medium-term future work", 43),
    ("Table 7.3 - Long-term future work", 43),
]


def paragraph_text(element) -> str:
    return "".join(t.text or "" for t in element.iter(base.qn("w:t"))).strip()


def replace_section(doc: Document, heading: str, next_heading: str, items: list[tuple[str, int]]):
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
    for label, page in items:
        p = doc.add_paragraph(style="Normal")
        p.paragraph_format.space_after = 0
        p.paragraph_format.tab_stops.add_tab_stop(Inches(6.35), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
        p.add_run(label)
        p.add_run("\t")
        p.add_run(str(page))
        el = base.pop_last_body_element(doc)
        base.add_after(anchor, el)
        anchor = el


def main():
    doc = Document(DOCX)
    replace_section(doc, "Table of Contents", "List of Figures", TOC_ITEMS)
    replace_section(doc, "List of Figures", "List of Tables", FIGURE_ITEMS)
    replace_section(doc, "List of Tables", "Chapter 1 - Introduction", TABLE_ITEMS)
    doc.save(DOCX)
    print(f"Updated front matter in {DOCX}")


if __name__ == "__main__":
    main()
