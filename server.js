const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Heroku dynamically assigns a port, so we use process.env.PORT
const PORT = process.env.PORT || 3000;

// In-memory high score (for now)
let highScore = 0;

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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
