// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import ExamResponses from "./pages/ExamResponses";
import ManualReview from "./pages/ManualReview";
import StartExam from "./pages/StartExam";
import ProfilePage from "./pages/ProfilePage";
import CreateExam from "./pages/CreateExam";
import MyExams from "./pages/MyExams";
import RegisterPage from "./pages/RegisterPage";
import UserTypeSelection from "./pages/UserTypeSelection";

// Training Section
import TrainingHub from "./pages/TrainingHub";
import TrainingSession from "./pages/TrainingSession";
import TrainingReport from "./pages/TrainingReport";

import "./styles.css";

const App = () => {
  return (
    <Router>
      {/* top nav on every page */}
      <NavBar />

      <div className="app-container">
        <Routes>
          {/* Landing / user‑type selection */}
          <Route path="/" element={<UserTypeSelection />} />

          {/* Login Pages */}
          <Route path="/login/student" element={<LoginPage userType="student" />} />
          <Route path="/login/admin" element={<LoginPage userType="admin" />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Exam Responses & Manual Review */}
          <Route path="/exam-responses" element={<ExamResponses />} />
          <Route path="/manual-review/:responseId" element={<ManualReview />} />

          {/* Registration */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Start Exam – now takes an :examId param */}
          <Route path="/start-exam/:examId" element={<StartExam />} />

          {/* Other Pages */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/my-exams" element={<MyExams />} />

          {/* Training Section */}
          <Route path="/training" element={<TrainingHub />} />
          <Route path="/training/session" element={<TrainingSession />} />
          <Route path="/training/report" element={<TrainingReport />} />
        </Routes>
      </div>

      {/* global footer */}
      <Footer />
    </Router>
  );
};

export default App;
