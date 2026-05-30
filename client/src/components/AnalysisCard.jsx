import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, FileSpreadsheet, Trash2, Calendar, User } from 'lucide-react';

const AnalysisCard = ({ analysis, onDelete, showOwnerDetails = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    _id,
    filename,
    ats_score,
    strengths,
    weaknesses,
    missing_keywords,
    overall_feedback,
    createdAt,
    userId, // Populated in admin routes
  } = analysis;

  // Determine ATS Score Color theme
  const getScoreTheme = (score) => {
    if (score < 5) {
      return {
        text: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        ring: 'ring-rose-500/20',
      };
    } else if (score >= 5 && score <= 7) {
      return {
        text: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        ring: 'ring-amber-500/20',
      };
    } else {
      return {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        ring: 'ring-emerald-500/20',
      };
    }
  };

  const theme = getScoreTheme(ats_score);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Avoid triggering card expand
    if (window.confirm(`Are you sure you want to delete the analysis for "${filename}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(_id);
      } catch (err) {
        console.error('Delete error inside card:', err);
        setIsDeleting(false);
      }
    }
  };

  return (
    <article
      className="glass-card glass-card-hover rounded-xl overflow-hidden shadow-xl mb-4 transition-all duration-300"
      id={`analysis-card-${_id}`}
    >
      {/* Card Header (Always Visible) */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 cursor-pointer select-none"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <FileSpreadsheet className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base md:text-lg break-all pr-4">
              {filename}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {showOwnerDetails && userId && (
                <span className="flex items-center gap-1 border-l border-slate-800 pl-3">
                  <User className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-medium text-slate-300">{userId.name}</span>
                  <span className="text-[10px] text-slate-500">({userId.email})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ATS Score Indicator */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800/50 sm:border-0 pt-3 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ATS Score</span>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full font-extrabold text-lg border-2 ${theme.bg} ${theme.text} ${theme.border}`}
            >
              {ats_score}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all border border-transparent hover:border-rose-500/20"
              title="Delete Report"
              id={`btn-delete-${_id}`}
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
            <div className="text-slate-400 hover:text-white p-1">
              {expanded ? <ChevronUp className="h-5.5 w-5.5" /> : <ChevronDown className="h-5.5 w-5.5" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Section */}
      {expanded && (
        <div className="border-t border-slate-800/80 bg-slate-900/30 p-6 space-y-6 animate-fadeIn">
          {/* Strengths & Weaknesses grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
              <h4 className="flex items-center gap-2 font-bold text-emerald-400 text-sm md:text-base mb-3.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                Key Strengths
              </h4>
              <ul className="space-y-2.5">
                {strengths && strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold select-none mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
                {(!strengths || strengths.length === 0) && (
                  <p className="text-slate-500 text-xs italic">No strengths listed.</p>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
              <h4 className="flex items-center gap-2 font-bold text-rose-400 text-sm md:text-base mb-3.5">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2.5">
                {weaknesses && weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 font-bold select-none mt-0.5">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
                {(!weaknesses || weaknesses.length === 0) && (
                  <p className="text-slate-500 text-xs italic">No critical improvement areas listed.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
            <h4 className="font-bold text-blue-400 text-sm md:text-base mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping"></span>
              Suggested Technical Keywords
            </h4>
            <p className="text-slate-400 text-xs mb-3.5">
              Including these key terms helps bypass ATS filters and match typical recruiter criteria:
            </p>
            <div className="flex flex-wrap gap-2">
              {missing_keywords && missing_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25 tracking-wide shadow-sm shadow-blue-500/5 hover:bg-blue-600/15 hover:border-blue-400/40 transition-all cursor-default"
                >
                  {keyword}
                </span>
              ))}
              {(!missing_keywords || missing_keywords.length === 0) && (
                <p className="text-slate-500 text-xs italic">No keywords suggested.</p>
              )}
            </div>
          </div>

          {/* Overall Suggestions */}
          <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800/60">
            <h4 className="font-bold text-indigo-400 text-sm md:text-base mb-2.5">
              Recruiter Summary & Action Plan
            </h4>
            <p className="text-sm leading-relaxed text-slate-300 font-medium">
              {overall_feedback}
            </p>
          </div>
        </div>
      )}
    </article>
  );
};

export default AnalysisCard;
