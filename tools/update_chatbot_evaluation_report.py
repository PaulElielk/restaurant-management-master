from __future__ import annotations

import json
import sys
from pathlib import Path

from docx import Document
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

INPUT_DOCX = ROOT / "final_capstone_report_db_seeded_full_evaluation.docx"
OUTPUT_DOCX = ROOT / "final_capstone_report_ai_enhanced_final.docx"
FIG_DIR = ROOT / "evaluation_figures"
SUMMARY_JSON = FIG_DIR / "chatbot_evaluation_summary.json"


SHORT_LABELS = {
    "greetings.hello": "hello",
    "restaurant.also_bought": "pair",
    "restaurant.dish_info": "info",
    "restaurant.menu_overview": "menu",
    "restaurant.recommend_meat": "meat",
    "restaurant.recommend_spicy": "spicy",
    "restaurant.recommend_vegan": "vegan",
    "restaurant.recommendation": "recommend",
    "None": "none",
}

TABLE_LABELS = {
    "greetings.hello": "Hello",
    "restaurant.also_bought": "Item pairing",
    "restaurant.dish_info": "Dish information",
    "restaurant.menu_overview": "Menu overview",
    "restaurant.recommend_meat": "Meat request",
    "restaurant.recommend_spicy": "Spicy request",
    "restaurant.recommend_vegan": "Vegan request",
    "restaurant.recommendation": "General recommendation",
}


def font(size: int, bold: bool = False):
    path = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    if Path(path).exists():
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def generate_confusion_matrix(summary: dict):
    intents = summary["intents"]
    predicted_labels = intents + ["None"]
    matrix = summary["confusion_matrix"]

    cell = 82
    left = 250
    top = 150
    width = left + cell * len(predicted_labels) + 80
    height = top + cell * len(intents) + 110
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    title_font = font(32, True)
    label_font = font(17)
    small_font = font(16, True)

    draw.text((width // 2, 48), "Chatbot Intent Classification Confusion Matrix", fill="#1F2937", font=title_font, anchor="mm")
    draw.text((left + (cell * len(predicted_labels)) // 2, 98), "Predicted Intent", fill="#374151", font=font(18, True), anchor="mm")
    draw.text((95, top + (cell * len(intents)) // 2), "Actual Intent", fill="#374151", font=font(18, True), anchor="mm")

    max_value = max(matrix[actual].get(predicted, 0) for actual in intents for predicted in predicted_labels) or 1

    for j, predicted in enumerate(predicted_labels):
        x = left + j * cell + cell / 2
        draw.text((x, top - 20), SHORT_LABELS.get(predicted, predicted), fill="#111827", font=label_font, anchor="mm")

    for i, actual in enumerate(intents):
        y = top + i * cell + cell / 2
        draw.text((left - 15, y), SHORT_LABELS.get(actual, actual), fill="#111827", font=label_font, anchor="rm")
        for j, predicted in enumerate(predicted_labels):
            value = matrix[actual].get(predicted, 0)
            intensity = int(245 - (value / max_value) * 175)
            fill = (219, 234, 254) if value == 0 else (37, 99 + intensity // 5, 235)
            x0 = left + j * cell
            y0 = top + i * cell
            draw.rectangle((x0, y0, x0 + cell, y0 + cell), fill=fill, outline="#FFFFFF")
            text_color = "white" if value >= max_value * 0.55 else "#111827"
            draw.text((x0 + cell / 2, y0 + cell / 2), str(value), fill=text_color, font=small_font, anchor="mm")

    img.save(FIG_DIR / "figure_6_4_chatbot_confusion_matrix.png")


def generate_performance_chart(summary: dict):
    labels = ["Accuracy", "Macro Precision", "Macro Recall", "Macro F1"]
    values = [
        summary["accuracy"],
        summary["macro_precision"],
        summary["macro_recall"],
        summary["macro_f1"],
    ]
    base._bar_chart(
        "Chatbot Intent Classification Performance",
        labels,
        values,
        "Score",
        FIG_DIR / "figure_6_5_chatbot_performance.png",
        ymax=1.0,
    )


def replace_section(doc: Document, start_heading: str, end_heading: str):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = "".join(t.text or "" for t in child.iter(base.qn("w:t"))).strip()
            if text == start_heading:
                start = idx
            elif start is not None and text == end_heading:
                end = idx
                break
    if start is None or end is None:
        raise RuntimeError(f"Could not find section {start_heading!r} -> {end_heading!r}")
    for child in children[start + 1 : end]:
        body.remove(child)
    return list(body)[start]


def update_front_matter_and_later_captions(doc: Document):
    replacements = {
        "Figure 6.4 - Distribution of chatbot training examples by intent": "Figure 6.4 - Chatbot intent classification confusion matrix",
        "Figure 6.5 - Forecast confidence distribution based on activity-day regularity": "Figure 6.6 - Forecast confidence distribution based on activity-day regularity",
        "Table 6.4 - Chatbot training utterance distribution": "Table 6.4 - Chatbot training and validation dataset summary",
        "Table 6.5 - Forecast confidence distribution from forecast-seeded development database": "Table 6.6 - Forecast confidence distribution from forecast-seeded development database",
        "Table 6.6 - Highest forecast outputs using the moving-average velocity formula": "Table 6.7 - Highest forecast outputs using the moving-average velocity formula",
        "Table 6.7 - Evaluation limitations and recommended validation improvements": "Table 6.8 - Evaluation limitations and recommended validation improvements",
    }
    for para in doc.paragraphs:
        text = para.text.strip()
        if text in replacements:
            para.text = replacements[text]

    list_anchor_text = "Figure 6.4 - Chatbot intent classification confusion matrix"
    for idx, para in enumerate(doc.paragraphs):
        if para.text.strip() == list_anchor_text and idx < 80:
            if doc.paragraphs[idx + 1].text.strip() != "Figure 6.5 - Chatbot intent classification performance metrics":
                new_p = doc.add_paragraph("Figure 6.5 - Chatbot intent classification performance metrics", style="List Bullet")
                doc.paragraphs[idx]._p.addnext(new_p._p)
            break

    table_anchor_text = "Table 6.4 - Chatbot training and validation dataset summary"
    for idx, para in enumerate(doc.paragraphs):
        if para.text.strip() == table_anchor_text and idx < 90:
            if doc.paragraphs[idx + 1].text.strip() != "Table 6.5 - Chatbot per-intent validation performance":
                new_p = doc.add_paragraph("Table 6.5 - Chatbot per-intent validation performance", style="List Bullet")
                doc.paragraphs[idx]._p.addnext(new_p._p)
            break

    old_scope = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and completed-order records "
        "stored in the development MySQL database. After expanded synthetic recommendation and forecast seeds were loaded into db_restaurant_v2, "
        "the model evaluations were recomputed from the actual database tables using the same scoring, holdout, and moving-average principles "
        "implemented by the backend."
    )
    new_scope = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, chatbot training and validation utterances evaluated with node-nlp, and completed-order records stored "
        "in the development MySQL database. After expanded synthetic recommendation and forecast seeds were loaded into db_restaurant_v2, "
        "the recommendation and forecasting evaluations were recomputed from the actual database tables, while the chatbot intent classifier "
        "was evaluated on a separate held-out validation set."
    )
    for para in doc.paragraphs:
        if para.text.strip() == old_scope:
            para.text = new_scope
            break


def fix_remaining_chatbot_limitation_text(doc: Document):
    replacements = {
        "No separate chatbot validation set, confusion-matrix output file, forecast benchmark table, production logs, or long-term restaurant deployment data was found in the repository. Therefore, the chapter distinguishes between measurable development evidence and recommended future validation.": (
            "No production chatbot transcript dataset, forecast-versus-actual benchmark table, production logs, or long-term restaurant deployment "
            "data was found in the repository. Therefore, the chapter distinguishes between measurable synthetic development evidence and "
            "recommended future validation."
        ),
        "After expanded synthetic recommendation and forecast seeds were loaded into db_restaurant_v2": (
            "After expanded synthetic development recommendation and forecast seeds were loaded into db_restaurant_v2"
        ),
        "a deterministic synthetic restaurant dataset was generated and loaded into the development MySQL database.": (
            "a deterministic synthetic development restaurant dataset was generated and loaded into the development MySQL database."
        ),
        "To evaluate the implemented confidence indicator more realistically, a recent synthetic demand dataset was loaded into the development MySQL database.": (
            "To evaluate the implemented confidence indicator more realistically, a recent synthetic development demand dataset was loaded into the "
            "development MySQL database."
        ),
        "expanded synthetic dataset": "expanded synthetic development dataset",
        "expanded synthetic evaluation": "expanded synthetic development evaluation",
        "The validation set contains unseen utterances that were not included in the training examples.": (
            "The held-out validation utterances contain unseen customer phrases that were not included in the training examples."
        ),
        "The improved confidence distribution should not be interpreted as proven predictive accuracy.": (
            "The improved confidence distribution should not be interpreted as predictive accuracy."
        ),
        "It does not perform open-ended generative reasoning, and its real classification quality cannot be claimed until a separate validation set is created.": (
            "It does not perform open-ended generative reasoning, and its production conversation quality cannot be claimed until real user chat "
            "transcripts are collected and evaluated."
        ),
        "No separate labeled validation utterance set exists": "No production chatbot transcript dataset was collected",
        "Create an unseen test set and compute confusion matrix, accuracy, precision, recall, and F1-score": (
            "Evaluate real user transcripts and compare production intent predictions with labeled expected intents"
        ),
    }

    for para in doc.paragraphs:
        for old, new in replacements.items():
            if old in para.text:
                para.text = para.text.replace(old, new)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for old, new in replacements.items():
                    if old in cell.text:
                        cell.text = cell.text.replace(old, new)


def build_chatbot_section(doc: Document, summary: dict):
    anchor = replace_section(doc, "6.4 Chatbot Evaluation", "6.5 Demand Forecasting Evaluation")

    def p(text: str, style: str | None = None):
        nonlocal anchor
        anchor = base.add_paragraph_after(doc, anchor, text, style)

    def table(rows: list[list[str]]):
        nonlocal anchor
        anchor = base.add_table_after(doc, anchor, rows)

    def pic(filename: str, caption: str):
        nonlocal anchor
        anchor = base.add_picture_after(doc, anchor, FIG_DIR / filename, caption)

    p(
        "The chatbot uses node-nlp intent classification combined with rule-based backend actions. To improve the practical usefulness of the "
        "assistant, the training set was expanded from the original small set of example utterances to a larger domain-specific dataset covering "
        "greetings, general recommendations, spicy requests, vegan requests, meat requests, dish information, item pairings, and menu overview "
        "questions. The live rule layer was also strengthened with additional phrase patterns for common dietary and meat-request expressions."
    )
    p(
        "Unlike the earlier evaluation, a separate validation set was created for the chatbot. The validation set contains unseen utterances that "
        "were not included in the training examples. The metrics below therefore measure intent-classification behavior on held-out synthetic "
        "customer phrases rather than memorization of the training set."
    )

    table(
        [
            ["Measure", "Value"],
            ["Training utterances", str(summary["training_examples"])],
            ["Validation utterances", str(summary["validation_examples"])],
            ["Intent classes", str(len(summary["intents"]))],
            ["Accuracy", f'{summary["accuracy"]:.4f}'],
            ["Macro Precision", f'{summary["macro_precision"]:.4f}'],
            ["Macro Recall", f'{summary["macro_recall"]:.4f}'],
            ["Macro F1-score", f'{summary["macro_f1"]:.4f}'],
        ]
    )
    p("Table 6.4 - Chatbot training and validation dataset summary", "Caption")

    rows = [["Intent", "Support", "Precision", "Recall", "F1-score"]]
    for intent, values in summary["per_intent"].items():
        rows.append([
            TABLE_LABELS.get(intent, intent),
            str(values["support"]),
            f'{values["precision"]:.4f}',
            f'{values["recall"]:.4f}',
            f'{values["f1"]:.4f}',
        ])
    table(rows)
    p("Table 6.5 - Chatbot per-intent validation performance", "Caption")

    pic("figure_6_4_chatbot_confusion_matrix.png", "Figure 6.4 - Chatbot intent classification confusion matrix")
    pic("figure_6_5_chatbot_performance.png", "Figure 6.5 - Chatbot intent classification performance metrics")

    p(
        f"The classifier achieved an accuracy of {summary['accuracy']:.4f} and a macro F1-score of {summary['macro_f1']:.4f} on the held-out "
        "validation set. The confusion matrix shows strong performance for pairings, dish information, menu overview, spicy requests, and general "
        "recommendations. The remaining errors mainly occur between vegan and meat-related language, which is expected because those classes use "
        "overlapping words such as meat, vegan, vegetarian, and non-vegan."
    )
    p(
        "These results should be interpreted as an intent-classification evaluation, not as a full user satisfaction study. The chatbot response "
        "quality also depends on menu data, food metadata, rule-based filters, and database availability. Future work should evaluate real user "
        "chat transcripts, add multilingual utterances if needed, and continue expanding phrases that express dietary restrictions."
    )


def main():
    summary = json.loads(SUMMARY_JSON.read_text(encoding="utf-8"))
    generate_confusion_matrix(summary)
    generate_performance_chart(summary)

    doc = Document(INPUT_DOCX)
    update_front_matter_and_later_captions(doc)
    build_chatbot_section(doc, summary)
    fix_remaining_chatbot_limitation_text(doc)
    doc.save(OUTPUT_DOCX)
    print(f"Created {OUTPUT_DOCX}")


if __name__ == "__main__":
    main()
