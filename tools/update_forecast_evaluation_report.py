from __future__ import annotations

import json
import sys
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402

INPUT_DOCX = ROOT / "final_capstone_report_db_seeded_recommendation_eval.docx"
OUTPUT_DOCX = ROOT / "final_capstone_report_db_seeded_full_evaluation.docx"
FIG_DIR = ROOT / "evaluation_figures"
SUMMARY_JSON = FIG_DIR / "db_forecast_evaluation_summary.json"


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


def update_front_matter(doc: Document):
    table_replacements = {
        "Table 6.5 - Forecast confidence distribution from repository seed data":
            "Table 6.5 - Forecast confidence distribution from forecast-seeded development database",
        "Table 6.6 - Highest seed-data forecast outputs using the moving-average velocity formula":
            "Table 6.6 - Highest forecast outputs using the moving-average velocity formula",
    }
    for para in doc.paragraphs:
        text = para.text.strip()
        if text in table_replacements:
            para.text = table_replacements[text]

    old_scope = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and completed-order records "
        "stored in the development MySQL database. After the expanded synthetic seed was loaded into db_restaurant_v2, the recommendation "
        "metrics were recomputed from the actual database tables using the same scoring and holdout principles implemented by the backend."
    )
    new_scope = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and completed-order records "
        "stored in the development MySQL database. After expanded synthetic recommendation and forecast seeds were loaded into db_restaurant_v2, "
        "the model evaluations were recomputed from the actual database tables using the same scoring, holdout, and moving-average principles "
        "implemented by the backend."
    )
    for para in doc.paragraphs:
        if para.text.strip() == old_scope:
            para.text = new_scope
            break


def build_forecast_section(doc: Document, summary: dict):
    counts = summary["confidence_counts"]
    top_outputs = summary["top_outputs"]

    ordered_counts = {key: int(counts.get(key, 0)) for key in ("low", "medium", "high")}
    base._pie_chart(
        "Forecast Confidence Distribution",
        ordered_counts,
        FIG_DIR / "figure_6_5_forecast_confidence.png",
    )

    anchor = replace_section(doc, "6.5 Demand Forecasting Evaluation", "6.6 Discussion of Results")

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
        "The forecasting module is a regression/time-series planning component, not a binary classifier. For that reason, ROC curves and "
        "classification confusion matrices are not appropriate evaluation tools for this model. Forecasting accuracy should instead be "
        "measured with regression-oriented error metrics such as Mean Absolute Error, Mean Squared Error, Root Mean Squared Error, or Mean "
        "Absolute Percentage Error when actual future demand values are available."
    )
    p(
        "To evaluate the implemented confidence indicator more realistically, a recent synthetic demand dataset was loaded into the development "
        "MySQL database. The seed covers all 42 menu items across the 30-day lookback window. Some foods were designed to appear on many active "
        "days, some on a moderate number of active days, and others only occasionally. This allows the actual forecasting endpoint to exercise "
        "low, medium, and high confidence levels instead of producing an all-low result from sparse historical data."
    )
    p(
        "During this evaluation, the forecast aggregation was also corrected so that total quantity sold is computed within the same lookback "
        "window used for active-day counting. This keeps the moving-average velocity calculation consistent: both total quantity and active-day "
        "regularity now refer to recent completed orders."
    )
    p(
        "The implemented endpoint computes item-level demand using completed or active order records, total quantity sold during a lookback "
        "period, average daily demand, predicted demand for a future horizon, and a confidence hint based on activity-day regularity. The "
        "expanded development dataset improves evaluation of the confidence indicator, but it still does not provide stored forecast-versus-actual "
        "future outcomes. Therefore, MAE, MSE, RMSE, MAPE, and true forecast-versus-actual plots are still recommended as future work rather than "
        "claimed as completed validation."
    )

    table(
        [
            ["Confidence Level", "Food Items"],
            ["Low", str(ordered_counts["low"])],
            ["Medium", str(ordered_counts["medium"])],
            ["High", str(ordered_counts["high"])],
        ]
    )
    p("Table 6.5 - Forecast confidence distribution from forecast-seeded development database", "Caption")
    pic("figure_6_5_forecast_confidence.png", "Figure 6.5 - Forecast confidence distribution based on activity-day regularity")

    rows = [["Food Item", "30-Day Quantity", "Active Days", "Seven-Day Forecast", "Confidence"]]
    for row in top_outputs[:8]:
        rows.append(
            [
                str(row["food_name"]),
                str(row["total_qty"]),
                str(row["active_days"]),
                f'{float(row["predicted_period_qty"]):.2f}',
                str(row["confidence_hint"]).title(),
            ]
        )
    table(rows)
    p("Table 6.6 - Highest forecast outputs using the moving-average velocity formula", "Caption")
    p(
        "The improved confidence distribution should not be interpreted as proven predictive accuracy. It shows that, when the development "
        "database contains recent and repeated sales activity, the confidence indicator can distinguish between regularly ordered foods and "
        "occasionally ordered foods. A rigorous forecast validation would still require saving forecast outputs, waiting for the forecast horizon "
        "to pass, collecting actual sales, and then comparing predicted and actual quantities."
    )


def main():
    summary = json.loads(SUMMARY_JSON.read_text(encoding="utf-8"))
    doc = Document(INPUT_DOCX)
    update_front_matter(doc)
    build_forecast_section(doc, summary)
    doc.save(OUTPUT_DOCX)
    print(f"Created {OUTPUT_DOCX}")


if __name__ == "__main__":
    main()
