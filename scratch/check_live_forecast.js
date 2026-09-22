import { getDemandForecast } from "../backend/models/BillStatusModel.js";

getDemandForecast(30, 7, (err, rows) => {
    if (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
    const counts = { high: 0, medium: 0, low: 0 };
    rows.forEach(r => {
        counts[r.confidence_hint] = (counts[r.confidence_hint] || 0) + 1;
    });
    console.log("Total items in forecast:", rows.length);
    console.log("Live Confidence Breakdown:", counts);
    console.log("\nTop 8 items:");
    rows.slice(0, 8).forEach(r => {
        console.log(`  ${r.food_name} (${r.food_category}): total_qty=${r.total_qty}, active_days=${r.active_days}, confidence=${r.confidence_hint}`);
    });
    console.log("\nMiddle 5 items:");
    rows.slice(35, 40).forEach(r => {
        console.log(`  ${r.food_name} (${r.food_category}): total_qty=${r.total_qty}, active_days=${r.active_days}, confidence=${r.confidence_hint}`);
    });
    console.log("\nBottom 8 items:");
    rows.slice(-8).forEach(r => {
        console.log(`  ${r.food_name} (${r.food_category}): total_qty=${r.total_qty}, active_days=${r.active_days}, confidence=${r.confidence_hint}`);
    });
    process.exit(0);
});

