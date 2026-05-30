import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, History as HistoryIcon, ShieldAlert, Award, FileText, TrendingUp, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalCount: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    recentAnalyses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/analysis/history');
        const data = response.data;

        if (data && data.length > 0) {
          const totalCount = data.length;
          const scores = data.map((item) => item.ats_score);
          const averageScore = (scores.reduce((a, b) => a + b, 0) / totalCount).toFixed(1);
          const highestScore = Math.max(...scores);
          const lowestScore = Math.min(...scores);

          setStats({
            totalCount,
            averageScore,
            highestScore,
            lowestScore,
            recentAnalyses: data.slice(0, 3), // Get 3 most recent
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-950/60 border border-blue-500/20 p-6 md:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Welcome back, {user?.role}
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Hello, {user?.name}!
            </h1>
            <p className="mt-2 text-slate-300 text-sm md:text-base max-w-xl">
              Optimize your resume, bypass Applicant Tracking Systems (ATS), and land your dream job interviews using instant Gemini AI evaluations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/35 transition-all"
              id="dash-btn-upload"
            >
              <UploadCloud className="h-5 w-5" />
              Analyze New Resume
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              id="dash-btn-history"
            >
              <HistoryIcon className="h-5 w-5" />
              View History
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Widgets Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Analyzed */}
        <div className="glass-card p-5 rounded-xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Resumes</p>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-2">
                {loading ? '...' : stats.totalCount}
              </h3>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="h-5.5 w-5.5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-semibold">Analyzed in your history</p>
        </div>

        {/* Average ATS Score */}
        <div className="glass-card p-5 rounded-xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Average ATS Score</p>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
                {loading ? '...' : stats.averageScore === 0 ? 'N/A' : `${stats.averageScore}/10`}
              </h3>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-semibold">Overall tracking progress</p>
        </div>

        {/* Highest ATS Score */}
        <div className="glass-card p-5 rounded-xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Highest Score</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {loading ? '...' : stats.highestScore === -Infinity ? 'N/A' : `${stats.highestScore}/10`}
              </h3>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="h-5.5 w-5.5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-semibold">Your stellar performance</p>
        </div>

        {/* Lowest ATS Score */}
        <div className="glass-card p-5 rounded-xl border border-slate-800/80 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Lowest Score</p>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-2">
                {loading ? '...' : stats.lowestScore === Infinity ? 'N/A' : `${stats.lowestScore}/10`}
              </h3>
            </div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="h-5.5 w-5.5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-semibold">Opportunities to improve</p>
        </div>
      </section>

      {/* Main Panel - Actions & Recents */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Tips */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-200">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/upload"
                className="flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-850 text-slate-300 hover:text-white transition-all group"
              >
                <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <UploadCloud className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Upload Resume</h4>
                  <p className="text-[11px] text-slate-400">Instant PDF evaluation</p>
                </div>
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-850 text-slate-300 hover:text-white transition-all group"
              >
                <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <HistoryIcon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Review History</h4>
                  <p className="text-[11px] text-slate-400">View previous scores</p>
                </div>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 p-3 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-850 text-slate-300 hover:text-amber-400 transition-all group"
                >
                  <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Admin Administration</h4>
                    <p className="text-[11px] text-slate-400">Monitor users & files</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-slate-800/80">
            <h3 className="font-extrabold text-lg text-slate-200 mb-3">ATS Success Tips</h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold select-none">•</span>
                <span><strong>Avoid Graphics:</strong> Logos and complex multi-column styling often confuse standard ATS parsers.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold select-none">•</span>
                <span><strong>Match Keywords:</strong> Adapt your resume bullet points to include skills mentioned in the job description.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500 font-bold select-none">•</span>
                <span><strong>Use PDF Format:</strong> Modern systems prefer clean PDFs with searchable text content.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Analyses List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-200">Recent Resume Analyses</h3>
            {stats.totalCount > 3 && (
              <Link to="/history" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-all">
                See all ({stats.totalCount})
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-500 border-t-transparent"></div>
              <p className="text-xs text-slate-400">Retrieving recent files...</p>
            </div>
          ) : stats.recentAnalyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
              <UploadCloud className="h-10 w-10 text-slate-500 mb-3" />
              <p className="text-sm font-semibold text-slate-300">No resumes analyzed yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Upload your first resume as a PDF file to check its ATS compatibility index.
              </p>
              <Link
                to="/upload"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                Upload Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.recentAnalyses.map((item) => {
                const isEmerald = item.ats_score > 7;
                const isRose = item.ats_score < 5;
                const badgeColor = isEmerald
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isRose
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                return (
                  <div
                    key={item._id}
                    className="flex justify-between items-center p-4 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-all"
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className="font-bold text-sm text-slate-200 truncate">{item.filename}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Checked on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-bold border rounded-md ${badgeColor}`}>
                        Score: {item.ats_score}/10
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="text-center pt-2">
                <Link
                  to="/history"
                  className="inline-flex justify-center w-full py-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  Expand Full Analysis Cards in History
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
