const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  ats_score: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  missing_keywords: {
    type: [String],
    default: [],
  },
  overall_feedback: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
