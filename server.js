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

// Endpoint to get the top 5 scores
app.get('/highscores', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, value FROM high_score ORDER BY value DESC LIMIT 5');
        const topScores = result.rows.map(row => ({ name: row.name, value: row.value }));
        res.json({ topScores });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching top scores' });
    }
});


// Endpoint to update the high score in real-time
app.post('/highscore', async (req, res) => {
    const { newScore, playerName } = req.body;

    try {
        // Add the new score with the player's name
        await pool.query('INSERT INTO high_score (name, value) VALUES ($1, $2)', [playerName, newScore]);

        // Optional: Clean up older scores to keep only the top 5
        await pool.query(`
            DELETE FROM high_score
            WHERE id NOT IN (
                SELECT id FROM high_score ORDER BY value DESC LIMIT 5
            )
        `);

        // Respond with updated top 5 scores
        const result = await pool.query('SELECT name, value FROM high_score ORDER BY value DESC LIMIT 5');
        const topScores = result.rows.map(row => ({ name: row.name, value: row.value }));
        res.json({ topScores });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating high scores' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
