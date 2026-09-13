-- Phase 1: Food metadata schema migration
-- Safe to re-run on existing databases.

USE db_restaurant_v2;

-- Extend existing food table (do not remove/rename legacy columns yet)
ALTER TABLE food ADD COLUMN IF NOT EXISTS description TEXT NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS cuisine_type VARCHAR(100) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS meat_type VARCHAR(100) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS is_vegan TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE food ADD COLUMN IF NOT EXISTS spice_level VARCHAR(50) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) NULL;
ALTER TABLE food ADD COLUMN IF NOT EXISTS order_count INT NOT NULL DEFAULT 0;

-- Phase 2 backfill: map legacy columns into new metadata columns
UPDATE food
SET
  description = COALESCE(NULLIF(description, ''), food_desc),
  category = COALESCE(NULLIF(category, ''), food_category),
  image_url = COALESCE(NULLIF(image_url, ''), food_src),
  rating = COALESCE(rating, CAST(food_star AS DECIMAL(3,2))),
  is_vegan = CASE
    WHEN LOWER(COALESCE(food_type, '')) = 'vegan' THEN 1
    ELSE 0
  END;

-- Ingredients per food
CREATE TABLE IF NOT EXISTS food_ingredients (
  food_id INT(11) NOT NULL,
  ingredient_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (food_id, ingredient_name),
  INDEX idx_food_ingredients_ingredient_name (ingredient_name),
  CONSTRAINT fk_food_ingredients_food
    FOREIGN KEY (food_id) REFERENCES food(food_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;

-- Simple tags per food
CREATE TABLE IF NOT EXISTS food_tags (
  food_id INT(11) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (food_id, tag),
  INDEX idx_food_tags_tag (tag),
  CONSTRAINT fk_food_tags_food
    FOREIGN KEY (food_id) REFERENCES food(food_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;

-- Allergens per food
CREATE TABLE IF NOT EXISTS food_allergens (
  food_id INT(11) NOT NULL,
  allergen_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (food_id, allergen_name),
  INDEX idx_food_allergens_allergen_name (allergen_name),
  CONSTRAINT fk_food_allergens_food
    FOREIGN KEY (food_id) REFERENCES food(food_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=INNODB;
