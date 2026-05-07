const mongoose = require('mongoose');

const performanceSnapshotSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing username as per project convention
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    questionId: {
        type: String, // Can be ID or question text index
        required: true
    },
    topicTag: {
        type: String,
        default: 'General'
    },
    timeTakenSeconds: {
        type: Number,
        required: true
    },
    stressLevel: {
        type: Number, // 0-100
        required: true
    },
    correctness: {
        type: Boolean,
        required: true
    },
    hesitationTimeSeconds: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PerformanceSnapshot', performanceSnapshotSchema);
