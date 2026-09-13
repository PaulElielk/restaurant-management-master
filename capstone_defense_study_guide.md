# Capstone Defense Study Guide

Project title:

**Design and Implementation of an AI-Enhanced Restaurant Management System with Personalized Recommendations, Natural Language Processing, and Demand Forecasting**

This guide is meant to prepare you for the oral defense. It explains the project as a full restaurant management platform first, then explains how the AI features improve specific workflows.

---

## 1. Core Project Explanation

The project is a full-stack restaurant management system. It allows customers to browse food, add items to a cart, checkout, reserve tables, track orders, and interact with a chatbot. It also allows administrators to manage orders, update delivery/payment status, and view demand forecasts.

The AI features are not separate from the website. They are integrated into real restaurant workflows:

- The recommendation system helps customers choose food.
- The NLP chatbot helps customers ask natural questions about the menu.
- The demand forecasting module helps administrators plan future demand.

Strong defense answer:

> This project is not only an AI demo. It is a complete restaurant management website where AI supports customer decision-making and restaurant operations.

---

## 2. Main Technologies Used

### Frontend

The frontend is built with:

- **Vue.js 3** for the user interface.
- **Vue Router** for page navigation.
- **Vuex** for shared state management.
- **Axios** for HTTP requests to the backend.
- **CSS and responsive layout styles** for the website interface.

The frontend includes pages such as:

- Home
- About
- Promotions
- Menu
- Table booking
- Cart
- Checkout
- Thank-you page
- My orders
- Admin login
- Admin dashboard

### Backend

The backend is built with:

- **Node.js** as the runtime.
- **Express.js** for REST API routing.
- **mysql2** for MySQL database access.
- **cors** for cross-origin communication.
- **body-parser** for request body parsing.
- **node-nlp** for chatbot intent classification.

### Database

The database is MySQL. The main database is:

```text
db_restaurant_v2
```

---

## 3. High-Level Architecture

The project follows a three-tier architecture:

```text
Vue.js Frontend
        ↓ Axios HTTP requests
Node.js / Express REST API
        ↓ SQL queries through mysql2
MySQL Database
```

The AI logic sits mostly in the backend service/model layer:

- Recommendation logic: `FoodModel.js`
- Chatbot/NLP logic: `ChatbotService.js`
- Demand forecasting logic: `BillStatusModel.js`

Strong defense answer:

> The frontend is responsible for interaction and display. The backend exposes REST APIs and handles business logic. The database stores users, food items, carts, orders, reservations, and order history. The AI modules use the same database records to produce recommendations, chatbot responses, and forecasts.

---

## 4. Project Folder Structure

### Frontend Structure

Important frontend folders:

```text
frontend/src/pages
frontend/src/components
frontend/src/admin
frontend/src/router
frontend/src/store
frontend/src/axios.js
```

Meaning:

- `pages`: main customer pages.
- `components`: reusable UI components.
- `admin`: admin login and dashboard.
- `router`: website routes.
- `store`: Vuex shared state.
- `axios.js`: backend API base URL.

Important frontend components:

- `Chatbot.vue`: chatbot UI and message handling.
- `QuickView.vue`: food details and add-to-cart action.
- `AlsoBought.vue`: co-purchase recommendations.
- `OrderDetails.vue`: order detail display.
- `NavBar.vue`: navigation.
- `FooterComponent.vue`: footer.

### Backend Structure

Important backend folders:

```text
backend/index.js
backend/routes/routes.js
backend/controllers
backend/models
backend/config/database.js
backend/sql
```

Meaning:

- `index.js`: starts the Express server.
- `routes.js`: defines REST API endpoints.
- `controllers`: receive requests and send responses.
- `models`: database queries and business logic.
- `database.js`: MySQL connection.
- `sql`: seed and migration scripts.

Strong defense answer:

> The backend separates routing, controllers, and models. Routes define endpoints, controllers handle HTTP request/response logic, and models communicate with the database or implement business logic.

---

## 5. Database Structure

### `food`

Stores menu items.

Important columns:

- `food_id`: unique food identifier.
- `food_name`: food name.
- `food_star`: rating.
- `food_vote`: popularity/vote count.
- `food_price`: original price.
- `food_discount`: discount amount.
- `food_desc`: short description.
- `food_status`: best seller, normal, new dishes, seasonal, online only.
- `food_type`: meat or vegan.
- `food_category`: taco, burrito, nachos, sides, dessert, drink.
- `food_src`: image path.
- `description`: extended description.
- `cuisine_type`: cuisine metadata.
- `category`: normalized category field.
- `meat_type`: meat metadata.
- `is_vegan`: vegan flag.
- `spice_level`: spice metadata.
- `image_url`: image path/URL.
- `rating`: numeric rating.
- `order_count`: popularity count.

### `user`

Stores customer accounts.

Columns:

- `user_id`
- `user_name`
- `user_email`
- `user_phone`
- `user_password`
- `user_birth`
- `user_gender`

### `cart`

Stores temporary cart items.

Columns:

- `user_id`
- `food_id`
- `item_qty`

Primary key:

```text
(user_id, food_id)
```

This means one user cannot have duplicate rows for the same food. If they add the same food again, the quantity is updated.

### `booktable`

Stores table reservations.

Columns:

- `book_id`
- `book_name`
- `book_phone`
- `book_people`
- `book_tables`
- `user_id`
- `book_when`
- `book_note`

### `billstatus`

Stores the order header.

Columns:

- `bill_id`
- `user_id`
- `bill_phone`
- `bill_address`
- `bill_when`
- `bill_method`
- `bill_discount`
- `bill_delivery`
- `bill_total`
- `bill_paid`
- `bill_status`

### `billdetails`

Stores order line items.

Columns:

- `bill_id`
- `food_id`
- `item_qty`

Primary key:

```text
(bill_id, food_id)
```

### AI Metadata Tables

The project also includes:

- `food_ingredients`
- `food_tags`
- `food_allergens`

These support richer food metadata and can improve future chatbot/recommendation features.

---

## 6. Customer Workflow

The customer workflow is:

```text
Home/Menu
   ↓
Food quick view
   ↓
Add to cart
   ↓
Cart update
   ↓
Checkout
   ↓
Create billstatus + billdetails
   ↓
Clear cart
   ↓
Track order
```

Detailed explanation:

1. Customer browses menu items from the `food` table.
2. Customer opens a food quick view.
3. Customer adds the item to cart.
4. The frontend checks whether the item already exists in the cart.
5. If it exists, the quantity is updated.
6. If it does not exist, a new cart row is inserted.
7. At checkout, the system calculates discount, delivery, and total.
8. The system creates a row in `billstatus`.
9. The system creates rows in `billdetails`.
10. The cart is cleared.
11. The customer can track the order from `MyOrder`.

Strong defense answer:

> The system separates cart data from completed order data. Cart represents temporary intention to purchase, while billstatus and billdetails represent confirmed orders.

---

## 7. Checkout Workflow

Checkout creates two types of records:

### `billstatus`

This is the order summary/header:

- who ordered,
- address,
- phone,
- payment method,
- total,
- paid status,
- current order status.

### `billdetails`

This stores the foods inside the order:

- bill id,
- food id,
- quantity.

Why this design is good:

- One order can contain many foods.
- The admin can manage one order using `billstatus`.
- The system can analyze food-level purchases using `billdetails`.
- Recommendation and forecasting can use completed order history.

---

## 8. Admin Workflow

The admin workflow is:

```text
Admin login
   ↓
Dashboard
   ↓
View active orders
   ↓
Update order status
   ↓
Mark payment / cancel if needed
   ↓
Use forecast table for planning
```

Order status values:

```text
0 = cancel
1 = confirmed
2 = preparing
3 = checking
4 = delivering
5 = delivered
6 = completed
```

Admin API calls:

```text
GET /api/billstatus
PUT /api/billstatus/:id
PUT /api/billstatus/paid/:id
PUT /api/billstatus/cancel/:id
GET /api/billstatus/forecast?days=7&lookback=30
```

Strong defense answer:

> The admin dashboard models a real restaurant order pipeline. The admin can move each order from confirmation to preparation, checking, delivery, delivered, and completed.

---

## 9. REST API Endpoints

### Food

```text
GET    /api/foods
GET    /api/foods/:id
POST   /api/foods
PUT    /api/foods/:id
DELETE /api/foods/:id
```

### Recommendation

```text
GET /api/recommendations/:id
GET /api/recommendations/:id/evaluate
```

Useful demo calls:

```text
GET /api/recommendations/1?limit=10&minHistory=1
GET /api/recommendations/1293?limit=10&minHistory=1
```

### Also Bought

```text
GET /api/foods/:id/also-bought?limit=5
```

### User

```text
GET  /api/users/:email
POST /api/users
```

### Cart

```text
POST   /api/cartItem
GET    /api/cartItem/:user_id/:food_id
GET    /api/cartItem/:id
PUT    /api/cartItem
DELETE /api/cartItem/:user_id/:food_id
DELETE /api/cartItem/:id
```

### Booking

```text
POST /api/booking
```

### Bill Details

```text
POST /api/billdetails
GET  /api/billdetails/:id
```

### Bill Status

```text
GET  /api/billstatus/new
POST /api/billstatus
GET  /api/billstatus/user/:id
GET  /api/billstatus/bill/:id
GET  /api/billstatus
GET  /api/billstatus/forecast
PUT  /api/billstatus/:id
PUT  /api/billstatus/paid/:id
PUT  /api/billstatus/cancel/:id
```

### Chatbot

```text
POST /api/chatbot/message
```

---

## 10. Recommendation System

### What It Does

The recommendation system returns food suggestions personalized to the user.

It uses:

- completed order history,
- food categories,
- food types,
- global popularity,
- votes/ratings,
- optional cart exclusion.

### Why It Is Hybrid

It is not purely collaborative filtering.

It combines:

- **Behavioral data**: what the user ordered before.
- **Content information**: food category and food type.
- **Popularity signal**: globally popular items.

Strong answer:

> The recommender is a practical hybrid approach. It combines user history, item metadata, and popularity, which is suitable for a capstone project and a limited dataset.

### Recommendation Inputs

From `billstatus`:

- user id,
- order completion/status.

From `billdetails`:

- food id,
- quantity.

From `food`:

- category,
- type,
- votes,
- price,
- image,
- popularity.

### Recommendation Scoring

The system builds:

- `categoryPreference`
- `typePreference`
- `totalHistoryQty`

Conceptual formula:

```text
personalizedScore = categoryScore × 3 + typeScore × 2
voteScore = food_vote / 1000
```

For users with enough history:

```text
score = popularity + personalizedScore + voteScore
```

For users with low history:

```text
score = popularity × 0.75 + personalizedScore × 0.25 + voteScore
```

### Cold Start Handling

If a user has no order history, the system falls back to popular items.

Strong answer:

> For new users, the system cannot infer personal taste yet, so it uses globally popular foods as a cold-start fallback.

### Why Two Users May Share Recommendations

Some products may appear for many users because popularity contributes to the score.

Defense answer:

> Overlap is normal because popular items influence the ranking. Personalization appears in the order, score, and recommendation reason.

### Returned Fields

Recommendations include:

- food information,
- `recommendation_score`,
- `recommendation_reason`,
- `recommendation_strategy`.

Example reasons:

- “Popular with customers”
- “Because you order taco”
- “Because you like dessert (vegan)”

---

## 11. Recommendation Evaluation

### Metrics

The system uses:

- Precision@K
- Recall@K

### Precision@K

```text
Precision@K = relevant recommended items / K
```

Meaning:

> Of the items recommended, how many were actually relevant?

### Recall@K

```text
Recall@K = relevant recommended items / total relevant held-out items
```

Meaning:

> Of the relevant items the user actually liked, how many did the recommender recover?

### Evaluation Method

The evaluation uses a holdout split:

1. Get user purchase history.
2. Sort history by order timing.
3. Use older items as training history.
4. Use newer items as held-out test items.
5. Generate recommendations.
6. Compare recommendations against held-out items.
7. Compute Precision@K and Recall@K.

### Dataset

Expanded development dataset:

- 300 synthetic users.
- 5,000 synthetic orders.
- 11,738 order lines.
- 4,420 unique user-product interactions.

### Results

```text
Precision@1 = 0.6342
Precision@3 = 0.4877
Precision@5 = 0.3685

Recall@1 = 0.1861
Recall@3 = 0.4310
Recall@5 = 0.5360
```

Strong answer:

> The initial zero values were caused by dataset sparsity. After expanding the interaction data, the same evaluation pipeline produced meaningful metrics.

---

## 12. NLP Chatbot

### What It Does

The chatbot allows users to ask natural-language questions about the restaurant menu.

Examples:

```text
I want some fresh drink
Show me spicy dishes
Do you have vegan options?
What goes well with tacos?
Tell me about shrimp nachos
```

### Technology

The chatbot uses:

```text
node-nlp
```

### Main Chatbot Intents

```text
greetings.hello
restaurant.recommendation
restaurant.recommend_spicy
restaurant.recommend_vegan
restaurant.recommend_meat
restaurant.dish_info
restaurant.also_bought
restaurant.menu_overview
```

### Chatbot Flow

```text
User message
   ↓
Frontend Chatbot.vue
   ↓
POST /api/chatbot/message
   ↓
ChatbotService.js
   ↓
Text normalization + intent classification
   ↓
Menu/recommendation logic
   ↓
Response returned to frontend
```

### Why It Is Domain-Specific

The chatbot is not a general open-ended AI assistant. It is trained for restaurant-related intents.

Strong answer:

> The chatbot is domain-specific. It classifies restaurant questions and connects them to menu data, recommendation logic, and food filters.

### Chatbot Evaluation

Training:

```text
170 training examples
8 intents
```

Validation:

```text
64 validation examples
```

Results:

```text
Accuracy = 0.9375
Macro Precision = 0.9405
Macro Recall = 0.9375
Macro F1 = 0.9373
```

Strong answer:

> The chatbot evaluation measures intent classification on a development validation set. It does not claim real-world customer satisfaction.

---

## 13. Demand Forecasting

### What It Does

The forecasting module estimates future food demand from historical completed orders.

It helps administrators think about:

- inventory planning,
- ingredient purchasing,
- waste reduction,
- workforce scheduling,
- menu planning.

### Forecast Endpoint

```text
GET /api/billstatus/forecast?days=7&lookback=30
```

### Model

The model is:

```text
moving_average_velocity
```

It is a lightweight moving-average approach.

### Forecast Inputs

The model uses:

- `billstatus`
- `billdetails`
- `food`

It only considers orders where:

```text
bill_status > 0
```

This excludes cancelled orders.

### Forecast Formula

```text
predictedDailyQty = totalQty / lookbackDays
predictedPeriodQty = predictedDailyQty × forecastDays
activityRatio = activeDays / lookbackDays
```

### Confidence Levels

```text
High confidence   = activityRatio >= 0.5
Medium confidence = activityRatio >= 0.2
Low confidence    = activityRatio < 0.2
```

Current development forecast distribution:

```text
High: 14 items
Medium: 16 items
Low: 12 items
```

### Important Clarification

Confidence is not accuracy.

Strong answer:

> Forecast confidence describes how regularly an item sold during the lookback period. It is not a statistical guarantee that the forecast will be correct.

### Why Moving Average Was Selected

Moving average was selected because it is:

- simple,
- interpretable,
- easy to deploy,
- low computational cost,
- suitable for a small capstone dataset,
- easy for administrators to understand.

Strong answer:

> I did not claim moving average is superior to ARIMA, Prophet, or LSTM. I selected it because it was practical and interpretable for the project scope and available data.

---

## 14. Also-Bought Feature

The also-bought feature gives related product recommendations.

Example:

```text
GET /api/foods/:id/also-bought?limit=5
```

Concept:

1. Find orders containing a selected food.
2. Find other foods bought in those same orders.
3. Rank them by co-purchase frequency.

This is useful because it supports cross-selling:

- tacos with drinks,
- nachos with salsa,
- burritos with sides.

Strong answer:

> The also-bought feature is based on co-purchase behavior. It recommends items that customers commonly buy together.

---

## 15. How the AI Features Work Together

The AI features serve different parts of the restaurant workflow:

```text
Customer choosing food
   → Recommendation system

Customer asking questions
   → NLP chatbot

Customer viewing item pairings
   → Also-bought logic

Admin planning demand
   → Forecasting module
```

Strong answer:

> The AI layer is distributed across the system. It supports both the customer side and the administrator side.

---

## 16. Security and Limitations

### Current Limitations

Be honest if asked:

- The system was evaluated in a development environment.
- No real restaurant deployment was conducted.
- No long-term business study was conducted.
- No real profit, waste reduction, or customer satisfaction improvement was measured.
- Recommendation quality depends on data density.
- Forecasting is simple and does not model seasonality.
- The chatbot is domain-specific and may misclassify ambiguous questions.

### Security Limitations

Possible improvements:

- hash passwords instead of storing plain text,
- stronger admin authentication,
- input validation,
- role-based access control,
- production deployment security,
- HTTPS,
- better error handling.

Strong answer:

> The project focuses on functional and AI-enhanced restaurant workflows. For production deployment, security hardening would be a major future improvement.

---

## 17. Possible Professor Questions and Answers

### Q1. What problem does your system solve?

It helps restaurants manage online ordering, customer interactions, order tracking, admin order control, and demand planning in one platform.

### Q2. Is this an AI project or a restaurant website?

It is both. The foundation is a restaurant management website. The AI features enhance important workflows such as food selection, customer assistance, and demand planning.

### Q3. Why Vue.js?

Vue.js is lightweight, component-based, and suitable for building interactive single-page applications. It allowed the frontend to be organized into pages and reusable components.

### Q4. Why Node.js and Express?

Node.js allows JavaScript to be used on the backend. Express provides a simple REST API structure, which is appropriate for connecting the Vue frontend to the MySQL database.

### Q5. Why MySQL?

The project data is relational: users, foods, carts, reservations, orders, and order details. MySQL is appropriate because these entities have clear table relationships.

### Q6. Why did you use REST APIs?

REST APIs separate frontend and backend responsibilities. The frontend sends HTTP requests, and the backend returns JSON data.

### Q7. How do you prove the AI is not hardcoded?

The AI uses database-driven logic:

- recommendations query order history,
- forecasting queries completed orders,
- chatbot classifies text using trained intents and menu data.

If the database changes, outputs can change.

### Q8. Why do recommendations sometimes overlap between users?

Because popularity is part of the score. Popular items may appear for many users, but ranking, score, and recommendation reason can differ.

### Q9. What is the cold-start problem?

The cold-start problem occurs when a user has little or no history. The system handles it by falling back to popular items.

### Q10. What makes your recommendation system hybrid?

It combines user behavior, item metadata, and popularity.

### Q11. What are Precision@K and Recall@K?

Precision@K measures how many of the recommended items were relevant.

Recall@K measures how many relevant held-out items were recovered by the recommendations.

### Q12. Why did the first recommendation evaluation produce zeros?

Because the original dataset was too sparse. There were not enough user-item interactions to evaluate recommendations meaningfully.

### Q13. Did you use real restaurant data?

No. The project used development and synthetic/seeded data. Real restaurant deployment is future work.

### Q14. Why use synthetic data?

Synthetic data allows testing of system behavior when real production data is unavailable. It helps evaluate whether the system works under realistic interaction density.

### Q15. What is the chatbot model?

It uses `node-nlp`, which performs intent classification over trained restaurant-related utterances.

### Q16. Is the chatbot like ChatGPT?

No. It is domain-specific. It does not generate open-ended responses like a large language model. It classifies intents and returns menu-aware responses.

### Q17. Why is a domain-specific chatbot useful?

It is more controlled, easier to evaluate, and safer for restaurant-specific tasks such as menu recommendations, food details, and category filtering.

### Q18. What is demand forecasting?

Demand forecasting estimates future product demand based on historical sales data.

### Q19. Why did you use moving average?

Because it is simple, interpretable, computationally light, and appropriate for the dataset and capstone scope.

### Q20. Why not ARIMA, Prophet, or LSTM?

Those methods require more data, more tuning, and more validation. They are valuable future improvements, but moving average was more practical for this implementation.

### Q21. Does forecast confidence mean accuracy?

No. It means regularity of sales activity. It is not a statistical accuracy measure.

### Q22. What would you improve first?

Real restaurant deployment, then collect real order data, compare forecasting models, improve chatbot training, and strengthen the recommender.

### Q23. What is the strongest contribution of the project?

The integration of full restaurant workflows with AI assistance. The system is not only a model; it is a usable platform.

### Q24. What is the biggest limitation?

No real-world restaurant deployment was performed, so real operational impact cannot be conclusively measured.

### Q25. What does `bill_status > 0` mean?

It means the order is not cancelled. The recommendation and forecasting modules use active/completed order records rather than cancelled orders.

---

## 18. Fast Demo Talking Script

Use this if you need a clean live demo explanation.

### Customer Side

> First, I will show the customer workflow. The customer can browse the menu, inspect a food item, add it to the cart, and proceed to checkout. The cart stores temporary selections, while checkout creates permanent order records.

### Admin Side

> On the admin side, the restaurant can view active orders, update order status, mark payment, and manage the order pipeline from confirmation to completion.

### Recommendation

> The recommendation system reads previous completed orders and scores foods using user preferences, category/type similarity, and popularity.

### Chatbot

> The chatbot allows the customer to ask natural-language questions such as asking for drinks, spicy dishes, vegan options, or food details.

### Forecasting

> The forecasting table estimates future demand using completed order history. The confidence label is based on how regularly the item was sold during the lookback period.

---

## 19. Best Final Defense Summary

Use this at the end:

> This project implements a full restaurant management platform with customer ordering, cart management, checkout, table booking, order tracking, admin order control, personalized recommendation, NLP chatbot support, and demand forecasting. The AI features are connected directly to restaurant workflows: recommendations help customers choose, the chatbot helps customers ask naturally, and forecasting helps administrators plan. The system was evaluated honestly in a development environment, and future work would focus on real restaurant deployment, larger real-world datasets, stronger forecasting comparisons, and more advanced recommendation models.

