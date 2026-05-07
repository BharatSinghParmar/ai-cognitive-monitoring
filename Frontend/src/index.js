// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';  // Use this import for React 18+
import './styles.css';
import App from './App';

// Create the root element using ReactDOM.createRoot()
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use root.render() instead of ReactDOM.render()
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
