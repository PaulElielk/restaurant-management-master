-- Bulk seed: many COMPLETED orders to influence forecast only
-- These orders use bill_status = 6, so they are hidden in Dashboard order table
-- because Dashboard currently shows only bill_status 1..5.

USE db_restaurant;

-- Rerunnable cleanup for this seed range
DELETE FROM billdetails WHERE bill_id BETWEEN 12001 AND 12300;
DELETE FROM billstatus  WHERE bill_id BETWEEN 12001 AND 12300;

-- 300 completed bills (12001..12300), spread over recent days/hours
-- (CTE-free version for MariaDB compatibility)
INSERT INTO billstatus
    (bill_id, user_id, bill_phone, bill_address, bill_when, bill_method, bill_discount, bill_delivery, bill_total, bill_paid, bill_status)
SELECT
    12001 + n AS bill_id,
    1 + (n % 5) AS user_id,
    CONCAT('07000000', LPAD(1 + (n % 5), 2, '0')) AS bill_phone,
    CONCAT('Abidjan - Zone ', 1 + (n % 8)) AS bill_address,
    DATE_FORMAT(
        DATE_SUB(NOW(), INTERVAL (n % 30) DAY) - INTERVAL (n % 24) HOUR,
        '%Y-%m-%dT%H:%i'
    ) AS bill_when,
    IF((n % 2) = 0, 'card', 'cash') AS bill_method,
    500 + ((n % 6) * 100) AS bill_discount,
    500 AS bill_delivery,
    12000 + ((n % 9) * 1200) AS bill_total,
    'true' AS bill_paid,
    6 AS bill_status
FROM (
    SELECT
        ones.n + (tens.n * 10) + (hundreds.n * 100) AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) AS hundreds
    WHERE (ones.n + (tens.n * 10) + (hundreds.n * 100)) < 300
) AS seq;

-- 3 items per bill => 900 billdetails rows
-- Deterministic food rotation across all 42 foods for visible forecast shifts
INSERT INTO billdetails (bill_id, food_id, item_qty)
SELECT
    12001 + n AS bill_id,
    1 + (n % 42) AS food_id,
    1 + (n % 3) AS item_qty
FROM (
    SELECT
        ones.n + (tens.n * 10) + (hundreds.n * 100) AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) AS hundreds
    WHERE (ones.n + (tens.n * 10) + (hundreds.n * 100)) < 300
) AS seq
UNION ALL
SELECT
    12001 + n AS bill_id,
    1 + ((n + 7) % 42) AS food_id,
    1 + ((n + 1) % 2) AS item_qty
FROM (
    SELECT
        ones.n + (tens.n * 10) + (hundreds.n * 100) AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) AS hundreds
    WHERE (ones.n + (tens.n * 10) + (hundreds.n * 100)) < 300
) AS seq
UNION ALL
SELECT
    12001 + n AS bill_id,
    1 + ((n + 13) % 42) AS food_id,
    1 AS item_qty
FROM (
    SELECT
        ones.n + (tens.n * 10) + (hundreds.n * 100) AS n
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS ones
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
         SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
    CROSS JOIN
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) AS hundreds
    WHERE (ones.n + (tens.n * 10) + (hundreds.n * 100)) < 300
) AS seq;

-- Optional check:
-- SELECT COUNT(*) AS completed_seed_bills FROM billstatus WHERE bill_id BETWEEN 12001 AND 12300 AND bill_status = 6;
-- SELECT COUNT(*) AS completed_seed_details FROM billdetails WHERE bill_id BETWEEN 12001 AND 12300;
