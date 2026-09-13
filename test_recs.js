import db from "./backend/config/database.js";
import { getRecommendedFoodsForUser } from "./backend/models/FoodModel.js";

getRecommendedFoodsForUser(1, { limit: 6, minHistory: 3, excludeCart: true }, (err, results) => {
    if (err) console.error("ERR:", err);
    else console.log("RESULTS LEN:", results.length);
    process.exit();
});
