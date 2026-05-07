// src/pages/ExamResponses.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const ExamResponses = () => {
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/exam-responses');
        setResponses(res.data);
      } catch (err) {
        console.error(err);
        setError('Error fetching exam responses.');
      }
    };
    fetchResponses();
  }, []);

  // Filter and sort (simple client-side approach)
  const getFilteredSortedResponses = () => {
    let temp = [...responses];
    if (filterText) {
      temp = temp.filter((r) =>
        (r.studentId && r.studentId.toLowerCase().includes(filterText.toLowerCase())) ||
        (r.examId && r.examId.toLowerCase().includes(filterText.toLowerCase()))
      );
    }
    temp.sort((a, b) => {
      const dateA = new Date(a.submittedAt);
      const dateB = new Date(b.submittedAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return temp;
  };

  const filteredResponses = getFilteredSortedResponses();

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Student Username,Exam ID,Submission Time,Plagiarism Score,Score\n";

    filteredResponses.forEach(response => {
      const {
        studentId = "",
        examId = "",
        submittedAt = null,
        plagiarismScore,
        score
      } = response;
      const submissionTime = submittedAt
        ? new Date(submittedAt).toLocaleString()
        : "N/A";
      const scoreVal = score !== undefined && score !== null ? score : "N/A";
      const plagiarismVal = plagiarismScore !== undefined && plagiarismScore !== null ? plagiarismScore : "N/A";
      csvContent += `"${studentId}","${examId}","${submissionTime}","${plagiarismVal}","${scoreVal}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exam_responses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="responses-container">
      <div className="responses-content">
        <h2>Exam Responses</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="filter-sort-container">
          <input
            type="text"
            placeholder="Search by student or exam"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          <button className="export-btn" onClick={exportCSV}>Export CSV</button>
        </div>
        {filteredResponses.length === 0 ? (
          <p>No responses available at this time.</p>
        ) : (
          <table className="responses-table">
            <thead>
              <tr>
                <th>Student Username</th>
                <th>Exam ID</th>
                <th>Submission Time</th>
                <th>Stress Level</th>
                <th>Warnings</th>
                <th>Plagiarism Score</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.map((response) => (
                <tr key={response._id}>
                  <td>{response.studentId}</td>
                  <td>{response.examId}</td>
                  <td>{new Date(response.submittedAt).toLocaleString()}</td>
                  <td>
                    <span className={`stress-badge ${response.stressLevel?.toLowerCase()}`}>
                      {response.stressLevel || 'Normal'}
                    </span>
                  </td>
                  <td>{response.warningCount || 0}</td>
                  <td>{response.plagiarismScore ?? 'N/A'}</td>
                  <td>{response.score ?? 'N/A'}</td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() => navigate(`/manual-review/${response._id}`)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExamResponses;
