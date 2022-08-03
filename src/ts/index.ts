// Default imports
import express from 'express';
import md5 from 'md5';
import mysql from 'mysql';
import util from 'util';
import teapot from './routes/teapot';

// Named imports
import { ValidRes } from './validation';
import { Logger } from 'tslog';

// Initializing tslog logger (general log)
const log: Logger = new Logger({ name: "genLog" });

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
    // Don't need to log this, because if it doesn't connect we don't want the server to continue running.
    if(err) throw err;
});

// Use express and auto-parse JSON
const app = express();
app.use(express.json());

// Other route files
app.use(teapot);

// Allow query to be called asynchronously
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
    } catch(err) {
        log.error(err);
    }

    return valid;
}

// Log the port to the console.
app.listen(
    PORT,
    () => log.info(`API is live on port: ${PORT}`)
);