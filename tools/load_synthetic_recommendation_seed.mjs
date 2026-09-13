import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "../backend/node_modules/mysql2/promise.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sqlPath = path.join(root, "backend", "sql", "synthetic_recommendation_eval_seed.sql");

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant_v2",
  multipleStatements: true,
});

try {
  const sql = await fs.readFile(sqlPath, "utf8");
  await db.query(sql);

  const [rows] = await db.query(`
    SELECT 'synthetic_users' AS metric, COUNT(*) AS value
      FROM user WHERE user_id BETWEEN 1001 AND 1300
    UNION ALL
    SELECT 'synthetic_orders', COUNT(*)
      FROM billstatus WHERE bill_id BETWEEN 30001 AND 35000
    UNION ALL
    SELECT 'synthetic_order_lines', COUNT(*)
      FROM billdetails WHERE bill_id BETWEEN 30001 AND 35000
  `);

  console.log(JSON.stringify(rows, null, 2));
  console.log("Synthetic recommendation dataset loaded into db_restaurant_v2.");
  console.log("Example login: synthetic1001@example.com / password123");
} finally {
  await db.end();
}
