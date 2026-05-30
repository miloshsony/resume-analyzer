const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  upload,
  uploadAndAnalyze,
  getHistory,
  getAllAnalysesAdmin,
  deleteAnalysis,
} = require('../controllers/analysisController');

// All routes here are protected and require JWT authentication
router.use(protect);

// Upload and analyze a PDF resume
router.post('/upload', upload.single('resume'), uploadAndAnalyze);

// Fetch logged-in user's analysis history
router.get('/history', getHistory);

// Admin-only route to retrieve all analyses and user counts
router.get('/admin/all', authorize('admin'), getAllAnalysesAdmin);

// Delete an analysis report
router.delete('/:id', deleteAnalysis);

module.exports = router;
