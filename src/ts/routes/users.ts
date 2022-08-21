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
router.get('/get-stocks/:username', async (req, res) => {
    const { username }: { username: string } = req.params;

    // Look for 'Authorization' header, which holds a user's unique API key.
    let key: string = req.header('Authorization');

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
router.post('/add-stock/:username', async (req, res) => {
    const { symbol, amount }: { symbol: string, amount: number } = req.body;
    const { username }: { username: string } = req.params;

    // Look for 'Authorization' header, which holds a user's unique API key.
    let key: string = req.header('Authorization');

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
router.delete('/remove-stock/:username', async (req, res) => {
    const { username }: { username: string } = req.params;

    // Look for 'Authorization' and 'Symbol' header, which holds a user's unique API key, and
    // the name of the stock they want to remove.
    let key: string = req.header('Authorization');
    let symbol: string = req.header('Symbol');

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