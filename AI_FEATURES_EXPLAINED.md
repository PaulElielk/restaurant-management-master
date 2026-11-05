# Comprehensive Guide to the AI Features

This document is designed to help you prepare for your jury presentation. It explains the **concept**, **logic**, and **actual code implementation** for the three Artificial Intelligence (AI) and data-driven features in your project:

1. **Personalized Recommendation Engine & Cross-Selling**
2. **Natural Language Processing (NLP) Chatbot**
3. **Demand Forecasting (Time Series Analysis)**

---

## 1. Personalized Recommendation Engine

### A. The Concept
The goal of the recommendation engine is to suggest dishes a customer is likely to order, rather than just showing them a static menu. Because the capstone required a fully functional system without massive amounts of real-world historical data to train a neural network, we used an **Algorithmic Hybrid Recommender**.

This hybrid model combines:
- **Content-Based Filtering**: What categories (e.g., main course, dessert), cuisines (e.g., Ivorian, Mexican), and food types (e.g., meat, vegan) does the user order most?
- **Global Popularity**: What are the most ordered items across the entire restaurant?
- **User Ratings**: How many stars has the food received?

If a user is new (**Cold Start Problem**), the system gracefully falls back to recommending the globally most popular items.

### B. The Code Implementation (`backend/models/FoodModel.js`)

**Function:** `getRecommendedFoodsForUser(userId, options, result)`

1. **Fetching History:** 
   The code first runs an SQL query to retrieve every past completed order for the user (`bs.bill_status > 0`).
2. **Building the Preference Profile:**
   It iterates over the user's history and counts quantities to build dictionaries (Hash Maps) of their preferences:
   ```javascript
   trainRows.forEach((row) => {
       const qty = Number.parseInt(row.qty, 10) || 0;
       cuisinePreference[row.cuisine_type] = (cuisinePreference[row.cuisine_type] || 0) + qty;
       categoryPreference[row.category] = (categoryPreference[row.category] || 0) + qty;
       typePreference[row.food_type] = (typePreference[row.food_type] || 0) + qty;
   });
   ```
3. **Scoring the Candidates:**
   The algorithm grabs all available menu items and scores them using the formulated heuristic equation:
   `PersonalizedScore = (50 × W_cuisine) + (25 × W_category) + (10 × W_type)`
   ```javascript
   const cuisineScore = cuisinePreference[food.cuisine_type] ? cuisinePreference[food.cuisine_type] : 0;
   const catScore = Math.max(categoryPreference[food.food_category] || 0, categoryPreference[food.category] || 0);
   const typeScore = typePreference[food.food_type] ? typePreference[food.food_type] : 0;
   
   const personalizedScore = (cuisineScore * 50) + (catScore * 25) + (typeScore * 10);
   const score = (normPop * 0.25) + personalizedScore + voteScore;
   ```
4. **Sorting:** The foods are sorted by the highest `score` and returned to the frontend.

---

## 1.5 Cross-Selling ("Customers Also Bought")

### A. The Concept (Market Basket Analysis)
When a user views a specific item (e.g., Garba), the system suggests items frequently bought in the exact same transaction (e.g., a cold drink). 

### B. The Code Implementation (`backend/models/FoodModel.js`)

**Function:** `getUsersAlsoBought(foodId, limit, result)`

The magic here happens entirely inside a highly optimized SQL query using `JOINs`.
```sql
SELECT f.food_id, f.food_name, COUNT(*) AS co_purchase_count
FROM billdetails target
JOIN billstatus bs ON bs.bill_id = target.bill_id
JOIN billdetails other ON other.bill_id = target.bill_id AND other.food_id != target.food_id
JOIN food f ON f.food_id = other.food_id
WHERE target.food_id = ? AND bs.bill_status > 0
GROUP BY f.food_id, f.food_name
ORDER BY co_purchase_count DESC
```
**Explanation for Jury:** 
We find the `target` item (Garba) in the `billdetails` table. We look up its overarching `bill_id`. Then, we join the `billdetails` table *to itself* (`other`) using that same `bill_id`, excluding the original item. Finally, we group the results and count how many times each `other` item appeared.

---

## 2. Natural Language Processing (NLP) Chatbot

### A. The Concept
Instead of relying on an expensive, slow, and uncontrollable third-party LLM (like ChatGPT), this project implements a **Supervised Intent Classifier** using `node-nlp`. 
The chatbot takes raw user text, analyzes the language, and classifies it into a predefined "Intent" (e.g., `restaurant.recommend_vegan`, `restaurant.check_dish_ingredient`). It then queries the database based on that intent.

### B. The Code Implementation (`backend/models/ChatbotService.js`)

1. **Training the Model (The Textbook):**
   The code maintains an array of training data (225 training pairs). Each pair links a human phrase to an intent label.
   ```javascript
   const trainingDocuments = [
       ['what ingredients are in burrito', 'restaurant.check_dish_ingredient'],
       ['show me pork or beef dishes', 'restaurant.recommend_meat'],
       // ... 200+ more
   ];
   ```
2. **Building the Brain:**
   When the server starts, the `NlpManager` ingests this array and builds a mathematical model (tokenization, stemming, neural network).
   ```javascript
   await manager.train();
   ```
3. **Processing Messages:**
   When a user sends a message, the NLP manager evaluates it against its training.
   ```javascript
   const response = await manager.process('en', message.toLowerCase());
   // response.intent will equal the winning category.
   // response.score will equal the confidence level (e.g., 0.95).
   ```
4. **Action Layer:**
   A `switch (response.intent)` statement routes the winning intent to specific database queries (e.g., calling `getVeganFoods()` or `getFoodsByIngredient()`).

---

## 3. Demand Forecasting (Time Series Analysis)

### A. The Concept
Restaurant managers need to know how many ingredients to buy. Demand forecasting uses sequential, chronological sales history to predict future demand. We implement a **Time Series Analysis** algorithm (specifically using a **Moving-Average Sales Velocity** approach) because it evaluates chronological order sequences, runs deterministically in $O(N)$ time directly from MySQL, and provides transparent signals for operational inventory planning.

### B. The Code Implementation (`backend/models/BillStatusModel.js`)

**Function:** `getDemandForecast(lookbackDays, forecastDays, result)`


1. **The SQL Aggregation (Data Gathering):**
   The database does the heavy lifting. It examines all completed orders over a sequential lookback window ($W = 30$ days) and calculates:
   - `total_qty`: Total units of the item sold over the window.
   - `active_days`: The number of unique calendar dates the item was ordered.
2. **The Mathematics (Time Series Formulation):**
   The Time Series algorithm computes the sequential daily sales velocity over the 30-day window, then projects expected demand across a weekly operational replenishment horizon ($H = 7$ days).
   ```javascript
   // Daily Sales Velocity (V_daily) = (1 / W) * sum(Qty_t)
   const velocity = totalQty / lookbackDays;
   
   // 7-Day Demand Forecast (Y_7d) = V_daily * H
   const predictedPeriodQty = velocity * forecastDays;
   ```
3. **The Confidence Indicator (Activity Regularity Ratio):**
   A time series prediction is only as reliable as the consistency of its underlying observations. If a restaurant sells 30 burgers, but they were all ordered on a single day for a private party, projecting 1 burger/day across the next week is risky. 
   To address this, the algorithm calculates an **Activity Regularity Ratio ($AR$)**:
   ```javascript
   const activityRatio = activeDays / lookbackDays; // Range: [0, 1]
   ```
   - **High Confidence:** `activityRatio >= 0.5` (Sold on $\ge 50\%$ of days, highly regular time series).
   - **Medium Confidence:** `activityRatio >= 0.2` (Sold on $\ge 20\%$ of days, moderate regularity).
   - **Low Confidence:** `activityRatio < 0.2` (Sold rarely, erratic time series).

---

### Tips for Answering Jury Questions:
* **"What algorithm did you use for Demand Forecasting?"**
  * *Answer:* It is a **Time Series Analysis** algorithm. Specifically, it uses a deterministic moving-average sales velocity formulation over a 30-day chronological rolling window, coupled with an activity regularity ratio to determine confidence levels.
* **"Why didn't you use Deep Learning or Matrix Factorization for the Recommender?"**
  * *Answer:* Deep learning requires massive amounts of real, dense historical user data to train weights effectively without overfitting. Since this is a new system (Cold Start), a transparent Algorithmic Hybrid approach was the most robust and explainable choice.
* **"Why didn't you use OpenAI's API for the Chatbot?"**
  * *Answer:* Relying on third-party generative APIs introduces latency, API costs, hallucinations (the AI inventing dishes that don't exist), and dependency issues. By using `node-nlp`, the classification happens locally and the responses are completely controlled by the actual database, guaranteeing 100% accurate menu information.
* **"How does the forecasting model handle seasonality?"**
  * *Answer:* It is a baseline Time Series Analysis algorithm based on a rolling moving-average window. It adapts to recent demand shifts over a 30-day window, but does not model multi-year seasonality or holiday spikes. Advanced time series models like ARIMA or Prophet could be layered on once the restaurant amasses multi-year longitudinal datasets.
