require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();

// Ensure temporary uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created temporary uploads directory');
}

// Middleware
app.use(cors({
  origin: '*', // We can restrict this in production (e.g. process.env.CLIENT_URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging middleware for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// Serve static assets if in production (optional hook)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ResumeAI API Services' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  
  // Clean up any uploaded file if error occurs and file is still present
  if (req.file && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
      console.log(`Cleaned up uploaded file after request error: ${req.file.path}`);
    } catch (unlinkErr) {
      console.error('Error cleaning up file after error:', unlinkErr);
    }
  }

  // Set appropriate status code (default to 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred',
  });
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume_analyzer';

console.log('Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB successfully connected!');
    app.listen(PORT, () => {
      console.log(`Server is running in active state on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB database connection failure:', err);
    process.exit(1);
  });
