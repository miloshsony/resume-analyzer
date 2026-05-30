import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, FileSpreadsheet, ChevronRight, CornerDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import AnalysisCard from '../components/AnalysisCard';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Selected user history view state
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching system-wide administration report data...');
      const response = await axios.get('/api/analysis/admin/all');
      const { users, analyses } = response.data;
      
      setUsers(users);
      setAnalyses(analyses);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(err.response?.data?.message || 'Access Denied: You must be an authorized Administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteAnalysis = async (id) => {
    try {
      if (window.confirm('As an Administrator, are you sure you want to permanently delete this resume evaluation report?')) {
        await axios.delete(`/api/analysis/${id}`);
        
        // Update local state
        setAnalyses(analyses.filter((item) => item._id !== id));
        
        // Recount analysisCount for users state
        setUsers(users.map((user) => {
          // Find matching analysis and delete count
          const deletedAnalysis = analyses.find((a) => a._id === id);
          if (deletedAnalysis && deletedAnalysis.userId && deletedAnalysis.userId._id === user._id) {
            return { ...user, analysisCount: Math.max(0, user.analysisCount - 1) };
          }
          return user;
        }));

        setSuccess('Evaluation report deleted successfully.');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Admin delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete report.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Filter analyses for the selected user
  const selectedUserAnalyses = selectedUser
    ? analyses.filter((item) => item.userId && (item.userId._id === selectedUser._id || item.userId === selectedUser._id))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2" id="admin-page-heading">
            <ShieldAlert className="h-7 w-7 text-amber-500" />
            Administration Center
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Role-Based Access Dashboard: Inspect all registered user profiles and resume analysis statistics.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all self-start sm:self-center"
          id="btn-admin-refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 p-4 text-sm text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 text-sm text-emerald-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Global Admin Stats widgets */}
      {!loading && !error && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User count */}
          <div className="glass-card p-6 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Accounts</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{users.length}</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">Registered system profiles</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Analysis count */}
          <div className="glass-card p-6 rounded-xl border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total PDF Analyses</p>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">{analyses.length}</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">Parsed through Gemini API</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Retrieving system-wide user logs...</p>
        </div>
      ) : (
        !error && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Users Table List */}
            <div className="lg:col-span-1 glass-card p-6 rounded-xl border border-slate-800/80 shadow-md space-y-4">
              <h3 className="font-extrabold text-lg text-slate-200">Registered Users</h3>
              <p className="text-xs text-slate-400">Select any user to inspect their scanned resume reports.</p>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {users.map((userObj) => {
                  const isSelected = selectedUser?._id === userObj._id;
                  return (
                    <div
                      key={userObj._id}
                      onClick={() => {
                        setSelectedUser(isSelected ? null : userObj);
                      }}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500/40 text-white'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                      id={`user-row-${userObj._id}`}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-sm truncate">{userObj.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{userObj.email}</p>
                        {userObj.role === 'admin' && (
                          <span className="inline-block mt-1 text-[8px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800/60">
                          {userObj.analysisCount} files
                        </span>
                        <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected User Details / Analyses List */}
            <div className="lg:col-span-2 space-y-6">
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CornerDownRight className="h-5 w-5 text-blue-500 shrink-0" />
                    <h3 className="font-extrabold text-lg text-slate-200">
                      Analyses for <span className="text-blue-400">{selectedUser.name}</span>
                    </h3>
                  </div>

                  {selectedUserAnalyses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/20">
                      <FileSpreadsheet className="h-10 w-10 text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No evaluations registered</p>
                      <p className="text-xs text-slate-500 mt-1">This user has not scanned any resumes.</p>
                    </div>
                  ) : (
                    <div className="space-y-4" id="admin-user-cards-list">
                      {selectedUserAnalyses.map((analysis) => (
                        <AnalysisCard
                          key={analysis._id}
                          analysis={analysis}
                          onDelete={handleDeleteAnalysis}
                          showOwnerDetails={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 p-6 h-full">
                  <ShieldAlert className="h-12 w-12 text-slate-700 mb-4" />
                  <h3 className="text-lg font-bold text-slate-400">User History Inspector</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Select a registered user from the sidebar list to inspect their PDF uploads and ATS results.
                  </p>
                </div>
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
};

export default AdminPanel;
