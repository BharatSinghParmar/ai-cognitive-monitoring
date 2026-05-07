const mongoose = require('mongoose');
const responseSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answerIndex: { type: Number },          // For multiple-choice answers (index)
  descriptiveAnswer: { type: String },    // For descriptive answers (text)
  similarity: { type: Number },           // Semantic similarity for descriptive questions
  plagiarism: { type: Number }            // Plagiarism score for individual response
});

const examResponseSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: String, required: true },
  responses: [responseSchema],
  plagiarismScore: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  // Stress and Proctoring Data
  stressLevel: { type: String, enum: ['Normal', 'High', 'Extreme'], default: 'Normal' },
  stressTimeline: [{
    timestamp: { type: Date, default: Date.now },
    visualScore: { type: Number, default: 0 },
    voiceScore: { type: Number, default: 0 },
    typingScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 }
  }],
  stressSummary: {
    visualAvg: { type: Number, default: 0 },
    voiceAvg: { type: Number, default: 0 },
    typingAvg: { type: Number, default: 0 },
    overallAvg: { type: Number, default: 0 },
    visualPeak: { type: Number, default: 0 },
    voicePeak: { type: Number, default: 0 },
    typingPeak: { type: Number, default: 0 }
  },
  warningCount: { type: Number, default: 0 },
  isAutoSubmitted: { type: Boolean, default: false },
  // Integrity Metrics
  integrityScore: { type: Number, default: 100 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  // New Analytics
  performanceScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('ExamResponse', examResponseSchema);
