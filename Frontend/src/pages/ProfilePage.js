import React, { useEffect, useState } from 'react';
import '../styles.css';

const ProfilePage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // If no username is found, redirect to login (or handle as needed)
      window.location.href = '/';
    } else {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-main">
          <h2>Your Profile</h2>
          {/* Display the actual username instead of a hardcoded value */}
          <p><strong>Username:</strong> {username}</p>
          {/* Removed the email field entirely */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
