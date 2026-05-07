// src/pages/RegisterPage.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FaceCapture from '../components/FaceCapture';
import '../styles.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is student
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const faceCaptureRef = useRef(null);

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

  const triggerCapture = async () => {
    if (faceCaptureRef.current && faceCaptureRef.current.captureFace) {
      await faceCaptureRef.current.captureFace();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceCaptured) {
      setError('Please capture your face before registering.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5001/api/users/register', {
        username,
        password,
        faceDescriptor,
        role, // include the selected role
      });

      if (res.data.message) {
        setMessage(res.data.message);
        // After showing the success message, redirect based on role after a short delay
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/login/admin');
          } else {
            navigate('/login/student');
          }
        }, 2000); // 2-second delay; adjust as needed
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {/* Role selection dropdown */}
          <div className="dropdown-container">
            <label htmlFor="role">Select Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="" disabled>Select your role</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* FaceCapture component with ref */}
          <FaceCapture onCapture={handleFaceCapture} ref={faceCaptureRef} />

          {/* Custom Capture Face Button */}
          <button type="button" className="capture-btn" onClick={triggerCapture}>
            <i className="fas fa-camera"></i> Capture Face
          </button>

          {faceCaptured ? (
            <p className="success-message">✅ Face captured successfully!</p>
          ) : (
            <p className="error-message">⚠ Capture your face before registering.</p>
          )}

          {error && <p className="error-message">{error}</p>}
          {message && <p className="message">{message}</p>}

          <button type="submit" className="register-btn" disabled={!faceCaptured}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
