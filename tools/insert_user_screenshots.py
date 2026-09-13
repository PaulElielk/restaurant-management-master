from __future__ import annotations

import sys
from pathlib import Path

from docx import Document
from docx.shared import Inches

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

DOCX = ROOT / "final_capstone_report_ai_enhanced_final.docx"
FIG_DIR = ROOT / "report_figures"


FIGURE_LIST = [
    "Figure 4.1 - Overall system architecture",
    "Figure 4.2 - Database entity relationship diagram",
    "Figure 4.3 - Customer ordering workflow",
    "Figure 4.4 - Frontend, API, and database interaction flow",
    "Figure 5.1 - Recommendation engine workflow",
    "Figure 5.2 - Chatbot and NLP processing pipeline",
    "Figure 5.3 - Demand forecasting workflow",
    "Figure 5.4 - Customer menu and recommendation interface",
    "Figure 5.5 - Chatbot interface showing a drink recommendation response",
    "Figure 5.6 - Admin dashboard order-status and action controls",
    "Figure 5.7 - Admin dashboard with demand forecast output",
    "Figure 6.1 - Precision@K for the recommendation engine using the expanded synthetic development dataset",
    "Figure 6.2 - Recall@K for the recommendation engine using the expanded synthetic development dataset",
    "Figure 6.3 - Expanded dataset precision and recall comparison across recommendation cutoffs",
    "Figure 6.4 - Chatbot intent classification confusion matrix",
    "Figure 6.5 - Chatbot intent classification performance metrics",
    "Figure 6.6 - Forecast confidence distribution based on activity-day regularity",
]


def paragraph_text(element) -> str:
    return "".join(t.text or "" for t in element.iter(base.qn("w:t"))).strip()


def caption_exists(doc: Document, caption: str) -> bool:
    return any(p.text.strip() == caption and p.style.name == "Caption" for p in doc.paragraphs)


def find_caption(doc: Document, caption: str):
    for para in doc.paragraphs:
        if para.text.strip() == caption and para.style.name == "Caption":
            return para
    raise RuntimeError(f"Caption not found: {caption}")


def find_heading(doc: Document, heading: str):
    for para in doc.paragraphs:
        if para.text.strip() == heading:
            return para
    raise RuntimeError(f"Heading not found: {heading}")


def replace_list_of_figures(doc: Document):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = paragraph_text(child)
            if text == "List of Figures":
                start = idx
            elif start is not None and text == "List of Tables":
                end = idx
                break
    if start is None or end is None:
        raise RuntimeError("Could not locate List of Figures")
    for child in children[start + 1 : end]:
        body.remove(child)
    anchor = children[start]
    for item in FIGURE_LIST:
        anchor = base.add_paragraph_after(doc, anchor, item, "List Bullet")


def add_picture_after(doc: Document, anchor, image_name: str, caption: str, width: float):
    p = doc.add_paragraph()
    p.alignment = 1
    p.add_run().add_picture(str(FIG_DIR / image_name), width=Inches(width))
    img_el = base.pop_last_body_element(doc)
    base.add_after(anchor, img_el)
    cap = doc.add_paragraph(caption, style="Caption")
    cap_el = base.pop_last_body_element(doc)
    base.add_after(img_el, cap_el)
    return cap_el


def add_paragraph_after(doc: Document, anchor, text: str):
    return base.add_paragraph_after(doc, anchor, text)


def renumber_forecast_figure(doc: Document):
    old_intro = "Figure 5.5 shows the administrator dashboard view after the expanded synthetic forecasting data was loaded into the database."
    new_intro = "Figure 5.7 shows the administrator dashboard view after the expanded synthetic forecasting data was loaded into the database."
    for para in doc.paragraphs:
        if para.text.strip().startswith(old_intro):
            para.text = para.text.replace(old_intro, new_intro)
        if para.text.strip() == "Figure 5.5 - Admin dashboard with demand forecast output" and para.style.name == "Caption":
            para.text = "Figure 5.7 - Admin dashboard with demand forecast output"


def remove_duplicate_sentence(doc: Document, text: str):
    body = doc._body._element
    seen = False
    for child in list(body):
        if not child.tag.endswith("}p"):
            continue
        current = paragraph_text(child)
        if current == text:
            if seen:
                body.remove(child)
            else:
                seen = True


def insert_chatbot_screenshot(doc: Document):
    caption = "Figure 5.5 - Chatbot interface showing a drink recommendation response"
    intro = (
        "Figure 5.5 shows the chatbot interface responding to a customer request for fresh drinks. "
        "The response demonstrates the implemented restaurant-specific NLP workflow by returning both textual menu options and food-card output."
    )
    remove_duplicate_sentence(doc, intro)
    if caption_exists(doc, caption):
        return
    anchor = find_caption(doc, "Figure 5.2 - Chatbot and NLP processing pipeline")._p
    anchor = add_paragraph_after(doc, anchor, intro)
    add_picture_after(doc, anchor, "figure_5_5_chatbot_interface_response.png", caption, 3.6)


def insert_admin_order_screenshot(doc: Document):
    caption = "Figure 5.6 - Admin dashboard order-status and action controls"
    old_caption = "Figure 5.6 - Admin dashboard order-management interface"
    intro = (
        "Figure 5.6 shows the administrator order-management controls, including payment state, order total, current status, "
        "and action buttons used to advance or cancel orders."
    )
    old_intro_prefix = "Figure 5.6 shows the administrator order-management interface"
    for para in doc.paragraphs:
        if para.text.strip() == old_caption and para.style.name == "Caption":
            para.text = caption
        if para.text.strip().startswith(old_intro_prefix):
            para.text = intro
    remove_duplicate_sentence(doc, intro)
    remove_figure_block(doc, "Figure 5.6 shows the administrator order-management", caption)
    anchor = find_heading(doc, "5.9 Admin Dashboard Implementation")._p
    # Place after the descriptive paragraph that follows the heading.
    children = list(doc._body._element)
    for idx, child in enumerate(children):
        if child is anchor:
            for next_child in children[idx + 1 :]:
                if next_child.tag.endswith("}p") and paragraph_text(next_child):
                    anchor = next_child
                    break
            break
    anchor = add_paragraph_after(doc, anchor, intro)
    add_picture_after(doc, anchor, "figure_5_6_admin_order_management.png", caption, 6.3)


def remove_figure_block(doc: Document, intro_prefix: str, caption: str):
    body = doc._body._element
    while True:
        children = list(body)
        start = end = None
        for idx, child in enumerate(children):
            if child.tag.endswith("}p") and paragraph_text(child).startswith(intro_prefix):
                start = idx
            elif start is not None and child.tag.endswith("}p") and paragraph_text(child) == caption:
                end = idx
                break
        if start is None or end is None:
            return
        for child in children[start : end + 1]:
            body.remove(child)


def insert_forecast_screenshot_after_admin(doc: Document):
    caption = "Figure 5.7 - Admin dashboard with demand forecast output"
    intro = (
        "Figure 5.7 shows the administrator dashboard view after the expanded synthetic forecasting data was loaded into the database. "
        "The forecast output is generated by the moving-average velocity endpoint and should be interpreted as development-environment validation, not production restaurant deployment."
    )
    remove_figure_block(doc, "Figure 5.7 shows the administrator dashboard view", caption)
    for para in doc.paragraphs:
        if para.text.strip() == "Figure 5.6 - Admin dashboard order-management interface" and para.style.name == "Caption":
            para.text = "Figure 5.6 - Admin dashboard order-status and action controls"
    anchor = find_caption(doc, "Figure 5.6 - Admin dashboard order-status and action controls")._p
    anchor = add_paragraph_after(doc, anchor, intro)
    add_picture_after(doc, anchor, "figure_5_6_admin_dashboard_forecast.png", caption, 6.3)


def main():
    doc = Document(DOCX)
    replace_list_of_figures(doc)
    renumber_forecast_figure(doc)
    insert_chatbot_screenshot(doc)
    insert_admin_order_screenshot(doc)
    insert_forecast_screenshot_after_admin(doc)
    doc.save(DOCX)
    print(f"Updated {DOCX}")


if __name__ == "__main__":
    main()
