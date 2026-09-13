from __future__ import annotations

import ast
import csv
import math
import re
import shutil
from collections import Counter, defaultdict
from datetime import datetime
from io import StringIO
from pathlib import Path

from docx import Document
from docx.enum.text import WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
INPUT_DOCX = ROOT / "final_capstone_report_citation_audited.docx"
OUTPUT_DOCX = ROOT / "final_capstone_report_evaluation_strengthened.docx"
FIG_DIR = ROOT / "evaluation_figures"


def _font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def _wrap(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if draw.textbbox((0, 0), test, font=font)[2] <= max_width or not current:
            current = test
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def _bar_chart(title: str, labels: list[str], values: list[float], ylabel: str, output: Path, ymax: float | None = None):
    width, height = 1100, 700
    margin_left, margin_right, margin_top, margin_bottom = 115, 70, 100, 125
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    title_font = _font(32, True)
    label_font = _font(22)
    small_font = _font(18)
    axis_font = _font(20, True)
    draw.text((width // 2, 35), title, fill="#1F2937", font=title_font, anchor="mm")
    plot_left, plot_top = margin_left, margin_top
    plot_right, plot_bottom = width - margin_right, height - margin_bottom
    plot_w, plot_h = plot_right - plot_left, plot_bottom - plot_top
    ymax = ymax if ymax is not None else max(values + [1.0])
    ymax = max(ymax, 1.0)
    for i in range(6):
        y_val = ymax * i / 5
        y = plot_bottom - (y_val / ymax) * plot_h
        draw.line((plot_left, y, plot_right, y), fill="#E5E7EB", width=1)
        draw.text((plot_left - 15, y), f"{y_val:.1f}", fill="#374151", font=small_font, anchor="rm")
    draw.line((plot_left, plot_top, plot_left, plot_bottom), fill="#111827", width=2)
    draw.line((plot_left, plot_bottom, plot_right, plot_bottom), fill="#111827", width=2)
    draw.text((58, (plot_top + plot_bottom) // 2), ylabel, fill="#111827", font=axis_font, anchor="mm")
    bar_area = plot_w / len(labels)
    colors = ["#2563EB", "#16A34A", "#F97316", "#7C3AED"]
    for idx, (label, value) in enumerate(zip(labels, values)):
        center = plot_left + bar_area * idx + bar_area / 2
        bar_w = bar_area * 0.48
        bar_h = (value / ymax) * plot_h
        x0, x1 = center - bar_w / 2, center + bar_w / 2
        y0, y1 = plot_bottom - bar_h, plot_bottom
        draw.rounded_rectangle((x0, y0, x1, y1), radius=8, fill=colors[idx % len(colors)])
        draw.text((center, y0 - 18), f"{value:.4f}", fill="#111827", font=label_font, anchor="mm")
        draw.text((center, plot_bottom + 35), label, fill="#111827", font=label_font, anchor="mm")
    img.save(output)


def _grouped_bar_chart(title: str, labels: list[str], series: dict[str, list[float]], output: Path):
    width, height = 1150, 720
    margin_left, margin_right, margin_top, margin_bottom = 115, 70, 105, 140
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    title_font = _font(32, True)
    label_font = _font(21)
    small_font = _font(18)
    draw.text((width // 2, 38), title, fill="#1F2937", font=title_font, anchor="mm")
    plot_left, plot_top = margin_left, margin_top
    plot_right, plot_bottom = width - margin_right, height - margin_bottom
    plot_w, plot_h = plot_right - plot_left, plot_bottom - plot_top
    ymax = max([1.0] + [v for vals in series.values() for v in vals])
    for i in range(6):
        y_val = ymax * i / 5
        y = plot_bottom - (y_val / ymax) * plot_h
        draw.line((plot_left, y, plot_right, y), fill="#E5E7EB", width=1)
        draw.text((plot_left - 15, y), f"{y_val:.1f}", fill="#374151", font=small_font, anchor="rm")
    draw.line((plot_left, plot_top, plot_left, plot_bottom), fill="#111827", width=2)
    draw.line((plot_left, plot_bottom, plot_right, plot_bottom), fill="#111827", width=2)
    colors = {"Precision": "#2563EB", "Recall": "#F97316"}
    group_w = plot_w / len(labels)
    names = list(series.keys())
    for idx, label in enumerate(labels):
        center = plot_left + group_w * idx + group_w / 2
        total_w = group_w * 0.58
        bar_w = total_w / len(names)
        for j, name in enumerate(names):
            value = series[name][idx]
            x0 = center - total_w / 2 + j * bar_w
            x1 = x0 + bar_w * 0.86
            y0 = plot_bottom - (value / ymax) * plot_h
            draw.rounded_rectangle((x0, y0, x1, plot_bottom), radius=7, fill=colors.get(name, "#6B7280"))
            draw.text(((x0 + x1) / 2, y0 - 15), f"{value:.4f}", fill="#111827", font=small_font, anchor="mm")
        draw.text((center, plot_bottom + 35), label, fill="#111827", font=label_font, anchor="mm")
    legend_x = width // 2 - 125
    for i, name in enumerate(names):
        x = legend_x + i * 170
        draw.rounded_rectangle((x, height - 70, x + 28, height - 42), radius=4, fill=colors.get(name, "#6B7280"))
        draw.text((x + 40, height - 56), name, fill="#111827", font=label_font, anchor="lm")
    img.save(output)


def _horizontal_bar_chart(title: str, items: list[tuple[str, int]], output: Path):
    width = 1200
    row_h = 54
    height = 145 + max(1, len(items)) * row_h
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    title_font = _font(32, True)
    label_font = _font(20)
    small_font = _font(18)
    draw.text((width // 2, 38), title, fill="#1F2937", font=title_font, anchor="mm")
    left, right = 360, width - 90
    top = 100
    max_val = max([v for _, v in items] + [1])
    for i, (label, value) in enumerate(items):
        y = top + i * row_h
        draw.text((left - 20, y + 18), label, fill="#111827", font=label_font, anchor="rm")
        draw.rounded_rectangle((left, y, right, y + 32), radius=8, fill="#EFF6FF")
        bar_w = (right - left) * value / max_val
        draw.rounded_rectangle((left, y, left + bar_w, y + 32), radius=8, fill="#2563EB")
        draw.text((left + bar_w + 12, y + 16), str(value), fill="#111827", font=small_font, anchor="lm")
    img.save(output)


def _pie_chart(title: str, counts: dict[str, int], output: Path):
    width, height = 1050, 650
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    title_font = _font(32, True)
    label_font = _font(22)
    small_font = _font(18)
    draw.text((width // 2, 40), title, fill="#1F2937", font=title_font, anchor="mm")
    total = sum(counts.values()) or 1
    colors = {"low": "#DC2626", "medium": "#F59E0B", "high": "#16A34A"}
    box = (95, 115, 545, 565)
    start = -90
    for key, value in counts.items():
        extent = 360 * value / total
        draw.pieslice(box, start, start + extent, fill=colors.get(key, "#6B7280"), outline="white", width=2)
        start += extent
    legend_x, legend_y = 640, 180
    for i, (key, value) in enumerate(counts.items()):
        y = legend_y + i * 75
        draw.rounded_rectangle((legend_x, y, legend_x + 34, y + 34), radius=5, fill=colors.get(key, "#6B7280"))
        pct = 100 * value / total
        draw.text((legend_x + 50, y + 17), f"{key.title()}: {value} items ({pct:.1f}%)", fill="#111827", font=label_font, anchor="lm")
    note = "Confidence is based on activity-day regularity, not statistical forecast accuracy."
    for idx, line in enumerate(_wrap(draw, note, small_font, 360)):
        draw.text((640, 425 + idx * 24), line, fill="#4B5563", font=small_font)
    img.save(output)


def parse_foods():
    sql = (ROOT / "frontend/src/resources/db_restaurant.sql").read_text(encoding="utf-8")
    match = re.search(r"INSERT INTO food .*?VALUES\s*(.*?);", sql, flags=re.S | re.I)
    if not match:
        raise RuntimeError("Food seed insert not found")
    values = match.group(1)
    rows = []
    for row_text in re.findall(r"\((.*?)\)(?:,|$)", values, flags=re.S):
        reader = csv.reader(StringIO(row_text), delimiter=",", quotechar='"', skipinitialspace=True)
        row = next(reader)
        rows.append(row)
    foods = []
    for idx, row in enumerate(rows, start=1):
        foods.append(
            {
                "food_id": idx,
                "food_name": row[0],
                "food_star": row[1],
                "food_vote": row[2],
                "food_price": row[3],
                "food_discount": row[4],
                "food_desc": row[5],
                "food_status": row[6],
                "food_type": row[7],
                "food_category": row[8],
                "food_src": row[9],
            }
        )
    return foods


def parse_seed_transactions():
    sql = (ROOT / "backend/sql/fake_transactions_seed.sql").read_text(encoding="utf-8")
    bill_match = re.search(r"INSERT INTO billstatus\s*\([^)]*\)\s*VALUES\s*(.*?);", sql, flags=re.S | re.I)
    detail_match = re.search(r"INSERT INTO billdetails\s*\([^)]*\)\s*VALUES\s*(.*?);", sql, flags=re.S | re.I)
    bills = {}
    for row_text in re.findall(r"\((.*?)\)(?:,|$)", bill_match.group(1), flags=re.S):
        row = ast.literal_eval("(" + row_text + ")")
        bills[int(row[0])] = {
            "bill_id": int(row[0]),
            "user_id": int(row[1]),
            "bill_when": row[4],
            "bill_status": int(row[10]),
        }
    details = []
    for row_text in re.findall(r"\((.*?)\)(?:,|$)", detail_match.group(1), flags=re.S):
        row = ast.literal_eval("(" + row_text + ")")
        details.append({"bill_id": int(row[0]), "food_id": int(row[1]), "item_qty": int(row[2])})
    return bills, details


def evaluate_recommendations(foods, bills, details, ks=(1, 3, 5)):
    food_by_id = {f["food_id"]: f for f in foods}
    global_qty = Counter()
    user_food = defaultdict(lambda: defaultdict(lambda: {"qty": 0, "last_bill_id": 0}))
    for d in details:
        bill = bills[d["bill_id"]]
        if bill["bill_status"] > 0:
            global_qty[d["food_id"]] += d["item_qty"]
            rec = user_food[bill["user_id"]][d["food_id"]]
            rec["qty"] += d["item_qty"]
            rec["last_bill_id"] = max(rec["last_bill_id"], d["bill_id"])
    per_user_by_k = {k: [] for k in ks}
    per_user_details = []
    for user_id, by_food in sorted(user_food.items()):
        if len(by_food) < 3:
            continue
        history = []
        for food_id, data in by_food.items():
            food = food_by_id[food_id]
            history.append(
                {
                    "food_id": food_id,
                    "food_category": food["food_category"],
                    "food_type": food["food_type"],
                    "qty": data["qty"],
                    "last_bill_id": data["last_bill_id"],
                }
            )
        history.sort(key=lambda x: x["last_bill_id"])
        holdout_count = max(1, math.ceil(len(history) * 0.2))
        train_rows = history[:-holdout_count]
        holdout_rows = history[-holdout_count:]
        train_ids = {r["food_id"] for r in train_rows}
        holdout_ids = {r["food_id"] for r in holdout_rows}
        cat_pref = Counter()
        type_pref = Counter()
        for row in train_rows:
            cat_pref[row["food_category"]] += row["qty"]
            type_pref[row["food_type"]] += row["qty"]
        scored = []
        for food in foods:
            food_id = food["food_id"]
            if food_id in train_ids:
                continue
            popularity = global_qty[food_id]
            vote_score = (float(food["food_vote"]) if food["food_vote"] else 0) / 1000
            score = popularity + cat_pref[food["food_category"]] * 3 + type_pref[food["food_type"]] * 2 + vote_score
            scored.append((score, food_id))
        scored.sort(key=lambda x: (-x[0], x[1]))
        ranked = [food_id for _, food_id in scored]
        for k in ks:
            predicted = ranked[:k]
            hits = len([fid for fid in predicted if fid in holdout_ids])
            precision = hits / k
            recall = hits / len(holdout_ids)
            per_user_by_k[k].append((precision, recall, hits))
        per_user_details.append(
            {
                "user_id": user_id,
                "train_count": len(train_ids),
                "holdout": sorted(holdout_ids),
                "top5": ranked[:5],
            }
        )
    metrics = {}
    for k in ks:
        rows = per_user_by_k[k]
        metrics[k] = {
            "precision": round(sum(r[0] for r in rows) / len(rows), 4) if rows else None,
            "recall": round(sum(r[1] for r in rows) / len(rows), 4) if rows else None,
            "users": len(rows),
            "hits": sum(r[2] for r in rows),
        }
    return metrics, per_user_details


def parse_chatbot_intents():
    js = (ROOT / "backend/models/ChatbotService.js").read_text(encoding="utf-8")
    match = re.search(r"const trainingDocuments = \[(.*?)\];", js, flags=re.S)
    if not match:
        raise RuntimeError("trainingDocuments array not found")
    rows = re.findall(r"\[\s*(['\"])(.*?)\1\s*,\s*(['\"])(.*?)\3\s*\]", match.group(1), flags=re.S)
    counts = Counter(intent for _, _, _, intent in rows)
    return counts


def forecast_confidence(foods, bills, details, lookback_days=30, forecast_days=7):
    # Static seed dates are older than the current runtime date, so this repository-level
    # analysis treats the seed file itself as the available historical window.
    total_qty = Counter()
    active_days = defaultdict(set)
    for d in details:
        bill = bills[d["bill_id"]]
        if bill["bill_status"] > 0:
            total_qty[d["food_id"]] += d["item_qty"]
            active_days[d["food_id"]].add(bill["bill_when"][:10])
    rows = []
    confidence = Counter()
    for food in foods:
        fid = food["food_id"]
        active = len(active_days[fid])
        activity_ratio = active / lookback_days
        hint = "high" if activity_ratio >= 0.5 else ("medium" if activity_ratio >= 0.2 else "low")
        confidence[hint] += 1
        rows.append(
            {
                "food_name": food["food_name"],
                "total_qty": total_qty[fid],
                "active_days": active,
                "predicted_period_qty": round((total_qty[fid] / lookback_days) * forecast_days, 2),
                "confidence": hint,
            }
        )
    rows.sort(key=lambda x: (-x["predicted_period_qty"], x["food_name"]))
    return confidence, rows


def make_charts(metrics, intent_counts, forecast_counts):
    if FIG_DIR.exists():
        shutil.rmtree(FIG_DIR)
    FIG_DIR.mkdir(parents=True)
    labels = [f"K={k}" for k in (1, 3, 5)]
    precision = [metrics[k]["precision"] for k in (1, 3, 5)]
    recall = [metrics[k]["recall"] for k in (1, 3, 5)]
    _bar_chart("Recommendation Precision@K", labels, precision, "Precision", FIG_DIR / "figure_6_1_precision_at_k.png")
    _bar_chart("Recommendation Recall@K", labels, recall, "Recall", FIG_DIR / "figure_6_2_recall_at_k.png")
    _grouped_bar_chart(
        "Precision and Recall by Recommendation Cutoff",
        labels,
        {"Precision": precision, "Recall": recall},
        FIG_DIR / "figure_6_3_precision_recall.png",
    )
    _horizontal_bar_chart(
        "Chatbot Training Examples per Intent",
        sorted(intent_counts.items(), key=lambda x: (-x[1], x[0])),
        FIG_DIR / "figure_6_4_chatbot_intent_distribution.png",
    )
    ordered_counts = {key: forecast_counts.get(key, 0) for key in ("low", "medium", "high")}
    _pie_chart("Forecast Confidence Distribution", ordered_counts, FIG_DIR / "figure_6_5_forecast_confidence.png")


def set_cell_text(cell, text: str):
    cell.text = text
    for p in cell.paragraphs:
        for run in p.runs:
            run.font.size = Pt(9)


def style_table(table):
    table.style = "Table Grid"
    for row in table.rows:
        for cell in row.cells:
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            tcMar = tcPr.first_child_found_in("w:tcMar")
            if tcMar is None:
                tcMar = OxmlElement("w:tcMar")
                tcPr.append(tcMar)
            for m in ("top", "left", "bottom", "right"):
                node = tcMar.find(qn(f"w:{m}"))
                if node is None:
                    node = OxmlElement(f"w:{m}")
                    tcMar.append(node)
                node.set(qn("w:w"), "90")
                node.set(qn("w:type"), "dxa")


def add_after(anchor, element):
    anchor.addnext(element)
    return element


def pop_last_body_element(doc: Document):
    body = doc._body._element
    if body[-1].tag == qn("w:sectPr"):
        return body[-2]
    return body[-1]


def add_paragraph_after(doc: Document, anchor, text: str = "", style: str | None = None):
    p = doc.add_paragraph(text, style=style)
    el = pop_last_body_element(doc)
    add_after(anchor, el)
    return el


def add_table_after(doc: Document, anchor, rows: list[list[str]]):
    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
    for r_idx, row in enumerate(rows):
        for c_idx, text in enumerate(row):
            set_cell_text(table.cell(r_idx, c_idx), text)
    style_table(table)
    el = pop_last_body_element(doc)
    add_after(anchor, el)
    return el


def add_picture_after(doc: Document, anchor, image_path: Path, caption: str):
    p = doc.add_paragraph()
    run = p.add_run()
    run.add_picture(str(image_path), width=Inches(6.1))
    el = pop_last_body_element(doc)
    add_after(anchor, el)
    cap = doc.add_paragraph(caption, style="Caption")
    cap_el = pop_last_body_element(doc)
    add_after(el, cap_el)
    return cap_el


def remove_between(doc: Document, start_text: str, end_text: str):
    body = doc._body._element
    children = list(body)
    starts = []
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = "".join(t.text or "" for t in child.iter(qn("w:t"))).strip()
            if text == start_text:
                starts.append(idx)
    start = starts[-1] if starts else None
    end = None
    if start is not None:
        for idx in range(start + 1, len(children)):
            child = children[idx]
            if child.tag.endswith("}p"):
                text = "".join(t.text or "" for t in child.iter(qn("w:t"))).strip()
                if text == end_text:
                    end = idx
                    break
    if start is None or end is None:
        raise RuntimeError(f"Could not find chapter range {start_text!r} -> {end_text!r}")
    for child in children[start + 1 : end]:
        body.remove(child)
    return list(body)[start]


def replace_list_section(doc: Document, heading: str, items: list[str], next_heading: str):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = "".join(t.text or "" for t in child.iter(qn("w:t"))).strip()
            if text == heading:
                start = idx
            elif start is not None and text == next_heading:
                end = idx
                break
    if start is None or end is None:
        return
    for child in children[start + 1 : end]:
        body.remove(child)
    anchor = list(body)[start]
    for item in items:
        p = doc.add_paragraph(item, style="List Bullet")
        el = pop_last_body_element(doc)
        anchor.addnext(el)
        anchor = el


def build_chapter(doc: Document, metrics, per_user_details, intent_counts, forecast_counts, forecast_rows):
    anchor = remove_between(doc, "Chapter 6 - System Evaluation", "Chapter 7 - Conclusion and Future Work")
    items = []

    def p(text: str, style: str | None = None):
        nonlocal anchor
        anchor = add_paragraph_after(doc, anchor, text, style)

    def table(rows: list[list[str]]):
        nonlocal anchor
        anchor = add_table_after(doc, anchor, rows)

    def pic(path: str, caption: str):
        nonlocal anchor
        anchor = add_picture_after(doc, anchor, FIG_DIR / path, caption)

    p(
        "This chapter evaluates the implemented restaurant management system from both a functional and model-oriented perspective. "
        "The evaluation focuses on what can be measured from the repository, implemented endpoints, and seeded development data. "
        "Where formal validation data is unavailable, the limitation is stated explicitly rather than replacing it with unsupported metrics."
    )

    p("6.1 Evaluation Scope and Data Sources", "Heading 2")
    p(
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and seeded completed-order "
        "records in backend/sql/fake_transactions_seed.sql. The live MySQL service was not available in the execution environment during "
        "this audit, so the quantitative recommendation analysis was reproduced from the repository seed files using the same scoring and "
        "holdout principles implemented by the backend."
    )
    p(
        "No separate chatbot validation set, confusion-matrix output file, forecast benchmark table, production logs, or long-term restaurant "
        "deployment data was found in the repository. Therefore, the chapter distinguishes between measurable development evidence and "
        "recommended future validation."
    )

    p("6.2 Functional Validation", "Heading 2")
    table(
        [
            ["Module", "Test Description", "Expected Result", "Outcome"],
            ["Authentication", "Register and log in with stored user credentials", "Customer session is created and user data is available to the frontend", "Passed in implementation review"],
            ["Menu Browsing", "Retrieve food records and display categories", "Food items and category filters are available in the Vue interface", "Passed in implementation review"],
            ["Cart", "Add, update, and remove food items before checkout", "Cart state updates and totals are recalculated", "Passed in implementation review"],
            ["Checkout", "Submit cart as an order", "Bill status and bill detail records are created through backend APIs", "Passed in implementation review"],
            ["Order Tracking", "Retrieve a user's order history and status", "Orders are returned with item-level details", "Passed in implementation review"],
            ["Recommendations", "Generate personalized food suggestions", "Endpoint returns ranked recommendations or a popularity fallback", "Passed in implementation review"],
            ["Chatbot", "Send a domain-specific customer message", "Intent is classified and a rule-based menu response is returned", "Passed in implementation review"],
            ["Forecasting", "Request a demand forecast for admin planning", "Endpoint returns item-level moving-average forecast records", "Passed in implementation review"],
        ]
    )
    p("Table 6.1 - Functional validation summary", "Caption")

    p("6.3 Recommendation Engine Evaluation", "Heading 2")
    p(
        "The recommendation module contains an offline holdout evaluator at GET /api/recommendations/:id/evaluate. For users with at least "
        "three unique purchased items, the method sorts the user's historical items by recency, reserves the newest 20 percent as a holdout "
        "set, generates recommendations from the remaining training items, and reports Precision@K and Recall@K. This is a standard offline "
        "top-N recommendation evaluation pattern, but it should be interpreted cautiously because the repository dataset is small and seeded."
    )
    metric_rows = [["K", "Users Evaluated", "Total Hits", "Precision@K", "Recall@K"]]
    for k in (1, 3, 5):
        m = metrics[k]
        metric_rows.append([str(k), str(m["users"]), str(m["hits"]), f'{m["precision"]:.4f}', f'{m["recall"]:.4f}'])
    table(metric_rows)
    p("Table 6.2 - Recommendation holdout metrics computed from repository seed data", "Caption")
    p(
        f"The static seed-data evaluation included {metrics[1]['users']} users with enough purchase history to run the holdout procedure. "
        "The resulting Precision@1, Precision@3, Precision@5, Recall@1, Recall@3, and Recall@5 values were all 0.0000. This result does not "
        "prove that the recommender is ineffective in a production setting; rather, it shows that the small development seed file does not "
        "contain enough repeated preference patterns for the held-out items to appear in the top ranked recommendations."
    )
    pic("figure_6_1_precision_at_k.png", "Figure 6.1 - Precision@K for the recommendation engine using repository seed data")
    pic("figure_6_2_recall_at_k.png", "Figure 6.2 - Recall@K for the recommendation engine using repository seed data")
    pic("figure_6_3_precision_recall.png", "Figure 6.3 - Precision and recall comparison across recommendation cutoffs")
    p(
        "Precision@K measures the proportion of recommended items in the top K list that are relevant to the user. Recall@K measures the "
        "proportion of the held-out relevant items that the recommender recovered. In this project, the zero values mainly reflect the "
        "evaluation context: the seed file contains only ten bills, five evaluated users, and sparse item overlap. A larger transaction log "
        "would be required to determine whether the hybrid scoring method generalizes beyond the development dataset."
    )

    p("6.4 Chatbot Evaluation", "Heading 2")
    p(
        "The chatbot uses node-nlp intent classification combined with rule-based backend actions. The repository contains labeled training "
        "utterances for greetings, recommendations, spicy dish requests, vegan requests, meat requests, dish information, pairings, and menu "
        "overview questions. These labels make it possible to summarize training coverage, but they do not by themselves provide an unbiased "
        "test set."
    )
    intent_rows = [["Intent", "Training Examples"]]
    for intent, count in sorted(intent_counts.items(), key=lambda x: (-x[1], x[0])):
        intent_rows.append([intent, str(count)])
    table(intent_rows)
    p("Table 6.3 - Chatbot training utterance distribution", "Caption")
    pic("figure_6_4_chatbot_intent_distribution.png", "Figure 6.4 - Distribution of chatbot training examples by intent")
    p(
        "Because no separate labeled validation dataset was found, accuracy, precision, recall, F1-score, and a confusion matrix were not "
        "computed. Evaluating on the same utterances used for training would overstate performance and would not satisfy a scientific "
        "validation standard. Future evaluation should create a held-out test set containing unseen customer utterances for every intent, "
        "run the trained model against that set, and then compute a confusion matrix and class-level precision, recall, and F1-score."
    )

    p("6.5 Demand Forecasting Evaluation", "Heading 2")
    p(
        "The forecasting module is a regression/time-series planning component, not a binary classifier. For that reason, ROC curves and "
        "classification confusion matrices are not appropriate evaluation tools for this model. Forecasting accuracy should instead be "
        "measured with regression-oriented error metrics such as Mean Absolute Error, Mean Squared Error, Root Mean Squared Error, or Mean "
        "Absolute Percentage Error when actual future demand values are available."
    )
    p(
        "The implemented endpoint computes item-level demand using completed or active order records, total quantity sold during a lookback "
        "period, average daily demand, predicted demand for a future horizon, and a confidence hint based on activity-day regularity. The "
        "repository did not contain stored historical forecasts paired with later actual demand, so MAE, MSE, RMSE, MAPE, and forecast-versus-actual "
        "plots could not be computed without inventing benchmark results."
    )
    forecast_table = [["Confidence Level", "Food Items"]]
    for key in ("low", "medium", "high"):
        forecast_table.append([key.title(), str(forecast_counts.get(key, 0))])
    table(forecast_table)
    p("Table 6.4 - Forecast confidence distribution from repository seed data", "Caption")
    pic("figure_6_5_forecast_confidence.png", "Figure 6.5 - Forecast confidence distribution based on activity-day regularity")
    top_rows = [["Food Item", "Seed Quantity", "Active Days", "Seven-Day Forecast", "Confidence"]]
    for row in forecast_rows[:8]:
        top_rows.append([row["food_name"], str(row["total_qty"]), str(row["active_days"]), f'{row["predicted_period_qty"]:.2f}', row["confidence"].title()])
    table(top_rows)
    p("Table 6.5 - Highest seed-data forecast outputs using the moving-average velocity formula", "Caption")
    p(
        "The confidence figure should not be read as predictive accuracy. It only describes the regularity signal used by the implemented "
        "model. In the static seed data, confidence remains low because the available transaction window is short and sparse. A rigorous "
        "forecast validation would require saving forecast outputs, waiting for the forecast horizon to pass, collecting actual sales, and "
        "then comparing predicted and actual quantities."
    )

    p("6.6 Discussion of Results", "Heading 2")
    p(
        "The evaluation confirms that the project implements the required functional workflows and includes measurable hooks for model "
        "assessment. The recommendation engine is explainable because its ranking combines purchase history, category preference, food type "
        "preference, popularity, and vote signals. Its main limitation is data sparsity: cold-start users and users with little order history "
        "must rely on popularity-based fallback behavior."
    )
    p(
        "The chatbot is lightweight and domain-specific, which makes it suitable for menu assistance, food discovery, and common customer "
        "questions. Its main limitation is that it depends on predefined intents and backend rules. It does not perform open-ended generative "
        "reasoning, and its real classification quality cannot be claimed until a separate validation set is created."
    )
    p(
        "The forecasting module is transparent and operationally easy to interpret. Managers can see how historical quantities are translated "
        "into a future demand estimate. However, the moving-average approach does not model seasonality, holidays, weather, promotions, or "
        "day-of-week effects. Its current evaluation is therefore functional rather than predictive."
    )

    p("6.7 Evaluation Limitations and Future Validation", "Heading 2")
    p(
        "The main limitation of this evaluation is the absence of a real restaurant deployment and a long-term operational dataset. No user "
        "study was conducted, no production chatbot transcript dataset was collected, and no historical forecast benchmark was stored. As a "
        "result, this report does not claim improvements in profit, waste reduction, customer satisfaction, or inventory accuracy."
    )
    p(
        "Future work should evaluate recommendations on a larger transaction history, compute chatbot confusion matrices from unseen labeled "
        "utterances, and validate demand forecasts using rolling time-based train/test splits. If the system is deployed in a restaurant, "
        "forecast outputs should be logged automatically so that actual future sales can be compared against predicted quantities."
    )
    table(
        [
            ["Area", "Current Limitation", "Recommended Future Evaluation"],
            ["Recommendations", "Seed data is sparse and produced no held-out hits", "Evaluate Precision@K and Recall@K on a larger real order history"],
            ["Chatbot", "No separate labeled validation utterance set exists", "Create an unseen test set and compute confusion matrix, accuracy, precision, recall, and F1-score"],
            ["Forecasting", "No saved forecast-versus-actual benchmark exists", "Log forecasts over time and compute MAE, MSE, RMSE, and MAPE after each horizon"],
            ["Deployment", "No production restaurant study was conducted", "Measure operational outcomes only after real deployment and data collection"],
        ]
    )
    p("Table 6.6 - Evaluation limitations and recommended validation improvements", "Caption")


def update_front_matter(doc: Document):
    figure_items = [
        "Figure 4.1 - Three-tier system architecture",
        "Figure 4.2 - Entity-relationship overview of the restaurant database",
        "Figure 4.3 - Checkout and order persistence data flow",
        "Figure 5.1 - Hybrid recommendation engine processing pipeline",
        "Figure 5.2 - NLP chatbot layered resolution pipeline",
        "Figure 5.3 - Demand forecasting endpoint output",
        "Figure 5.4 - Floating chatbot user interface with food cards",
        "Figure 6.1 - Precision@K for the recommendation engine using repository seed data",
        "Figure 6.2 - Recall@K for the recommendation engine using repository seed data",
        "Figure 6.3 - Precision and recall comparison across recommendation cutoffs",
        "Figure 6.4 - Distribution of chatbot training examples by intent",
        "Figure 6.5 - Forecast confidence distribution based on activity-day regularity",
    ]
    table_items = [
        "Table 1.1 - Project objectives and verification methods",
        "Table 1.2 - Definition of terms",
        "Table 4.1 - Functional requirements",
        "Table 4.2 - Non-functional requirements",
        "Table 4.3 - Database schema overview",
        "Table 4.4 - Main API domains",
        "Table 6.1 - Functional validation summary",
        "Table 6.2 - Recommendation holdout metrics computed from repository seed data",
        "Table 6.3 - Chatbot training utterance distribution",
        "Table 6.4 - Forecast confidence distribution from repository seed data",
        "Table 6.5 - Highest seed-data forecast outputs using the moving-average velocity formula",
        "Table 6.6 - Evaluation limitations and recommended validation improvements",
    ]
    replace_list_section(doc, "List of Figures", figure_items, "List of Tables")
    replace_list_section(doc, "List of Tables", table_items, "Chapter 1 - Introduction")


def write_metrics_summary(metrics, intent_counts, forecast_counts):
    lines = ["Metric,Value"]
    for k in (1, 3, 5):
        lines.append(f"Precision@{k},{metrics[k]['precision']:.4f}")
        lines.append(f"Recall@{k},{metrics[k]['recall']:.4f}")
    lines.append(f"Evaluated users,{metrics[1]['users']}")
    lines.append(f"Chatbot training examples,{sum(intent_counts.values())}")
    for intent, count in sorted(intent_counts.items()):
        lines.append(f"Chatbot intent {intent},{count}")
    for key in ("low", "medium", "high"):
        lines.append(f"Forecast confidence {key},{forecast_counts.get(key, 0)}")
    (FIG_DIR / "evaluation_metrics_summary.csv").write_text("\n".join(lines), encoding="utf-8")


def main():
    foods = parse_foods()
    bills, details = parse_seed_transactions()
    metrics, per_user_details = evaluate_recommendations(foods, bills, details)
    intent_counts = parse_chatbot_intents()
    forecast_counts, forecast_rows = forecast_confidence(foods, bills, details)
    make_charts(metrics, intent_counts, forecast_counts)
    write_metrics_summary(metrics, intent_counts, forecast_counts)
    doc = Document(INPUT_DOCX)
    update_front_matter(doc)
    build_chapter(doc, metrics, per_user_details, intent_counts, forecast_counts, forecast_rows)
    doc.save(OUTPUT_DOCX)
    print(f"Created {OUTPUT_DOCX}")
    print(f"Figures in {FIG_DIR}")
    print("Recommendation metrics:", metrics)
    print("Chatbot intents:", dict(sorted(intent_counts.items())))
    print("Forecast confidence:", dict(forecast_counts))


if __name__ == "__main__":
    main()
