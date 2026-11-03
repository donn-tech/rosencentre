import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  ArrowRight,
  Sparkles,
  BarChart2
} from 'lucide-react';

export default function MyHistory({ onViewResult }) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user.email]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m === 0 ? `${s}s` : `${m}m ${s}s`;
  };

  const totalTaken = submissions.length;
  const passedCount = submissions.filter((s) => s.passed).length;
  const avgScore =
    totalTaken > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.percentage, 0) / totalTaken)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            My Quiz Activity & Performance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track all your completed evaluations, scores, and progress records.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-100 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-brand-700">Total Attempts</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{totalTaken}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">Assessments Passed</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                {passedCount} / {totalTaken}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-indigo-700">Average Score</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{avgScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Attempt History</h3>
          <span className="text-xs text-slate-500 font-medium">{submissions.length} Record(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading history...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Quizzes Completed Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Once you take and submit a quiz, your results and answer sheets will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        sub.passed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {sub.passed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passed</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </>
                      )}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{sub.quizTitle}</h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(sub.timeSpentSeconds)}</span>
                    </span>
                    <span>•</span>
                    <span>Required: {sub.passingScorePercentage}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 leading-tight">
                      {sub.percentage}%
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {sub.score}/{sub.maxScore} pts
                    </p>
                  </div>

                  <button
                    onClick={() => onViewResult(sub)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center space-x-1.5"
                  >
                    <span>View Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

