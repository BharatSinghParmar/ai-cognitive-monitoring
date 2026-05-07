const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceDescriptor: { type: [Number], default: [] },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student' // Default role is student if not specified
  }
});

module.exports = mongoose.model('User', userSchema);
