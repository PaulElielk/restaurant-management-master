#
First you need to download and install xampp(make sure mySQL is also installed ) and download the project. Once it is downloaded, run your apache and mysql server in xampp. Go to frontend/src/resources, copy the whole content of your db_restaurant.sql file and paste it into the SQL section in your phpMyAdmin page and run the code. Once you're done open the restaurant management folder in vs code and create two bash terminals, in one enter 'cd .\backend" and in the other one enter 'cd .\frontend". You also need to execute the command "npm install" in both terminals. After that, In the backend terminal enter the command "npm start" and in the frontend one enter "npm run serve". From here everything should be fine and you can access the website.


You will need support for vue.js, node.js, express.js and mySQL(xampp is recommended )

## AI Features (Capstone)

### 1. Personalized Recommender
- Endpoint: `GET /api/recommendations/:id`
- Example: `GET /api/recommendations/5?limit=6&minHistory=3&excludeCart=true`
- Behavior:
  - Uses user order history from `billstatus + billdetails`
  - Uses global popularity signal (`global_qty`)
  - For low-history users (`minHistory`), blends personalization with popularity
  - For new users, falls back to popular foods
  - Can exclude foods already in the user's cart (`excludeCart=true`)

Response includes:
- `recommendation_score`
- `recommendation_reason`
- `recommendation_strategy`

### 2. Recommendation Evaluation (Offline, per user)
- Endpoint: `GET /api/recommendations/:id/evaluate`
- Example: `GET /api/recommendations/5/evaluate?limit=6`
- Output:
  - `precision_at_k`
  - `recall_at_k`
  - `hits`, `predicted_food_ids`, `holdout_food_ids`

Evaluation method:
- Uses a simple holdout split of each user's past unique items (80% train, 20% holdout)
- Builds recommendations from train profile
- Measures how many holdout items appear in top-`k`

### 3. Demand Forecasting (Admin)
- Endpoint: `GET /api/billstatus/forecast`
- Example: `GET /api/billstatus/forecast?days=7&lookback=30`
- Behavior:
  - Uses recent paid/active order history from `billstatus + billdetails`
  - Computes sales velocity per food over a lookback window
  - Predicts per-food quantity for the next `days`
- Response fields:
  - `predicted_daily_qty`
  - `predicted_period_qty`
  - `confidence_hint`
  - `model` (`moving_average_velocity`)
