const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Analysis = require('../models/Analysis');
const User = require('../models/User');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// Configure Multer for PDF storage in uploads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * Clean Markdown wrapper backticks off Gemini's response
 */
const cleanGeminiResponse = (text) => {
  let cleaned = text.trim();
  // Strip opening backticks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  // Strip closing backticks
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
};

/**
 * @desc    Upload PDF, extract text, call Gemini, save analysis
 * @route   POST /api/analysis/upload
 * @access  Private (User)
 */
const uploadAndAnalyze = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file format' });
  }

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  console.log(`Processing file upload: ${originalName} (${req.file.size} bytes) for User: ${req.user.email}`);

  let extractedText = '';
  try {
    // Read PDF file buffer
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text ? pdfData.text.trim() : '';
  } catch (parseError) {
    console.error('PDF parsing error:', parseError);
    // Cleanup physical file in case of error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(400).json({ message: 'Could not parse PDF file' });
  }

  // Immediately delete the file after text extraction (requirement)
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted temporary file: ${filePath}`);
    }
  } catch (unlinkError) {
    console.error('Error deleting temporary file:', unlinkError);
  }

  // Validate extracted text
  if (!extractedText || extractedText.length < 50) {
    console.warn('PDF text content is too short or blank.');
    return res.status(400).json({ message: 'Could not extract text from PDF' });
  }

  const prompt = `You are an expert technical recruiter and ATS specialist. 
Analyze the following resume and return ONLY a valid JSON object 
with no extra text, markdown, or explanation.

The JSON must follow this exact structure:
{
  "ats_score": <number from 1 to 10>,
  "strengths": [<3 specific strengths as strings>],
  "weaknesses": [<3 specific weaknesses as strings>],
  "missing_keywords": [<5 to 8 suggested technical keywords as strings>],
  "overall_feedback": "<2 to 3 sentence overall summary and recommendation>"
}

Resume text:
${extractedText}`;

  // Analyze text via Gemini API, with 1 retry on JSON parse failure
  let parsedResult = null;
  let attempts = 0;
  let responseText = '';
  const apiKey = process.env.GEMINI_API_KEY || '';

  while (attempts < 2) {
    attempts++;
    try {
      console.log(`Contacting Gemini API via REST (Model: gemini-2.5-flash) - Attempt ${attempts}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status} Error`);
      }

      if (
        !data.candidates ||
        data.candidates.length === 0 ||
        !data.candidates[0].content ||
        !data.candidates[0].content.parts ||
        data.candidates[0].content.parts.length === 0
      ) {
        throw new Error('Incomplete structure in Gemini response');
      }

      responseText = data.candidates[0].content.parts[0].text;
      
      const cleanedJSON = cleanGeminiResponse(responseText);
      parsedResult = JSON.parse(cleanedJSON);
      
      // Basic structure validation
      if (
        typeof parsedResult.ats_score === 'undefined' ||
        !Array.isArray(parsedResult.strengths) ||
        !Array.isArray(parsedResult.weaknesses) ||
        !Array.isArray(parsedResult.missing_keywords) ||
        !parsedResult.overall_feedback
      ) {
        throw new Error('Incomplete JSON structure returned by Gemini');
      }
      
      console.log('Successfully received and parsed Gemini response!');
      break;
    } catch (apiError) {
      console.error(`Gemini Call Attempt ${attempts} failed:`, apiError.message);
      if (attempts >= 2) {
        console.error('Full response text that failed parsing:', responseText);
        return res.status(500).json({
          message: 'Failed to analyze resume. AI returned an incompatible format. Please try again.',
        });
      }
    }
  }

  try {
    // Save to database
    const analysis = await Analysis.create({
      userId: req.user._id,
      filename: originalName,
      ats_score: parsedResult.ats_score,
      strengths: parsedResult.strengths,
      weaknesses: parsedResult.weaknesses,
      missing_keywords: parsedResult.missing_keywords,
      overall_feedback: parsedResult.overall_feedback,
    });

    console.log(`Saved resume analysis with ID: ${analysis._id} for user: ${req.user.email}`);
    return res.status(201).json(analysis);
  } catch (dbError) {
    console.error('Database write error:', dbError);
    return res.status(500).json({ message: 'Error saving analysis to database' });
  }
};

/**
 * @desc    Get all analyses for the logged-in user
 * @route   GET /api/analysis/history
 * @access  Private (User)
 */
const getHistory = async (req, res) => {
  try {
    console.log(`Fetching history for user: ${req.user.email}`);
    const analyses = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(analyses);
  } catch (error) {
    console.error('Fetch history error:', error);
    return res.status(500).json({ message: 'Error fetching analysis history' });
  }
};

/**
 * @desc    Get all analyses from all users, and users analysis count (Admin only)
 * @route   GET /api/analysis/admin/all
 * @access  Private (Admin only)
 */
const getAllAnalysesAdmin = async (req, res) => {
  try {
    console.log(`Admin requested all analyses: ${req.user.email}`);
    
    // Get all analyses with user details populated
    const analyses = await Analysis.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    // Aggregate users and count their analyses
    const users = await User.find().select('name email role createdAt');
    
    // Calculate analysis counts per user
    const userAnalysisCounts = await Analysis.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format users with counts
    const usersWithCounts = users.map((user) => {
      const match = userAnalysisCounts.find((countObj) => countObj._id.toString() === user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        analysisCount: match ? match.count : 0,
      };
    });

    return res.json({
      analyses,
      users: usersWithCounts,
    });
  } catch (error) {
    console.error('Admin fetch error:', error);
    return res.status(500).json({ message: 'Error fetching administration reports' });
  }
};

/**
 * @desc    Delete a specific analysis (User must own it)
 * @route   DELETE /api/analysis/:id
 * @access  Private (User/Admin)
 */
const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Delete analysis requested: ${id} by user: ${req.user.email}`);

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis report not found' });
    }

    // Check ownership: logged-in user must be owner or must be an admin
    if (analysis.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.warn(`User ${req.user.email} attempted unauthorized delete of report ${id}`);
      return res.status(403).json({ message: 'Not authorized to delete this analysis' });
    }

    await Analysis.findByIdAndDelete(id);
    console.log(`Analysis ${id} successfully deleted`);
    return res.json({ message: 'Analysis deleted successfully', id });
  } catch (error) {
    console.error('Delete analysis error:', error);
    return res.status(500).json({ message: 'Error deleting analysis report' });
  }
};

module.exports = {
  upload,
  uploadAndAnalyze,
  getHistory,
  getAllAnalysesAdmin,
  deleteAnalysis,
};
