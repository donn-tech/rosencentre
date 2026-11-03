import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Clock,
  Eye
} from 'lucide-react';
import SubmissionDetailModal from './SubmissionDetailModal';

export default function SubmissionsTab({ inspectedSub, onClearInspect }) {
  const [submissions, setSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterQuiz, setFilterQuiz] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'passed' | 'failed'
  const [activeModalSub, setActiveModalSub] = useState(inspectedSub || null);

  useEffect(() => {
    if (inspectedSub) {
      setActiveModalSub(inspectedSub);
    }
  }, [inspectedSub]);

  useEffect(() => {
    fetchSubmissions();
    fetchQuizzes();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes?includeDrafts=true');
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const formatTime = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m === 0 ? `${s}s` : `${m}m ${s}s`;
  };

  const filtered = submissions.filter((sub) => {
    const q = search.toLowerCase();
    const matchesSearch =
      sub.firstName.toLowerCase().includes(q) ||
      sub.userEmail.toLowerCase().includes(q) ||
      sub.quizTitle.toLowerCase().includes(q);

    const matchesQuiz = filterQuiz === 'all' || sub.quizId === filterQuiz;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && sub.passed) ||
      (filterStatus === 'failed' && !sub.passed);

    return matchesSearch && matchesQuiz && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      'Submission ID',
      'First Name',
      'Email',
      'Quiz Title',
      'Score',
      'Max Score',
      'Percentage',
      'Result',
      'Passing Required',
      'Time Spent (seconds)',
      'Submitted At'
    ];

    const rows = filtered.map((s) => [
      s.id,
      `"${s.firstName}"`,
      `"${s.userEmail}"`,
      `"${s.quizTitle}"`,
      s.score,
      s.maxScore,
      `${s.percentage}%`,
      s.passed ? 'PASSED' : 'FAILED',
      `${s.passingScorePercentage}%`,
      s.timeSpentSeconds,
      s.submittedAt
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `team-quiz-submissions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Quiz Submissions & Assessment Records
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of team attempts with full answer sheets and pass/fail indicators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-brand-300" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member, email, or quiz..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quiz Filter Dropdown */}
          <select
            value={filterQuiz}
            onChange={(e) => setFilterQuiz(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Quizzes</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Submissions Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Showing {filtered.length} of {submissions.length} Submissions
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No submissions found</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting filters or have an authorized team member complete an assessment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Team Member</th>
                  <th className="py-3.5 px-6 font-bold">Quiz</th>
                  <th className="py-3.5 px-6 font-bold">Score</th>
                  <th className="py-3.5 px-6 font-bold">Result</th>
                  <th className="py-3.5 px-6 font-bold">Duration</th>
                  <th className="py-3.5 px-6 font-bold">Submitted Date</th>
                  <th className="py-3.5 px-6 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{sub.firstName}</div>
                      <div className="text-[11px] text-slate-500">{sub.userEmail}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {sub.quizTitle}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-black text-sm text-slate-900">{sub.percentage}%</span>
                      <span className="text-[11px] text-slate-500 ml-1">
                        ({sub.score}/{sub.maxScore} pts)
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          sub.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
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
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {formatTime(sub.timeSpentSeconds)}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{new Date(sub.submittedAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setActiveModalSub(sub)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs border border-slate-200 transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Inspector */}
      {activeModalSub && (
        <SubmissionDetailModal
          submission={activeModalSub}
          onClose={() => {
            setActiveModalSub(null);
            if (onClearInspect) onClearInspect();
          }}
        />
      )}
    </div>
  );
}

