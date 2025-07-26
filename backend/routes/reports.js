const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Entry = require('../models/Entry');
const moment = require('moment');

// Get weekly mood report
router.get('/weekly', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const endOfWeek = moment().endOf('day');
        const startOfWeek = moment().subtract(7, 'days').startOf('day');

        const entries = await Entry.find({
            user: userId,
            date: {
                $gte: startOfWeek.toDate(),
                $lte: endOfWeek.toDate(),
            },
        }).sort({ date: 1 });

        const report = {};
        const sentimentScores = {
            'very negative': -2,
            'negative': -1,
            'neutral': 0,
            'positive': 1,
            'very positive': 2,
        };

        entries.forEach(entry => {
            const day = moment(entry.date).format('YYYY-MM-DD');
            if (!report[day]) {
                report[day] = {
                    count: 0,
                    totalSentimentScore: 0,
                    moods: {},
                };
            }
            report[day].count++;
            report[day].totalSentimentScore += sentimentScores[entry.sentiment] || 0;
            report[day].moods[entry.mood] = (report[day].moods[entry.mood] || 0) + 1;
        });

        const dailyAverages = Object.keys(report).map(day => {
            const avgSentiment = report[day].totalSentimentScore / report[day].count;
            let overallSentiment = 'neutral';
            if (avgSentiment > 1) overallSentiment = 'very positive';
            else if (avgSentiment > 0.5) overallSentiment = 'positive';
            else if (avgSentiment < -1) overallSentiment = 'very negative';
            else if (avgSentiment < -0.5) overallSentiment = 'negative';

            const topMood = Object.keys(report[day].moods).reduce((a, b) => 
                report[day].moods[a] > report[day].moods[b] ? a : b
            , 'N/A');

            return {
                date: day,
                averageSentiment: overallSentiment,
                topMood,
                entryCount: report[day].count,
            };
        });

        res.json(dailyAverages);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
