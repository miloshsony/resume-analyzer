import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, AlertCircle, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import AnalysisCard from '../components/AnalysisCard';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // File Validation
  const validateFile = (selectedFile) => {
    setError('');
    setSuccess('');
    
    if (!selectedFile) return false;

    // Check mimetype/extension
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Invalid file format. Please upload a PDF file only.');
      return false;
    }

    // Check size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum size allowed is 5MB.');
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag a PDF resume file first.');
      return;
    }

    setError('');
    setSuccess('');
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      console.log('Sending resume payload to backend...');
      const response = await axios.post('/api/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Analysis received successfully:', response.data);
      setSuccess('Resume successfully analyzed by Gemini AI!');
      setAnalysisResult(response.data);
      // Reset file input
      setFile(null);
    } catch (err) {
      console.error('Upload & analysis error:', err);
      const errMsg = err.response?.data?.message || 'Error occurred during resume analysis. Please try again.';
      setError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setError('');
    setSuccess('');
    setAnalysisResult(null);
  };

  const handleDeleteCardResult = async (id) => {
    try {
      await axios.delete(`/api/analysis/${id}`);
      resetUploader();
      setSuccess('Analysis report deleted successfully.');
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.response?.data?.message || 'Could not delete the analysis report.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          AI Recruiter Evaluation
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white" id="upload-page-heading">
          Scan & Optimize Your Resume
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Upload your resume in PDF format. Our Gemini AI engine will parse the content, score its ATS compliance index, and generate detailed actionable feedback.
        </p>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 text-sm text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Uploader Section */}
      {!analysisResult && (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {/* File Drag Drop Zone */}
          <div
            onClick={triggerFileInput}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 md:p-14 text-center transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center ${
              dragActive
                ? 'border-blue-500 bg-blue-500/5 shadow-inner'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
            id="drag-drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
              id="file-input-pdf"
            />
            
            {/* Visual Icon */}
            <div className={`h-16 w-16 rounded-xl flex items-center justify-center border transition-all mb-4 ${
              file
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              {isAnalyzing ? (
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              ) : file ? (
                <FileText className="h-8 w-8 text-emerald-400" />
              ) : (
                <UploadCloud className="h-8 w-8 text-slate-400" />
              )}
            </div>

            {/* Prompt text */}
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200 break-all">{file.name}</p>
                <p className="text-xs text-slate-400 font-semibold">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-3 text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-200">
                  Drag and drop your PDF resume here, or <span className="text-blue-400 hover:text-blue-300 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500">Supports: PDF only (Max: 5MB)</p>
              </div>
            )}
          </div>

          {/* Submit CTA Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!file || isAnalyzing}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/35 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              id="btn-upload-analyze"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  Analyzing Text via Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Analysis Result Displays */}
      {analysisResult && (
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Evaluation Result
            </h2>
            <button
              onClick={resetUploader}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
              id="btn-analyze-another"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Analyze Another Resume
            </button>
          </div>

          {/* Render the actual card */}
          <AnalysisCard
            analysis={analysisResult}
            onDelete={handleDeleteCardResult}
          />
        </section>
      )}
    </div>
  );
};

export default Upload;
