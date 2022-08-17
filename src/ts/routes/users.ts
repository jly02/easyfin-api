// Module imports
import express from 'express';

// Named imports
import { validate, getId } from './lib/validation';
import { query } from './lib/queries';

/**
 * Handles user info routes, like getting/adding stock data.
 */
const router = express.Router();

/**
 * Results in a JSON string containing all of the stocks a particular user has,
 * and their quantities.
 */
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
    let id: number = await getId(username);
    if(!id) {
        res.status(404).send({
            valid: false,
            message: "User not found!"
        }).end();

        return;
    }

    // Validate API key
    let valid: boolean = await validate(id, key);
    if(!valid) {
        res.status(401).send({
            message: "Could not validate key!"
        }).end();
    } else {
        let response = await query(`SELECT symbol, amount FROM stocks WHERE user_id = ${id}`);

        res.status(200).send({
            response,
            message: "Successfully acquired data!"
        });
    }
});

/**
 * Handles adding a stock to a user's account.
 */
router.post('/add-stock/', async (req, res) => {
    const { username, symbol, amount }: { username: string, symbol: string, amount: number } = req.body;

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
    let id: number = await getId(username);
    if(!id) {
        res.status(404).send({
            valid: false,
            message: "User not found!"
        }).end();

        return;
    }

    // Validate API key
    let valid: boolean = await validate(id, key);
    if(!valid) {
        res.status(401).send({
            message: "Could not validate key!"
        }).end();
    } else {
        let response = await query(`INSERT INTO stocks VALUES('${id}', '${symbol}', ${amount})`);

        res.status(200).send({
            response,
            message: "Successfully added data!"
        });
    }
});

/**
 * Removes a stock from a user's account.
 */
router.delete('/remove-stock/', async (req, res) => {
    const { username, symbol }: { username: string, symbol: string } = req.body;

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
    let id: number = await getId(username);
    if(!id) {
        res.status(404).send({
            valid: false,
            message: "User not found!"
        }).end();

        return;
    }

    // Validate API key
    let valid: boolean = await validate(id, key);
    if(!valid) {
        res.status(401).send({
            message: "Could not validate key!"
        }).end();
    } else {
        let response = await query(`DELETE FROM stocks WHERE user_id = ${id} AND symbol = '${symbol}'`);

        res.status(200).send({
            response,
            message: "Successfully removed data!"
        });
    }
});

export default router;