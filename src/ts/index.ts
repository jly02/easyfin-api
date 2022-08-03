// Default imports
import express from 'express';
import md5 from 'md5';
import mysql from 'mysql';
import util from 'util';
import path from 'path';

// Type interface imports
import { ValidRes } from './validation';

// Setting port
const PORT = process.env.PORT;

// Start SQL connection.
const con = mysql.createConnection({
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_USER
});

// ONLY CONNECT ONCE HERE, DO NOT DO AGAIN IN ANY FUNCTION
con.connect(err => {
    if(err) throw err;
});

// Use express and auto-parse JSON
const app = express();
app.use(express.json())

// Allow query to be called asynchronously for password validation.
const query = util.promisify(con.query).bind(con);

/**
 * Validate a password.
 * @param {String} key the password to be validated
 * @returns whether the password is valid
 */
const validate = async (key: string, user_name: string) => {
    let valid: boolean = false;
    try {
        // wait for response from the database
        const status: ValidRes[] = await query(`SELECT * FROM apikeys WHERE user_id = '${user_name}'`);
        // check hashes
        valid = (status[0].hash === md5(key));
    } catch(error) {
        // tslint:disable-next-line:no-console
        console.log(error);
    }

    return valid;
}


/**
 * I'm a teapot.
 */
app.get('/418/', (req, res) => { 
    res.status(418).sendFile('src/html/teapot.html', {root: path.dirname(__dirname)});
});


// Log the port to the console.
app.listen(
    PORT,
    // tslint:disable-next-line:no-console
    () => console.log(`API is live on port: ${PORT}`)
);