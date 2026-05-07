const mongoose = require('mongoose');

const integrityEventSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing username as per project convention
        required: true
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    eventType: {
        type: String,
        enum: ['TAB_SWITCH', 'FACE_MISSING', 'MULTIPLE_FACES', 'STRESS_SPIKE', 'COPY_PASTE'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    integrityImpact: {
        type: Number,
        required: true
    },
    explanationText: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('IntegrityEvent', integrityEventSchema);
