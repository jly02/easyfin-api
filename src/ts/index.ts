// Modules
import express from 'express';
import md5 from 'md5';
import mysql from 'mysql';
import util from 'util';
import session from 'express-session';

// Named imports
import { ValidRes, UserId } from './querytypes';
import { Logger } from 'tslog';

// URI route imports
import teapot from './routes/teapot';
import resources from './routes/resources';

// Initializing tslog logger (general log)
const log: Logger = new Logger({ name: "genLog" });

// Setting port
const PORT = process.env.PORT;

// Start SQL connection
const con = mysql.createConnection({
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

// Adding modules to app
const app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());

// Other routes
app.use(teapot);
app.use(resources);

// Allow query to be called asynchronously
const query = util.promisify(con.query).bind(con);

/**
 * Validate an api key.
 * @param {String} key the api key to be validated
 * @returns whether the key is valid
 */
const validate = async (key: string, user_name: string) => {
    // get id for given user
    const id: UserId[] = await query(`SELECT user_id FROM users WHERE user_name = '${user_name}'`);

    let valid: boolean = false;
    try {
        // wait for response from the database
        const status: ValidRes[] = await query(`SELECT keyhash FROM apikeys WHERE user_id = ${id}`);
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