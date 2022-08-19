// Module imports
import md5 from 'md5';

// Named imports
import { query } from './queries';
import { ValidRes, UserId } from './types';
import { Logger } from 'tslog';

const log: Logger = new Logger({ name: "authLog" });

/**
 * Gets the user ID attached to a given username.
 * 
 * @param {string} username the username to find the related id for
 * @returns the user id
 */
export const getId = async (username: string): Promise<number> => {
    // Look for user in database
    let id: UserId[] = await query(`SELECT user_id FROM users WHERE user_name = '${username}'`);
    if(!id[0]) {
        return;
    }

    return id[0].user_id;
}

/**
 * Validate an api key.
 * 
 * @param {number} id the user's unique ID
 * @param {string} key the api key to be validated
 * @returns whether the key is valid for the given user
 */
export const validate = async (id: number, key: string): Promise<boolean> => {
    let valid: boolean;
    try {
        // wait for response from the database
        const status: ValidRes[] = await query(`SELECT keyhash FROM apikeys WHERE user_id = ${id}`);
        // check hashes
        valid = (status[0].keyhash === md5(key));
    } catch(err) {
        log.error(err);
    }

    return valid;
}