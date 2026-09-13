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

    const sqlScript = fs.readFileSync('frontend/src/resources/db_restaurant.sql', 'utf8');

    db.query(`
        DROP DATABASE IF EXISTS db_restaurant;
        CREATE DATABASE db_restaurant;
        USE db_restaurant;
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
