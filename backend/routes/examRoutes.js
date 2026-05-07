const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Exam = require('../models/examModel');

// Ensure "/create" is explicitly defined before any dynamic routes
router.post('/create', async (req, res) => {
  try {
    // Log the incoming exam data for debugging
    console.log("Received exam data:", req.body);
    
    const exam = new Exam(req.body);
    await exam.save();
    res.status(201).json(exam.toObject());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch all exams
router.get('/', async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch a specific exam by ID, only if it's a valid MongoDB ObjectId
router.get('/:examId', async (req, res) => {
  const { examId } = req.params;

  // Validate examId format
  if (!mongoose.Types.ObjectId.isValid(examId)) {
    return res.status(400).json({ error: 'Invalid exam ID format' });
  }

  try {
    const exam = await Exam.findById(examId);
    if (exam) {
      res.json(exam);
    } else {
      res.status(404).json({ message: 'Exam not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
