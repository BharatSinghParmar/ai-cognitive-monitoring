const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const PerformanceSnapshot = require('../models/performanceSnapshotModel');

/**
 * @route POST /api/performance/log
 * @desc Logs a single performance snapshot for a question
 */
router.post('/log', async (req, res) => {
    try {
        const {
            userId,
            examId,
            questionId,
            topicTag,
            timeTakenSeconds,
            stressLevel,
            correctness,
            hesitationTimeSeconds
        } = req.body;
        console.log(`[PERF LOG] User: ${userId}, Exam: ${examId}, Question: ${questionId}`);

        const newSnapshot = new PerformanceSnapshot({
            userId,
            examId,
            questionId,
            topicTag,
            timeTakenSeconds,
            stressLevel,
            correctness,
            hesitationTimeSeconds
        });

        await newSnapshot.save();
        res.status(201).json({ success: true, message: 'Performance snapshot logged', snapshot: newSnapshot });
    } catch (error) {
        console.error('Error logging performance snapshot:', error);
        res.status(500).json({ success: false, message: 'Server error logging snapshot' });
    }
});

/**
 * @route GET /api/performance/report/:examId/:userId
 * @desc Returns all snapshots for a specific student and exam for analytics
 */
router.get('/report/:examId/:userId', async (req, res) => {
    try {
        const { examId, userId } = req.params;

        const query = {
            examId: new mongoose.Types.ObjectId(examId),
            userId
        };
        const snapshots = await PerformanceSnapshot.find(query)
            .sort({ timestamp: 1 });

        res.status(200).json({ success: true, snapshots });
    } catch (error) {
        console.error('Error fetching performance report:', error);
        res.status(500).json({ success: false, message: 'Server error fetching report' });
    }
});

module.exports = router;
