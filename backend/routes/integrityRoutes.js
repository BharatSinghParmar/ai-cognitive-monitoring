const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const IntegrityEvent = require('../models/integrityEventModel');

/**
 * @route POST /api/integrity/log-event
 * @desc Logs a single integrity risk event
 */
router.post('/log-event', async (req, res) => {
    try {
        const { userId, examId, eventType, severity, integrityImpact, explanationText } = req.body;
        console.log(`[INTEGRITY LOG] Type: ${eventType}, User: ${userId}, Exam: ${examId}`);

        const newEvent = new IntegrityEvent({
            userId,
            examId,
            eventType,
            severity,
            integrityImpact,
            explanationText
        });

        await newEvent.save();
        res.status(201).json({ success: true, message: 'Integrity event logged', event: newEvent });
    } catch (error) {
        console.error('Error logging integrity event:', error);
        res.status(500).json({ success: false, message: 'Server error logging event' });
    }
});

/**
 * @route GET /api/integrity/timeline/:examId/:userId
 * @desc Returns full integrity timeline for a specific student and exam
 */
router.get('/timeline/:examId/:userId', async (req, res) => {
    try {
        const { examId, userId } = req.params;

        const query = {
            examId: new mongoose.Types.ObjectId(examId),
            userId
        };
        const timeline = await IntegrityEvent.find(query)
            .sort({ timestamp: 1 }); // Sorted by timestamp ascending

        res.status(200).json({ success: true, timeline });
    } catch (error) {
        console.error('Error fetching integrity timeline:', error);
        res.status(500).json({ success: false, message: 'Server error fetching timeline' });
    }
});

module.exports = router;
