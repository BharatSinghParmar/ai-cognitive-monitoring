const express = require('express');
const router = express.Router();
const User = require('../models/usermodel.js');

// Helper function to compute Euclidean distance between two arrays
const euclideanDistance = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
};

// Registration endpoint: Save new user with face descriptor and role
router.post('/register', async (req, res) => {
  try {
    const { username, password, faceDescriptor, role } = req.body;
    console.log(`[USER REGISTER] Attempting to register user: ${username}, role: ${role}`);

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.warn(`[USER REGISTER] Username already exists: ${username}`);
      return res.status(409).json({ error: 'Username already taken. Please choose another one.' });
    }

    // Create a new user with the provided role, defaulting to 'student'
    const user = new User({
      username,
      password,
      faceDescriptor,
      role: role || 'student'
    });
    await user.save();
    console.log(`[USER REGISTER] Success: ${username}`);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(`[USER REGISTER] Error: ${error.message}`);
    res.status(400).json({ error: 'Registration failed: ' + error.message });
  }
});

/**
 * Login endpoint: 
 *   /api/users/login/:role
 *   Expects body: { username, password, faceDescriptor }
 *   Checks that user.role === :role
 */
router.post('/login/:role', async (req, res) => {
  try {
    const { username, password, faceDescriptor } = req.body;
    const { role } = req.params; // 'admin' or 'student'
    console.log(`[USER LOGIN] Attempting login for: ${username}, role: ${role}`);

    // 1. Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.warn(`[USER LOGIN] User not found: ${username}`);
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // 2. Check password
    if (user.password !== password) {
      console.warn(`[USER LOGIN] Invalid password for: ${username}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // 3. Check role
    if (user.role !== role) {
      console.warn(`[USER LOGIN] Role mismatch for: ${username}. Expected: ${role}, Actual: ${user.role}`);
      return res.status(403).json({ success: false, message: 'Unauthorized for this role.' });
    }

    // 4. Check face descriptor
    if (!user.faceDescriptor || !faceDescriptor) {
      console.warn(`[USER LOGIN] Face data missing for: ${username}`);
      return res.status(400).json({ success: false, message: 'Face data missing.' });
    }
    const distance = euclideanDistance(user.faceDescriptor, faceDescriptor);
    const threshold = 0.6; // adjust threshold as needed
    if (distance > threshold) {
      console.warn(`[USER LOGIN] Face auth failed for: ${username}, distance: ${distance}`);
      return res.status(401).json({ success: false, message: 'Face authentication failed.' });
    }

    // If all checks pass, login is successful
    console.log(`[USER LOGIN] Success: ${username}`);
    res.json({ success: true, message: 'Login successful.' });
  } catch (error) {
    console.error(`[USER LOGIN] Server Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
