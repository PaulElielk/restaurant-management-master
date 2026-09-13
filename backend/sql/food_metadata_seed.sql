-- Seed metadata for chatbot-ready filtering.
-- Safe to run multiple times.

USE db_restaurant;

-- Fill remaining metadata fields where still empty
UPDATE food
SET cuisine_type = CASE
    WHEN LOWER(food_name) LIKE '%shawarma%' THEN 'middle_eastern'
    WHEN LOWER(food_name) LIKE '%pizza%' THEN 'italian'
    WHEN LOWER(food_name) LIKE '%burger%' OR LOWER(food_name) LIKE '%hotdog%' THEN 'american'
    WHEN LOWER(food_name) LIKE '%garba%'
      OR LOWER(food_name) LIKE '%alloco%'
      OR LOWER(food_name) LIKE '%foutou%'
      OR LOWER(food_name) LIKE '%placali%'
      OR LOWER(food_name) LIKE '%tchep%'
      OR LOWER(food_name) LIKE '%yassa%'
      OR LOWER(food_name) LIKE '%yam%' THEN 'african'
    WHEN LOWER(COALESCE(category, food_category, '')) IN ('taco', 'burrito', 'nachos', 'sides', 'dessert', 'drink')
      THEN 'mexican'
    ELSE 'international'
END
WHERE cuisine_type IS NULL OR cuisine_type = '';

UPDATE food
SET meat_type = CASE
    WHEN LOWER(food_name) LIKE '%shrimp%' THEN 'seafood'
    WHEN LOWER(food_name) LIKE '%fish%' THEN 'fish'
    WHEN LOWER(food_name) LIKE '%chicken%' THEN 'chicken'
    WHEN LOWER(food_name) LIKE '%pork%' THEN 'pork'
    WHEN LOWER(food_name) LIKE '%beef%'
      OR LOWER(food_name) LIKE '%carne%'
      OR LOWER(food_name) LIKE '%barbacoa%' THEN 'beef'
    WHEN is_vegan = 1 OR LOWER(COALESCE(food_type, '')) = 'vegan' THEN 'plant_based'
    ELSE 'mixed'
END
WHERE meat_type IS NULL OR meat_type = '';

UPDATE food
SET spice_level = CASE
    WHEN LOWER(food_name) LIKE '%spicy%'
      OR LOWER(food_name) LIKE '%chili%'
      OR LOWER(food_name) LIKE '%jalapeno%'
      OR LOWER(food_name) LIKE '%salsa%' THEN 'hot'
    WHEN LOWER(COALESCE(category, food_category, '')) IN ('taco', 'burrito', 'nachos') THEN 'medium'
    WHEN LOWER(COALESCE(category, food_category, '')) IN ('dessert', 'drink') THEN 'mild'
    ELSE 'mild'
END
WHERE spice_level IS NULL OR spice_level = '';

-- Ingredients
INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'tortilla'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) IN ('taco', 'burrito');

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'tortilla_chips'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) = 'nachos';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'vegetables'
FROM food
WHERE is_vegan = 1 OR LOWER(COALESCE(food_type, '')) = 'vegan';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'chicken'
FROM food
WHERE LOWER(food_name) LIKE '%chicken%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'beef'
FROM food
WHERE LOWER(food_name) LIKE '%beef%'
   OR LOWER(food_name) LIKE '%carne%'
   OR LOWER(food_name) LIKE '%barbacoa%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'pork'
FROM food
WHERE LOWER(food_name) LIKE '%pork%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'shrimp'
FROM food
WHERE LOWER(food_name) LIKE '%shrimp%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'fish'
FROM food
WHERE LOWER(food_name) LIKE '%fish%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'cheese'
FROM food
WHERE LOWER(food_name) LIKE '%cheese%'
   OR LOWER(food_name) LIKE '%ice cream%'
   OR LOWER(food_name) LIKE '%dulce de leche%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'rice'
FROM food
WHERE LOWER(food_name) LIKE '%rice%'
   OR LOWER(food_name) LIKE '%tchep%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'beans'
FROM food
WHERE LOWER(food_name) LIKE '%bean%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'avocado'
FROM food
WHERE LOWER(food_name) LIKE '%guacamole%'
   OR LOWER(food_name) LIKE '%avocado%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'tomato'
FROM food
WHERE LOWER(food_name) LIKE '%tomato%'
   OR LOWER(food_name) LIKE '%salsa%'
   OR LOWER(food_name) LIKE '%pico de gallo%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'corn'
FROM food
WHERE LOWER(food_name) LIKE '%corn%'
   OR LOWER(food_name) LIKE '%nacho%'
   OR LOWER(food_name) LIKE '%taco%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'sugar'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) IN ('dessert', 'drink');

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'milk'
FROM food
WHERE LOWER(food_name) LIKE '%ice cream%'
   OR LOWER(food_name) LIKE '%dulce de leche%'
   OR LOWER(food_name) LIKE '%horchata%'
   OR LOWER(food_name) LIKE '%atole%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'egg'
FROM food
WHERE LOWER(food_name) LIKE '%breakfast%'
   OR LOWER(food_name) LIKE '%cake%'
   OR LOWER(food_name) LIKE '%churros%'
   OR LOWER(food_name) LIKE '%conchas%';

INSERT IGNORE INTO food_ingredients (food_id, ingredient_name)
SELECT food_id, 'soy_sauce'
FROM food
WHERE LOWER(food_name) LIKE '%ramen%'
   OR LOWER(food_name) LIKE '%soy%';

-- Tags
INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'vegan'
FROM food
WHERE is_vegan = 1 OR LOWER(COALESCE(food_type, '')) = 'vegan';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'vegetarian'
FROM food
WHERE is_vegan = 1 OR LOWER(COALESCE(food_type, '')) = 'vegan';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'dairy_free'
FROM food
WHERE is_vegan = 1 OR LOWER(COALESCE(food_type, '')) = 'vegan';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'spicy'
FROM food
WHERE LOWER(COALESCE(spice_level, '')) IN ('medium', 'hot')
   OR LOWER(food_name) LIKE '%spicy%'
   OR LOWER(food_name) LIKE '%salsa%'
   OR LOWER(food_name) LIKE '%chili%';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'light'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) IN ('drink', 'sides')
   OR LOWER(food_name) LIKE '%salsa%'
   OR LOWER(food_name) LIKE '%detox%';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'filling'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) IN ('taco', 'burrito', 'fast food')
   OR LOWER(food_name) LIKE '%burger%'
   OR LOWER(food_name) LIKE '%pizza%'
   OR LOWER(food_name) LIKE '%shawarma%';

INSERT IGNORE INTO food_tags (food_id, tag)
SELECT food_id, 'gluten_free'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) = 'drink'
   OR LOWER(food_name) LIKE '%rice%'
   OR LOWER(food_name) LIKE '%garba%'
   OR LOWER(food_name) LIKE '%alloco%';

-- Allergens
INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT food_id, 'shellfish'
FROM food
WHERE LOWER(food_name) LIKE '%shrimp%';

INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT food_id, 'milk'
FROM food
WHERE LOWER(food_name) LIKE '%cheese%'
   OR LOWER(food_name) LIKE '%ice cream%'
   OR LOWER(food_name) LIKE '%dulce de leche%'
   OR LOWER(food_name) LIKE '%horchata%'
   OR LOWER(food_name) LIKE '%atole%';

INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT food_id, 'eggs'
FROM food
WHERE LOWER(food_name) LIKE '%breakfast%'
   OR LOWER(food_name) LIKE '%cake%'
   OR LOWER(food_name) LIKE '%churros%'
   OR LOWER(food_name) LIKE '%conchas%';

INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT food_id, 'gluten'
FROM food
WHERE LOWER(COALESCE(category, food_category, '')) IN ('taco', 'burrito', 'dessert')
   OR LOWER(food_name) LIKE '%burger%'
   OR LOWER(food_name) LIKE '%pizza%'
   OR LOWER(food_name) LIKE '%shawarma%';

INSERT IGNORE INTO food_allergens (food_id, allergen_name)
SELECT food_id, 'soy'
FROM food
WHERE LOWER(food_name) LIKE '%soy%'
   OR LOWER(food_name) LIKE '%ramen%';

-- Popularity backfill for new metric (optional but useful)
UPDATE food f
LEFT JOIN (
  SELECT bd.food_id, COALESCE(SUM(bd.item_qty), 0) AS total_qty
  FROM billdetails bd
  GROUP BY bd.food_id
) sales ON sales.food_id = f.food_id
SET f.order_count = COALESCE(sales.total_qty, 0);
