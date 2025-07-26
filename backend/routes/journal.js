const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Entry = require('../models/Entry');
const axios = require('axios');

// Crisis detection keywords (simple example - a real app would use a more sophisticated model)
const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'can't go on', 'hopeless',
    'worthless', 'self-harm', 'cut myself', 'die', 'no reason to live'
];

function detectCrisis(text) {
    const lowerText = text.toLowerCase();
    for (const keyword of crisisKeywords) {
        if (lowerText.includes(keyword)) {
            return true;
        }
    }
    return false;
}

// Add a journal entry
router.post(
    '/',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { text } = req.body;

        try {
            // Sentiment Analysis (using a placeholder for Hugging Face API)
            const sentimentResponse = await axios.post('https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment', 
                { inputs: text },
                { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
            );
            const sentiment = sentimentResponse.data[0][0].label; 

            // Mood Extraction (simplified)
            const mood = 'neutral'; // This would be more complex in a real app

            // Crisis Detection
            const crisisDetected = detectCrisis(text);

            const newEntry = new Entry({
                user: req.user.id,
                text,
                sentiment,
                mood,
                crisisDetected, // Save crisis detection status
            });

            const entry = await newEntry.save();
            res.json(entry);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Get all journal entries for a user
router.get('/', auth, async (req, res) => {
    try {
        const entries = await Entry.find({ user: req.user.id }).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
