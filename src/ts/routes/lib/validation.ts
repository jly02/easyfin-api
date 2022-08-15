// Module imports
import md5 from 'md5';

// Named imports
import { query } from './queries';
import { ValidRes } from './types';
import { Logger } from 'tslog';

const log: Logger = new Logger({ name: "authLog" });

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