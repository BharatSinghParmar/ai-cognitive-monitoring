const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['multiple_choice', 'descriptive'], 
    default: 'multiple_choice' 
  },
  // For multiple choice:
  options: [{ type: String }],
  correctAnswer: { type: Number }, // index of the correct option

  // For descriptive questions:
  referenceAnswer: { type: String }, // model answer for grading
  wordLimit: { type: Number } // maximum words allowed
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);
