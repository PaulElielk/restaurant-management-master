import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const homeDir = process.env.HOME || "C:/Users/Paul-Eliel Kouame";
const artifactToolPath = path.join(
  homeDir,
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "node",
  "node_modules",
  "@oai",
  "artifact-tool",
  "dist",
  "artifact_tool.mjs",
);

const { Presentation, PresentationFile } = await import(pathToFileURL(artifactToolPath).href);

const root = "C:/Users/Paul-Eliel Kouame/Desktop/programming/restaurant-management-master";
const outPath = path.join(root, "capstone_presentation_ai_restaurant_system_visual.pptx");
const qaDir = path.join(root, "_render_capstone_presentation_visual");

const W = 1280;
const H = 720;
const C = {
  bg: "#FFFEFA",
  ink: "#102A43",
  muted: "#52616B",
  green: "#1F8A5B",
  mint: "#EAF7EF",
  blue: "#2D7DD2",
  sky: "#EAF3FF",
  coral: "#E66B3D",
  peach: "#FFF0E8",
  amber: "#F2B84B",
  cream: "#FFF8E5",
  red: "#C2413A",
  panel: "#F4F7F5",
  border: "#D3DDD8",
  white: "#FFFFFF",
};

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

function addShape(slide, name, left, top, width, height, fill = C.panel, line = C.border) {
  return slide.shapes.add({
    geometry: "rect",
    name,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: line, width: 1 },
  });
}

function addText(slide, name, text, left, top, width, height, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left, top, width, height },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: style.fontSize || 20,
    bold: style.bold || false,
    color: style.color || C.ink,
    alignment: style.alignment || "left",
  };
  return shape;
}

function addHeader(slide, title, section, n, accent = C.green) {
  slide.background.fill = C.bg;
  addShape(slide, `header-band-${n}`, 0, 0, W, 92, C.mint, C.mint);
  addShape(slide, `header-accent-${n}`, 0, 0, 14, H, accent, accent);
  addText(slide, `section-${n}`, section.toUpperCase(), 42, 24, 360, 22, {
    fontSize: 13,
    bold: true,
    color: accent,
  });
  addText(slide, `title-${n}`, title, 42, 50, 1070, 70, {
    fontSize: 36,
    bold: true,
    color: C.ink,
  });
  addFooter(slide, n);
}

function addFooter(slide, n) {
  addText(slide, `footer-${n}`, "AI-Enhanced Restaurant Management System", 42, 676, 520, 22, {
    fontSize: 12,
    color: C.muted,
  });
  addText(slide, `page-${n}`, String(n).padStart(2, "0"), 1194, 676, 42, 22, {
    fontSize: 12,
    color: C.muted,
    alignment: "right",
  });
}

function addBullets(slide, name, items, left, top, width, height, fontSize = 21) {
  addText(slide, name, items.map((item) => `- ${item}`).join("\n"), left, top, width, height, {
    fontSize,
    color: C.ink,
  });
}

function addCard(slide, title, body, left, top, width, height, fill, accent) {
  addShape(slide, `card-${title}`, left, top, width, height, fill, C.border);
  addShape(slide, `card-accent-${title}`, left, top, 9, height, accent, accent);
  addText(slide, `card-title-${title}`, title, left + 24, top + 18, width - 48, 34, {
    fontSize: 23,
    bold: true,
    color: C.ink,
  });
  addText(slide, `card-body-${title}`, body, left + 24, top + 62, width - 48, height - 76, {
    fontSize: 17,
    color: C.muted,
  });
}

function addPlaceholder(slide, label, left, top, width, height, accent = C.green) {
  addShape(slide, `placeholder-${label}`, left, top, width, height, C.white, accent);
  addShape(slide, `placeholder-fill-${label}`, left + 10, top + 10, width - 20, height - 20, "#F1F5F3", "#F1F5F3");
  addText(slide, `placeholder-label-${label}`, `Insert screenshot:\n${label}`, left + 30, top + height / 2 - 42, width - 60, 84, {
    fontSize: 23,
    bold: true,
    color: C.muted,
    alignment: "center",
  });
}

function addMetric(slide, value, label, left, top, width, height, color) {
  addShape(slide, `metric-${label}`, left, top, width, height, C.white, color);
  addText(slide, `metric-value-${label}`, value, left + 16, top + 18, width - 32, 48, {
    fontSize: 36,
    bold: true,
    color,
    alignment: "center",
  });
  addText(slide, `metric-label-${label}`, label, left + 14, top + 66, width - 28, 40, {
    fontSize: 14,
    color: C.muted,
    alignment: "center",
  });
}

function addFlow(slide, steps, left, top, width, height) {
  const gap = 14;
  const stepW = (width - gap * (steps.length - 1)) / steps.length;
  steps.forEach((step, index) => {
    const x = left + index * (stepW + gap);
    const colors = [C.mint, C.sky, C.peach, C.cream, C.mint];
    const accents = [C.green, C.blue, C.coral, C.amber, C.green];
    addShape(slide, `flow-${index}`, x, top, stepW, height, colors[index % colors.length], accents[index % accents.length]);
    addText(slide, `flow-step-${index}`, String(index + 1).padStart(2, "0"), x + 15, top + 18, 44, 26, {
      fontSize: 16,
      bold: true,
      color: accents[index % accents.length],
    });
    addText(slide, `flow-title-${index}`, step, x + 15, top + 54, stepW - 30, 62, {
      fontSize: 21,
      bold: true,
      color: C.ink,
    });
  });
}

// 1
{
  const s = deck.slides.add();
  s.background.fill = C.bg;
  addShape(s, "left-band", 0, 0, 380, H, C.mint, C.mint);
  addShape(s, "coral-strip", 0, 0, 18, H, C.coral, C.coral);
  addText(s, "eyebrow", "BACHELOR OF SCIENCE CAPSTONE DEFENSE", 48, 44, 560, 26, {
    fontSize: 15,
    bold: true,
    color: C.green,
  });
  addText(s, "title", "Design and Implementation of an AI-Enhanced Restaurant Management System", 48, 138, 780, 250, {
    fontSize: 54,
    bold: true,
    color: C.ink,
  });
  addText(s, "subtitle", "A full restaurant platform with online ordering, admin operations, recommendations, NLP assistance, and demand forecasting.", 48, 420, 700, 80, {
    fontSize: 24,
    color: C.muted,
  });
  addPlaceholder(s, "Homepage or menu overview", 838, 130, 360, 430, C.green);
  addText(s, "meta", "Paul-Eliel Kouame\nBachelor of Science Capstone Report", 48, 582, 720, 52, {
    fontSize: 18,
    color: C.ink,
  });
  addFooter(s, 1);
}

// 2
{
  const s = deck.slides.add();
  addHeader(s, "The problem is operational, not only technical", "Context", 2, C.coral);
  addBullets(s, "problem-bullets", [
    "Customers need faster ways to browse, choose, order, and follow up.",
    "Restaurant staff need clearer visibility over orders, payment, and delivery status.",
    "Managers need demand signals before purchasing ingredients or planning work.",
    "The project connects daily restaurant operations with AI-assisted support."
  ], 64, 168, 520, 330, 23);
  addPlaceholder(s, "Restaurant workflow pain points or opening screen", 650, 162, 500, 340, C.coral);
  addCard(s, "Core point", "The system solves an operational workflow first. The AI features strengthen that workflow where they are useful.", 64, 538, 1086, 82, C.peach, C.coral);
}

// 3
{
  const s = deck.slides.add();
  addHeader(s, "The project objective is a working restaurant platform", "Objective", 3, C.green);
  addCard(s, "Customer side", "Browse the menu, view food details, add items to cart, checkout, book tables, and track orders.", 60, 180, 350, 240, C.mint, C.green);
  addCard(s, "Restaurant side", "Receive orders, update order status, manage payment and delivery progress, and monitor demand forecasts.", 465, 180, 350, 240, C.sky, C.blue);
  addCard(s, "AI assistance", "Personalize recommendations, answer menu questions through NLP, and forecast demand from completed orders.", 870, 180, 350, 240, C.peach, C.coral);
  addText(s, "objective-close", "The system is not an isolated AI demo. It is a restaurant management workflow with AI embedded where it can reduce friction and support decisions.", 110, 502, 1010, 72, {
    fontSize: 24,
    bold: true,
    color: C.ink,
    alignment: "center",
  });
}

// 4
{
  const s = deck.slides.add();
  addHeader(s, "The website covers the main restaurant journey", "System scope", 4, C.green);
  addCard(s, "Customer modules", "Home, menu, promotions, cart, checkout, table booking, and order tracking.", 62, 160, 350, 145, C.mint, C.green);
  addCard(s, "Admin modules", "Admin login, order list, status updates, payment actions, and delivery control.", 465, 160, 350, 145, C.sky, C.blue);
  addCard(s, "AI modules", "Recommendation system, chatbot assistant, and demand forecasting service.", 868, 160, 350, 145, C.peach, C.coral);
  addPlaceholder(s, "Homepage or menu overview", 80, 360, 520, 230, C.green);
  addPlaceholder(s, "Chatbot widget", 680, 360, 440, 230, C.blue);
}

// 5
{
  const s = deck.slides.add();
  addHeader(s, "The architecture separates interface, logic, and data", "System design", 5, C.blue);
  addFlow(s, ["Vue.js frontend", "Node/Express API", "MySQL database"], 64, 162, 480, 118);
  addCard(s, "AI service layer", "Recommendation logic, chatbot intent handling, and moving-average forecasting are connected through REST endpoints and database records.", 64, 330, 480, 160, C.peach, C.coral);
  addPlaceholder(s, "System architecture or data-flow diagram", 610, 158, 560, 390, C.blue);
}

// 6
{
  const s = deck.slides.add();
  addHeader(s, "The customer workflow supports ordering from discovery to checkout", "Customer workflow", 6, C.green);
  addFlow(s, ["Browse menu", "View food", "Add to cart", "Checkout", "Track order"], 58, 150, 1110, 104);
  addPlaceholder(s, "Menu filtering or food quick view", 58, 318, 350, 250, C.green);
  addPlaceholder(s, "Cart page", 464, 318, 320, 250, C.blue);
  addPlaceholder(s, "Checkout or order confirmation", 840, 318, 350, 250, C.coral);
}

// 7
{
  const s = deck.slides.add();
  addHeader(s, "The admin workflow turns orders into managed operations", "Admin workflow", 7, C.blue);
  addBullets(s, "admin-bullets", [
    "The dashboard lists active orders and customer details.",
    "Status controls move orders through preparation and delivery.",
    "Payment and cancellation actions support operational control.",
    "Forecasting appears inside the same admin workspace."
  ], 64, 170, 420, 300, 21);
  addPlaceholder(s, "Admin login", 540, 154, 280, 170, C.blue);
  addPlaceholder(s, "Admin order dashboard", 540, 360, 620, 230, C.green);
}

// 8
{
  const s = deck.slides.add();
  addHeader(s, "AI improves specific points in the restaurant workflow", "AI integration", 8, C.coral);
  addCard(s, "Choosing food", "The recommender ranks products from user history, item popularity, category, and type signals.", 60, 154, 350, 130, C.mint, C.green);
  addCard(s, "Asking naturally", "The chatbot maps customer messages to restaurant intents and returns menu-aware answers.", 465, 154, 350, 130, C.sky, C.blue);
  addCard(s, "Planning demand", "The forecast table estimates future item demand from completed order activity.", 870, 154, 350, 130, C.peach, C.coral);
  addPlaceholder(s, "Recommendation panel", 64, 342, 330, 210, C.green);
  addPlaceholder(s, "Chatbot response", 474, 342, 330, 210, C.blue);
  addPlaceholder(s, "Forecast table", 884, 342, 330, 210, C.coral);
}

// 9
{
  const s = deck.slides.add();
  addHeader(s, "Recommendations personalize the menu without hiding popular items", "Recommendation system", 9, C.green);
  addBullets(s, "rec-bullets", [
    "Completed orders provide the customer history.",
    "Scores combine personal preference, popularity, category, and type.",
    "Popular items can overlap, but ranks and scores vary by user.",
    "Precision@K and Recall@K evaluate recommendation quality."
  ], 64, 162, 400, 230, 19);
  addMetric(s, "0.634", "Precision@1", 70, 438, 118, 98, C.green);
  addMetric(s, "0.488", "Precision@3", 210, 438, 118, 98, C.green);
  addMetric(s, "0.536", "Recall@5", 350, 438, 118, 98, C.blue);
  addPlaceholder(s, "Recommended foods on website", 540, 150, 590, 190, C.green);
  addPlaceholder(s, "Postman API comparison for users 1 and 1293", 540, 380, 590, 190, C.blue);
}

// 10
{
  const s = deck.slides.add();
  addHeader(s, "The chatbot turns customer language into restaurant actions", "NLP chatbot", 10, C.blue);
  addBullets(s, "chat-bullets", [
    "Intent classification recognizes greetings, menu overview, dish information, pairings, and recommendations.",
    "Domain rules connect intent to menu data and product filters.",
    "Validation set: 64 utterances across 8 intents.",
    "Measured accuracy: 93.75% in development evaluation."
  ], 64, 166, 460, 270, 19);
  addPlaceholder(s, "Chatbot drink response", 580, 150, 290, 180, C.green);
  addPlaceholder(s, "Chatbot spicy response", 910, 150, 290, 180, C.coral);
  addPlaceholder(s, "Chatbot vegan response", 700, 384, 360, 190, C.blue);
}

// 11
{
  const s = deck.slides.add();
  addHeader(s, "Forecasting gives the admin a practical planning signal", "Demand forecasting", 11, C.coral);
  addBullets(s, "forecast-bullets", [
    "Moving-average velocity uses completed order history.",
    "Lookback period: 30 days. Forecast horizon: next 7 days.",
    "Predicted/day equals total quantity divided by lookback days.",
    "Confidence describes sales regularity, not guaranteed accuracy."
  ], 64, 160, 430, 260, 19);
  addMetric(s, "14", "High confidence", 72, 470, 120, 92, C.green);
  addMetric(s, "16", "Medium confidence", 214, 470, 140, 92, C.amber);
  addMetric(s, "12", "Low confidence", 376, 470, 120, 92, C.red);
  addPlaceholder(s, "Forecast table with high, medium, and low confidence", 570, 150, 590, 240, C.coral);
  addPlaceholder(s, "Forecast confidence chart", 570, 426, 590, 150, C.green);
}

// 12
{
  const s = deck.slides.add();
  addHeader(s, "Evaluation shows progress while staying honest about scope", "Evaluation", 12, C.green);
  addCard(s, "Recommendation", "298 evaluated users. Precision@1: 0.6342. Recall@5: 0.5360.", 60, 150, 350, 130, C.mint, C.green);
  addCard(s, "Chatbot", "64 validation utterances across 8 intents. Accuracy: 93.75%.", 465, 150, 350, 130, C.sky, C.blue);
  addCard(s, "Forecast", "Development order data produced 14 high, 16 medium, and 12 low confidence items.", 870, 150, 350, 130, C.peach, C.coral);
  addText(s, "scope-note", "The system was evaluated in a development environment. Real restaurant deployment and long-term operational study remain future work.", 112, 310, 1050, 48, {
    fontSize: 22,
    bold: true,
    color: C.ink,
    alignment: "center",
  });
  addPlaceholder(s, "Precision@K and Recall@K chart", 110, 408, 470, 170, C.green);
  addPlaceholder(s, "Forecast confidence chart", 700, 408, 470, 170, C.coral);
}

// 13
{
  const s = deck.slides.add();
  addHeader(s, "The result is a full restaurant system with AI support", "Conclusion", 13, C.coral);
  addBullets(s, "conclusion-bullets", [
    "The project implements customer ordering, table booking, checkout, order tracking, and admin order management.",
    "AI features support real workflows: menu choice, customer assistance, and demand planning.",
    "The implementation uses Vue.js, Node.js/Express, MySQL, REST APIs, recommendation logic, NLP, and forecasting.",
    "Future work should include real restaurant deployment, seasonal forecasting, richer chatbot training, and more advanced recommendation models."
  ], 72, 166, 690, 330, 21);
  addShape(s, "closing-panel", 836, 188, 310, 290, C.peach, C.coral);
  addText(s, "closing-main", "Core contribution", 866, 230, 250, 36, {
    fontSize: 24,
    bold: true,
    color: C.ink,
    alignment: "center",
  });
  addText(s, "closing-copy", "A working restaurant management website where AI improves everyday customer and admin decisions.", 870, 302, 242, 128, {
    fontSize: 25,
    bold: true,
    color: C.coral,
    alignment: "center",
  });
}

await fs.mkdir(qaDir, { recursive: true });
for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(qaDir, `${stem}.png`), png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(qaDir, `${stem}.layout.json`), await layout.text(), "utf8");
}

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(outPath);
console.log(outPath);
