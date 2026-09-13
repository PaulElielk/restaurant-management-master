-- ========================================================================
-- Seed Script: Expand Menu with 32 Fast Food & Ivorian / West African Dishes
-- Target Database: db_restaurant_v2
-- Design: Idempotent (safe to execute multiple times)
-- ========================================================================

USE db_restaurant_v2;

-- 1. Ensure unique index on food_name for idempotent upserting
CREATE UNIQUE INDEX IF NOT EXISTS uq_food_name ON food (food_name);

-- 2. Insert or update the 32 food items
INSERT INTO food (
    food_name, food_star, food_vote, food_price, food_discount, food_desc,
    food_status, food_type, food_category, food_src, description,
    cuisine_type, category, meat_type, is_vegan, spice_level, image_url, rating, order_count
) VALUES
-- ========================================================================
-- Group A: Fast Food Category (16 Items)
-- ========================================================================
(
    'Classic Bacon Cheeseburger', '4.5', '850', '4500', '0', '01 burger with brioche bun',
    'best seller', 'meat', 'burger', 'fastfood/cheeseburger.jpg',
    'Juicy grilled beef patty topped with crispy smoked bacon, melted cheddar cheese, lettuce, pickles, and house burger sauce in a toasted brioche bun.',
    'american', 'burger', 'beef', 0, 'mild', 'fastfood/cheeseburger.jpg', 4.50, 0
),
(
    'Double Smash Burger', '4.8', '920', '5500', '500', '02 seared patties on potato roll',
    'best seller', 'meat', 'burger', 'fastfood/burger.jpg',
    'Two crispy-edged seared beef patties, caramelized grilled onions, double American cheese, and tangy secret sauce on a potato roll.',
    'american', 'burger', 'beef', 0, 'mild', 'fastfood/burger.jpg', 4.80, 0
),
(
    'Crispy Buttermilk Fried Chicken Sandwich', '4.7', '780', '4800', '0', '01 crunchy sandwich with dill pickles',
    'best seller', 'meat', 'burger', 'fastfood/chickenburger.jpg',
    'Buttermilk-marinated chicken breast, golden deep-fried with a crunchy coating, dill pickles, and creamy mayonnaise on a toasted bun.',
    'american', 'burger', 'chicken', 0, 'medium', 'fastfood/chickenburger.jpg', 4.70, 0
),
(
    'Spicy Buffalo Wings', '4.6', '640', '4200', '0', '08 pieces per serving with dip',
    'best seller', 'meat', 'chicken', 'fastfood/friedchicken.jpg',
    'Crispy deep-fried chicken wings tossed in a tangy, fiery cayenne pepper hot sauce, served with cool blue cheese dip.',
    'american', 'chicken', 'chicken', 0, 'hot', 'fastfood/friedchicken.jpg', 4.60, 0
),
(
    'Loaded Chili Cheese Fries', '4.4', '510', '3500', '0', '01 sharing tray per serving',
    'new dishes', 'meat', 'sides', 'side/fries.jpg',
    'Golden crispy french fries smothered in slow-simmered minced beef chili, warm melted cheddar cheese sauce, and pickled jalapeños.',
    'american', 'sides', 'beef', 0, 'medium', 'side/fries.jpg', 4.40, 0
),
(
    'Philly Cheesesteak Sub', '4.6', '590', '5200', '0', '01 hoagie roll per serving',
    'normal', 'meat', 'sandwich', 'fastfood/shawarma.jpg',
    'Thinly shaved ribeye steak griddled with sweet bell peppers and onions, melted provolone cheese, packed into a soft hoagie roll.',
    'american', 'sandwich', 'beef', 0, 'mild', 'fastfood/shawarma.jpg', 4.60, 0
),
(
    'Crispy Chicken Tenders', '4.5', '670', '3800', '0', '05 pieces per serving with dip',
    'best seller', 'meat', 'chicken', 'fastfood/friedchicken.jpg',
    'Hand-breaded crispy chicken breast tenderloins seasoned with garlic and onion powder, served with sweet honey mustard sauce.',
    'american', 'chicken', 'chicken', 0, 'mild', 'fastfood/friedchicken.jpg', 4.50, 0
),
(
    'BBQ Pulled Pork Sandwich', '4.6', '430', '4800', '0', '01 sandwich with coleslaw',
    'seasonal dishes', 'meat', 'sandwich', 'fastfood/smokedribs.jpg',
    'Slow-smoked pork shoulder shredded and tossed in sweet and smoky barbecue sauce, topped with crisp cabbage coleslaw on a brioche bun.',
    'american', 'sandwich', 'pork', 0, 'mild', 'fastfood/smokedribs.jpg', 4.60, 0
),
(
    'Classic Hot Dog Deluxe', '4.3', '490', '2500', '0', '01 hotdog per serving',
    'normal', 'meat', 'quick_bite', 'fastfood/hotdog.jpg',
    'All-beef grilled sausage nestled in a soft steamed bun, topped with yellow mustard, tomato ketchup, sweet relish, and diced white onions.',
    'american', 'quick_bite', 'beef', 0, 'mild', 'fastfood/hotdog.jpg', 4.30, 0
),
(
    'Beer-Battered Onion Rings', '4.4', '380', '2200', '0', '08 pieces per serving with garlic dip',
    'normal', 'vegan', 'sides', 'side/side-1.png',
    'Thick-cut sweet Spanish onions dipped in a light, crunchy beer batter, fried golden brown and served with garlic dip.',
    'american', 'sides', 'none', 1, 'mild', 'side/side-1.png', 4.40, 0
),
(
    'Golden French Fries', '4.7', '1100', '1800', '0', '01 large bowl per serving',
    'best seller', 'vegan', 'sides', 'side/fries.jpg',
    'Classic salted russet potato fries, double-fried for a crisp exterior and fluffy potato interior.',
    'american', 'sides', 'none', 1, 'mild', 'side/fries.jpg', 4.70, 0
),
(
    'Mozzarella Cheese Sticks', '4.5', '560', '2800', '0', '06 pieces per serving with marinara',
    'normal', 'meat', 'sides', 'side/side-2.png',
    'Gooey whole-milk mozzarella coated in seasoned Italian breadcrumbs, fried crisp and served with rich warm marinara sauce.',
    'american', 'sides', 'none', 0, 'mild', 'side/side-2.png', 4.50, 0
),
(
    'Jalapeño Poppers', '4.5', '420', '3000', '0', '05 pieces per serving',
    'seasonal dishes', 'meat', 'sides', 'side/side-3.png',
    'Hollowed spicy jalapeño peppers stuffed with herb cream cheese and cheddar, breaded and fried to a crisp golden finish.',
    'american', 'sides', 'none', 0, 'hot', 'side/side-3.png', 4.50, 0
),
(
    'Crispy Fish and Chips', '4.6', '610', '5000', '500', '01 platter with chips & tartar dip',
    'best seller', 'meat', 'seafood', 'fastfood/frenchtacos.jpg',
    'Fresh white fish fillet coated in crispy golden batter, served with chunky potato chips, tartar sauce, and a lemon wedge.',
    'american', 'seafood', 'seafood', 0, 'mild', 'fastfood/frenchtacos.jpg', 4.60, 0
),
(
    'Plant-Based Beyond Burger', '4.6', '540', '5200', '0', '01 plant-based burger with vegan cheese',
    'new dishes', 'vegan', 'burger', 'fastfood/burger.jpg',
    '100% plant-based grilled protein patty with dairy-free vegan cheddar, fresh crisp lettuce, sliced tomato, and vegan herb mayo.',
    'american', 'burger', 'plant_based', 1, 'mild', 'fastfood/burger.jpg', 4.60, 0
),
(
    'Crispy Chicken Caesar Wrap', '4.5', '470', '4000', '0', '01 rolled tortilla wrap',
    'normal', 'meat', 'wrap', 'fastfood/frenchtacos.jpg',
    'Sliced breaded chicken breast, crisp romaine lettuce, grated parmesan cheese, and creamy garlic caesar dressing rolled in a flour tortilla.',
    'american', 'wrap', 'chicken', 0, 'mild', 'fastfood/frenchtacos.jpg', 4.50, 0
),

-- ========================================================================
-- Group B: Ivorian & West African Category (16 Items)
-- ========================================================================
(
    'Garba (Attiéké Thon Frit)', '4.9', '1450', '2500', '0', '01 portion with fried tuna steak',
    'best seller', 'meat', 'street_food', 'African/garba.jpeg',
    'The quintessential Abidjan street food: steamed fermented cassava couscous (attiéké) paired with crispy salted fried tuna steak, fresh crushed habanero peppers, and diced red onions.',
    'ivorian', 'street_food', 'seafood', 0, 'hot', 'African/garba.jpeg', 4.90, 0
),
(
    'Alloco Simple', '4.8', '980', '1500', '0', '01 bowl golden fried plantains',
    'best seller', 'vegan', 'sides', 'African/alloco.jpg',
    'Sweet ripe plantains diced and deep-fried in vegetable oil until caramelized and golden brown. Sweet inside with a crisp bite.',
    'ivorian', 'sides', 'none', 1, 'mild', 'African/alloco.jpg', 4.80, 0
),
(
    'Alloco avec Œuf Bouilli & Sauce Piment', '4.7', '820', '2000', '0', '01 plate fried plantains with boiled egg & chili sauce',
    'best seller', 'meat', 'street_food', 'African/alloco_fish.jpg',
    'Golden fried sweet plantains served with a hard-boiled egg and a fiery side sauce made of crushed onions, tomatoes, and red habanero peppers.',
    'ivorian', 'street_food', 'none', 0, 'hot', 'African/alloco_fish.jpg', 4.70, 0
),
(
    'Attiéké Poisson Braisé', '4.9', '1250', '5500', '0', '01 whole grilled fish with attieke & salsa',
    'best seller', 'meat', 'grill', 'African/cheick.jpg',
    'Whole fresh tilapia marinated in garlic, ginger, and lemon, slowly flame-grilled over hot charcoal. Served with fresh attiéké, sliced raw onions, tomatoes, and spicy chili paste.',
    'ivorian', 'grill', 'seafood', 0, 'medium', 'African/cheick.jpg', 4.90, 0
),
(
    'Poulet Braisé Ivoirien', '4.9', '1300', '6000', '0', 'Half grilled chicken with onion salsa',
    'best seller', 'meat', 'grill', 'African/cheick.jpg',
    'Tender chicken marinated in an aromatic blend of mustard, garlic, bay leaf, and local spices, flame-grilled to smoky perfection. Served with spicy tomato-onion salsa.',
    'ivorian', 'grill', 'chicken', 0, 'medium', 'African/cheick.jpg', 4.90, 0
),
(
    'Choukouya de Mouton', '4.8', '870', '5000', '0', '01 platter tender roasted mutton with kankan spice',
    'best seller', 'meat', 'grill', 'African/mika.jpg',
    'Street-style barbecue mutton braised and roasted in foil over open coals, cut into bite-sized tender chunks and dusted with aromatic kan-kan roasted pepper spice.',
    'ivorian', 'grill', 'mutton', 0, 'hot', 'African/mika.jpg', 4.80, 0
),
(
    'Kedjenou de Poulet', '4.8', '760', '5500', '0', '01 clay pot slow simmered chicken stew',
    'best seller', 'meat', 'stew', 'African/kader.jpg',
    'Traditional slow-cooked chicken stew simmered in a sealed canari clay pot with ripe tomatoes, eggplants, onions, ginger, and hot peppers with no added water.',
    'ivorian', 'stew', 'chicken', 0, 'hot', 'African/kader.jpg', 4.80, 0
),
(
    'Placali Sauce Kopè', '4.7', '890', '4000', '0', '01 bowl placali with okra seafood soup',
    'best seller', 'meat', 'traditional', 'African/placali.webp',
    'Smooth, elastic fermented cassava dough (placali) served in a rich, spicy, and mucilaginous okra soup loaded with smoked fish, crab, and snails.',
    'ivorian', 'traditional', 'mixed', 0, 'hot', 'African/placali.webp', 4.70, 0
),
(
    'Foutou Banane Sauce Graine', '4.8', '940', '4500', '0', 'Pounded plantain mash with palm nut sauce & beef',
    'best seller', 'meat', 'traditional', 'African/foutou.jpeg',
    'Traditional pounded plantain and cassava mash (foutou) served with a dense sauce extracted from fresh oil palm nuts, simmered with beef and smoked fish.',
    'ivorian', 'traditional', 'beef', 0, 'medium', 'African/foutou.jpeg', 4.80, 0
),
(
    'Riz Gras Ivoirien', '4.7', '710', '3500', '0', '01 plate savory stewed rice with beef & vegetables',
    'normal', 'meat', 'rice', 'African/tchep.jpeg',
    'Savory rice grains simmered directly in rich tomato, garlic, and onion stew fat, served with browned tender beef chunks, cabbage, and carrots.',
    'ivorian', 'rice', 'beef', 0, 'medium', 'African/tchep.jpeg', 4.70, 0
),
(
    'Pain Brochette (Pain-Chien d\'Abidjan)', '4.8', '1050', '2000', '0', '01 crusty baguette with grilled beef skewers & onions',
    'best seller', 'meat', 'sandwich', 'African/mounir.jpg',
    'Warm crusty baguette stuffed with skewered grilled beef suya, sliced raw red onions, spicy pepper sauce, and a drizzle of mayonnaise.',
    'ivorian', 'sandwich', 'beef', 0, 'medium', 'African/mounir.jpg', 4.80, 0
),
(
    'Sauce Arachide (Tiguadèguè / Mafé)', '4.8', '830', '4000', '0', 'Creamy peanut stew with chicken & vegetables',
    'best seller', 'meat', 'stew', 'African/yam.jpg',
    'Creamy and savory ground peanut butter stew simmered slowly with chicken, root vegetables, and tomatoes. Best paired with steamed white rice.',
    'west_african', 'stew', 'chicken', 0, 'mild', 'African/yam.jpg', 4.80, 0
),
(
    'Dêguê', '4.7', '690', '1500', '0', '01 chilled cup sweet yogurt & steamed millet granules',
    'new dishes', 'meat', 'dessert', 'dessert/dessert-3.png',
    'Refreshing West African dessert of steamed granulated millet couscous blended with sweetened curdled milk, creamy yogurt, nutmeg, and vanilla.',
    'west_african', 'dessert', 'none', 0, 'mild', 'dessert/dessert-3.png', 4.70, 0
),
(
    'Gbofloto (Ivorian Beignets)', '4.8', '950', '1000', '0', '05 golden fried dough beignets',
    'best seller', 'vegan', 'dessert', 'dessert/dessert-1.png',
    'Golden deep-fried sweet dough balls, fluffy and pillowy on the inside with a delicate crust. Eaten as a snack or dessert.',
    'ivorian', 'dessert', 'none', 1, 'mild', 'dessert/dessert-1.png', 4.80, 0
),
(
    'Placali Sauce Gombo Frais (Vegan)', '4.6', '410', '3000', '0', 'Stretchy cassava dough with fresh okra sauce (plant-based)',
    'new dishes', 'vegan', 'traditional', 'African/placali.webp',
    'Traditional stretchy cassava dough served with a fresh sliced okra sauce cooked with red palm oil, tomatoes, and fragrant seasonings without animal products.',
    'ivorian', 'traditional', 'none', 1, 'medium', 'African/placali.webp', 4.60, 0
),
(
    'Gnamakoudji (Fresh Ginger Juice)', '4.9', '1120', '1000', '0', '01 cold-pressed fresh ginger bottle (330ml)',
    'best seller', 'vegan', 'drinks', 'drink/drink-5.png',
    'Fiery and invigorating homemade cold-pressed ginger root juice mellowed with fresh pineapple juice, lime juice, and mint leaves.',
    'ivorian', 'drinks', 'none', 1, 'medium', 'drink/drink-5.png', 4.90, 0
)
ON DUPLICATE KEY UPDATE
    food_star = VALUES(food_star),
    food_vote = VALUES(food_vote),
    food_price = VALUES(food_price),
    food_discount = VALUES(food_discount),
    food_desc = VALUES(food_desc),
    food_status = VALUES(food_status),
    food_type = VALUES(food_type),
    food_category = VALUES(food_category),
    food_src = VALUES(food_src),
    description = VALUES(description),
    cuisine_type = VALUES(cuisine_type),
    category = VALUES(category),
    meat_type = VALUES(meat_type),
    is_vegan = VALUES(is_vegan),
    spice_level = VALUES(spice_level),
    image_url = VALUES(image_url),
    rating = VALUES(rating);

-- ========================================================================
-- 3. Populate food_ingredients Dynamically
-- ========================================================================
INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT f.food_id, item.ing
FROM food f
JOIN (
    -- 1. Classic Bacon Cheeseburger
    SELECT 'Classic Bacon Cheeseburger' AS food_name, 'ground beef' AS ing UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'bacon' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'cheddar cheese' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'brioche bun' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'lettuce' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'pickles' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'burger sauce' UNION ALL

    -- 2. Double Smash Burger
    SELECT 'Double Smash Burger', 'ground beef' UNION ALL
    SELECT 'Double Smash Burger', 'american cheese' UNION ALL
    SELECT 'Double Smash Burger', 'onions' UNION ALL
    SELECT 'Double Smash Burger', 'potato bun' UNION ALL
    SELECT 'Double Smash Burger', 'secret sauce' UNION ALL
    SELECT 'Double Smash Burger', 'butter' UNION ALL

    -- 3. Crispy Buttermilk Fried Chicken Sandwich
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'chicken breast' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'buttermilk' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'flour' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'paprika' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'dill pickles' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'mayonnaise' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'bun' UNION ALL

    -- 4. Spicy Buffalo Wings
    SELECT 'Spicy Buffalo Wings', 'chicken wings' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'buffalo hot sauce' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'cayenne pepper' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'butter' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'blue cheese dip' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'celery' UNION ALL

    -- 5. Loaded Chili Cheese Fries
    SELECT 'Loaded Chili Cheese Fries', 'potatoes' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'ground beef chili' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'cheddar sauce' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'jalapeno' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'onions' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'vegetable oil' UNION ALL

    -- 6. Philly Cheesesteak Sub
    SELECT 'Philly Cheesesteak Sub', 'shaved beef steak' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'provolone cheese' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'bell peppers' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'onions' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'hoagie roll' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'butter' UNION ALL

    -- 7. Crispy Chicken Tenders
    SELECT 'Crispy Chicken Tenders', 'chicken tenderloin' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'breadcrumbs' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'flour' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'garlic powder' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'honey mustard dip' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'egg' UNION ALL

    -- 8. BBQ Pulled Pork Sandwich
    SELECT 'BBQ Pulled Pork Sandwich', 'pork shoulder' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'bbq sauce' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'cabbage coleslaw' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'vinegar' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'brown sugar' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'brioche bun' UNION ALL

    -- 9. Classic Hot Dog Deluxe
    SELECT 'Classic Hot Dog Deluxe', 'all-beef frankfurter' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'hot dog bun' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'mustard' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'ketchup' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'pickle relish' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'onions' UNION ALL

    -- 10. Beer-Battered Onion Rings
    SELECT 'Beer-Battered Onion Rings', 'onions' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'flour' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'cornstarch' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'sparkling batter' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'paprika' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'vegetable oil' UNION ALL

    -- 11. Golden French Fries
    SELECT 'Golden French Fries', 'russet potatoes' UNION ALL
    SELECT 'Golden French Fries', 'sea salt' UNION ALL
    SELECT 'Golden French Fries', 'vegetable oil' UNION ALL

    -- 12. Mozzarella Cheese Sticks
    SELECT 'Mozzarella Cheese Sticks', 'mozzarella cheese' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'breadcrumbs' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'oregano' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'egg' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'marinara sauce' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'vegetable oil' UNION ALL

    -- 13. Jalapeño Poppers
    SELECT 'Jalapeño Poppers', 'jalapeno peppers' UNION ALL
    SELECT 'Jalapeño Poppers', 'cream cheese' UNION ALL
    SELECT 'Jalapeño Poppers', 'cheddar cheese' UNION ALL
    SELECT 'Jalapeño Poppers', 'breadcrumbs' UNION ALL
    SELECT 'Jalapeño Poppers', 'egg' UNION ALL
    SELECT 'Jalapeño Poppers', 'vegetable oil' UNION ALL

    -- 14. Crispy Fish and Chips
    SELECT 'Crispy Fish and Chips', 'white fish fillet' UNION ALL
    SELECT 'Crispy Fish and Chips', 'flour' UNION ALL
    SELECT 'Crispy Fish and Chips', 'tartar sauce' UNION ALL
    SELECT 'Crispy Fish and Chips', 'lemon' UNION ALL
    SELECT 'Crispy Fish and Chips', 'russet potatoes' UNION ALL
    SELECT 'Crispy Fish and Chips', 'vegetable oil' UNION ALL

    -- 15. Plant-Based Beyond Burger
    SELECT 'Plant-Based Beyond Burger', 'pea-protein patty' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'vegan cheese' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'lettuce' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'tomato' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'vegan bun' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'egg-free mayo' UNION ALL

    -- 16. Crispy Chicken Caesar Wrap
    SELECT 'Crispy Chicken Caesar Wrap', 'flour tortilla' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'crispy chicken' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'romaine lettuce' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'parmesan cheese' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'caesar dressing' UNION ALL

    -- 17. Garba (Attiéké Thon Frit)
    SELECT 'Garba (Attiéké Thon Frit)', 'attieke' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'fried tuna steak' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'fresh habanero chili' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'red onions' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'vegetable oil' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'seasoning cube' UNION ALL

    -- 18. Alloco Simple
    SELECT 'Alloco Simple', 'ripe plantains' UNION ALL
    SELECT 'Alloco Simple', 'vegetable oil' UNION ALL
    SELECT 'Alloco Simple', 'sea salt' UNION ALL

    -- 19. Alloco avec Œuf Bouilli & Sauce Piment
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'ripe plantains' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'hard-boiled egg' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'tomatoes' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'red onions' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'habanero chili' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'vegetable oil' UNION ALL

    -- 20. Attiéké Poisson Braisé
    SELECT 'Attiéké Poisson Braisé', 'whole tilapia fish' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'attieke' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'onions' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'tomatoes' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'garlic' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'ginger' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'lemon' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'chili pepper' UNION ALL

    -- 21. Poulet Braisé Ivoirien
    SELECT 'Poulet Braisé Ivoirien', 'chicken' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'dijon mustard' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'garlic' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'ginger' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'bouillon cube' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'onions' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'chili pepper' UNION ALL

    -- 22. Choukouya de Mouton
    SELECT 'Choukouya de Mouton', 'mutton' UNION ALL
    SELECT 'Choukouya de Mouton', 'kankan spice' UNION ALL
    SELECT 'Choukouya de Mouton', 'dried red chili' UNION ALL
    SELECT 'Choukouya de Mouton', 'ginger' UNION ALL
    SELECT 'Choukouya de Mouton', 'garlic' UNION ALL
    SELECT 'Choukouya de Mouton', 'white onions' UNION ALL

    -- 23. Kedjenou de Poulet
    SELECT 'Kedjenou de Poulet', 'chicken' UNION ALL
    SELECT 'Kedjenou de Poulet', 'fresh tomatoes' UNION ALL
    SELECT 'Kedjenou de Poulet', 'african eggplant' UNION ALL
    SELECT 'Kedjenou de Poulet', 'onions' UNION ALL
    SELECT 'Kedjenou de Poulet', 'habanero chili' UNION ALL
    SELECT 'Kedjenou de Poulet', 'garlic' UNION ALL
    SELECT 'Kedjenou de Poulet', 'ginger' UNION ALL
    SELECT 'Kedjenou de Poulet', 'thyme' UNION ALL

    -- 24. Placali Sauce Kopè
    SELECT 'Placali Sauce Kopè', 'fermented cassava starch' UNION ALL
    SELECT 'Placali Sauce Kopè', 'fresh okra' UNION ALL
    SELECT 'Placali Sauce Kopè', 'smoked fish' UNION ALL
    SELECT 'Placali Sauce Kopè', 'crab' UNION ALL
    SELECT 'Placali Sauce Kopè', 'snails' UNION ALL
    SELECT 'Placali Sauce Kopè', 'palm oil' UNION ALL
    SELECT 'Placali Sauce Kopè', 'habanero pepper' UNION ALL

    -- 25. Foutou Banane Sauce Graine
    SELECT 'Foutou Banane Sauce Graine', 'boiled green plantain' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'boiled cassava' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'palm nut pulp' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'beef chuck' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'smoked fish' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'chili pepper' UNION ALL

    -- 26. Riz Gras Ivoirien
    SELECT 'Riz Gras Ivoirien', 'long-grain rice' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'beef' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'tomato paste' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'fresh tomatoes' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'carrots' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'cabbage' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'onions' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'garlic' UNION ALL

    -- 27. Pain Brochette (Pain-Chien d'Abidjan)
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'baguette bread' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'beef skewers' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'suya pepper spice' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'red onions' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'mayonnaise' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'chili' UNION ALL

    -- 28. Sauce Arachide (Tiguadèguè / Mafé)
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'roasted peanut butter' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'chicken' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'fresh tomatoes' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'onions' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'sweet potatoes' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'garlic' UNION ALL

    -- 29. Dêguê
    SELECT 'Dêguê', 'steamed millet granules' UNION ALL
    SELECT 'Dêguê', 'sweet yogurt' UNION ALL
    SELECT 'Dêguê', 'condensed milk' UNION ALL
    SELECT 'Dêguê', 'vanilla' UNION ALL
    SELECT 'Dêguê', 'nutmeg' UNION ALL

    -- 30. Gbofloto (Ivorian Beignets)
    SELECT 'Gbofloto (Ivorian Beignets)', 'all-purpose flour' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'yeast' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'sugar' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'nutmeg' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'vanilla' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'vegetable oil' UNION ALL

    -- 31. Placali Sauce Gombo Frais (Vegan)
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'fermented cassava dough' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'fresh okra' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'red palm oil' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'fresh tomatoes' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'onions' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'hot pepper' UNION ALL

    -- 32. Gnamakoudji (Fresh Ginger Juice)
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'fresh ginger root' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'pineapple juice' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'lime' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'brown sugar' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'mint leaves' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'water'
) item ON f.food_name = item.food_name;

-- ========================================================================
-- 4. Populate food_tags Dynamically
-- ========================================================================
INSERT IGNORE INTO food_tags (food_id, tag)
SELECT f.food_id, item.tag
FROM food f
JOIN (
    -- Fast Food
    SELECT 'Classic Bacon Cheeseburger' AS food_name, 'savory' AS tag UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'filling' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'grilled' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'classic' UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'beef' UNION ALL

    SELECT 'Double Smash Burger', 'crispy' UNION ALL
    SELECT 'Double Smash Burger', 'cheesy' UNION ALL
    SELECT 'Double Smash Burger', 'savory' UNION ALL
    SELECT 'Double Smash Burger', 'heavy' UNION ALL

    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'crunchy' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'juicy' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'fried' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'poultry' UNION ALL

    SELECT 'Spicy Buffalo Wings', 'spicy' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'hot' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'finger food' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'crispy' UNION ALL
    SELECT 'Spicy Buffalo Wings', 'wings' UNION ALL

    SELECT 'Loaded Chili Cheese Fries', 'sharing' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'loaded' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'cheesy' UNION ALL
    SELECT 'Loaded Chili Cheese Fries', 'comfort food' UNION ALL

    SELECT 'Philly Cheesesteak Sub', 'savory' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'warm' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'cheesy' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'hearty' UNION ALL

    SELECT 'Crispy Chicken Tenders', 'finger food' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'crunchy' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'snack' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'kid-friendly' UNION ALL

    SELECT 'BBQ Pulled Pork Sandwich', 'smoky' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'sweet' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'tender' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'pork' UNION ALL

    SELECT 'Classic Hot Dog Deluxe', 'street food' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'quick bite' UNION ALL
    SELECT 'Classic Hot Dog Deluxe', 'classic' UNION ALL

    SELECT 'Beer-Battered Onion Rings', 'vegetarian' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'vegan' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'crunchy' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'side' UNION ALL
    SELECT 'Beer-Battered Onion Rings', 'fried' UNION ALL

    SELECT 'Golden French Fries', 'vegan' UNION ALL
    SELECT 'Golden French Fries', 'side' UNION ALL
    SELECT 'Golden French Fries', 'salty' UNION ALL
    SELECT 'Golden French Fries', 'crispy' UNION ALL
    SELECT 'Golden French Fries', 'potato' UNION ALL

    SELECT 'Mozzarella Cheese Sticks', 'vegetarian' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'cheesy' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'gooey' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'appetizer' UNION ALL

    SELECT 'Jalapeño Poppers', 'spicy' UNION ALL
    SELECT 'Jalapeño Poppers', 'hot' UNION ALL
    SELECT 'Jalapeño Poppers', 'cheesy' UNION ALL
    SELECT 'Jalapeño Poppers', 'vegetarian' UNION ALL
    SELECT 'Jalapeño Poppers', 'appetizer' UNION ALL

    SELECT 'Crispy Fish and Chips', 'seafood' UNION ALL
    SELECT 'Crispy Fish and Chips', 'crispy' UNION ALL
    SELECT 'Crispy Fish and Chips', 'fried' UNION ALL
    SELECT 'Crispy Fish and Chips', 'classic' UNION ALL

    SELECT 'Plant-Based Beyond Burger', 'vegan' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'healthy' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'plant-based' UNION ALL
    SELECT 'Plant-Based Beyond Burger', 'burger' UNION ALL

    SELECT 'Crispy Chicken Caesar Wrap', 'wrap' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'handheld' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'fresh' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'chicken' UNION ALL

    -- Ivorian & West African
    SELECT 'Garba (Attiéké Thon Frit)', 'street food' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'authentic' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'signature' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'savory' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'spicy' UNION ALL
    SELECT 'Garba (Attiéké Thon Frit)', 'garba' UNION ALL

    SELECT 'Alloco Simple', 'vegan' UNION ALL
    SELECT 'Alloco Simple', 'sweet' UNION ALL
    SELECT 'Alloco Simple', 'street food' UNION ALL
    SELECT 'Alloco Simple', 'side' UNION ALL
    SELECT 'Alloco Simple', 'plantain' UNION ALL
    SELECT 'Alloco Simple', 'alloco' UNION ALL

    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'street food' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'vegetarian' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'spicy' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'sweet' UNION ALL
    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'protein' UNION ALL

    SELECT 'Attiéké Poisson Braisé', 'grilled' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'charcoal' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'seafood' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'traditional' UNION ALL
    SELECT 'Attiéké Poisson Braisé', 'healthy' UNION ALL

    SELECT 'Poulet Braisé Ivoirien', 'grilled' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'smoky' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'poultry' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'signature' UNION ALL
    SELECT 'Poulet Braisé Ivoirien', 'high-protein' UNION ALL

    SELECT 'Choukouya de Mouton', 'grilled' UNION ALL
    SELECT 'Choukouya de Mouton', 'street food' UNION ALL
    SELECT 'Choukouya de Mouton', 'smoky' UNION ALL
    SELECT 'Choukouya de Mouton', 'tender' UNION ALL
    SELECT 'Choukouya de Mouton', 'mutton' UNION ALL
    SELECT 'Choukouya de Mouton', 'spicy' UNION ALL

    SELECT 'Kedjenou de Poulet', 'stew' UNION ALL
    SELECT 'Kedjenou de Poulet', 'traditional' UNION ALL
    SELECT 'Kedjenou de Poulet', 'slow-cooked' UNION ALL
    SELECT 'Kedjenou de Poulet', 'clay pot' UNION ALL
    SELECT 'Kedjenou de Poulet', 'juicy' UNION ALL

    SELECT 'Placali Sauce Kopè', 'traditional' UNION ALL
    SELECT 'Placali Sauce Kopè', 'soup' UNION ALL
    SELECT 'Placali Sauce Kopè', 'seafood' UNION ALL
    SELECT 'Placali Sauce Kopè', 'hearty' UNION ALL
    SELECT 'Placali Sauce Kopè', 'placali' UNION ALL

    SELECT 'Foutou Banane Sauce Graine', 'traditional' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'heavy' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'comfort food' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'palm nut' UNION ALL
    SELECT 'Foutou Banane Sauce Graine', 'foutou' UNION ALL

    SELECT 'Riz Gras Ivoirien', 'rice' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'savory' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'filling' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'west african' UNION ALL
    SELECT 'Riz Gras Ivoirien', 'comfort' UNION ALL

    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'street food' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'sandwich' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'quick bite' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'grilled' UNION ALL

    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'stew' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'nutty' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'savory' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'hearty' UNION ALL
    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'peanut' UNION ALL

    SELECT 'Dêguê', 'dessert' UNION ALL
    SELECT 'Dêguê', 'sweet' UNION ALL
    SELECT 'Dêguê', 'chilled' UNION ALL
    SELECT 'Dêguê', 'vegetarian' UNION ALL
    SELECT 'Dêguê', 'creamy' UNION ALL

    SELECT 'Gbofloto (Ivorian Beignets)', 'vegan' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'dessert' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'sweet' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'snack' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'street food' UNION ALL
    SELECT 'Gbofloto (Ivorian Beignets)', 'pastry' UNION ALL

    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'vegan' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'plant-based' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'traditional' UNION ALL
    SELECT 'Placali Sauce Gombo Frais (Vegan)', 'gluten-free' UNION ALL

    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'beverage' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'drink' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'spicy' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'refreshing' UNION ALL
    SELECT 'Gnamakoudji (Fresh Ginger Juice)', 'vegan'
) item ON f.food_name = item.food_name;

-- ========================================================================
-- 5. Populate food_allergens Dynamically
-- ========================================================================
INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT f.food_id, item.alg
FROM food f
JOIN (
    -- Fast Food
    SELECT 'Classic Bacon Cheeseburger' AS food_name, 'gluten' AS alg UNION ALL
    SELECT 'Classic Bacon Cheeseburger', 'dairy' UNION ALL

    SELECT 'Double Smash Burger', 'gluten' UNION ALL
    SELECT 'Double Smash Burger', 'dairy' UNION ALL

    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'gluten' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'dairy' UNION ALL
    SELECT 'Crispy Buttermilk Fried Chicken Sandwich', 'egg' UNION ALL

    SELECT 'Spicy Buffalo Wings', 'dairy' UNION ALL

    SELECT 'Loaded Chili Cheese Fries', 'dairy' UNION ALL

    SELECT 'Philly Cheesesteak Sub', 'gluten' UNION ALL
    SELECT 'Philly Cheesesteak Sub', 'dairy' UNION ALL

    SELECT 'Crispy Chicken Tenders', 'gluten' UNION ALL
    SELECT 'Crispy Chicken Tenders', 'egg' UNION ALL

    SELECT 'BBQ Pulled Pork Sandwich', 'gluten' UNION ALL
    SELECT 'BBQ Pulled Pork Sandwich', 'egg' UNION ALL

    SELECT 'Classic Hot Dog Deluxe', 'gluten' UNION ALL

    SELECT 'Beer-Battered Onion Rings', 'gluten' UNION ALL

    SELECT 'Mozzarella Cheese Sticks', 'gluten' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'dairy' UNION ALL
    SELECT 'Mozzarella Cheese Sticks', 'egg' UNION ALL

    SELECT 'Jalapeño Poppers', 'gluten' UNION ALL
    SELECT 'Jalapeño Poppers', 'dairy' UNION ALL
    SELECT 'Jalapeño Poppers', 'egg' UNION ALL

    SELECT 'Crispy Fish and Chips', 'gluten' UNION ALL
    SELECT 'Crispy Fish and Chips', 'fish' UNION ALL
    SELECT 'Crispy Fish and Chips', 'egg' UNION ALL

    SELECT 'Plant-Based Beyond Burger', 'gluten' UNION ALL

    SELECT 'Crispy Chicken Caesar Wrap', 'gluten' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'dairy' UNION ALL
    SELECT 'Crispy Chicken Caesar Wrap', 'egg' UNION ALL

    -- Ivorian & West African
    SELECT 'Garba (Attiéké Thon Frit)', 'fish' UNION ALL

    SELECT 'Alloco avec Œuf Bouilli & Sauce Piment', 'egg' UNION ALL

    SELECT 'Attiéké Poisson Braisé', 'fish' UNION ALL

    SELECT 'Poulet Braisé Ivoirien', 'mustard' UNION ALL

    SELECT 'Placali Sauce Kopè', 'fish' UNION ALL
    SELECT 'Placali Sauce Kopè', 'crustaceans' UNION ALL
    SELECT 'Placali Sauce Kopè', 'molluscs' UNION ALL

    SELECT 'Foutou Banane Sauce Graine', 'fish' UNION ALL

    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'gluten' UNION ALL
    SELECT 'Pain Brochette (Pain-Chien d\'Abidjan)', 'egg' UNION ALL

    SELECT 'Sauce Arachide (Tiguadèguè / Mafé)', 'peanuts' UNION ALL

    SELECT 'Dêguê', 'dairy' UNION ALL

    SELECT 'Gbofloto (Ivorian Beignets)', 'gluten'
) item ON f.food_name = item.food_name;

