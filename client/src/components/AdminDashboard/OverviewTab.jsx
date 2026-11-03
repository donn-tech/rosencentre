import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileCheck2, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';

export default function OverviewTab({ onInspectSubmission, onGoToQuizzes, onGoToWhitelist }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
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

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time assessment activity, authorized team members, and quiz completion analytics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Quizzes */}
        <div
          onClick={onGoToQuizzes}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Quizzes</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.totalQuizzes ?? '-'}</p>
          <p className="text-[11px] text-brand-600 font-semibold mt-1">
            {stats?.publishedQuizzes ?? 0} published active
          </p>
        </div>

        {/* Authorized Members */}
        <div
          onClick={onGoToWhitelist}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Authorized Team</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.totalAuthorizedMembers ?? '-'}</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {stats?.activeMembersCount ?? 0} active members
          </p>
        </div>

        {/* Submissions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completions</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats?.totalSubmissions ?? '-'}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {stats?.passedSubmissions ?? 0} passed attempts
          </p>
        </div>

        {/* Average Score */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Team Score</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.averageScore !== undefined ? `${stats.averageScore}%` : '-'}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Across all attempts
          </p>
        </div>

        {/* Pass Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats?.overallPassRate !== undefined ? `${stats.overallPassRate}%` : '-'}
          </p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">
            Passing threshold met
          </p>
        </div>
      </div>

      {/* Real-time Recent Submissions Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-base font-extrabold text-slate-900">
                Live Quiz Completions Stream
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly logs each team member's quiz completion, score, and pass/fail status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading completions...</div>
        ) : !stats?.recentSubmissions?.length ? (
          <div className="p-12 text-center space-y-2">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No submissions recorded yet</p>
            <p className="text-[11px] text-slate-500">
              When an authorized team member takes a quiz, it will show up here immediately.
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
                  <th className="py-3.5 px-6 font-bold">Time Spent</th>
                  <th className="py-3.5 px-6 font-bold">Submitted</th>
                  <th className="py-3.5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentSubmissions.map((sub) => (
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
                        ({sub.score}/{sub.maxScore})
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          sub.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.passed ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">
                      {formatTime(sub.timeSpentSeconds)}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(sub.submittedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onInspectSubmission(sub)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-[11px] border border-slate-200 transition-colors"
                      >
                        View Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quiz Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">Quiz Engagement & Pass Rates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Summary performance for each quiz topic.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 font-bold">Quiz Title</th>
                <th className="py-3 px-6 font-bold">Category</th>
                <th className="py-3 px-6 font-bold">Questions</th>
                <th className="py-3 px-6 font-bold">Total Attempts</th>
                <th className="py-3 px-6 font-bold">Pass Rate</th>
                <th className="py-3 px-6 font-bold">Average Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.quizStats?.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{q.title}</td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">
                      {q.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">{q.questionCount}</td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">{q.completionsCount}</td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{q.passRate}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${q.passRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">{q.averageScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

