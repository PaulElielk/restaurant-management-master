import fs from 'fs';
import mysql from 'mysql2';

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    multipleStatements: true
});

db.connect(error => {
    if (error) {
        console.error("Connection error:", error);
        process.exit(1);
    }
    console.log("Connected to MySQL.");

    const sqlScript = fs.readFileSync('../frontend/src/resources/db_restaurant.sql', 'utf8');

    db.query(`
        USE db_restaurant;
        SET FOREIGN_KEY_CHECKS = 0;
        DROP TABLE IF EXISTS food_allergens;
        DROP TABLE IF EXISTS food_tags;
        DROP TABLE IF EXISTS food_ingredients;
        DROP TABLE IF EXISTS cart;
        DROP TABLE IF EXISTS booktable;
        DROP TABLE IF EXISTS billdetails;
        DROP TABLE IF EXISTS billstatus;
        DROP TABLE IF EXISTS user;
        DROP TABLE IF EXISTS food;
        SET FOREIGN_KEY_CHECKS = 1;
        ${sqlScript}
    `, (err, results) => {
        if (err) {
            console.error("Error executing script:", err);
        } else {
            console.log("Application Database successfully seeded with new CFA prices!");
        }
        db.end();
        process.exit(0);
    });
});
