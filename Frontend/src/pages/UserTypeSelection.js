// src/pages/UserTypeSelection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleStudentClick = () => {
    navigate('/login/student');
  };

  const handleAdminClick = () => {
    navigate('/login/admin');
  };

  return (
    <div className="user-type-page">
      <div className="user-type-container">
        <div className="user-type-card" onClick={handleStudentClick}>
          <h2>Student</h2>
        </div>
        <div className="user-type-card" onClick={handleAdminClick}>
          <h2>Admin</h2>
        </div>
      </div>

      <div className="about-us">
        <h3>About Us</h3>
        <p>
          Welcome to the AI‑Based Proctored Examination Portal—your secure, user‑friendly platform
          for creating and taking exams online.  Our system combines face recognition, behavior
          monitoring, and automated grading to ensure integrity and ease for both students and administrators.
        </p>
      </div>
    </div>
  );
};

export default UserTypeSelection;
