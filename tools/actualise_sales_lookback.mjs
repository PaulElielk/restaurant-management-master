import mysql from "../backend/node_modules/mysql2/promise.js";
import { getDemandForecast } from "../backend/models/BillStatusModel.js";

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_restaurant_v2",
};

async function actualiseSalesLookback() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log("Connected to db_restaurant_v2.");

  try {
    // 1. Inspect current historical max date and calculate dynamic day delta
    const [dateRows] = await conn.query(`
      SELECT 
        MIN(bill_when) AS minDate,
        MAX(bill_when) AS maxDate,
        DATEDIFF(CURRENT_DATE(), DATE(MAX(STR_TO_DATE(bill_when, '%Y-%m-%dT%H:%i')))) AS deltaDays,
        COUNT(*) AS totalHistoricalCompleted
      FROM billstatus
      WHERE bill_status = 6 AND bill_when < '2026-11-01T00:00'
    `);

    const { minDate, maxDate, deltaDays, totalHistoricalCompleted } = dateRows[0];
    console.log(`Current historical completed orders: ${totalHistoricalCompleted}`);
    console.log(`Date span: ${minDate} -> ${maxDate}`);
    console.log(`Computed deltaDays to today: ${deltaDays} days`);

    if (!deltaDays || deltaDays <= 0) {
      console.log("Sales are already up-to-date within the current 30-day lookback window. No shift needed.");
    } else {
      console.log(`Shifting ${totalHistoricalCompleted} orders forward by ${deltaDays} days...`);
      const [updateResult] = await conn.query(
        `
        UPDATE billstatus
        SET bill_when = DATE_FORMAT(
          DATE_ADD(STR_TO_DATE(bill_when, '%Y-%m-%dT%H:%i'), INTERVAL ? DAY),
          '%Y-%m-%dT%H:%i'
        )
        WHERE bill_status = 6 AND bill_when < '2026-11-01T00:00'
        `,
        [deltaDays]
      );
      console.log(`Successfully updated ${updateResult.affectedRows} orders.`);
    }

    // 2. Verify new date span for completed orders
    const [newDateRows] = await conn.query(`
      SELECT 
        MIN(bill_when) AS newMinDate,
        MAX(bill_when) AS newMaxDate,
        COUNT(*) AS totalCompleted
      FROM billstatus
      WHERE bill_status = 6
    `);
    console.log("New completed orders date span:", newDateRows[0]);

    // 3. Confirm active orders (bill_status 1-5) and today's test orders remain untouched
    const [activeRows] = await conn.query(`
      SELECT bill_id, bill_status, bill_when 
      FROM billstatus 
      WHERE bill_status BETWEEN 1 AND 5
    `);
    console.log(`Active kitchen orders intact (${activeRows.length} active tickets).`);

  } finally {
    await conn.end();
  }

  // 4. Run model forecast verification
  console.log("\nRunning Demand Forecast model verification (30-day lookback, 7-day forecast)...");
  await new Promise((resolve, reject) => {
    getDemandForecast(30, 7, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const counts = rows.reduce(
        (acc, r) => {
          acc[r.confidence_hint] = (acc[r.confidence_hint] || 0) + 1;
          return acc;
        },
        { low: 0, medium: 0, high: 0 }
      );
      console.log("Forecast confidence distribution:", counts);
      console.log("Top 5 forecasted menu items:");
      rows.slice(0, 5).forEach((r, i) => {
        console.log(
          `  ${i + 1}. ${r.food_name} (ID: ${r.food_id}) -> Total Qty: ${r.total_qty}, Active Days: ${r.active_days}/30, Predicted 7-day: ${r.predicted_period_qty}, Conf: ${r.confidence_hint}`
        );
      });
      resolve();
    });
  });
}

actualiseSalesLookback()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error actualising sales lookback:", err);
    process.exit(1);
  });
