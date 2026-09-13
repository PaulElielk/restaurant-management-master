import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "../backend/node_modules/mysql2/promise.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "evaluation_figures", "db_recommendation_metrics.csv");
const summaryPath = path.join(root, "evaluation_figures", "db_recommendation_dataset_summary.json");

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant_v2",
});

try {
  const [foods] = await db.query(`
    SELECT
      f.food_id,
      f.food_name,
      f.food_category,
      f.food_type,
      f.food_vote,
      COALESCE(SUM(CASE WHEN bs.bill_status > 0 THEN bd.item_qty ELSE 0 END), 0) AS global_qty
    FROM food f
    LEFT JOIN billdetails bd ON bd.food_id = f.food_id
    LEFT JOIN billstatus bs ON bs.bill_id = bd.bill_id
    GROUP BY f.food_id, f.food_name, f.food_category, f.food_type, f.food_vote
  `);

  const [historyRows] = await db.query(`
    SELECT
      bs.user_id,
      bd.food_id,
      f.food_category,
      f.food_type,
      SUM(bd.item_qty) AS qty,
      MAX(bs.bill_id) AS last_bill_id
    FROM billstatus bs
    JOIN billdetails bd ON bd.bill_id = bs.bill_id
    JOIN food f ON f.food_id = bd.food_id
    WHERE bs.bill_status > 0
      AND bs.user_id BETWEEN 1001 AND 1300
    GROUP BY bs.user_id, bd.food_id, f.food_category, f.food_type
  `);

  const byUser = new Map();
  for (const row of historyRows) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
    byUser.get(row.user_id).push(row);
  }

  const ks = [1, 3, 5];
  const metrics = {};

  for (const k of ks) {
    let users = 0;
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalHits = 0;

    for (const rows of byUser.values()) {
      if (rows.length < 3) continue;
      users += 1;

      const sortedHistory = rows
        .slice()
        .sort((a, b) => Number(a.last_bill_id || 0) - Number(b.last_bill_id || 0));
      const holdoutCount = Math.max(1, Math.ceil(sortedHistory.length * 0.2));
      const trainRows = sortedHistory.slice(0, sortedHistory.length - holdoutCount);
      const holdoutRows = sortedHistory.slice(sortedHistory.length - holdoutCount);

      const trainFoodIds = new Set(trainRows.map((row) => Number(row.food_id)));
      const holdoutFoodIds = new Set(holdoutRows.map((row) => Number(row.food_id)));
      const categoryPreference = {};
      const typePreference = {};

      for (const row of trainRows) {
        const qty = Number(row.qty || 0);
        categoryPreference[row.food_category] = (categoryPreference[row.food_category] || 0) + qty;
        typePreference[row.food_type] = (typePreference[row.food_type] || 0) + qty;
      }

      const predictedIds = foods
        .filter((food) => !trainFoodIds.has(Number(food.food_id)))
        .map((food) => {
          const popularity = Number(food.global_qty || 0);
          const categoryScore = categoryPreference[food.food_category] || 0;
          const typeScore = typePreference[food.food_type] || 0;
          const voteScore = Number.parseFloat(food.food_vote || 0) / 1000;
          const score = popularity + categoryScore * 3 + typeScore * 2 + voteScore;
          return { food_id: Number(food.food_id), score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map((food) => food.food_id);

      const hits = predictedIds.filter((id) => holdoutFoodIds.has(id)).length;
      totalHits += hits;
      totalPrecision += hits / k;
      totalRecall += hits / holdoutFoodIds.size;
    }

    metrics[k] = {
      evaluated_users: users,
      total_hits: totalHits,
      precision: Number((totalPrecision / users).toFixed(4)),
      recall: Number((totalRecall / users).toFixed(4)),
    };
  }

  const [statsRows] = await db.query(`
    SELECT 'synthetic_users' AS metric, COUNT(DISTINCT user_id) AS value
      FROM user WHERE user_id BETWEEN 1001 AND 1300
    UNION ALL
    SELECT 'synthetic_orders', COUNT(*)
      FROM billstatus WHERE bill_id BETWEEN 30001 AND 35000
    UNION ALL
    SELECT 'synthetic_order_lines', COUNT(*)
      FROM billdetails WHERE bill_id BETWEEN 30001 AND 35000
    UNION ALL
    SELECT 'synthetic_unique_user_product_interactions', COUNT(*)
      FROM (
        SELECT bs.user_id, bd.food_id
        FROM billstatus bs
        JOIN billdetails bd ON bd.bill_id = bs.bill_id
        WHERE bs.user_id BETWEEN 1001 AND 1300
          AND bs.bill_status > 0
        GROUP BY bs.user_id, bd.food_id
      ) AS interactions
  `);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    ["K,Evaluated Users,Total Hits,Precision,Recall"]
      .concat(
        ks.map((k) => {
          const row = metrics[k];
          return `${k},${row.evaluated_users},${row.total_hits},${row.precision.toFixed(4)},${row.recall.toFixed(4)}`;
        })
      )
      .join("\n"),
    "utf8"
  );

  await fs.writeFile(
    summaryPath,
    JSON.stringify({ stats: statsRows, metrics }, null, 2),
    "utf8"
  );

  console.log(JSON.stringify({ stats: statsRows, metrics }, null, 2));
  console.log(`Wrote ${outputPath}`);
} finally {
  await db.end();
}
