import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDemandForecast } from "../backend/models/BillStatusModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "evaluation_figures");
const jsonPath = path.join(outDir, "db_forecast_evaluation_summary.json");
const csvPath = path.join(outDir, "db_forecast_top_outputs.csv");

function runForecast(lookbackDays = 30, forecastDays = 7) {
  return new Promise((resolve, reject) => {
    getDemandForecast(lookbackDays, forecastDays, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

const rows = await runForecast(30, 7);
const counts = rows.reduce(
  (acc, row) => {
    acc[row.confidence_hint] = (acc[row.confidence_hint] || 0) + 1;
    return acc;
  },
  { low: 0, medium: 0, high: 0 }
);

const topOutputs = rows.slice(0, 10).map((row) => ({
  food_id: Number(row.food_id),
  food_name: row.food_name,
  total_qty: Number(row.total_qty),
  active_days: Number(row.active_days),
  predicted_period_qty: Number(row.predicted_period_qty),
  confidence_hint: row.confidence_hint,
}));

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(
  jsonPath,
  JSON.stringify(
    {
      source: "db_restaurant_v2 development MySQL database",
      seed_range: "billstatus/billdetails bill_id 50001-53000",
      model: "moving_average_velocity",
      lookback_days: 30,
      forecast_days: 7,
      confidence_counts: counts,
      top_outputs: topOutputs,
    },
    null,
    2
  ),
  "utf8"
);

await fs.writeFile(
  csvPath,
  ["food_id,food_name,total_qty,active_days,predicted_period_qty,confidence_hint"]
    .concat(
      topOutputs.map((row) =>
        [
          row.food_id,
          `"${String(row.food_name).replaceAll('"', '""')}"`,
          row.total_qty,
          row.active_days,
          row.predicted_period_qty.toFixed(2),
          row.confidence_hint,
        ].join(",")
      )
    )
    .join("\n"),
  "utf8"
);

console.log(JSON.stringify({ confidence_counts: counts, top_outputs: topOutputs }, null, 2));
console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${csvPath}`);
process.exit(0);
