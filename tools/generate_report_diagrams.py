from __future__ import annotations

import json
import math
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "report_figures"
OUT.mkdir(exist_ok=True)


COLORS = {
    "bg": "#FFFFFF",
    "ink": "#1F2937",
    "muted": "#6B7280",
    "blue": "#2563EB",
    "blue_light": "#DBEAFE",
    "green": "#16A34A",
    "green_light": "#DCFCE7",
    "orange": "#F97316",
    "orange_light": "#FFEDD5",
    "purple": "#7C3AED",
    "purple_light": "#EDE9FE",
    "red": "#DC2626",
    "red_light": "#FEE2E2",
    "gray": "#F3F4F6",
    "line": "#374151",
}


def font(size: int, bold: bool = False):
    path = "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"
    if Path(path).exists():
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()


F_TITLE = font(34, True)
F_H = font(22, True)
F = font(18)
F_SM = font(15)
F_XS = font(13)


def wrap(text: str, width: int) -> str:
    lines = []
    for part in text.split("\n"):
        lines.extend(textwrap.wrap(part, width=width) or [""])
    return "\n".join(lines)


def box(draw: ImageDraw.ImageDraw, xy, title: str, body: str = "", fill: str = "#F3F4F6", outline: str = "#374151", width_chars: int = 26):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=18, fill=fill, outline=outline, width=3)
    draw.text((x0 + 18, y0 + 14), wrap(title, width_chars), fill=COLORS["ink"], font=F_H)
    if body:
        draw.text((x0 + 18, y0 + 54), wrap(body, width_chars + 6), fill=COLORS["ink"], font=F)


def arrow(draw: ImageDraw.ImageDraw, start, end, fill: str = COLORS["line"], width: int = 4, dashed: bool = False):
    x0, y0 = start
    x1, y1 = end
    if dashed:
        segments = 18
        for i in range(segments):
            if i % 2 == 0:
                t0 = i / segments
                t1 = (i + 1) / segments
                sx = x0 + (x1 - x0) * t0
                sy = y0 + (y1 - y0) * t0
                ex = x0 + (x1 - x0) * t1
                ey = y0 + (y1 - y0) * t1
                draw.line((sx, sy, ex, ey), fill=fill, width=width)
    else:
        draw.line((x0, y0, x1, y1), fill=fill, width=width)
    angle = math.atan2(y1 - y0, x1 - x0)
    size = 14
    p1 = (x1 - size * math.cos(angle - math.pi / 6), y1 - size * math.sin(angle - math.pi / 6))
    p2 = (x1 - size * math.cos(angle + math.pi / 6), y1 - size * math.sin(angle + math.pi / 6))
    draw.polygon([end, p1, p2], fill=fill)


def title(draw, text: str, width: int):
    draw.text((width // 2, 40), text, fill=COLORS["ink"], font=F_TITLE, anchor="mm")


def save(img: Image.Image, name: str, source: dict):
    path = OUT / name
    img.save(path)
    (OUT / f"{Path(name).stem}.json").write_text(json.dumps(source, indent=2), encoding="utf-8")
    print(path)


def system_architecture():
    img = Image.new("RGB", (1700, 980), COLORS["bg"])
    d = ImageDraw.Draw(img)
    title(d, "Overall System Architecture", 1700)

    box(d, (70, 120, 440, 430), "Vue.js Frontend SPA", "Customer pages\nMenu, cart, checkout, orders\nAdmin dashboard\nChatbot component", COLORS["blue_light"])
    box(d, (530, 120, 880, 430), "HTTP/API Layer", "Axios requests\nREST endpoints under /api\nJSON request and response payloads", COLORS["green_light"])
    box(d, (970, 120, 1320, 430), "Node.js / Express Backend", "routes.js\nControllers\nModel functions\nStatic Vue build serving", COLORS["orange_light"])
    box(d, (1400, 120, 1640, 430), "MySQL", "db_restaurant_v2\nfood, user, cart\nbillstatus, billdetails\nbooking and metadata tables", COLORS["purple_light"], width_chars=19)

    arrow(d, (440, 275), (530, 275))
    arrow(d, (880, 275), (970, 275))
    arrow(d, (1320, 275), (1400, 275))
    arrow(d, (1400, 325), (1320, 325))
    arrow(d, (970, 325), (880, 325))
    arrow(d, (530, 325), (440, 325))

    box(d, (120, 590, 430, 815), "Customer Interface", "Home, Menu, QuickView\nCart, Checkout, MyOrder\nTable booking", COLORS["gray"], width_chars=24)
    box(d, (500, 590, 810, 815), "Admin Interface", "Admin login\nDashboard\nOrder status updates\nDemand forecast view", COLORS["gray"], width_chars=24)
    box(d, (880, 560, 1185, 850), "AI-Related Modules", "FoodModel.js\nRecommendation engine\nUsers also bought\n\nChatbotService.js\nnode-nlp + rules\n\nBillStatusModel.js\nMoving-average forecast", COLORS["red_light"], width_chars=24)
    box(d, (1260, 590, 1580, 815), "Data Access", "mysql2 model queries\nLogical relationships through IDs\nSome food metadata FKs", COLORS["gray"], width_chars=25)
    arrow(d, (1185, 705), (1260, 705))
    arrow(d, (410, 590), (530, 430), dashed=True)
    arrow(d, (655, 590), (1080, 430), dashed=True)
    arrow(d, (1035, 560), (1145, 430), dashed=True)
    save(img, "figure_4_1_overall_system_architecture.png", {"source": ["frontend/src/router/index.js", "frontend/src/axios.js", "backend/index.js", "backend/routes/routes.js", "backend/config/database.js"]})


def erd():
    img = Image.new("RGB", (1700, 1120), COLORS["bg"])
    d = ImageDraw.Draw(img)
    title(d, "Database Entity Relationship Diagram", 1700)

    tables = {
        "user": ((90, 130, 410, 315), "user", "PK user_id\nuser_name, email, phone\npassword, birth, gender"),
        "food": ((690, 120, 1060, 390), "food", "PK food_id\nname, price, discount\ncategory, type, status\nrating, order_count\nmetadata fields"),
        "cart": ((90, 470, 410, 650), "cart", "PK user_id + food_id\nitem_qty\nlogical link to user/food"),
        "booktable": ((90, 760, 410, 955), "booktable", "PK book_id\nuser_id\npeople, tables, when\nphone, note"),
        "billstatus": ((690, 470, 1060, 690), "billstatus", "PK bill_id\nuser_id\nphone, address, when\ntotal, paid, status"),
        "billdetails": ((690, 790, 1060, 970), "billdetails", "PK bill_id + food_id\nitem_qty\nlogical link to bill/food"),
        "food_ingredients": ((1250, 150, 1600, 300), "food_ingredients", "PK food_id + ingredient\nFK food_id -> food"),
        "food_tags": ((1250, 405, 1600, 555), "food_tags", "PK food_id + tag\nFK food_id -> food"),
        "food_allergens": ((1250, 660, 1600, 810), "food_allergens", "PK food_id + allergen\nFK food_id -> food"),
    }
    for xy, title_text, body in tables.values():
        box(d, xy, title_text, body, COLORS["gray"], width_chars=25)

    # Declared foreign keys from metadata tables to food.
    arrow(d, (1250, 225), (1060, 225), fill=COLORS["green"], dashed=False)
    arrow(d, (1250, 480), (1060, 270), fill=COLORS["green"], dashed=False)
    arrow(d, (1250, 735), (1060, 315), fill=COLORS["green"], dashed=False)

    # Logical relationships used by application code.
    arrow(d, (250, 315), (250, 470), fill=COLORS["blue"], dashed=True)
    arrow(d, (410, 560), (690, 560), fill=COLORS["blue"], dashed=True)
    arrow(d, (410, 855), (690, 585), fill=COLORS["blue"], dashed=True)
    arrow(d, (250, 315), (250, 760), fill=COLORS["blue"], dashed=True)
    arrow(d, (875, 690), (875, 790), fill=COLORS["blue"], dashed=True)
    arrow(d, (875, 790), (875, 390), fill=COLORS["blue"], dashed=True)

    d.rounded_rectangle((90, 1000, 1600, 1095), radius=14, fill="#F9FAFB", outline="#D1D5DB", width=2)
    legend = (
        "Legend: solid green lines are foreign keys declared in the SQL metadata migration/schema. "
        "Dashed blue lines are logical relationships used by controllers and models through shared identifier columns."
    )
    d.text((120, 1018), wrap(legend, 128), fill=COLORS["ink"], font=F)

    save(img, "figure_4_2_database_erd.png", {"source": ["frontend/src/resources/db_restaurant.sql", "backend/sql/food_metadata_migration.sql", "backend/models/*.js"]})


def flow_diagram(name: str, heading: str, steps: list[str], colors: list[str], source: list[str], width: int = 1700):
    rows = math.ceil(len(steps) / 4)
    height = 180 + rows * 230
    img = Image.new("RGB", (width, height), COLORS["bg"])
    d = ImageDraw.Draw(img)
    title(d, heading, width)
    margin_x = 90
    gap_x = 55
    box_w = (width - 2 * margin_x - 3 * gap_x) // 4
    box_h = 135
    positions = []
    for idx, step in enumerate(steps):
        row = idx // 4
        col = idx % 4
        if row % 2 == 1:
            col = 3 - col
        x0 = margin_x + col * (box_w + gap_x)
        y0 = 120 + row * 220
        positions.append((x0, y0, x0 + box_w, y0 + box_h))
        box(d, positions[-1], f"{idx + 1}. {step.split('|')[0]}", step.split("|")[1] if "|" in step else "", colors[idx % len(colors)], width_chars=26)
    for idx in range(len(positions) - 1):
        x0, y0, x1, y1 = positions[idx]
        nx0, ny0, nx1, ny1 = positions[idx + 1]
        start = (x1, (y0 + y1) // 2) if nx0 > x0 else (x0, (y0 + y1) // 2)
        end = (nx0, (ny0 + ny1) // 2) if nx0 > x0 else (nx1, (ny0 + ny1) // 2)
        if abs(start[1] - end[1]) > 50:
            start = ((x0 + x1) // 2, y1)
            end = ((nx0 + nx1) // 2, ny0)
        arrow(d, start, end)
    save(img, name, {"source": source, "steps": steps})


def workflows():
    palette = [COLORS["blue_light"], COLORS["green_light"], COLORS["orange_light"], COLORS["purple_light"]]
    flow_diagram(
        "figure_4_3_customer_ordering_workflow.png",
        "Customer Ordering Workflow",
        [
            "Browse menu|Menu.vue retrieves foods and categories",
            "Filter or search|Frontend filters menu items by category/status",
            "View details|QuickView/food card shows description and price",
            "Add to cart|POST /api/cartItem stores item quantity",
            "Checkout|Checkout.vue collects delivery/payment details",
            "Create bill status|POST /api/billstatus creates order header",
            "Save bill details|POST /api/billdetails stores item lines",
            "Clear cart|DELETE /api/cartItem/:id removes cart rows",
            "Admin manages order|Dashboard updates status/paid/cancelled",
        ],
        palette,
        ["frontend/src/pages/Menu.vue", "frontend/src/pages/Checkout.vue", "backend/routes/routes.js", "backend/models/CartModel.js", "backend/models/BillStatusModel.js", "backend/models/BillDetailsModel.js"],
    )
    flow_diagram(
        "figure_4_4_frontend_api_database_flow.png",
        "Frontend, API, and Database Interaction Flow",
        [
            "Vue component|Menu, Checkout, Dashboard, Chatbot, etc.",
            "Vuex state|Shared allFoods, user, and admin state",
            "Axios request|Base URL points to :8001/api",
            "Express route|routes.js maps endpoint to controller",
            "Controller|Reads params/body and calls model",
            "Model|Runs mysql2 query against database",
            "MySQL result|Rows returned from db_restaurant_v2",
            "JSON response|Controller sends API response",
            "UI update|Component refreshes reactive data",
        ],
        palette,
        ["frontend/src/store/index.js", "frontend/src/axios.js", "backend/routes/routes.js", "backend/controllers/*.js", "backend/models/*.js"],
    )
    flow_diagram(
        "figure_5_1_recommendation_workflow.png",
        "Recommendation Engine Workflow",
        [
            "Receive user ID|GET /api/recommendations/:id",
            "Load cart exclusions|Optional excludeCart removes current cart items",
            "Retrieve purchase history|billstatus and billdetails joined with food",
            "Compute preferences|Category and food_type quantities form profile",
            "Load candidate foods|Available menu items and popularity signals",
            "Apply co-purchase endpoint|Also-bought logic is available for item pairings",
            "Calculate score|Popularity + category + type + vote signals",
            "Rank items|Sort by recommendation_score",
            "Return top results|Frontend displays reason and strategy fields",
        ],
        palette,
        ["backend/models/FoodModel.js", "backend/controllers/food.js", "frontend/src/pages/Menu.vue", "frontend/src/pages/Home.vue"],
    )
    flow_diagram(
        "figure_5_2_chatbot_pipeline.png",
        "Chatbot and NLP Processing Pipeline",
        [
            "User enters message|Floating Chatbot.vue component",
            "POST chatbot endpoint|/api/chatbot/message",
            "Normalize text|Lowercase, tokenize, remove stop words",
            "Direct food matching|Find menu item names or dish candidates",
            "Rule-based filters|Detect category, cuisine, vegan, meat, spicy, price",
            "node-nlp classification|Intent model trained from labeled utterances",
            "Select backend action|Menu overview, recommendation, details, pairings",
            "Retrieve menu data|FoodModel queries MySQL when needed",
            "Generate response|Text plus optional food card data",
            "Return to frontend|Chatbot renders assistant reply",
        ],
        palette,
        ["frontend/src/components/Chatbot.vue", "backend/controllers/chatbot.js", "backend/models/ChatbotService.js", "backend/models/FoodModel.js"],
    )
    flow_diagram(
        "figure_5_3_forecasting_workflow.png",
        "Demand Forecasting Workflow",
        [
            "Admin requests forecast|GET /api/billstatus/forecast",
            "Apply lookback window|Default 30 days, bounded by backend",
            "Retrieve completed orders|billstatus joined with billdetails and food",
            "Group by food item|Aggregate item_qty per food",
            "Count active days|Distinct order dates within lookback",
            "Compute daily velocity|total_qty / lookback_days",
            "Apply horizon|daily velocity x forecast days",
            "Assign confidence|Activity-day regularity: low, medium, high",
            "Return forecast|Dashboard displays ranked forecast rows",
        ],
        palette,
        ["backend/models/BillStatusModel.js", "backend/controllers/billstatus.js", "frontend/src/admin/Dashboard.vue"],
    )


def main():
    system_architecture()
    erd()
    workflows()


if __name__ == "__main__":
    main()
