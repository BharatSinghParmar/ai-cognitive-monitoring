const express = require("express");
const router = express.Router();
const TrainingSession = require("../models/trainingSessionModel");
const trainingQuestions = require("../questionBank/trainingQuestions.json");

// POST /api/training/start
router.post("/start", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const session = new TrainingSession({
            userId,
            currentQuestionIndex: 0,
            questionHistory: [],
            masteryMap: {}
        });

        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/training/next-question
router.post("/next-question", async (req, res) => {
    try {
        const { sessionId, lastAnswerCorrect, stressLevel, timeTaken } = req.body;
        const session = await TrainingSession.findById(sessionId);

        if (!session) return res.status(404).json({ error: "Session not found" });
        if (session.isCompleted) return res.status(400).json({ error: "Session already completed" });

        // Update session with last result if exists
        if (session.currentQuestionIndex > 0) {
            const lastQ = session.questionHistory[session.questionHistory.length - 1];
            lastQ.isCorrect = lastAnswerCorrect;
            lastQ.timeTaken = timeTaken;
            lastQ.stressLevel = stressLevel;

            // Update masteryMap
            const currentMastery = session.masteryMap.get(lastQ.topic) || 0;
            session.masteryMap.set(lastQ.topic, lastAnswerCorrect ? currentMastery + 1 : Math.max(0, currentMastery - 1));

            session.stressTrend.push({ stressLevel });
            await session.save();
        }

        if (session.currentQuestionIndex >= session.maxQuestions) {
            return res.json({ isCompleted: true });
        }

        // Adaptive Logic for Next Question
        let targetDifficulty = 1;
        if (session.questionHistory.length > 0) {
            const lastQ = session.questionHistory[session.questionHistory.length - 1];
            targetDifficulty = lastQ.difficulty;

            if (lastAnswerCorrect) targetDifficulty = Math.min(5, targetDifficulty + 1);
            else targetDifficulty = Math.max(1, targetDifficulty - 1);

            // Stress-aware pacing: If high stress, force lower difficulty
            if (stressLevel > 60) {
                targetDifficulty = Math.max(1, targetDifficulty - 1);
            }
        }

        // Topic Rotation: Find topics least recently used or with lowest mastery
        const usedIds = session.questionHistory.map(h => h.questionId);

        // Filter questions by difficulty and those not used
        let candidates = trainingQuestions.filter(q => q.difficulty === targetDifficulty && !usedIds.includes(q.id));

        // Fallback if no exact difficulty match
        if (candidates.length === 0) {
            candidates = trainingQuestions.filter(q => !usedIds.includes(q.id));
        }

        if (candidates.length === 0) {
            return res.json({ isCompleted: true, message: "Question bank exhausted" });
        }

        const nextQ = candidates[Math.floor(Math.random() * candidates.length)];

        // Update history with placeholder for current question
        session.questionHistory.push({
            questionId: nextQ.id,
            topic: nextQ.topic,
            difficulty: nextQ.difficulty
        });
        session.currentQuestionIndex += 1;
        await session.save();

        res.json({
            question: nextQ,
            currentQuestionIndex: session.currentQuestionIndex,
            totalQuestions: session.maxQuestions
        });

    } catch (error) {
        console.error("Next Question Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/training/complete
router.post("/complete", async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await TrainingSession.findById(sessionId);

        if (!session) return res.status(404).json({ error: "Session not found" });

        const correctCount = session.questionHistory.filter(h => h.isCorrect).length;
        session.accuracy = (correctCount / session.maxQuestions) * 100;

        const validTimes = session.questionHistory.filter(h => h.timeTaken).map(h => h.timeTaken);
        session.avgTimePerQuestion = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;

        session.isCompleted = true;
        session.completedAt = new Date();
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/training/report/:userId
router.get("/report/:userId", async (req, res) => {
    try {
        const latestSession = await TrainingSession.findOne({ userId: req.params.userId, isCompleted: true })
            .sort({ completedAt: -1 });

        if (!latestSession) return res.status(404).json({ error: "No training reports found" });

        // Generate Action Plan (Logic)
        const topicAccuracy = {};
        latestSession.questionHistory.forEach(h => {
            if (!topicAccuracy[h.topic]) topicAccuracy[h.topic] = { correct: 0, total: 0 };
            topicAccuracy[h.topic].total++;
            if (h.isCorrect) topicAccuracy[h.topic].correct++;
        });

        const weakTopics = Object.keys(topicAccuracy).filter(t => (topicAccuracy[t].correct / topicAccuracy[t].total) < 0.6);
        const hotspots = latestSession.questionHistory.filter(h => h.stressLevel > 70).map(h => h.topic);

        const actionPlan = [];
        if (weakTopics.length > 0) actionPlan.push(`Focus on foundational drills for: ${weakTopics.join(", ")}`);
        if (hotspots.length > 0) actionPlan.push(`Practice stress-reduction techniques during ${hotspots[0]} challenges`);
        if (latestSession.avgTimePerQuestion > 20) actionPlan.push("Work on rapid mental processing to reduce time-per-question");

        res.json({
            session: latestSession,
            analytics: {
                weakTopics,
                hotspots: [...new Set(hotspots)],
                actionPlan
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
