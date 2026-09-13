import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NlpManager } from "../backend/node_modules/node-nlp/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const chatbotPath = path.join(root, "backend", "models", "ChatbotService.js");
const outDir = path.join(root, "evaluation_figures");
const summaryPath = path.join(outDir, "chatbot_evaluation_summary.json");
const predictionsPath = path.join(outDir, "chatbot_validation_predictions.csv");

const validationDocuments = [
  ["hello assistant", "greetings.hello"],
  ["good day can you help me", "greetings.hello"],
  ["hi i need help with food", "greetings.hello"],
  ["hey can we start", "greetings.hello"],
  ["is anyone available to help", "greetings.hello"],
  ["good evening restaurant bot", "greetings.hello"],
  ["i need help with my order", "greetings.hello"],
  ["can you assist me please", "greetings.hello"],

  ["what meal would you suggest", "restaurant.recommendation"],
  ["give me your best recommendation", "restaurant.recommendation"],
  ["what dish should i pick", "restaurant.recommendation"],
  ["show me something popular", "restaurant.recommendation"],
  ["what are customers buying most", "restaurant.recommendation"],
  ["recommend a good dinner", "restaurant.recommendation"],
  ["choose a meal for me", "restaurant.recommendation"],
  ["what is a strong choice today", "restaurant.recommendation"],

  ["show me your hottest meals", "restaurant.recommend_spicy"],
  ["i want food with chili", "restaurant.recommend_spicy"],
  ["which dishes are spicy", "restaurant.recommend_spicy"],
  ["give me something hot and spicy", "restaurant.recommend_spicy"],
  ["recommend a spicy dish", "restaurant.recommend_spicy"],
  ["what menu items have heat", "restaurant.recommend_spicy"],
  ["i like spicy tacos", "restaurant.recommend_spicy"],
  ["show me food with spice", "restaurant.recommend_spicy"],

  ["what meals have no meat", "restaurant.recommend_vegan"],
  ["i want vegan friendly food", "restaurant.recommend_vegan"],
  ["show vegetarian dishes", "restaurant.recommend_vegan"],
  ["give me plant based options", "restaurant.recommend_vegan"],
  ["do you have meat free meals", "restaurant.recommend_vegan"],
  ["recommend something vegan", "restaurant.recommend_vegan"],
  ["i cannot eat meat", "restaurant.recommend_vegan"],
  ["show vegan menu items", "restaurant.recommend_vegan"],

  ["show food with beef", "restaurant.recommend_meat"],
  ["i want chicken dishes", "restaurant.recommend_meat"],
  ["recommend non vegetarian meals", "restaurant.recommend_meat"],
  ["what meat options are available", "restaurant.recommend_meat"],
  ["give me something with pork", "restaurant.recommend_meat"],
  ["i want a meaty meal", "restaurant.recommend_meat"],
  ["show beef or chicken meals", "restaurant.recommend_meat"],
  ["what dishes are not vegan", "restaurant.recommend_meat"],

  ["what comes inside carne asada tacos", "restaurant.dish_info"],
  ["tell me details about fried ice cream", "restaurant.dish_info"],
  ["what ingredients are in chicken nachos", "restaurant.dish_info"],
  ["describe the california burrito", "restaurant.dish_info"],
  ["what does horchata include", "restaurant.dish_info"],
  ["explain shrimp nachos to me", "restaurant.dish_info"],
  ["what is in the corn salad", "restaurant.dish_info"],
  ["give me information about churros", "restaurant.dish_info"],

  ["what should i pair with tacos", "restaurant.also_bought"],
  ["what goes well with burritos", "restaurant.also_bought"],
  ["what do customers buy together with nachos", "restaurant.also_bought"],
  ["suggest a drink for my order", "restaurant.also_bought"],
  ["what side should come with my meal", "restaurant.also_bought"],
  ["show items commonly bought together", "restaurant.also_bought"],
  ["what else should i add to tacos", "restaurant.also_bought"],
  ["recommend a pairing for burrito", "restaurant.also_bought"],

  ["let me browse the menu", "restaurant.menu_overview"],
  ["show all your food categories", "restaurant.menu_overview"],
  ["what can customers order here", "restaurant.menu_overview"],
  ["display the restaurant menu", "restaurant.menu_overview"],
  ["what dishes are available", "restaurant.menu_overview"],
  ["open menu categories", "restaurant.menu_overview"],
  ["list your menu options", "restaurant.menu_overview"],
  ["show available meals", "restaurant.menu_overview"],
];

function extractTrainingDocuments(source) {
  const relevant = source.slice(
    source.indexOf("const trainingDocuments"),
    source.indexOf("const allTrainingDocuments")
  );
  const rows = [];
  const pattern = /\[\s*(['"`])((?:\\.|(?!\1).)*?)\1\s*,\s*(['"`])((?:\\.|(?!\3).)*?)\3\s*\]/g;
  let match;
  while ((match = pattern.exec(relevant)) !== null) {
    rows.push([match[2].replace(/\\'/g, "'").replace(/\\"/g, '"'), match[4]]);
  }
  return rows;
}

const source = await fs.readFile(chatbotPath, "utf8");
const trainingDocuments = extractTrainingDocuments(source);
const intents = [...new Set(trainingDocuments.map(([, intent]) => intent))].sort();

const manager = new NlpManager({ languages: ["en"], forceNER: true });
for (const [text, intent] of trainingDocuments) {
  manager.addDocument("en", text, intent);
}

await manager.train();

const confusion = Object.fromEntries(
  intents.map((intent) => [intent, Object.fromEntries(intents.map((predicted) => [predicted, 0]).concat([["None", 0]]))])
);

const predictions = [];
for (const [text, expected] of validationDocuments) {
  const response = await manager.process("en", text);
  const predicted = response.intent === "None" || response.score < 0.5 ? "None" : response.intent;
  if (!confusion[expected][predicted] && confusion[expected][predicted] !== 0) {
    confusion[expected][predicted] = 0;
  }
  confusion[expected][predicted] += 1;
  predictions.push({
    text,
    expected,
    predicted,
    score: Number(response.score.toFixed(4)),
    correct: expected === predicted,
  });
}

const labels = intents;
const total = predictions.length;
const correct = predictions.filter((row) => row.correct).length;
const perIntent = {};

for (const intent of labels) {
  const tp = predictions.filter((row) => row.expected === intent && row.predicted === intent).length;
  const fp = predictions.filter((row) => row.expected !== intent && row.predicted === intent).length;
  const fn = predictions.filter((row) => row.expected === intent && row.predicted !== intent).length;
  const support = predictions.filter((row) => row.expected === intent).length;
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  perIntent[intent] = {
    support,
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
  };
}

const macroPrecision = labels.reduce((sum, intent) => sum + perIntent[intent].precision, 0) / labels.length;
const macroRecall = labels.reduce((sum, intent) => sum + perIntent[intent].recall, 0) / labels.length;
const macroF1 = labels.reduce((sum, intent) => sum + perIntent[intent].f1, 0) / labels.length;

const summary = {
  training_examples: trainingDocuments.length,
  validation_examples: validationDocuments.length,
  intents: labels,
  accuracy: Number((correct / total).toFixed(4)),
  macro_precision: Number(macroPrecision.toFixed(4)),
  macro_recall: Number(macroRecall.toFixed(4)),
  macro_f1: Number(macroF1.toFixed(4)),
  per_intent: perIntent,
  confusion_matrix: confusion,
  predictions,
};

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
await fs.writeFile(
  predictionsPath,
  ["text,expected,predicted,score,correct"]
    .concat(
      predictions.map((row) =>
        [
          `"${row.text.replaceAll('"', '""')}"`,
          row.expected,
          row.predicted,
          row.score.toFixed(4),
          row.correct ? "true" : "false",
        ].join(",")
      )
    )
    .join("\n"),
  "utf8"
);

console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${summaryPath}`);
console.log(`Wrote ${predictionsPath}`);
