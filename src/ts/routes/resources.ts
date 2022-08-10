import express from 'express';
import path from 'path';

const router = express.Router();

/**
 * Display login page
 */
router.get('/getkey/', (req, res) => { 
    res.status(200).sendFile('src/pages/getkey.html', {root: path.dirname(path.dirname(__dirname))});
});

/**
 * Route for getting genkey JavaScript file
 */
router.get('/scripts/genkey.ts', (req, res) => {
    res.status(200).sendFile('dist/scripts/genkey.js', {root: path.dirname(path.dirname(path.dirname(__dirname)))});
});

export default router;