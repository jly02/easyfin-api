// Module imports
import mysql from 'mysql';
import util from 'util';

// Start SQL connection
export const con = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_USER
});

// ONLY CONNECT ONCE HERE, DO NOT DO AGAIN IN ANY FUNCTION
con.connect(err => {
    // If connection doesn't work, don't keep trying to run server
    if(err) throw err;
});

// Allow query to be called asynchronously
export const query = util.promisify(con.query).bind(con);