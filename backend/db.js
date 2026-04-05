const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.join(__dirname, 'database.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(databasePath);

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    try {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema, (err) => {
            if (err) {
                console.error('Failed to initialize database schema:', err.message);
            }
        });
    } catch (err) {
        console.error('Failed to read database schema:', err.message);
    }
});

module.exports = db;
