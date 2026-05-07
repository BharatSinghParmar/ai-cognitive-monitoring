// src/pages/MyExams.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const MyExams = () => {
  const [exams, setExams] = useState([]);
  const [attemptedIds, setAttemptedIds] = useState(new Set());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/exams');
        if (res.data && res.data.length) {
          const sorted = res.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setExams(sorted);
        } else {
          setError('No exams available.');
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Error fetching exam details.');
      }
    };
    fetchExams();
  }, []);

  // Fetch student's existing responses to mark attempted exams
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;
    const fetchResponses = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/exam-responses');
        const ids = res.data
          .filter(r => r.studentId === username)
          .map(r => r.examId);
        setAttemptedIds(new Set(ids));
      } catch (err) {
        console.error('Error fetching responses:', err);
      }
    };
    fetchResponses();
  }, []);

  const handleExamClick = (examId) => {
    if (attemptedIds.has(examId)) return;
    navigate(`/start-exam/${examId}`);
  };

  return (
    <div className="exams-container">
      <div className="exams-content">
        <h2>Available Exams</h2>
        {error && <p className="error-message">{error}</p>}
        {exams.length === 0 ? (
          <p>No exams available at this time.</p>
        ) : (
          <div className="exams-list">
            {exams.map((exam) => {
              const attempted = attemptedIds.has(exam._id);
              return (
                <div
                  key={exam._id}
                  className={`exam-card ${attempted ? 'attempted' : ''}`}
                  onClick={() => handleExamClick(exam._id)}
                >
                  <h3>{exam.title}</h3>
                  <p>Duration: {exam.duration} minutes</p>
                  {attempted && (
                    <span className="attempted-badge">Already Attempted</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExams;
