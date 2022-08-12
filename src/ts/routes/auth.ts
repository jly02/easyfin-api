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
 * 
 * @param {number} id the user's unique ID
 * @param {string} key the api key to be validated
 * @returns whether the key is valid for the given user
 */
const validate = async (id: number, key: string): Promise<boolean> => {
    let valid: boolean;
    try {
        // wait for response from the database
        const status: ValidRes[] = await query(`SELECT keyhash FROM apikeys WHERE user_id = ${id}`);
        // check hashes
        valid = (status[0].keyhash === md5(key));
        log.info(status);
        log.info(status[0].keyhash);
        log.info(md5(key));
    } catch(err) {
        log.error(err);
    }

    return valid;
}

/**
 * Generates a random 16-byte API key.
 */
const genkey = async (): Promise<string> => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;

    // Need to re-generate a key if its already been generated before.
    let dup: ValidRes[];
    do {
        for(let i = 0; i < 16; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        dup = await query(`SELECT keyhash FROM apikeys WHERE keyhash = '${md5(result)}'`);
    } while(dup[0]);

    return result;
}

/**
 * Needs JSON body to contain requested username, and if possible will generate a new API key.
 */
router.post('/update-users/', async (req, res) => {
    const { username }: { username: string } = req.body;

    log.info(username);

    if(!username) {
        res.status(400).send({
            message: "Username is required!"
        }).end();

        return;
    }

    con.query(`INSERT INTO users(user_name) VALUES('${username}')`, async (err, result) => {
        if(err) {
            // 1062 is MySQL duplicate entry error number
            if(err.errno === 1062) {
                res.status(409).send({
                    message: "Username has been taken!"
                }).end();
            }

            // HTTP - 500 Internal Server Error (other unknown errors)
            res.status(500).send({ err }).end();
        }

        // Update apikeys table
        let apikey: string = await genkey();
        let id: UserId[] = await query(`SELECT user_id FROM users WHERE user_name = '${username}'`);
        await query(`INSERT INTO apikeys VALUES(${id[0].user_id}, '${md5(apikey)}')`);

        // HTTP - 200 OK
        res.status(200).send({
            result,
            message: "Username successfully registered!",
            apikey
        });
    });
});

/**
 * Handles incoming requests for API validation
 */
router.post('/test-login/', async (req, res) => {
    const { username }: { username: string } = req.body;

    // Look for 'Authorization' header, which holds a user's unique API key.
    let key: string;
    try {
        key = req.header('Authorization');
    } catch(error) {
        // HTTP - 401 Unauthorized
        res.status(401).send({
            error,
            valid: false,
            message: "missing header token"
        }).end();

        return;
    }

    // Look for user in database
    let id: UserId[] = await query(`SELECT user_id FROM users WHERE user_name = '${username}'`);
    if(!id[0]) {
        res.status(404).send({
            valid: false,
            message: "User not found!"
        }).end();

        return;
    }

    // Validate API key
    let valid: boolean = await validate(id[0].user_id, key);
    let statCode: number = valid ? 200 : 401;
    res.status(statCode).send({
        valid
    });
})

export default router;