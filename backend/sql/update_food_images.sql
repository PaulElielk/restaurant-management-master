-- ========================================================================
-- Update Food Images Script
-- Assign authentic culinary photos to Fast Food & African catalog items
-- ========================================================================

USE db_restaurant_v2;

-- Fast Food Items
UPDATE food SET food_src = 'fastfood/buffalo_wings.jpg', image_url = 'fastfood/buffalo_wings.jpg' 
WHERE food_id = 46 OR food_name = 'Spicy Buffalo Wings';

UPDATE food SET food_src = 'fastfood/chili_cheese_fries.jpg', image_url = 'fastfood/chili_cheese_fries.jpg' 
WHERE food_id = 47 OR food_name = 'Loaded Chili Cheese Fries';

UPDATE food SET food_src = 'fastfood/philly_cheesesteak.jpg', image_url = 'fastfood/philly_cheesesteak.jpg' 
WHERE food_id = 48 OR food_name = 'Philly Cheesesteak Sub';

UPDATE food SET food_src = 'fastfood/chicken_tenders.jpg', image_url = 'fastfood/chicken_tenders.jpg' 
WHERE food_id = 49 OR food_name = 'Crispy Chicken Tenders';

UPDATE food SET food_src = 'fastfood/pulled_pork.jpg', image_url = 'fastfood/pulled_pork.jpg' 
WHERE food_id = 50 OR food_name = 'BBQ Pulled Pork Sandwich';

UPDATE food SET food_src = 'fastfood/onion_rings.jpg', image_url = 'fastfood/onion_rings.jpg' 
WHERE food_id = 52 OR food_name = 'Beer-Battered Onion Rings';

UPDATE food SET food_src = 'fastfood/mozzarella_sticks.jpg', image_url = 'fastfood/mozzarella_sticks.jpg' 
WHERE food_id = 54 OR food_name = 'Mozzarella Cheese Sticks';

UPDATE food SET food_src = 'fastfood/jalapeno_poppers.jpg', image_url = 'fastfood/jalapeno_poppers.jpg' 
WHERE food_id = 55 OR food_name = 'Jalapeño Poppers';

UPDATE food SET food_src = 'fastfood/fish_and_chips.jpg', image_url = 'fastfood/fish_and_chips.jpg' 
WHERE food_id = 56 OR food_name = 'Crispy Fish and Chips';

UPDATE food SET food_src = 'fastfood/beyond_burger.jpg', image_url = 'fastfood/beyond_burger.jpg' 
WHERE food_id = 57 OR food_name = 'Plant-Based Beyond Burger';

UPDATE food SET food_src = 'fastfood/chicken_wrap.jpg', image_url = 'fastfood/chicken_wrap.jpg' 
WHERE food_id = 58 OR food_name = 'Crispy Chicken Caesar Wrap';

-- African Items
UPDATE food SET food_src = 'African/alloco_oeuf.jpg', image_url = 'African/alloco_oeuf.jpg' 
WHERE food_id = 61 OR food_name = 'Alloco avec Oeuf Bouilli & Sauce Piment';

UPDATE food SET food_src = 'African/poisson_braise.jpg', image_url = 'African/poisson_braise.jpg' 
WHERE food_id = 62 OR food_name = 'Attiéké Poisson Braisé';

UPDATE food SET food_src = 'African/poulet_braise.jpg', image_url = 'African/poulet_braise.jpg' 
WHERE food_id = 63 OR food_name = 'Poulet Braisé Ivoirien';

UPDATE food SET food_src = 'African/choukouya.jpg', image_url = 'African/choukouya.jpg' 
WHERE food_id = 64 OR food_name = 'Choukouya de Mouton';

UPDATE food SET food_src = 'African/kedjenou.jpg', image_url = 'African/kedjenou.jpg' 
WHERE food_id = 65 OR food_name = 'Kedjenou de Poulet';

UPDATE food SET food_src = 'African/pain_brochette.jpg', image_url = 'African/pain_brochette.jpg' 
WHERE food_id = 69 OR food_name = "Pain Brochette (Pain-Chien d'Abidjan)";

UPDATE food SET food_src = 'African/mafe.jpg', image_url = 'African/mafe.jpg' 
WHERE food_id = 70 OR food_name = 'Sauce Arachide (Tiguadèguè / Mafé)';

UPDATE food SET food_src = 'African/degue.jpg', image_url = 'African/degue.jpg' 
WHERE food_id = 71 OR food_name = 'Dêguê';

UPDATE food SET food_src = 'African/gbofloto.jpg', image_url = 'African/gbofloto.jpg' 
WHERE food_id = 72 OR food_name = 'Gbofloto (Ivorian Beignets)';

UPDATE food SET food_src = 'African/sauce_gombo.jpg', image_url = 'African/sauce_gombo.jpg' 
WHERE food_id = 73 OR food_name = 'Placali Sauce Gombo Frais (Vegan)';

UPDATE food SET food_src = 'African/gnamakoudji.jpg', image_url = 'African/gnamakoudji.jpg' 
WHERE food_id = 74 OR food_name = 'Gnamakoudji (Fresh Ginger Juice)';

