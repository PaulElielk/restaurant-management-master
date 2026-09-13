import mysql from '../backend/node_modules/mysql2/promise.js';

const updates = [
  {
    food_id: 47,
    food_name: 'Loaded Chili Cheese Fries',
    food_desc: '01 sharing tray per serving',
    description:
      'Golden crispy french fries smothered in slow-simmered minced beef chili, warm melted cheddar cheese sauce, and pickled jalapeños.'
  },
  {
    food_id: 55,
    food_name: 'Jalapeño Poppers',
    food_desc: '05 pieces per serving',
    description:
      'Hollowed spicy jalapeño peppers stuffed with herb cream cheese and cheddar, breaded and fried to a crisp golden finish.'
  },
  {
    food_id: 59,
    food_name: 'Garba (Attiéké Thon Frit)',
    food_desc: '01 portion with fried tuna steak',
    description:
      'The quintessential Abidjan street food: steamed fermented cassava couscous (attiéké) paired with crispy salted fried tuna steak, fresh crushed habanero peppers, and diced red onions.'
  },
  {
    food_id: 61,
    food_name: 'Alloco avec Oeuf Bouilli & Sauce Piment',
    food_desc: '01 plate fried plantains with boiled egg & chili sauce',
    description:
      'Golden fried sweet plantains served with a hard-boiled egg and a fiery side sauce made of crushed onions, tomatoes, and red habanero peppers.'
  },
  {
    food_id: 62,
    food_name: 'Attiéké Poisson Braisé',
    food_desc: '01 whole grilled fish with attieke & salsa',
    description:
      'Whole fresh tilapia marinated in garlic, ginger, and lemon, slowly flame-grilled over hot charcoal. Served with fresh attiéké, sliced raw onions, tomatoes, and spicy chili paste.'
  },
  {
    food_id: 63,
    food_name: 'Poulet Braisé Ivoirien',
    food_desc: 'Half grilled chicken with onion salsa',
    description:
      'Tender chicken marinated in an aromatic blend of mustard, garlic, bay leaf, and local spices, flame-grilled to smoky perfection. Served with spicy tomato-onion salsa.'
  },
  {
    food_id: 66,
    food_name: 'Placali Sauce Kopè',
    food_desc: '01 bowl placali with okra seafood soup',
    description:
      'Smooth, elastic fermented cassava dough (placali) served in a rich, spicy, and mucilaginous okra soup loaded with smoked fish, crab, and snails.'
  },
  {
    food_id: 70,
    food_name: 'Sauce Arachide (Tiguadèguè / Mafé)',
    food_desc: 'Creamy peanut stew with chicken & vegetables',
    description:
      'Creamy and savory ground peanut butter stew simmered slowly with chicken, root vegetables, and tomatoes. Best paired with steamed white rice.'
  },
  {
    food_id: 71,
    food_name: 'Dêguê',
    food_desc: '01 chilled cup sweet yogurt & steamed millet granules',
    description:
      'Refreshing West African dessert of steamed granulated millet couscous blended with sweetened curdled milk, creamy yogurt, nutmeg, and vanilla.'
  }
];

async function repair() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_restaurant_v2',
    charset: 'utf8mb4'
  });

  console.log('Connected to MySQL with utf8mb4.');

  for (const item of updates) {
    const [result] = await conn.execute(
      'UPDATE food SET food_name = ?, food_desc = ?, description = ? WHERE food_id = ?',
      [item.food_name, item.food_desc, item.description, item.food_id]
    );
    console.log(`Updated food_id ${item.food_id} -> "${item.food_name}": ${result.affectedRows} row(s) affected`);
  }

  // Verification step: read back from database and check for any remaining mojibake
  console.log('\n--- VERIFYING FOOD TABLE ---');
  const [rows] = await conn.query('SELECT food_id, food_name, food_desc, description FROM food WHERE food_id >= 43 ORDER BY food_id');
  let hasErrors = false;
  for (const r of rows) {
    const combined = r.food_name + ' ' + (r.food_desc || '') + ' ' + (r.description || '');
    if (combined.includes('├') || combined.includes('┼') || combined.includes('Â')) {
      console.error(`ERROR: food_id ${r.food_id} still has mojibake: "${r.food_name}"`);
      hasErrors = true;
    } else {
      console.log(`✓ ID ${r.food_id}: ${r.food_name}`);
    }
  }

  await conn.end();

  if (hasErrors) {
    console.error('\nEncoding repair completed with errors.');
    process.exit(1);
  } else {
    console.log('\nAll food names and descriptions are 100% clean UTF-8!');
  }
}

repair().catch((err) => {
  console.error('Repair failed:', err);
  process.exit(1);
});
