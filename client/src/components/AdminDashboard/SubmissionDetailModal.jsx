import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  HelpCircle,
  FileCheck2,
  X
} from 'lucide-react';

export default function SubmissionDetailModal({ submission, onClose }) {
  if (!submission) return null;

  const {
    quizTitle,
    firstName,
    userEmail,
    score,
    maxScore,
    percentage,
    passed,
    passingScorePercentage,
    timeSpentSeconds,
    submittedAt,
    answers = {}
  } = submission;

  const formatTime = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m === 0 ? `${s}s` : `${m}m ${s}s`;
  };

  const formatAns = (val) => {
    if (val === undefined || val === null || val === '') return '(No Answer Provided)';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    return String(val);
  };

  const answerEntries = Object.entries(answers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {passed ? 'Passed ✓' : 'Failed ✗'}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Score: <strong className="text-slate-900">{percentage}%</strong> ({score}/{maxScore} pts)
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">{quizTitle}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member & Submission Meta Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Team Member</p>
            <p className="font-bold text-slate-900 mt-0.5">{firstName}</p>
            <p className="text-[11px] text-slate-500">{userEmail}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Time Spent</p>
            <p className="font-bold text-slate-900 mt-0.5">{formatTime(timeSpentSeconds)}</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Required Threshold</p>
            <p className="font-bold text-slate-900 mt-0.5">{passingScorePercentage}%</p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[10px]">Date Submitted</p>
            <p className="font-bold text-slate-900 mt-0.5">
              {new Date(submittedAt).toLocaleDateString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Answer Breakdown */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
            <span>Submitted Answers Inspection</span>
            <span className="text-xs font-normal text-slate-500">
              ({answerEntries.filter(([_, a]) => a.correct).length}/{answerEntries.length} Correct)
            </span>
          </h4>

          <div className="space-y-3">
            {answerEntries.map(([qId, ans], idx) => {
              const isCorrect = ans.correct;
              return (
                <div
                  key={qId}
                  className={`p-4 rounded-2xl border text-xs ${
                    isCorrect ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">
                      Question #{idx + 1}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ans.pointsAwarded || 0} / {ans.maxPoints || 10} pts
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <p className="font-bold text-[10px] text-slate-400 uppercase">User Submitted:</p>
                      <p className={`font-semibold mt-0.5 ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {formatAns(ans.userAnswer)}
                      </p>
                    </div>

                    {!isCorrect && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <p className="font-bold text-[10px] text-emerald-600 uppercase">Correct Solution:</p>
                        <p className="font-semibold text-emerald-800 mt-0.5">
                          {formatAns(ans.correctAnswer || (ans.acceptedAnswers ? ans.acceptedAnswers[0] : ''))}
                        </p>
                      </div>
                    )}
                  </div>

                  {ans.explanation && (
                    <p className="mt-2 text-[11px] text-slate-500 italic">
                      Note: {ans.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}

