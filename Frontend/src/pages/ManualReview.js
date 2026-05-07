// src/pages/ManualReview.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StressRadar from '../components/StressRadar';
import StressChart from '../components/StressChart';
import '../styles.css';

const ManualReview = () => {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [responseData, setResponseData] = useState(null);
  const [examData, setExamData] = useState(null);
  const [error, setError] = useState('');
  const [overrideScore, setOverrideScore] = useState('');

  // Fetch the exam response by ID
  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/exam-responses/${responseId}`);
        setResponseData(res.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching response details.');
      }
    };
    fetchResponse();
  }, [responseId]);

  // Once the response is loaded, fetch the exam details to get question texts
  useEffect(() => {
    if (responseData && responseData.examId) {
      const fetchExam = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/exams/${responseData.examId}`);
          setExamData(res.data);
        } catch (err) {
          console.error(err);
          setError('Error fetching exam details.');
        }
      };
      fetchExam();
    }
  }, [responseData]);

  // Compute marks per question (assuming total marks = 100)
  const marksPerQuestion = examData && examData.questions && examData.questions.length
    ? 100 / examData.questions.length
    : 0;

  const handleOverrideSubmit = async () => {
    try {
      // Update the response score in the backend
      const res = await axios.put(`http://localhost:5001/api/exam-responses/${responseId}`, {
        score: Number(overrideScore)
      });
      alert(`Override submitted: new score = ${overrideScore}`);
      navigate('/exam-responses');
    } catch (err) {
      console.error('Error overriding score:', err);
      setError('Failed to override score.');
    }
  };

  if (error) {
    return (
      <div className="responses-container">
        <div className="responses-content">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!responseData || !examData) {
    return (
      <div className="responses-container">
        <div className="responses-content">
          <p>Loading details...</p>
        </div>
      </div>
    );
  }

  // Create a mapping from questionId to question text and type from the exam data
  const questionMapping = {};
  examData.questions.forEach(q => {
    questionMapping[q._id] = {
      text: q.questionText,
      type: q.type
    };
  });

  // Filter only descriptive responses
  const descriptiveResponses = responseData.responses.filter(r => {
    const q = questionMapping[r.questionId];
    return q && q.type === 'descriptive';
  });

  return (
    <div className="responses-container">
      <h1 className="review-header">COGNITIVE ANALYSIS REVIEW</h1>

      <div className="responses-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0 }}>Candidate Profile</h2>
          <button onClick={() => navigate('/exam-responses')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
            Back to List
          </button>
        </div>

        <div className="review-details">
          <p><strong>Candidate:</strong> {responseData.studentId}</p>
          <p><strong>Exam Reference:</strong> {responseData.examId}</p>
          <p><strong>Session Timestamp:</strong> {new Date(responseData.submittedAt).toLocaleString()}</p>
          <p><strong>Global Stress Index:</strong> {responseData.stressLevel || 'Normal'}</p>
          <p><strong>Proctoring Alerts:</strong> {responseData.warningCount || 0}</p>
          <p><strong>Integrity Score:</strong> <span style={{ color: responseData.integrityScore < 80 ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>{responseData.integrityScore !== undefined ? `${responseData.integrityScore}%` : '100%'}</span></p>
          <p><strong>Plagiarism Average:</strong> {responseData.plagiarismScore !== undefined ? `${responseData.plagiarismScore.toFixed(1)}%` : '0%'}</p>
          <p><strong>Accuracy Score:</strong> {responseData.score ?? 0}%</p>
          <p><strong>Performance Index:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{responseData.performanceScore ?? 0}%</span></p>
        </div>

        <div style={{ marginTop: '50px' }}>
          <h3>Cognitive Profile Matrix</h3>
          <StressRadar summary={responseData.stressSummary} />
        </div>

        <div style={{ marginTop: '50px' }}>
          <h3>Sensor Analytics Table</h3>
          <table className="responses-table">
            <thead>
              <tr>
                <th>Neural Sensor</th>
                <th>Baseline Avg</th>
                <th>Peak Intensity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Visual (Face Metrics)</td>
                <td>{(responseData.stressSummary?.visualAvg ?? 0).toFixed(1)}%</td>
                <td>{(responseData.stressSummary?.visualPeak ?? 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Acoustic (Linguistic Stress)</td>
                <td>{(responseData.stressSummary?.voiceAvg ?? 0).toFixed(1)}%</td>
                <td>{(responseData.stressSummary?.voicePeak ?? 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td style={{ color: '#00d4ff', fontWeight: 'bold' }}>Kinetic (Input Dynamics)</td>
                <td>{(responseData.stressSummary?.typingAvg ?? 0).toFixed(1)}%</td>
                <td>{(responseData.stressSummary?.typingPeak ?? 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '50px' }}>
          <h3>Temporal Stress Signature</h3>
          <StressChart timeline={responseData.stressTimeline} />
        </div>

        <div style={{ marginTop: '50px' }}>
          <h3>Subjective Response Validation</h3>
          {descriptiveResponses.length === 0 ? (
            <p className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>No descriptive responses recorded.</p>
          ) : (
            descriptiveResponses.map((r, idx) => (
              <div key={idx} className="review-answer-block">
                <h4>QUERY #{idx + 1}</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>{questionMapping[r.questionId]?.text || 'N/A'}</p>
                <div className="glass" style={{ padding: '15px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                  <strong style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>CANDIDATE RESPONSE:</strong>
                  {r.descriptiveAnswer}
                </div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                  <span><strong>AI Similarity:</strong> {(r.similarity * 100).toFixed(1)}%</span>
                  <span><strong>Max Marks:</strong> {marksPerQuestion.toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="override-section-modal">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>ADJUST VALIDATED SCORE</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <input
                type="number"
                placeholder="Final Grade (0-100)"
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
              />
              <button onClick={handleOverrideSubmit}>Update Analysis</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualReview;
