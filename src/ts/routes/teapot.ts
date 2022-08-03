import express from 'express';
import path from 'path';

const router = express.Router();

/**
 * I'm a teapot.
 */
router.get('/418/', (req, res) => { 
    res.status(418).sendFile('src/html/teapot.html', {root: path.dirname(path.dirname(__dirname))});
});

/**
 * Teapot styling.
 */
router.get('/assets/teapot.css', (req, res) => {
    res.status(200).sendFile('src/assets/css/teapot.css', {root: path.dirname(path.dirname(__dirname))});
});

/**
 * Teapot picture.
 */
router.get('/assets/teapot.png', (req, res) => {
    res.status(200).sendFile('src/assets/img/teapot.png', {root: path.dirname(path.dirname(__dirname))});
});

export default router;