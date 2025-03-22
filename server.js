const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg'); // Import Postgres client

const app = express();
const PORT = process.env.PORT || 3000;

// Postgres connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Heroku Postgres
    },
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the root route with index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to get the current high score
app.get('/highscore', async (req, res) => {
    try {
        const result = await pool.query('SELECT value FROM high_score LIMIT 1');
        const highScore = result.rows.length > 0 ? result.rows[0].value : 0;
        res.json({ highScore });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching high score' });
    }
});

// Endpoint to update the high score
app.post('/highscore', async (req, res) => {
    const { newHighScore } = req.body;

    try {
        // Check the current high score
        const result = await pool.query('SELECT value FROM high_score LIMIT 1');
        const currentHighScore = result.rows.length > 0 ? result.rows[0].value : 0;

        if (newHighScore > currentHighScore) {
            if (result.rows.length > 0) {
                // Update the high score
                await pool.query('UPDATE high_score SET value = $1', [newHighScore]);
            } else {
                // Insert the high score for the first time
                await pool.query('INSERT INTO high_score (value) VALUES ($1)', [newHighScore]);
            }
        }

        res.json({ highScore: Math.max(newHighScore, currentHighScore) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating high score' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
