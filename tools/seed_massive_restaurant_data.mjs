import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_restaurant_v2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const ABIDJAN_COMMUNES = ['Cocody', 'Marcory', 'Yopougon', 'Plateau', 'Bingerville', 'Koumassi', 'Treichville', 'Adjamé'];
const FIRST_NAMES = ['Kouadio', 'Aya', 'Jean', 'Affoué', 'Yao', 'Fatou', 'Mamadou', 'Marie', 'Ibrahim', 'Grace', 'Emmanuel', 'Syntyche', 'Alex', 'Sarah', 'Koffi'];
const LAST_NAMES = ['Kouamé', 'Konan', 'Touré', 'Bakayoko', 'Diallo', 'Traoré', 'Bamba', 'Ouattara', 'N\'Guessan', 'Yapi', 'Koffi', 'Cissé'];

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log(' Connected to db_restaurant_v2');

  try {
    // 1. Fetch Food Catalog
    const [foods] = await conn.query('SELECT food_id, food_name, food_price, food_type, category, cuisine_type, is_vegan FROM food');
    if (foods.length === 0) {
      throw new Error('No foods found in table `food`. Please run the catalog seed first.');
    }
    console.log(` Loaded ${foods.length} menu items from catalog.`);

    // Categorize foods for persona sampling
    const ivorianFoods = foods.filter(f => (f.cuisine_type && f.cuisine_type.toLowerCase().includes('ivorian')) || /garba|attieke|alloco|choukouya|kedjenou|placali|foutou|riz gras|pain brochette|gnamakoudji/i.test(f.food_name));
    const fastFoods = foods.filter(f => /burger|fries|wings|sub|tenders|rings|sticks|poppers|chips|hot dog|wrap/i.test(f.food_name) || (f.cuisine_type && f.cuisine_type.toLowerCase().includes('american')));
    const mexicanFoods = foods.filter(f => /taco|burrito|nacho|salsa|quesadilla/i.test(f.food_name) || (f.cuisine_type && f.cuisine_type.toLowerCase().includes('mexican')));
    const veganFoods = foods.filter(f => f.is_vegan === 1 || f.food_type === 'vegan');
    const beverageAndDessert = foods.filter(f => /drink|beverage|dessert/i.test(f.category) || /coca|juice|degué|degue|churros|ice cream|margarita|atole|michelada/i.test(f.food_name));

    // Define 18 High-Velocity Staples (sold on 80-95% of days)
    const stapleFoods = foods.filter(f => /garba|alloco simple|cheeseburger|french fries|coca cola|wings|tacos al pastor|shrimp tacos|burrito|gnamakoudji/i.test(f.food_name)).slice(0, 18);
    const regularFoods = foods.filter(f => !stapleFoods.some(s => s.food_id === f.food_id)).slice(0, 32);
    const nicheFoods = foods.filter(f => !stapleFoods.some(s => s.food_id === f.food_id) && !regularFoods.some(r => r.food_id === f.food_id));

    // 2. Generate and Insert 500 Synthetic Users
    console.log(' Generating 500 users with behavioral personas...');
    const userValues = [];
    const userPersonas = [];
    const personaTypes = ['ivorian', 'fastfood', 'mexican', 'vegan', 'eclectic'];

    for (let i = 1; i <= 500; i++) {
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${fn} ${ln}`;
      const email = `client_${i}_${Date.now()}@testresto.ci`;
      const phone = `07${String(Math.floor(10000000 + Math.random() * 90000000))}`;
      const password = 'password123';
      const birth = '1998-05-12';
      const gender = i % 2 === 0 ? 'Male' : 'Female';
      const persona = personaTypes[i % personaTypes.length];

      userValues.push([name, email, phone, password, birth, gender]);
      userPersonas.push(persona);
    }

    // Insert users in chunks of 250
    for (let i = 0; i < userValues.length; i += 250) {
      const chunk = userValues.slice(i, i + 250);
      await conn.query(
        'INSERT INTO user (user_name, user_email, user_phone, user_password, user_birth, user_gender) VALUES ?',
        [chunk]
      );
    }

    const [userRows] = await conn.query('SELECT user_id FROM user ORDER BY user_id DESC LIMIT 500');
    const createdUserIds = userRows.map(r => r.user_id).reverse();
    console.log(` Inserted 500 users (IDs: ${createdUserIds[0]} to ${createdUserIds[createdUserIds.length - 1]})`);

    // 3. Generate 10,000 Orders across the last 60 days
    console.log(' Generating 10,000 orders and calculating line items...');
    const now = Date.now();
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

    const billStatusRows = [];
    const billDetailsQueue = [];
    // Dynamically offset billCounter above any existing bill_id to guarantee zero primary key collisions
    const [[{ maxBillId }]] = await conn.query('SELECT COALESCE(MAX(bill_id), 50000) AS maxBillId FROM billstatus');
    let billCounter = Math.max(50000, Number(maxBillId) || 50000); // Offset ID to avoid collisions

    for (let o = 0; o < 10000; o++) {
      billCounter++;
      const billId = billCounter;
      const userIndex = Math.floor(Math.random() * createdUserIds.length);
      const userId = createdUserIds[userIndex];
      const persona = userPersonas[userIndex];

      // Realistic date distribution biased toward recent weeks
      const randomOffset = Math.pow(Math.random(), 1.2) * SIXTY_DAYS_MS;
      const orderDate = new Date(now - randomOffset);
      
      // Bias hour to lunch (11-14) or dinner (18-22)
      const isLunch = Math.random() < 0.45;
      const hour = isLunch ? 11 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 5);
      orderDate.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      // Format with 'T' separator to match STR_TO_DATE(bs.bill_when, '%Y-%m-%dT%H:%i') in BillStatusModel
      const formattedDate = orderDate.toISOString().slice(0, 16);

      // Pick 1 to 4 distinct items according to persona and velocity tiers
      let primaryPool = foods;
      if (persona === 'ivorian' && ivorianFoods.length) primaryPool = ivorianFoods;
      else if (persona === 'fastfood' && fastFoods.length) primaryPool = fastFoods;
      else if (persona === 'mexican' && mexicanFoods.length) primaryPool = mexicanFoods;
      else if (persona === 'vegan' && veganFoods.length) primaryPool = veganFoods;

      const itemCount = 1 + Math.floor(Math.random() * 3);
      const selectedFoods = [];

      for (let k = 0; k < itemCount; k++) {
        let candidate;
        const dice = Math.random();
        if (dice < 0.50 && stapleFoods.length) {
          candidate = stapleFoods[Math.floor(Math.random() * stapleFoods.length)];
        } else if (dice < 0.85 && primaryPool.length) {
          candidate = primaryPool[Math.floor(Math.random() * primaryPool.length)];
        } else {
          candidate = foods[Math.floor(Math.random() * foods.length)];
        }

        if (candidate && !selectedFoods.some(s => s.food_id === candidate.food_id)) {
          selectedFoods.push(candidate);
        }
      }

      // Add a beverage/side with 40% probability if not present
      if (Math.random() < 0.40 && beverageAndDessert.length) {
        const side = beverageAndDessert[Math.floor(Math.random() * beverageAndDessert.length)];
        if (!selectedFoods.some(s => s.food_id === side.food_id)) {
          selectedFoods.push(side);
        }
      }

      // Compute financial totals and queue details
      let orderTotal = 0;
      for (const item of selectedFoods) {
        const qty = 1 + Math.floor(Math.random() * 2);
        const price = parseFloat(item.food_price) || 2000;
        orderTotal += price * qty;
        billDetailsQueue.push([billId, item.food_id, qty]);
      }

      // Status: 92% completed (6), 8% cancelled (0) to preserve clean active dashboard orders
      const isCancelled = Math.random() < 0.08;
      const billStatus = isCancelled ? 0 : 6;
      const billPaid = isCancelled ? 'false' : 'true';
      const address = `${ABIDJAN_COMMUNES[Math.floor(Math.random() * ABIDJAN_COMMUNES.length)]}, Rue ${1 + Math.floor(Math.random() * 40)}`;
      const phone = `01${String(Math.floor(10000000 + Math.random() * 90000000))}`;

      billStatusRows.push([
        billId, userId, phone, address, formattedDate,
        Math.random() > 0.4 ? 'cash' : 'card',
        0, 1000, orderTotal + 1000, billPaid, billStatus
      ]);
    }

    // 4. Batch Insert Orders into `billstatus` (chunks of 500)
    console.log(' Inserting 10,000 order headers into `billstatus`...');
    for (let i = 0; i < billStatusRows.length; i += 500) {
      const chunk = billStatusRows.slice(i, i + 500);
      await conn.query(
        `INSERT INTO billstatus 
        (bill_id, user_id, bill_phone, bill_address, bill_when, bill_method, bill_discount, bill_delivery, bill_total, bill_paid, bill_status) 
        VALUES ?`,
        [chunk]
      );
    }

    // 5. Batch Insert Details into `billdetails` (chunks of 1,000)
    console.log(` Inserting ${billDetailsQueue.length} line items into 'billdetails'...`);
    for (let i = 0; i < billDetailsQueue.length; i += 1000) {
      const chunk = billDetailsQueue.slice(i, i + 1000);
      await conn.query(
        'INSERT INTO billdetails (bill_id, food_id, item_qty) VALUES ?',
        [chunk]
      );
    }

    console.log(' Synthesis completed successfully!');
    console.log(` Summary: 500 Users | 10,000 Orders | ${billDetailsQueue.length} Line Items generated.`);
  } catch (err) {
    console.error(' Seeding failed:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

main();

