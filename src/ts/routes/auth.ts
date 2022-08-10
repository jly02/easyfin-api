// Module imports
import express from 'express';
import md5 from 'md5';
import mysql from 'mysql';
import util from 'util';

// Named imports
import { ValidRes, UserId } from './lib/types';
import { Logger } from 'tslog';

// Authorization-related logs
const log: Logger = new Logger({ name: "authLog" });

/**
 * Handles authorization-related routes.
 */
const router = express.Router();

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

/**
 * Needs JSON body to contain requested username, and if possible will generate a new API key.
 */
router.post('/update-users/', async (req, res) => {
    const { username } = req.body;

    if(!username) {
        res.status(400).send({
            message: "Username is required!"
        }).end();
    }

    con.query(`INSERT INTO users(user_name) VALUES('${username}')`, async (err, result) => {
        // HTTP - 500 Internal Server Error
        if(err) {
            // 1062 is MySQL duplicate entry error number
            if(err.errno === 1062) {
                res.status(409).send({
                    message: "Username has been taken!"
                }).end();
            }

            res.status(500).send({ err }).end();
        }

        // HTTP - 200 OK
        res.status(200).send({
            result,
            message: "Username successfully registered!",
            apikey: 1
        });
    });
});

/**
 * Handles incoming requests for API validation
 */
router.get('validate', async (req, res) => {
    
})

export default router;