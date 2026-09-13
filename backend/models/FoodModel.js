// import connection
import db from "../config/database.js";

// get all Foods
export const getFoods = (result) => {
    db.query("SELECT * FROM food", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// get single Foods
export const getFoodById = (id,result) => {
    db.query("SELECT * FROM food WHERE food_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// insert Food
export const insertFood = (data,result) => {
    db.query("INSERT INTO food SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// update Food
export const updateFoodById = (data,id,result) => {
    db.query("UPDATE food SET food_name = ?, food_price = ? WHERE food_id = ?",[data.food_name, data.food_price, id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};


// delete Food
export const deleteFoodById = (id,result) => {
    db.query("DELETE FROM food WHERE food_id = ?",[id], (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

// ─── Chatbot helpers ───────────────────────────────────────────────────────────

// Chatbot: get spicy foods (spice_level is not none/null/empty)
export const getSpicyFoods = (limit = 5, result) => {
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 5, 20));
    db.query(
        `SELECT food_id, food_name, food_price, food_discount, food_src, food_desc, spice_level
         FROM food
         WHERE spice_level IS NOT NULL
           AND spice_level != ''
           AND LOWER(spice_level) NOT IN ('none', 'no spice', 'not spicy')
         LIMIT ?`,
        [safeLimit],
        (err, results) => {
            if (err) { console.log(err); result(err, null); return; }
            result(null, results);
        }
    );
};

// Chatbot: get vegan foods
export const getVeganFoods = (limit = 5, result) => {
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 5, 20));
    db.query(
        `SELECT food_id, food_name, food_price, food_discount, food_src, food_desc
         FROM food
         WHERE is_vegan = 1
         LIMIT ?`,
        [safeLimit],
        (err, results) => {
            if (err) { console.log(err); result(err, null); return; }
            result(null, results);
        }
    );
};

// Chatbot: get a food by name (partial match so "burger" matches "Beef Burger")
export const getFoodByName = (name, result) => {
    db.query(
        `SELECT food_id, food_name, food_price, food_discount, food_src, food_desc,
                food_category, food_type, spice_level, is_vegan, description, cuisine_type
         FROM food
         WHERE LOWER(food_name) LIKE ?
         LIMIT 1`,
        [`%${name.toLowerCase()}%`],
        (err, results) => {
            if (err) { console.log(err); result(err, null); return; }
            result(null, results[0] || null);
        }
    );
};

// Chatbot: get popular foods (sorted by order_count then vote)
export const getPopularFoods = (limit = 5, result) => {
    const safeLimit = Math.max(1, Math.min(parseInt(limit) || 5, 20));
    db.query(
        `SELECT food_id, food_name, food_price, food_discount, food_src, food_desc
         FROM food
         ORDER BY order_count DESC, CAST(food_vote AS UNSIGNED) DESC
         LIMIT ?`,
        [safeLimit],
        (err, results) => {
            if (err) { console.log(err); result(err, null); return; }
            result(null, results);
        }
    );
};

// recommendation list for user (fallbacks to globally popular foods for new users)
export const getRecommendedFoodsForUser = (userId, options, result) => {
    const parsedUserId = Number.parseInt(userId, 10);
    const safeUserId = Number.isNaN(parsedUserId) ? 0 : parsedUserId;

    const parsedLimit = Number.parseInt(options?.limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 6 : Math.max(1, Math.min(parsedLimit, 20));

    const parsedMinHistory = Number.parseInt(options?.minHistory, 10);
    const safeMinHistory = Number.isNaN(parsedMinHistory) ? 3 : Math.max(1, parsedMinHistory);

    const excludeCart = options?.excludeCart === true;

    const userPreferenceQuery = `
        SELECT
            f.food_id,
            f.food_category,
            f.food_type,
            SUM(bd.item_qty) AS qty
        FROM billstatus bs
        JOIN billdetails bd ON bd.bill_id = bs.bill_id
        JOIN food f ON f.food_id = bd.food_id
        WHERE bs.user_id = ? AND bs.bill_status > 0
        GROUP BY f.food_id, f.food_category, f.food_type
    `;

    const foodSignalsQuery = `
        SELECT
            f.food_id,
            f.food_name,
            f.food_star,
            f.food_vote,
            f.food_price,
            f.food_discount,
            f.food_desc,
            f.food_status,
            f.food_type,
            f.food_category,
            f.food_src,
            f.description,
            f.cuisine_type,
            f.category,
            f.meat_type,
            f.is_vegan,
            f.spice_level,
            f.image_url,
            f.rating,
            f.order_count,
            COALESCE(SUM(CASE WHEN bs.bill_status > 0 THEN bd.item_qty ELSE 0 END), 0) AS global_qty
        FROM food f
        LEFT JOIN billdetails bd ON bd.food_id = f.food_id
        LEFT JOIN billstatus bs ON bs.bill_id = bd.bill_id
        GROUP BY
            f.food_id,
            f.food_name,
            f.food_star,
            f.food_vote,
            f.food_price,
            f.food_discount,
            f.food_desc,
            f.food_status,
            f.food_type,
            f.food_category,
            f.food_src,
            f.description,
            f.cuisine_type,
            f.category,
            f.meat_type,
            f.is_vegan,
            f.spice_level,
            f.image_url,
            f.rating,
            f.order_count
    `;

    const sortByPopularity = (foods) => {
        return foods
            .slice()
            .sort((a, b) => {
                const qtyDiff = (Number.parseInt(b.global_qty, 10) || 0) - (Number.parseInt(a.global_qty, 10) || 0);
                if (qtyDiff !== 0) {
                    return qtyDiff;
                }
                return (Number.parseFloat(b.food_vote) || 0) - (Number.parseFloat(a.food_vote) || 0);
            });
    };

    const withDebugFields = (food, score, reason, strategy) => ({
        ...food,
        recommendation_score: Number(score.toFixed(3)),
        recommendation_reason: reason,
        recommendation_strategy: strategy
    });

    const buildPopularList = (foods, excludeIdsSet) => {
        return sortByPopularity(foods)
            .filter((food) => !excludeIdsSet.has(Number.parseInt(food.food_id, 10)))
            .slice(0, safeLimit)
            .map((food) => {
                const popularity = Number.parseInt(food.global_qty, 10) || 0;
                const voteScore = (Number.parseFloat(food.food_vote) || 0) / 1000;
                return withDebugFields(food, popularity + voteScore, "Popular with customers", "popular_fallback");
            });
    };

    const loadCartExclusions = (done) => {
        if (!excludeCart || safeUserId <= 0) {
            done(null, new Set());
            return;
        }

        db.query("SELECT food_id FROM cart WHERE user_id = ?", [safeUserId], (cartErr, cartRows) => {
            if (cartErr) {
                done(cartErr, null);
                return;
            }

            const cartIds = new Set((cartRows || []).map((row) => Number.parseInt(row.food_id, 10)));
            done(null, cartIds);
        });
    };

    db.query(foodSignalsQuery, (foodErr, allFoods) => {
        if (foodErr) {
            console.log(foodErr);
            result(foodErr, null);
            return;
        }

        loadCartExclusions((cartErr, cartExcludedIds) => {
            if (cartErr) {
                console.log(cartErr);
                result(cartErr, null);
                return;
            }

            if (safeUserId <= 0) {
                result(null, buildPopularList(allFoods, cartExcludedIds));
                return;
            }

            db.query(userPreferenceQuery, [safeUserId], (prefErr, userRows) => {
                if (prefErr) {
                    console.log(prefErr);
                    result(prefErr, null);
                    return;
                }

                if (!userRows.length) {
                    result(null, buildPopularList(allFoods, cartExcludedIds));
                    return;
                }

                const purchasedFoodIds = new Set();
                const categoryPreference = {};
                const typePreference = {};
                let totalHistoryQty = 0;

                userRows.forEach((row) => {
                    purchasedFoodIds.add(Number.parseInt(row.food_id, 10));

                    const rowQty = Number.parseInt(row.qty, 10) || 0;
                    totalHistoryQty += rowQty;
                    categoryPreference[row.food_category] = (categoryPreference[row.food_category] || 0) + rowQty;
                    typePreference[row.food_type] = (typePreference[row.food_type] || 0) + rowQty;
                });

                const historyIsLow = totalHistoryQty < safeMinHistory;

                const excludedIds = new Set(cartExcludedIds);

                const candidates = allFoods
                    .filter((food) => !excludedIds.has(Number.parseInt(food.food_id, 10)))
                    .map((food) => {
                        const popularity = Number.parseInt(food.global_qty, 10) || 0;
                        const categoryScore = categoryPreference[food.food_category] || 0;
                        const typeScore = typePreference[food.food_type] || 0;
                        const personalizedScore = (categoryScore * 3) + (typeScore * 2);
                        const voteScore = (Number.parseFloat(food.food_vote) || 0) / 1000;

                        const score = historyIsLow
                            ? (popularity * 0.75) + (personalizedScore * 0.25) + voteScore
                            : popularity + personalizedScore + voteScore;

                        let reason = "Popular with customers";
                        if (categoryScore > 0 && typeScore > 0) {
                            reason = `Because you like ${food.food_category} (${food.food_type})`;
                        } else if (categoryScore > 0) {
                            reason = `Because you order ${food.food_category}`;
                        } else if (typeScore > 0) {
                            reason = `Because you prefer ${food.food_type} options`;
                        }

                        const strategy = historyIsLow ? "blended_low_history" : "history_plus_popularity";
                        return withDebugFields(food, score, reason, strategy);
                    })
                    .sort((a, b) => {
                        if (b.recommendation_score !== a.recommendation_score) {
                            return b.recommendation_score - a.recommendation_score;
                        }
                        return (Number.parseFloat(b.food_vote) || 0) - (Number.parseFloat(a.food_vote) || 0);
                    });

                const picked = candidates.slice(0, safeLimit);

                if (picked.length < safeLimit) {
                    const seen = new Set(picked.map((f) => Number.parseInt(f.food_id, 10)));
                    const fallbackFoods = sortByPopularity(allFoods)
                        .filter((food) => {
                            const foodId = Number.parseInt(food.food_id, 10);
                            return !seen.has(foodId) && !excludedIds.has(foodId);
                        })
                        .slice(0, safeLimit - picked.length)
                        .map((food) => {
                            const popularity = Number.parseInt(food.global_qty, 10) || 0;
                            const voteScore = (Number.parseFloat(food.food_vote) || 0) / 1000;
                            return withDebugFields(food, popularity + voteScore, "Popular with customers", "popular_fill");
                        });

                    result(null, [...picked, ...fallbackFoods]);
                    return;
                }

                result(null, picked);
            });
        });
    });
};

// quick offline evaluation for one user using a simple holdout split
export const evaluateRecommendationsForUser = (userId, options, result) => {
    const parsedUserId = Number.parseInt(userId, 10);
    const safeUserId = Number.isNaN(parsedUserId) ? 0 : parsedUserId;

    if (safeUserId <= 0) {
        result(null, {
            user_id: safeUserId,
            message: "Invalid user id for evaluation"
        });
        return;
    }

    const parsedLimit = Number.parseInt(options?.limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 6 : Math.max(1, Math.min(parsedLimit, 20));

    const userHistoryQuery = `
        SELECT
            bd.food_id,
            f.food_category,
            f.food_type,
            SUM(bd.item_qty) AS qty,
            MAX(bs.bill_id) AS last_bill_id
        FROM billstatus bs
        JOIN billdetails bd ON bd.bill_id = bs.bill_id
        JOIN food f ON f.food_id = bd.food_id
        WHERE bs.user_id = ? AND bs.bill_status > 0
        GROUP BY bd.food_id, f.food_category, f.food_type
    `;

    const foodSignalsQuery = `
        SELECT
            f.food_id,
            f.food_name,
            f.food_star,
            f.food_vote,
            f.food_price,
            f.food_discount,
            f.food_desc,
            f.food_status,
            f.food_type,
            f.food_category,
            f.food_src,
            f.description,
            f.cuisine_type,
            f.category,
            f.meat_type,
            f.is_vegan,
            f.spice_level,
            f.image_url,
            f.rating,
            f.order_count,
            COALESCE(SUM(CASE WHEN bs.bill_status > 0 THEN bd.item_qty ELSE 0 END), 0) AS global_qty
        FROM food f
        LEFT JOIN billdetails bd ON bd.food_id = f.food_id
        LEFT JOIN billstatus bs ON bs.bill_id = bd.bill_id
        GROUP BY
            f.food_id,
            f.food_name,
            f.food_star,
            f.food_vote,
            f.food_price,
            f.food_discount,
            f.food_desc,
            f.food_status,
            f.food_type,
            f.food_category,
            f.food_src,
            f.description,
            f.cuisine_type,
            f.category,
            f.meat_type,
            f.is_vegan,
            f.spice_level,
            f.image_url,
            f.rating,
            f.order_count
    `;

    db.query(userHistoryQuery, [safeUserId], (historyErr, historyRows) => {
        if (historyErr) {
            console.log(historyErr);
            result(historyErr, null);
            return;
        }

        if (!historyRows.length || historyRows.length < 3) {
            result(null, {
                user_id: safeUserId,
                limit: safeLimit,
                message: "Not enough order history to evaluate (need at least 3 unique items)",
                unique_history_items: historyRows.length
            });
            return;
        }

        // oldest -> newest by latest bill each item appeared in
        const sortedHistory = historyRows
            .slice()
            .sort((a, b) => (Number.parseInt(a.last_bill_id, 10) || 0) - (Number.parseInt(b.last_bill_id, 10) || 0));

        const holdoutCount = Math.max(1, Math.ceil(sortedHistory.length * 0.2));
        const trainRows = sortedHistory.slice(0, sortedHistory.length - holdoutCount);
        const holdoutRows = sortedHistory.slice(sortedHistory.length - holdoutCount);

        const trainFoodIds = new Set(trainRows.map((row) => Number.parseInt(row.food_id, 10)));
        const holdoutFoodIds = new Set(holdoutRows.map((row) => Number.parseInt(row.food_id, 10)));

        const categoryPreference = {};
        const typePreference = {};
        trainRows.forEach((row) => {
            const qty = Number.parseInt(row.qty, 10) || 0;
            categoryPreference[row.food_category] = (categoryPreference[row.food_category] || 0) + qty;
            typePreference[row.food_type] = (typePreference[row.food_type] || 0) + qty;
        });

        db.query(foodSignalsQuery, (foodErr, allFoods) => {
            if (foodErr) {
                console.log(foodErr);
                result(foodErr, null);
                return;
            }

            const candidates = allFoods
                .filter((food) => !trainFoodIds.has(Number.parseInt(food.food_id, 10)))
                .map((food) => {
                    const popularity = Number.parseInt(food.global_qty, 10) || 0;
                    const categoryScore = categoryPreference[food.food_category] || 0;
                    const typeScore = typePreference[food.food_type] || 0;
                    const voteScore = (Number.parseFloat(food.food_vote) || 0) / 1000;
                    const score = popularity + (categoryScore * 3) + (typeScore * 2) + voteScore;

                    return {
                        ...food,
                        recommendation_score: Number(score.toFixed(3))
                    };
                })
                .sort((a, b) => b.recommendation_score - a.recommendation_score)
                .slice(0, safeLimit);

            const predictedIds = candidates.map((food) => Number.parseInt(food.food_id, 10));
            const hits = predictedIds.filter((id) => holdoutFoodIds.has(id)).length;

            const precisionAtK = hits / safeLimit;
            const recallAtK = hits / holdoutFoodIds.size;

            result(null, {
                user_id: safeUserId,
                limit: safeLimit,
                metric: "precision_recall_at_k",
                precision_at_k: Number(precisionAtK.toFixed(4)),
                recall_at_k: Number(recallAtK.toFixed(4)),
                hits,
                holdout_count: holdoutFoodIds.size,
                train_count: trainFoodIds.size,
                predicted_food_ids: predictedIds,
                holdout_food_ids: Array.from(holdoutFoodIds)
            });
        });
    });
};

// "Users also bought" — items frequently ordered in the same bill as the target food
export const getUsersAlsoBought = (foodId, limit, result) => {
    const parsedFoodId = Number.parseInt(foodId, 10);
    const safeLimit = Number.isNaN(Number.parseInt(limit, 10))
        ? 5
        : Math.max(1, Math.min(Number.parseInt(limit, 10), 20));

    if (Number.isNaN(parsedFoodId) || parsedFoodId <= 0) {
        result(null, []);
        return;
    }

    const query = `
        SELECT
            f.food_id,
            f.food_name,
            f.food_price,
            f.food_discount,
            f.food_star,
            f.food_vote,
            f.food_desc,
            f.food_src,
            f.food_status,
            f.food_type,
            f.food_category,
            f.image_url,
            f.rating,
            COUNT(*) AS co_purchase_count
        FROM billdetails target
        JOIN billstatus bs ON bs.bill_id = target.bill_id
        JOIN billdetails other
            ON other.bill_id = target.bill_id
            AND other.food_id != target.food_id
        JOIN food f ON f.food_id = other.food_id
        WHERE target.food_id = ?
            AND bs.bill_status > 0
        GROUP BY
            f.food_id, f.food_name, f.food_price, f.food_discount,
            f.food_star, f.food_vote, f.food_desc, f.food_src,
            f.food_status, f.food_type, f.food_category, f.image_url, f.rating
        ORDER BY co_purchase_count DESC
        LIMIT ?
    `;

    db.query(query, [parsedFoodId, safeLimit], (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
            return;
        }
        result(null, results);
    });
};

// Get all ingredients for a specific food item
export const getIngredientsByFoodId = (foodId, result) => {
    const parsedFoodId = Number.parseInt(foodId, 10);
    if (Number.isNaN(parsedFoodId) || parsedFoodId <= 0) {
        result(null, []);
        return;
    }

    const query = `
        SELECT ingredient_name
        FROM food_ingredients
        WHERE food_id = ?
        ORDER BY ingredient_name ASC
    `;

    db.query(query, [parsedFoodId], (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
            return;
        }
        result(null, results);
    });
};

// Get foods that contain a specific ingredient (case-insensitive partial match)
export const getFoodsByIngredient = (ingredientName, result) => {
    if (!ingredientName || typeof ingredientName !== 'string' || !ingredientName.trim()) {
        result(null, []);
        return;
    }

    const query = `
        SELECT DISTINCT
            f.food_id,
            f.food_name,
            f.food_price,
            f.food_discount,
            f.food_star,
            f.food_vote,
            f.food_desc,
            f.food_src,
            f.food_status,
            f.food_type,
            f.food_category,
            f.image_url,
            f.rating,
            f.spice_level,
            f.cuisine_type
        FROM food f
        JOIN food_ingredients fi ON f.food_id = fi.food_id
        WHERE LOWER(fi.ingredient_name) LIKE LOWER(?)
    `;

    const cleanedTerm = ingredientName.trim();
    const pattern = cleanedTerm.startsWith('%') || cleanedTerm.endsWith('%')
        ? cleanedTerm
        : `%${cleanedTerm}%`;

    db.query(query, [pattern], (err, results) => {
        if (err) {
            console.log(err);
            result(err, null);
            return;
        }
        result(null, results);
    });
};

