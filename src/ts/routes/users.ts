// Module imports
import express from 'express';

// Named imports
import { UserId } from './lib/types';
import { validate } from './lib/validation';
import { query } from './lib/queries';

/**
 * Handles user info routes, like getting/adding stock data.
 */
const router = express.Router();

router.get('/get-stocks/', async (req, res) => {
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
    if(!valid) {
        res.status(401).send({
            message: "Could not validate key!"
        }).end();
    } else {
        let response = await query(`SELECT symbol, amount FROM stocks WHERE user_id = ${id[0].user_id}`);

        res.status(200).send({
            response,
            message: "Successfully acquired data!"
        });
    }
});

router.post('/add-stock/', (req, res) => {

});

export default router;