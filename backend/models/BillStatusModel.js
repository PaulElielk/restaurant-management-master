/**
 * BillStatusModel.js
 * 
 * Order lifecycle state management and AI demand forecasting:
 * - Order statuses: 0 (Cancelled), 1 (Pending), 2 (Cooking), 3 (Delivering), 4 (Completed)
 * - Moving-average sales velocity demand forecasting with confidence intervals
 */

// import connection
import db from "../config/database.js";

// get newest Bill Status
export const getNewestId = (result) => {
    db.query("SELECT bill_id FROM billstatus ORDER BY bill_id DESC LIMIT 0, 1", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }
        else{
            result(null,results[0]);
        }
    });
};

// insert Bill Status
export const insertBillStatus = (data,result) => {
    db.query("INSERT INTO billstatus SET ?",data, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results[0]);
        }
    });
};

// get all Bills Status
export const getBillsByUser = (id,result) => {
    db.query("SELECT * FROM billstatus WHERE user_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }
        else{
            result(null,results);
        }
    });
};


// get all Bills Status
export const getBillsByBill = (id,result) => {
    db.query("SELECT * FROM billstatus WHERE bill_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }
        else{
            result(null,results);
        }
    });
};

// get all Bills Status
export const getAll = (result) => {
    db.query("SELECT * FROM billstatus", (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }
        else{
            result(null,results);
        }
    });
};


export const updateStatus = (id,result) => {
    db.query("UPDATE billstatus SET bill_status = bill_status + 1  WHERE bill_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const updatePaid = (id,result) => {
    db.query("UPDATE billstatus SET bill_paid = 'true' WHERE bill_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
};

export const cancelStatus = (id,result) => {
    db.query("UPDATE billstatus SET bill_status = 0  WHERE bill_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }else{
            result(null,results);
        }
    });
    db.query("UPDATE billstatus SET bill_paid = 'false' WHERE bill_id = ?",id, (err,results)=> {
        if (err){
            console.log(err);
            result(err,null);
        }
    });
};

/**
 * Generates demand forecasts using moving-average daily order velocity.
 * 
 * Metrics:
 * - Velocity = total_qty / lookbackDays
 * - Forecast = Velocity * forecastDays
 * - Confidence = High (activeDays/lookback >= 0.5), Medium (>= 0.2), Low (< 0.2)
 */
export const getDemandForecast = (lookbackDays, forecastDays, result) => {
    const safeLookback = Number.isNaN(Number.parseInt(lookbackDays, 10))
        ? 30
        : Math.max(7, Math.min(Number.parseInt(lookbackDays, 10), 180));
    const safeForecast = Number.isNaN(Number.parseInt(forecastDays, 10))
        ? 7
        : Math.max(1, Math.min(Number.parseInt(forecastDays, 10), 30));

    const query = `
        SELECT
            f.food_id,
            f.food_name,
            f.food_category,
            f.food_type,
            f.food_src,
            COALESCE(SUM(CASE WHEN bs.bill_id IS NOT NULL THEN bd.item_qty ELSE 0 END), 0) AS total_qty,
            COUNT(DISTINCT DATE(STR_TO_DATE(bs.bill_when, '%Y-%m-%dT%H:%i'))) AS active_days
        FROM food f
        LEFT JOIN billdetails bd ON bd.food_id = f.food_id
        LEFT JOIN billstatus bs ON bs.bill_id = bd.bill_id
            AND bs.bill_status > 0
            AND STR_TO_DATE(bs.bill_when, '%Y-%m-%dT%H:%i') >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY
            f.food_id,
            f.food_name,
            f.food_category,
            f.food_type,
            f.food_src
    `;

    db.query(query, [safeLookback], (err, rows) => {
        if (err) {
            console.log(err);
            result(err, null);
            return;
        }

        const forecast = rows
            .map((row) => {
                const totalQty = Number.parseInt(row.total_qty, 10) || 0;
                const activeDays = Number.parseInt(row.active_days, 10) || 0;
                const predictedDailyQty = totalQty / safeLookback;
                const predictedPeriodQty = predictedDailyQty * safeForecast;
                const activityRatio = activeDays / safeLookback;

                return {
                    ...row,
                    lookback_days: safeLookback,
                    forecast_days: safeForecast,
                    predicted_daily_qty: Number(predictedDailyQty.toFixed(2)),
                    predicted_period_qty: Number(predictedPeriodQty.toFixed(2)),
                    model: "moving_average_velocity",
                    confidence_hint: activityRatio >= 0.5 ? "high" : (activityRatio >= 0.2 ? "medium" : "low")
                };
            })
            .sort((a, b) => b.predicted_period_qty - a.predicted_period_qty);

        result(null, forecast);
    });
};

// get full order history with items for a specific user
export const getOrderHistoryByUser = (userId, result) => {
    const query = `
        SELECT 
            bs.bill_id,
            bs.bill_when,
            bs.bill_total,
            bs.bill_status,
            bs.bill_paid,
            bd.food_id,
            bd.item_qty,
            f.food_name,
            f.food_price,
            f.food_discount,
            f.food_src
        FROM billstatus bs
        LEFT JOIN billdetails bd ON bd.bill_id = bs.bill_id
        LEFT JOIN food f ON f.food_id = bd.food_id
        WHERE bs.user_id = ?
        ORDER BY bs.bill_id DESC
    `;
    db.query(query, [userId], (err, rows) => {
        if (err) {
            console.log(err);
            result(err, null);
            return;
        }

        const orderMap = new Map();
        (rows || []).forEach((row) => {
            if (!orderMap.has(row.bill_id)) {
                orderMap.set(row.bill_id, {
                    bill_id: row.bill_id,
                    bill_when: row.bill_when,
                    bill_total: row.bill_total,
                    bill_status: row.bill_status,
                    bill_paid: row.bill_paid,
                    items: []
                });
            }
            if (row.food_id && row.food_name) {
                const rawPrice = parseFloat(row.food_price) || 0;
                const discount = parseFloat(row.food_discount) || 0;
                orderMap.get(row.bill_id).items.push({
                    food_id: row.food_id,
                    food_name: row.food_name,
                    item_qty: row.item_qty || 1,
                    food_price: rawPrice,
                    unit_price: Math.max(0, rawPrice - discount),
                    food_src: row.food_src
                });
            }
        });

        result(null, Array.from(orderMap.values()));
    });
};
