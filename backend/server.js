const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const examRoutes = require('./routes/examRoutes');
const userRoutes = require('./routes/userRoutes');
const examResponseRoutes = require('./routes/examResponseRoutes');
const integrityRoutes = require('./routes/integrityRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const trainingRoutes = require('./routes/trainingRoutes');

// Mount routes
app.use('/api/exams', examRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exam-responses', examResponseRoutes);
app.use('/api/integrity', integrityRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/training', trainingRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('API is working!');
});

// MongoDB Connection (lazy connect — reuses connection across serverless invocations)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('MongoDB connected');
};
connectDB().catch((err) => console.error('MongoDB connection error:', err));

// Local dev: start server normally
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel serverless export
module.exports = app;
