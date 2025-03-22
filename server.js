const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Needed to resolve file paths

const app = express();
const PORT = 3000;

let highScore = 0; // Temporary in-memory storage

// Middleware for body parsing and CORS
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the high score
app.get('/highscore', (req, res) => {
    res.json({ highScore });
});

// Endpoint to update the high score
app.post('/highscore', (req, res) => {
    const { newHighScore } = req.body;
    if (newHighScore > highScore) {
        highScore = newHighScore;
    }
    res.json({ highScore });
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
