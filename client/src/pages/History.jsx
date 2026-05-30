import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Search, AlertCircle, FileText, Filter } from 'lucide-react';
import AnalysisCard from '../components/AnalysisCard';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all', 'high' (7+), 'mid' (5-7), 'low' (<5)

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching analysis reports...');
      const response = await axios.get('/api/analysis/history');
      setAnalyses(response.data);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.response?.data?.message || 'Error occurred while loading history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteAnalysis = async (id) => {
    try {
      console.log(`Sending delete request for report: ${id}`);
      await axios.delete(`/api/analysis/${id}`);
      
      // Update local state
      setAnalyses(analyses.filter((item) => item._id !== id));
      setSuccess('Analysis report successfully removed.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Delete analysis report error:', err);
      setError(err.response?.data?.message || 'Failed to delete analysis report.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Filter analyses
  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesScore = true;
    if (scoreFilter === 'high') {
      matchesScore = item.ats_score > 7;
    } else if (scoreFilter === 'mid') {
      matchesScore = item.ats_score >= 5 && item.ats_score <= 7;
    } else if (scoreFilter === 'low') {
      matchesScore = item.ats_score < 5;
    }

    return matchesSearch && matchesScore;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2" id="history-page-heading">
            <HistoryIcon className="h-7 w-7 text-blue-500" />
            Your Analysis History
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Review all previously scanned resumes, score charts, and AI recruiter suggestions.
          </p>
        </div>
        <div className="text-slate-400 text-xs font-semibold bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-lg self-start sm:self-center">
          Total Reports: <span className="text-blue-400 font-bold">{analyses.length}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 text-sm text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 text-sm text-emerald-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search and Filters Controls */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="filters-container">
          {/* Search Field */}
          <div className="sm:col-span-2 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              id="search-input"
            />
          </div>

          {/* Score Filters */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-slate-300 focus:border-blue-500 focus:outline-none appearance-none"
              id="filter-score-select"
            >
              <option value="all">All ATS Scores</option>
              <option value="high">High Scores (&gt; 7)</option>
              <option value="mid">Mid Scores (5 - 7)</option>
              <option value="low">Low Scores (&lt; 5)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading your history reports...</p>
        </div>
      ) : analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl p-6">
          <FileText className="h-12 w-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No evaluations found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            It looks like you haven't uploaded any resumes yet. Start by checking your first resume!
          </p>
          <a
            href="/upload"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            Go to Upload
          </a>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="text-center py-12 border border-slate-850 rounded-2xl bg-slate-900/10">
          <p className="text-slate-400 text-sm">No analysis reports match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setScoreFilter('all');
            }}
            className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300 underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section className="space-y-4" id="history-cards-list">
          {filteredAnalyses.map((analysis) => (
            <AnalysisCard
              key={analysis._id}
              analysis={analysis}
              onDelete={handleDeleteAnalysis}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default History;
