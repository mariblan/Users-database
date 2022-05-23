const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./client.sqlite');


db.run(`CREATE TABLE IF NOT EXISTS
users (
    users_id INTEGER PRIMARY KEY, 
    first_name TEXT NOT NULL, 
    last_name TEXT NOT NULL)
    `, (error) => {
        if (error) throw error;
    }
);



module.exports = db