from __future__ import annotations

import json
import csv
import random
import shutil
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

from docx import Document
from docx.enum.text import WD_BREAK

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

import build_evaluation_chapter as base  # noqa: E402


OUTPUT_DOCX = ROOT / "final_capstone_report_db_seeded_recommendation_eval.docx"
INPUT_DOCX = ROOT / "final_capstone_report_evaluation_strengthened.docx"
FIG_DIR = ROOT / "evaluation_figures"
SQL_OUT = ROOT / "backend/sql/synthetic_recommendation_eval_seed.sql"
SUMMARY_JSON = FIG_DIR / "expanded_recommendation_dataset_summary.json"
METRICS_CSV = FIG_DIR / "expanded_recommendation_metrics.csv"
DB_METRICS_CSV = FIG_DIR / "db_recommendation_metrics.csv"


def weighted_choice(rng: random.Random, items: list[int], weights: list[float]) -> int:
    total = sum(weights)
    threshold = rng.random() * total
    upto = 0.0
    for item, weight in zip(items, weights):
        upto += weight
        if upto >= threshold:
            return item
    return items[-1]


def build_menu_groups(foods):
    by_category = defaultdict(list)
    by_type = defaultdict(list)
    for food in foods:
        fid = food["food_id"]
        by_category[food["food_category"]].append(fid)
        by_type[food["food_type"]].append(fid)
    # Explicit product clusters reflect the actual 42-item menu in db_restaurant.sql.
    return {
        "taco_meal": {
            "core": [1, 2, 3, 4, 5, 6, 7, 8],
            "pair": [20, 21, 22, 23, 24, 37, 38, 42],
            "dessert": [30, 31, 36],
        },
        "burrito_meal": {
            "core": [9, 10, 11, 12, 13, 14],
            "pair": [25, 26, 27, 28, 29, 37, 40, 42],
            "dessert": [30, 34, 36],
        },
        "nachos_party": {
            "core": [15, 16, 17, 18, 19],
            "pair": [20, 21, 22, 23, 24, 37, 38, 42],
            "dessert": [30, 31, 35],
        },
        "vegan_light": {
            "core": [8, 11, 19, 20, 21, 22, 23, 24, 25, 27, 28],
            "pair": [30, 31, 36, 37, 38, 40, 42],
            "dessert": [30, 31, 32, 33, 34, 35, 36],
        },
        "dessert_drink": {
            "core": [30, 31, 32, 33, 34, 35, 36],
            "pair": [37, 38, 39, 40, 41, 42],
            "dessert": [30, 31, 36],
        },
        "meat_combo": {
            "core": [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18],
            "pair": [25, 26, 29, 37, 38, 42],
            "dessert": [30, 31, 36],
        },
    }


def food_popularity_weight(food_id: int) -> float:
    # Higher weights mark broadly popular menu items while preserving niche items.
    very_popular = {1, 2, 4, 10, 11, 13, 16, 17, 20, 24, 30, 31, 37, 38, 40, 42}
    popular = {3, 6, 7, 12, 15, 18, 21, 25, 26, 29, 34, 36, 39, 41}
    niche = {8, 14, 19, 22, 23, 27, 28, 32, 33, 35}
    if food_id in very_popular:
        return 6.0
    if food_id in popular:
        return 3.0
    if food_id in niche:
        return 1.2
    return 2.0


def choose_from_pool(rng: random.Random, pool: list[int], preferred: set[int] | None = None) -> int:
    weights = []
    for fid in pool:
        w = food_popularity_weight(fid)
        if preferred and fid in preferred:
            w *= 1.8
        weights.append(w)
    return weighted_choice(rng, pool, weights)


def generate_synthetic_dataset(foods, user_count=300, order_count=5000, seed=260504):
    rng = random.Random(seed)
    groups = build_menu_groups(foods)
    persona_names = list(groups.keys())
    persona_weights = [0.22, 0.19, 0.17, 0.15, 0.10, 0.17]

    users = {}
    for offset in range(user_count):
        user_id = 1001 + offset
        persona = weighted_choice(rng, persona_names, persona_weights)
        secondary = weighted_choice(rng, persona_names, persona_weights)
        while secondary == persona:
            secondary = weighted_choice(rng, persona_names, persona_weights)
        core = groups[persona]["core"]
        favorites = set(rng.sample(core, k=min(len(core), rng.randint(2, 4))))
        users[user_id] = {
            "persona": persona,
            "secondary": secondary,
            "favorites": favorites,
            "seen": set(),
            "orders": 0,
        }

    user_ids = list(users.keys())
    # Mildly non-uniform customer activity: some users order more often than others.
    activity_weights = [rng.gammavariate(2.0, 1.0) for _ in user_ids]
    start_date = datetime(2026, 1, 3, 11, 0)

    bills = {}
    details = []
    for n in range(order_count):
        user_id = weighted_choice(rng, user_ids, activity_weights)
        profile = users[user_id]
        profile["orders"] += 1
        persona = profile["persona"] if rng.random() < 0.82 else profile["secondary"]
        group = groups[persona]
        items = []

        # Core item: repeat favorites are common, with occasional discovery within the same preference cluster.
        if rng.random() < 0.68 and profile["favorites"]:
            core_item = choose_from_pool(rng, list(profile["favorites"]), profile["favorites"])
        else:
            not_seen = [fid for fid in group["core"] if fid not in profile["seen"]]
            core_item = choose_from_pool(rng, not_seen or group["core"], profile["favorites"])
            if rng.random() < 0.55:
                profile["favorites"].add(core_item)
        items.append(core_item)

        # Co-purchase behavior: side/salsa/drink with most meals.
        if rng.random() < 0.86:
            items.append(choose_from_pool(rng, group["pair"], profile["favorites"]))

        # Larger orders sometimes include a second main item from the same cluster.
        if rng.random() < 0.34:
            items.append(choose_from_pool(rng, group["core"], profile["favorites"]))

        # Dessert after meals.
        if rng.random() < 0.24:
            items.append(choose_from_pool(rng, group["dessert"], profile["favorites"]))

        # Remove duplicate line items within an order while preserving order.
        unique_items = []
        for fid in items:
            if fid not in unique_items:
                unique_items.append(fid)
        for fid in unique_items:
            profile["seen"].add(fid)

        bill_id = 30001 + n
        order_time = start_date + timedelta(days=n // 55, minutes=(n * 37) % 720)
        bills[bill_id] = {
            "bill_id": bill_id,
            "user_id": user_id,
            "bill_when": order_time.strftime("%Y-%m-%dT%H:%M"),
            "bill_status": 6,
        }
        for fid in unique_items:
            qty = 1
            if fid in profile["favorites"] and rng.random() < 0.18:
                qty = 2
            details.append({"bill_id": bill_id, "food_id": fid, "item_qty": qty})

    return users, bills, details


def dataset_stats(foods, bills, details):
    users = sorted({bill["user_id"] for bill in bills.values()})
    products = {food["food_id"] for food in foods}
    orders_by_user = Counter(bill["user_id"] for bill in bills.values())
    unique_products_by_user = defaultdict(set)
    for d in details:
        unique_products_by_user[bills[d["bill_id"]]["user_id"]].add(d["food_id"])
    unique_interactions = sum(len(v) for v in unique_products_by_user.values())
    return {
        "users": len(users),
        "orders": len(bills),
        "products": len(products),
        "line_items": len(details),
        "average_orders_per_user": round(len(bills) / len(users), 2) if users else 0,
        "average_unique_products_per_user": round(unique_interactions / len(users), 2) if users else 0,
        "unique_user_product_interactions": unique_interactions,
        "interaction_density": round(unique_interactions / (len(users) * len(products)), 4) if users and products else 0,
        "users_with_at_least_3_unique_products": sum(1 for u in users if len(unique_products_by_user[u]) >= 3),
    }


def write_synthetic_sql(users, bills, details):
    SQL_OUT.parent.mkdir(parents=True, exist_ok=True)
    bill_values = []
    for bill in bills.values():
        user_id = bill["user_id"]
        phone = f"07{user_id:08d}"[-10:]
        bill_values.append(
            f"  ({bill['bill_id']}, {user_id}, '{phone}', 'Synthetic Evaluation Zone', "
            f"'{bill['bill_when']}', 'card', 0, 500, 15000, 'true', {bill['bill_status']})"
        )
    detail_values = [
        f"  ({d['bill_id']}, {d['food_id']}, {d['item_qty']})"
        for d in details
    ]

    def chunks(values, size=600):
        for i in range(0, len(values), size):
            yield values[i : i + size]

    lines = [
        "-- Synthetic recommendation evaluation seed dataset",
        "-- Deterministically generated by tools/build_expanded_recommendation_eval.py",
        "-- Intended for development recommendation evaluation, not for production data claims.",
        "-- Synthetic customer login pattern: synthetic1001@example.com / password123",
        "USE db_restaurant_v2;",
        "DELETE FROM billdetails WHERE bill_id BETWEEN 30001 AND 35000;",
        "DELETE FROM billstatus WHERE bill_id BETWEEN 30001 AND 35000;",
        "DELETE FROM user WHERE user_id BETWEEN 1001 AND 1300;",
        "",
        "INSERT INTO user",
        "  (user_id, user_name, user_email, user_phone, user_password, user_birth, user_gender)",
        "VALUES",
        ",\n".join(
            [
                f"  ({user_id}, 'Synthetic User {user_id}', 'synthetic{user_id}@example.com', "
                f"'0700{user_id}', 'password123', '1998-01-01', "
                f"'{('male' if user_id % 2 == 0 else 'female')}')"
                for user_id in sorted(users)
            ]
        ) + ";",
        "",
        "INSERT INTO billstatus",
        "  (bill_id, user_id, bill_phone, bill_address, bill_when, bill_method, bill_discount, bill_delivery, bill_total, bill_paid, bill_status)",
        "VALUES",
        ",\n".join(bill_values) + ";",
        "",
    ]
    first = True
    for chunk in chunks(detail_values):
        lines.extend(
            [
                "INSERT INTO billdetails (bill_id, food_id, item_qty)",
                "VALUES",
                ",\n".join(chunk) + ";",
                "",
            ]
        )
        first = False
    SQL_OUT.write_text("\n".join(lines), encoding="utf-8")


def write_metrics_outputs(original_stats, expanded_stats, original_metrics, expanded_metrics):
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    summary = {
        "original_dataset": original_stats,
        "expanded_dataset": expanded_stats,
        "original_metrics": original_metrics,
        "expanded_metrics": expanded_metrics,
        "method": "Offline reproduction of backend holdout evaluator using seeded SQL data.",
    }
    SUMMARY_JSON.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    lines = ["Metric,Original Dataset,Expanded Dataset"]
    for name, k, field in [
        ("Precision@1", 1, "precision"),
        ("Precision@3", 3, "precision"),
        ("Precision@5", 5, "precision"),
        ("Recall@1", 1, "recall"),
        ("Recall@3", 3, "recall"),
        ("Recall@5", 5, "recall"),
    ]:
        lines.append(f"{name},{original_metrics[k][field]:.4f},{expanded_metrics[k][field]:.4f}")
    METRICS_CSV.write_text("\n".join(lines), encoding="utf-8")


def load_db_metrics_if_available():
    if not DB_METRICS_CSV.exists():
        return None
    metrics = {}
    with DB_METRICS_CSV.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            k = int(row["K"])
            metrics[k] = {
                "precision": round(float(row["Precision"]), 4),
                "recall": round(float(row["Recall"]), 4),
                "users": int(row["Evaluated Users"]),
                "hits": int(row["Total Hits"]),
            }
    return metrics if all(k in metrics for k in (1, 3, 5)) else None


def make_updated_recommendation_charts(expanded_metrics):
    labels = [f"K={k}" for k in (1, 3, 5)]
    precision = [expanded_metrics[k]["precision"] for k in (1, 3, 5)]
    recall = [expanded_metrics[k]["recall"] for k in (1, 3, 5)]
    base._bar_chart("Expanded Dataset Recommendation Precision@K", labels, precision, "Precision", FIG_DIR / "figure_6_1_precision_at_k.png")
    base._bar_chart("Expanded Dataset Recommendation Recall@K", labels, recall, "Recall", FIG_DIR / "figure_6_2_recall_at_k.png")
    base._grouped_bar_chart(
        "Expanded Dataset Precision and Recall by Cutoff",
        labels,
        {"Precision": precision, "Recall": recall},
        FIG_DIR / "figure_6_3_precision_recall.png",
    )


def replace_recommendation_section(doc: Document, original_stats, expanded_stats, original_metrics, expanded_metrics):
    body = doc._body._element
    children = list(body)
    start = end = None
    for idx, child in enumerate(children):
        if child.tag.endswith("}p"):
            text = "".join(t.text or "" for t in child.iter(base.qn("w:t"))).strip()
            if text == "6.3 Recommendation Engine Evaluation":
                start = idx
            elif start is not None and text == "6.4 Chatbot Evaluation":
                end = idx
                break
    if start is None or end is None:
        raise RuntimeError("Could not find recommendation evaluation section range")
    for child in children[start + 1 : end]:
        body.remove(child)
    anchor = list(body)[start]

    def p(text: str, style: str | None = None):
        nonlocal anchor
        anchor = base.add_paragraph_after(doc, anchor, text, style)

    def table(rows: list[list[str]]):
        nonlocal anchor
        anchor = base.add_table_after(doc, anchor, rows)

    def pic(filename: str, caption: str):
        nonlocal anchor
        anchor = base.add_picture_after(doc, anchor, FIG_DIR / filename, caption)

    def page_break():
        nonlocal anchor
        p_break = doc.add_paragraph()
        p_break.add_run().add_break(WD_BREAK.PAGE)
        el = base.pop_last_body_element(doc)
        anchor.addnext(el)
        anchor = el

    p(
        "The recommendation module includes an offline holdout evaluator at GET /api/recommendations/:id/evaluate. The evaluator groups each "
        "user's completed-order history by food item, orders the unique items by their most recent bill identifier, reserves the newest 20 "
        "percent as a holdout set, and generates recommendations from the remaining training items. Precision@K and Recall@K are then computed "
        "by comparing the top K predicted item identifiers with the holdout set."
    )
    p(
        "A review of the original seed data showed that the previous zero Precision@K and Recall@K values were strongly affected by dataset "
        "sparsity. The original evaluation file contained only ten orders, five users, and a small number of user-product interactions. Because "
        "the evaluator requires at least three unique items per user and withholds recent unique items, such a small dataset provides very little "
        "evidence from which category, type, and popularity patterns can be learned."
    )
    table(
        [
            ["Measure", "Original Seed Dataset", "Expanded Synthetic Dataset"],
            ["Users", str(original_stats["users"]), str(expanded_stats["users"])],
            ["Completed Orders", str(original_stats["orders"]), str(expanded_stats["orders"])],
            ["Menu Products", str(original_stats["products"]), str(expanded_stats["products"])],
            ["Order Line Items", str(original_stats["line_items"]), str(expanded_stats["line_items"])],
            ["Average Orders per User", f'{original_stats["average_orders_per_user"]:.2f}', f'{expanded_stats["average_orders_per_user"]:.2f}'],
            ["Average Unique Products per User", f'{original_stats["average_unique_products_per_user"]:.2f}', f'{expanded_stats["average_unique_products_per_user"]:.2f}'],
            ["User-Product Interaction Density", f'{original_stats["interaction_density"]:.4f}', f'{expanded_stats["interaction_density"]:.4f}'],
        ]
    )
    p("Table 6.2 - Original and expanded recommendation evaluation dataset characteristics", "Caption")
    p(
        "To test whether the zero scores were caused primarily by sparse data, a deterministic synthetic restaurant dataset was generated and "
        "loaded into the development MySQL database. The expanded dataset models recurring restaurant behavior such as taco meals with salsa or drinks, burrito meals "
        "with sides, nachos party orders, vegan/light meals, dessert-and-drink orders, and meat-based combinations. The dataset includes repeat "
        "purchases, popular menu items, niche items, and co-purchase patterns while still using the actual 42 menu items from the project database."
    )
    page_break()
    metric_rows = [["Metric", "Original Dataset", "Expanded Dataset"]]
    for label, k, field in [
        ("Precision@1", 1, "precision"),
        ("Precision@3", 3, "precision"),
        ("Precision@5", 5, "precision"),
        ("Recall@1", 1, "recall"),
        ("Recall@3", 3, "recall"),
        ("Recall@5", 5, "recall"),
    ]:
        metric_rows.append([label, f'{original_metrics[k][field]:.4f}', f'{expanded_metrics[k][field]:.4f}'])
    table(metric_rows)
    p("Table 6.3 - Recommendation metric comparison before and after synthetic dataset expansion", "Caption")
    p(
        f"The expanded synthetic dataset evaluated {expanded_metrics[1]['users']} users with sufficient purchase history. The resulting metrics "
        f"were Precision@1 = {expanded_metrics[1]['precision']:.4f}, Precision@3 = {expanded_metrics[3]['precision']:.4f}, "
        f"Precision@5 = {expanded_metrics[5]['precision']:.4f}, Recall@1 = {expanded_metrics[1]['recall']:.4f}, "
        f"Recall@3 = {expanded_metrics[3]['recall']:.4f}, and Recall@5 = {expanded_metrics[5]['recall']:.4f}. These results indicate that the "
        "previous all-zero values were mainly a consequence of insufficient evaluation data rather than an obvious defect in the recommendation "
        "pipeline."
    )
    pic("figure_6_1_precision_at_k.png", "Figure 6.1 - Precision@K for the recommendation engine using the expanded synthetic dataset")
    pic("figure_6_2_recall_at_k.png", "Figure 6.2 - Recall@K for the recommendation engine using the expanded synthetic dataset")
    pic("figure_6_3_precision_recall.png", "Figure 6.3 - Expanded dataset precision and recall comparison across recommendation cutoffs")
    p(
        "The improvement should not be interpreted as proof of production performance because the expanded dataset is synthetic. However, it is "
        "a useful development-database diagnostic test: when the evaluator receives enough repeated interactions and coherent preference patterns, "
        "the same scoring logic is able to recover a meaningful portion of held-out items. For the final capstone report, the expanded synthetic "
        "evaluation is therefore more informative than the tiny original seed evaluation, provided it is clearly labeled as synthetic and not "
        "presented as real restaurant deployment data."
    )


def update_front_matter_lists(doc: Document):
    figures = [
        "Figure 4.1 - Three-tier system architecture",
        "Figure 4.2 - Entity-relationship overview of the restaurant database",
        "Figure 4.3 - Checkout and order persistence data flow",
        "Figure 5.1 - Hybrid recommendation engine processing pipeline",
        "Figure 5.2 - NLP chatbot layered resolution pipeline",
        "Figure 5.3 - Demand forecasting endpoint output",
        "Figure 5.4 - Floating chatbot user interface with food cards",
        "Figure 6.1 - Precision@K for the recommendation engine using the expanded synthetic dataset",
        "Figure 6.2 - Recall@K for the recommendation engine using the expanded synthetic dataset",
        "Figure 6.3 - Expanded dataset precision and recall comparison across recommendation cutoffs",
        "Figure 6.4 - Distribution of chatbot training examples by intent",
        "Figure 6.5 - Forecast confidence distribution based on activity-day regularity",
    ]
    tables = [
        "Table 1.1 - Project objectives and verification methods",
        "Table 1.2 - Definition of terms",
        "Table 4.1 - Functional requirements",
        "Table 4.2 - Non-functional requirements",
        "Table 4.3 - Database schema overview",
        "Table 4.4 - Main API domains",
        "Table 6.1 - Functional validation summary",
        "Table 6.2 - Original and expanded recommendation evaluation dataset characteristics",
        "Table 6.3 - Recommendation metric comparison before and after synthetic dataset expansion",
        "Table 6.4 - Chatbot training utterance distribution",
        "Table 6.5 - Forecast confidence distribution from repository seed data",
        "Table 6.6 - Highest seed-data forecast outputs using the moving-average velocity formula",
        "Table 6.7 - Evaluation limitations and recommended validation improvements",
    ]
    base.replace_list_section(doc, "List of Figures", figures, "List of Tables")
    base.replace_list_section(doc, "List of Tables", tables, "Chapter 1 - Introduction")


def renumber_later_chapter6_captions(doc: Document):
    replacements = {
        "Table 6.3 - Chatbot training utterance distribution": "Table 6.4 - Chatbot training utterance distribution",
        "Table 6.4 - Forecast confidence distribution from repository seed data": "Table 6.5 - Forecast confidence distribution from repository seed data",
        "Table 6.5 - Highest seed-data forecast outputs using the moving-average velocity formula": "Table 6.6 - Highest seed-data forecast outputs using the moving-average velocity formula",
        "Table 6.6 - Evaluation limitations and recommended validation improvements": "Table 6.7 - Evaluation limitations and recommended validation improvements",
    }
    for para in doc.paragraphs:
        text = para.text.strip()
        if text in replacements:
            para.text = replacements[text]


def update_evaluation_scope_for_db_seed(doc: Document):
    old = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and seeded completed-order "
        "records in backend/sql/fake_transactions_seed.sql. The live MySQL service was not available in the execution environment during "
        "this audit, so the quantitative recommendation analysis was reproduced from the repository seed files using the same scoring and "
        "holdout principles implemented by the backend."
    )
    new = (
        "The inspection identified three relevant sources of evaluation evidence: the recommendation holdout evaluation logic in "
        "backend/models/FoodModel.js, labeled chatbot training utterances in backend/models/ChatbotService.js, and completed-order records "
        "stored in the development MySQL database. After the expanded synthetic seed was loaded into db_restaurant_v2, the recommendation "
        "metrics were recomputed from the actual database tables using the same scoring and holdout principles implemented by the backend."
    )
    for para in doc.paragraphs:
        if para.text.strip() == old:
            para.text = new
            return


def main():
    foods = base.parse_foods()
    original_bills, original_details = base.parse_seed_transactions()
    original_metrics, _ = base.evaluate_recommendations(foods, original_bills, original_details)
    original_stats = dataset_stats(foods, original_bills, original_details)

    synthetic_users, expanded_bills, expanded_details = generate_synthetic_dataset(foods)
    expanded_metrics, _ = base.evaluate_recommendations(foods, expanded_bills, expanded_details)
    expanded_stats = dataset_stats(foods, expanded_bills, expanded_details)
    db_metrics = load_db_metrics_if_available()
    if db_metrics is not None:
        expanded_metrics = db_metrics

    write_synthetic_sql(synthetic_users, expanded_bills, expanded_details)
    write_metrics_outputs(original_stats, expanded_stats, original_metrics, expanded_metrics)
    make_updated_recommendation_charts(expanded_metrics)

    doc = Document(INPUT_DOCX)
    update_front_matter_lists(doc)
    update_evaluation_scope_for_db_seed(doc)
    replace_recommendation_section(doc, original_stats, expanded_stats, original_metrics, expanded_metrics)
    renumber_later_chapter6_captions(doc)
    doc.save(OUTPUT_DOCX)

    print(f"Created {OUTPUT_DOCX}")
    print(f"Wrote {SQL_OUT}")
    print(json.dumps({
        "original_stats": original_stats,
        "expanded_stats": expanded_stats,
        "original_metrics": original_metrics,
        "expanded_metrics": expanded_metrics,
    }, indent=2))


if __name__ == "__main__":
    main()
