import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateRecommendationsForUser } from "../backend/models/FoodModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "evaluation_figures", "db_recommendation_metrics.csv");

function evaluateUser(userId, limit) {
  return new Promise((resolve, reject) => {
    evaluateRecommendationsForUser(userId, { limit }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

const users = Array.from({ length: 300 }, (_, i) => 1001 + i);
const ks = [1, 3, 5];
const rows = [];

for (const k of ks) {
  const evaluated = [];
  for (const userId of users) {
    const result = await evaluateUser(userId, k);
    if (result?.metric === "precision_recall_at_k") {
      evaluated.push(result);
    }
  }

  const precision = evaluated.reduce((sum, row) => sum + Number(row.precision_at_k || 0), 0) / evaluated.length;
  const recall = evaluated.reduce((sum, row) => sum + Number(row.recall_at_k || 0), 0) / evaluated.length;
  const hits = evaluated.reduce((sum, row) => sum + Number(row.hits || 0), 0);

  rows.push({
    k,
    evaluated_users: evaluated.length,
    total_hits: hits,
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
  });
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(
  outputPath,
  ["K,Evaluated Users,Total Hits,Precision,Recall"]
    .concat(rows.map((row) => `${row.k},${row.evaluated_users},${row.total_hits},${row.precision.toFixed(4)},${row.recall.toFixed(4)}`))
    .join("\n"),
  "utf8"
);

console.log(JSON.stringify(rows, null, 2));
console.log(`Wrote ${outputPath}`);
process.exit(0);
