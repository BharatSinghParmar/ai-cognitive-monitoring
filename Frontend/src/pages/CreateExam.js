// src/pages/CreateExam.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles.css';

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  DESCRIPTIVE: 'descriptive',
};

const CreateExam = () => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      type: QUESTION_TYPES.MULTIPLE_CHOICE, // default type
      options: ['', '', ''],
      correctAnswer: null,
      referenceAnswer: '',  // for descriptive questions
      wordLimit: 100,       // default word limit for descriptive questions
    },
  ]);
  const [message, setMessage] = useState('');

  // Handle changes for a question field
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;

    // When the type is changed to descriptive, clear multiple-choice fields
    if (field === 'type' && value === QUESTION_TYPES.DESCRIPTIVE) {
      newQuestions[index].options = [];
      newQuestions[index].correctAnswer = null;
      // Optionally, you can also clear referenceAnswer and wordLimit, or leave them as-is for editing.
    }
    
    setQuestions(newQuestions);
    console.log(`Updated question ${index}:`, newQuestions[index]);
  };

  // Handle change for options array
  const handleOptionChange = (qIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  // Handle selection of the correct answer for multiple-choice questions
  const handleCorrectAnswerSelect = (qIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  // Add a new question block
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        type: QUESTION_TYPES.MULTIPLE_CHOICE,
        options: ['', '', ''],
        correctAnswer: null,
        referenceAnswer: '',
        wordLimit: 100,
      },
    ]);
  };

  // Remove a question block
  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setMessage(`Please enter text for question ${i + 1}.`);
        return;
      }
      if (questions[i].type === QUESTION_TYPES.MULTIPLE_CHOICE) {
        if (questions[i].options.some(opt => !opt.trim())) {
          setMessage(`Please fill in all options for question ${i + 1}.`);
          return;
        }
        if (questions[i].correctAnswer === null) {
          setMessage(`Please mark a correct option for question ${i + 1}.`);
          return;
        }
      }
      if (questions[i].type === QUESTION_TYPES.DESCRIPTIVE) {
        if (!questions[i].referenceAnswer.trim()) {
          setMessage(`Please provide a reference answer for question ${i + 1}.`);
          return;
        }
      }
    }

    // Transform questions:
    // For descriptive questions, include only questionText, type, referenceAnswer, and wordLimit.
    const transformedQuestions = questions.map(q => {
      if (q.type === QUESTION_TYPES.DESCRIPTIVE) {
        return {
          questionText: q.questionText,
          type: q.type,
          referenceAnswer: q.referenceAnswer.trim() || "No reference provided",
          wordLimit: Number(q.wordLimit) || 0,
          options: []
        };
      }
      return q; // For multiple-choice, keep all fields as is.
    });

   // console.log("Transformed Questions:", transformedQuestions);

    const examData = {
      title,
      duration: Number(duration),
      questions: transformedQuestions,
    };
    console.log("Exam Data to be sent:", examData);
    
    try {
      const response = await axios.post('http://localhost:5001/api/exams/create', examData);
      setMessage('Exam created successfully!');
      // Clear form
      setTitle('');
      setDuration('');
      setQuestions([
        {
          questionText: '',
          type: QUESTION_TYPES.MULTIPLE_CHOICE,
          options: ['', '', ''],
          correctAnswer: null,
          referenceAnswer: '',
          wordLimit: 100,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessage('Error creating exam: ' + error.message);
    }
  };

  return (
    <div className="create-exam-container">
      <h2>Create New Exam</h2>
      <form onSubmit={handleSubmit} className="create-exam-form">
        <div className="form-group">
          <label>Exam Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Duration (in minutes):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <h3>Questions</h3>
        {questions.map((question, index) => (
          <div key={index} className="question-group">
            <div className="form-group">
              <label>Question Text:</label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Question Type:</label>
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
              >
                <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
                <option value={QUESTION_TYPES.DESCRIPTIVE}>Descriptive</option>
              </select>
            </div>
            {question.type === QUESTION_TYPES.MULTIPLE_CHOICE ? (
              <>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="form-group option-group">
                    <label>Option {oIndex + 1}:</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={`mark-correct-btn ${question.correctAnswer === oIndex ? 'selected' : ''}`}
                      onClick={() => handleCorrectAnswerSelect(index, oIndex)}
                    >
                      {question.correctAnswer === oIndex ? 'Correct' : 'Mark as Correct'}
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Reference Answer (for grading):</label>
                  <textarea
                    value={question.referenceAnswer}
                    onChange={(e) => handleQuestionChange(index, 'referenceAnswer', e.target.value)}
                    placeholder="Enter a model answer for reference"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Word Limit:</label>
                  <input
                    type="number"
                    value={question.wordLimit}
                    onChange={(e) => handleQuestionChange(index, 'wordLimit', e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            {questions.length > 1 && (
              <button
                type="button"
                className="remove-question-btn"
                onClick={() => removeQuestion(index)}
              >
                Remove Question
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="add-question-btn">
          Add Another Question
        </button>
        <button type="submit" className="create-exam-btn">Create Exam</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default CreateExam;
