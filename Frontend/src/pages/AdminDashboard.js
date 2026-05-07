// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IntegrityTimelineDashboard from '../components/IntegrityTimelineDashboard';
import PerformanceDashboard from '../components/PerformanceDashboard';
import '../styles.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [examResponses, setExamResponses] = useState([]);
  const [selectedTimeline, setSelectedTimeline] = useState(null); // {examId, studentId}
  const [selectedPerformance, setSelectedPerformance] = useState(null); // {examId, studentId}

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/exam-responses');
        setExamResponses(res.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-actions">
          <button className="action-btn" onClick={() => navigate('/create-exam')}>
            Create Exam
          </button>
          <button className="action-btn" onClick={() => navigate('/exam-responses')}>
            Exam Responses
          </button>
          <button className="action-btn" onClick={() => navigate('/profile')}>
            Profile
          </button>
        </div>

        <div className="integrity-analytics-section" style={{ marginTop: '50px', textAlign: 'left' }}>
          <h3 className="section-title">Cognitive Integrity Analytics</h3>
          <div className="integrity-summary-list">
            {examResponses.length === 0 ? (
              <p className="no-data">No session data available for analysis.</p>
            ) : (
              examResponses.map((response) => (
                <div key={response._id} className="integrity-summary-card glass">
                  <div className="student-info">
                    <strong>{response.studentId}</strong>
                    <span>Exam: {response.examId}</span>
                  </div>
                  <div className="score-info">
                    <span className="integrity-val">{response.integrityScore ?? 100}</span>
                    <span className={`risk-tag ${response.riskLevel?.toLowerCase() || 'low'}`}>
                      {response.riskLevel || 'LOW'}
                    </span>
                  </div>
                  <button
                    className="timeline-btn"
                    onClick={() => setSelectedTimeline({
                      examId: response.examId.toString(),
                      studentId: response.studentId
                    })}
                  >
                    View Timeline
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedTimeline && (
          <IntegrityTimelineDashboard
            examId={selectedTimeline.examId}
            studentId={selectedTimeline.studentId}
            onClose={() => setSelectedTimeline(null)}
          />
        )}

        <div className="performance-intelligence-section" style={{ marginTop: '50px', textAlign: 'left' }}>
          <h3 className="section-title">Performance Intelligence</h3>
          <div className="performance-summary-list">
            {examResponses.length === 0 ? (
              <p className="no-data">No performance data available.</p>
            ) : (
              examResponses.map((response) => (
                <div key={`${response._id}-perf`} className="performance-summary-card glass">
                  <div className="student-info">
                    <strong>{response.studentId}</strong>
                    <span>Productivity Audit</span>
                  </div>
                  <button
                    className="performance-btn"
                    onClick={() => setSelectedPerformance({
                      examId: response.examId.toString(),
                      studentId: response.studentId
                    })}
                  >
                    View Performance Report
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedPerformance && (
          <PerformanceDashboard
            examId={selectedPerformance.examId}
            studentId={selectedPerformance.studentId}
            onClose={() => setSelectedPerformance(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;