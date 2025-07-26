const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get chat history for a user
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Message.find({ user: req.user.id }).sort({ date: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
