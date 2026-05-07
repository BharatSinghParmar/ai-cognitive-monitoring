const mongoose = require("mongoose");

const trainingSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    currentQuestionIndex: { type: Number, default: 0 },
    maxQuestions: { type: Number, default: 25 },
    masteryMap: {
        type: Map,
        of: Number, // topic -> score/level
        default: {}
    },
    stressTrend: [{
        timestamp: { type: Date, default: Date.now },
        stressLevel: { type: Number }
    }],
    questionHistory: [{
        questionId: { type: String },
        topic: { type: String },
        difficulty: { type: Number },
        isCorrect: { type: Boolean },
        timeTaken: { type: Number }, // seconds
        stressLevel: { type: Number }
    }],
    accuracy: { type: Number, default: 0 },
    avgTimePerQuestion: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

module.exports = mongoose.model("TrainingSession", trainingSessionSchema);
