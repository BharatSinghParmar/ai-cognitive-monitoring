// src/pages/LoginPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceCapture from '../components/FaceCapture';
import '../styles.css';

const LoginPage = ({ userType = 'student' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [faceCaptured, setFaceCaptured] = useState(false);
  const navigate = useNavigate();

  // Create a ref to trigger the capture function in FaceCapture
  const faceCaptureRef = useRef(null);

  // Callback from FaceCapture to get the face descriptor
  const handleFaceCapture = (descriptor) => {
    if (descriptor && descriptor.length > 0) {
      setFaceDescriptor(descriptor);
      setFaceCaptured(true);
      setError('');
    } else {
      setFaceCaptured(false);
      setError('Face capture failed. Please try again.');
    }
  };

  // Function to trigger face capture from the FaceCapture component
  const triggerCapture = async () => {
    if (faceCaptureRef.current && faceCaptureRef.current.captureFace) {
      await faceCaptureRef.current.captureFace();
    }
  };

  // Handle form submission by sending credentials and face descriptor to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceCaptured) {
      setError('Please capture your face for authentication.');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5001/api/users/login/${userType}`, {
        username,
        password,
        faceDescriptor,
      });

      if (res.data.success) {
        // Store the username in localStorage upon successful login
        localStorage.setItem('username', username);
        alert('Login successful!');

        // Use the role returned by the backend if available, otherwise fallback to userType prop
        const userRole = res.data.user ? res.data.user.role : userType;
        console.log("User role from response:", userRole);

        if (userRole === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error("🚨 Login error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Unable to login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {userType === 'admin' ? 'Admin Login' : 'Student Login'}
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>
          {/* Render FaceCapture without its own button */}
          <FaceCapture onCapture={handleFaceCapture} ref={faceCaptureRef} />

          {/* Custom Capture Face Button */}
          <button
            type="button"
            className="capture-btn"
            onClick={triggerCapture}
          >
            <i className="fas fa-camera"></i> Capture Face
          </button>

          {faceCaptured ? (
            <p className="success-message">✅ Face captured successfully!</p>
          ) : (
            <p className="error-message">⚠ Capture your face before logging in.</p>
          )}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn" disabled={!faceCaptured}>
            Login
          </button>
        </form>
        {/* Registration link for new users */}
        <div className="register-link">
          <p>
            New user?{' '}
            <span onClick={() => navigate('/register')} className="link-text">
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
