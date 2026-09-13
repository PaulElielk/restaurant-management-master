-- Seed fake transactions for admin dashboard and demand forecasting
-- Safe to run multiple times if you keep unique bill_id values in this file.

USE db_restaurant_v2;

-- Optional cleanup for this seed range only
DELETE FROM billdetails WHERE bill_id BETWEEN 9001 AND 9010;
DELETE FROM billstatus  WHERE bill_id BETWEEN 9001 AND 9010;

-- 10 fake bills across different dates/statuses
INSERT INTO billstatus
  (bill_id, user_id, bill_phone, bill_address, bill_when, bill_method, bill_discount, bill_delivery, bill_total, bill_paid, bill_status)
VALUES
  (9001, 1, '0700000001', 'Abidjan - Cocody',  '2026-02-10T12:30', 'cash',  500, 500, 14500, 'false', 1),
  (9002, 2, '0700000002', 'Abidjan - Marcory', '2026-02-11T13:10', 'card', 1000, 500, 18000, 'true',  5),
  (9003, 1, '0700000001', 'Abidjan - Cocody',  '2026-02-12T18:45', 'cash',  300, 500, 12200, 'false', 3),
  (9004, 3, '0700000003', 'Abidjan - Yopougon','2026-02-13T19:20', 'card',  700, 500, 20100, 'true',  6),
  (9005, 2, '0700000002', 'Abidjan - Marcory', '2026-02-14T20:15', 'cash',  400, 500, 13300, 'false', 2),
  (9006, 4, '0700000004', 'Abidjan - Plateau', '2026-02-16T11:55', 'card',  600, 500, 15400, 'true',  5),
  (9007, 5, '0700000005', 'Abidjan - Bingerville','2026-02-18T17:05','cash',300, 500, 11800, 'false', 4),
  (9008, 1, '0700000001', 'Abidjan - Cocody',  '2026-02-20T14:35', 'card',  900, 500, 17600, 'true',  5),
  (9009, 3, '0700000003', 'Abidjan - Yopougon','2026-02-24T21:10', 'cash',  500, 500, 14900, 'false', 1),
  (9010, 2, '0700000002', 'Abidjan - Marcory', '2026-02-27T12:05', 'card',  800, 500, 16900, 'true',  5);

-- billdetails lines per bill (food_id must exist in food table)
INSERT INTO billdetails (bill_id, food_id, item_qty) VALUES
  (9001,  1, 2), (9001, 10, 1), (9001, 42, 2),
  (9002, 16, 2), (9002, 17, 1), (9002, 37, 2),
  (9003,  4, 2), (9003, 26, 1), (9003, 41, 2),
  (9004, 13, 2), (9004, 29, 1), (9004, 38, 2),
  (9005,  2, 1), (9005, 15, 2), (9005, 42, 1),
  (9006, 11, 2), (9006, 18, 1), (9006, 36, 2),
  (9007,  8, 2), (9007, 24, 1), (9007, 40, 2),
  (9008,  3, 2), (9008, 12, 1), (9008, 39, 2),
  (9009,  6, 2), (9009, 20, 1), (9009, 37, 1),
  (9010,  7, 2), (9010, 23, 1), (9010, 42, 2);

