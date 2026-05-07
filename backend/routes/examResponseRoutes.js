const express = require('express');
const router = express.Router();
const ExamResponse = require('../models/examResponseModel');
const Exam = require('../models/examModel'); // To get exam details for grading
const { computeSimilarity } = require('../utils/similarity');
const { computePlagiarismScore } = require('../utils/plagiarism');

router.post('/submit', async (req, res) => {
  try {
    const {
      examId,
      studentId,
      responses,
      stressLevel,
      stressTimeline,
      warningCount,
      isAutoSubmitted
    } = req.body;

    // Retrieve exam details to know question types and reference answers
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    let totalScore = 0;
    let obtainedScore = 0;
    let descriptivePlagiarismTotal = 0;
    let descriptiveCount = 0;
    const processedResponses = [];

    // Process each submitted response
    for (const response of responses) {
      // Find the matching question from the exam
      const question = exam.questions.find(q => q._id.toString() === response.questionId);
      if (!question) continue;

      totalScore += 1; // each question is worth 1 mark
      let processedResponse = { questionId: response.questionId };

      if (question.type === 'multiple_choice') {
        // Assume the student's answer is already a valid index
        const studentIndex = response.answer;
        processedResponse.answerIndex = studentIndex; // store as answerIndex
        if (Number(studentIndex) === Number(question.correctAnswer)) {
          obtainedScore += 1;
        }
      } else if (question.type === 'descriptive') {
        // For descriptive questions, store the free-text answer
        processedResponse.descriptiveAnswer = response.answer;
        if (question.referenceAnswer && response.answer) {
          // Compute similarity for grading
          const similarity = await computeSimilarity(question.referenceAnswer, response.answer);
          console.log(`Similarity for question "${question.questionText}": ${similarity}`);
          const threshold = 0.75; // adjust as needed
          if (similarity >= threshold) {
            obtainedScore += 1;
          }
          processedResponse.similarity = similarity;

          // Compute plagiarism score for this descriptive answer
          const plagiarism = await computePlagiarismScore(response.answer, question.referenceAnswer);
          processedResponse.plagiarism = plagiarism;
          descriptivePlagiarismTotal += plagiarism;
          descriptiveCount++;
        }
      }

      processedResponses.push(processedResponse);
    }

    // Calculate overall plagiarism score as average of descriptive responses
    let overallPlagiarismScore = descriptiveCount > 0 ? descriptivePlagiarismTotal / descriptiveCount : 0;

    // Increase plagiarism score if auto-submitted (proctoring penalty)
    if (isAutoSubmitted) {
      overallPlagiarismScore = Math.min(100, overallPlagiarismScore + 25); // Add 25% penalty
    }

    // Calculate stress summary
    const timeline = stressTimeline || [];
    const count = Math.max(1, timeline.length);

    const summary = {
      visualAvg: (timeline.reduce((acc, curr) => acc + (curr.visualScore || 0), 0) / count) || 0,
      voiceAvg: (timeline.reduce((acc, curr) => acc + (curr.voiceScore || 0), 0) / count) || 0,
      typingAvg: (timeline.reduce((acc, curr) => acc + (curr.typingScore || 0), 0) / count) || 0,
      overallAvg: (timeline.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / count) || 0,
      visualPeak: timeline.length > 0 ? Math.max(0, ...timeline.map(t => t.visualScore || 0)) : 0,
      voicePeak: timeline.length > 0 ? Math.max(0, ...timeline.map(t => t.voiceScore || 0)) : 0,
      typingPeak: timeline.length > 0 ? Math.max(0, ...timeline.map(t => t.typingScore || 0)) : 0
    };

    // Calculate final percentage score (Accuracy)
    const accuracyScore = totalScore > 0 ? (obtainedScore / totalScore) * 100 : 0;

    // Calculate Performance Score (Weighted Accuracy 60% + Productivity 40%)
    // Productivity is high if no warnings and low stress
    const stressPenalty = Math.max(0, (summary.overallAvg - 20) * 0.5); // Start penalizing above 20% stress
    const warningPenalty = (warningCount || 0) * 10;
    const productivityScore = Math.max(0, 100 - stressPenalty - warningPenalty);

    const performanceScore = (accuracyScore * 0.6) + (productivityScore * 0.4);

    const examResponse = new ExamResponse({
      examId,
      studentId,
      responses: processedResponses,
      plagiarismScore: overallPlagiarismScore,
      score: accuracyScore,
      stressLevel: stressLevel || 'Normal',
      stressTimeline: timeline,
      stressSummary: summary,
      warningCount: warningCount || 0,
      isAutoSubmitted: isAutoSubmitted || false,
      integrityScore: req.body.integrityScore || 100,
      riskLevel: req.body.riskLevel || 'Low',
      performanceScore: Math.round(performanceScore)
    });

    await examResponse.save();
    res.status(201).json(examResponse);
  } catch (error) {
    console.error('Exam submission error:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET all exam responses
router.get('/', async (req, res) => {
  try {
    const responses = await ExamResponse.find({});
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single exam response by ID
router.get('/:responseId', async (req, res) => {
  try {
    const response = await ExamResponse.findById(req.params.responseId);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update exam response (for override)
router.put('/:responseId', async (req, res) => {
  try {
    const { score } = req.body;
    const updatedResponse = await ExamResponse.findByIdAndUpdate(
      req.params.responseId,
      { score },
      { new: true }
    );
    if (!updatedResponse) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json(updatedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
