import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  HelpCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function QuizResult({ submission, onRetake, onBackToQuizzes }) {
  const {
    quizTitle,
    firstName,
    score,
    maxScore,
    percentage,
    passed,
    passingScorePercentage,
    timeSpentSeconds,
    answers = {},
    submittedAt
  } = submission;

  // Trigger celebration confetti on pass!
  useEffect(() => {
    if (passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [passed]);

  const formatTime = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const answerEntries = Object.entries(answers);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Result Card */}
      <div
        className={`rounded-3xl p-8 sm:p-10 border shadow-xl relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white border-emerald-500/30 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-rose-600 via-slate-800 to-rose-900 text-white border-rose-500/30 shadow-rose-900/10'
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
              {passed ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Assessment Passed</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-200" />
                  <span>Score Below Passing Mark</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {passed ? `Congratulations, ${firstName}!` : `Good effort, ${firstName}!`}
            </h1>
            <p className="text-sm opacity-90 max-w-xl">
              {passed
                ? `You have successfully completed the "${quizTitle}" assessment. Your score meets the required standard.`
                : `You scored ${percentage}%, but this assessment requires ${passingScorePercentage}% to pass. You can review the correct answers below and retake it.`}
            </p>
          </div>

          {/* Big Score Radial/Badge */}
          <div className="shrink-0 text-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 min-w-[160px]">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">Final Score</p>
            <div className="text-5xl font-black tracking-tight my-1">
              {percentage}%
            </div>
            <p className="text-xs font-medium text-white/80">
              {score} / {maxScore} Points
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-75 font-semibold">Status</p>
            <p className="font-bold text-sm mt-0.5">{passed ? 'Passed ✓' : 'Failed ✗'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-75 font-semibold">Required Mark</p>
            <p className="font-bold text-sm mt-0.5">{passingScorePercentage}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-75 font-semibold">Time Spent</p>
            <p className="font-bold text-sm mt-0.5">{formatTime(timeSpentSeconds)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider opacity-75 font-semibold">Completed</p>
            <p className="font-bold text-sm mt-0.5">
              {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <button
          onClick={onBackToQuizzes}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quizzes</span>
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onRetake}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>

      {/* Answer Breakdown Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Question-by-Question Review</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your answers, correct solutions, and explanations below to improve your skills.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {answerEntries.filter(([_, a]) => a.correct).length} of {answerEntries.length} Correct
          </span>
        </div>

        {/* Question Review Cards */}
        <div className="space-y-4">
          {answerEntries.map(([qId, ans], idx) => {
            const isCorrect = ans.correct;

            // Format answers cleanly
            const formatAns = (val) => {
              if (val === undefined || val === null || val === '') return '(No Answer Provided)';
              if (Array.isArray(val)) return val.join(', ');
              if (typeof val === 'boolean') return val ? 'True' : 'False';
              return String(val);
            };

            return (
              <div
                key={qId}
                className={`p-6 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-white border-emerald-200 shadow-sm'
                    : 'bg-white border-rose-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <XCircle className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Question {idx + 1}
                      </span>
                      <p className="text-slate-900 font-bold text-sm sm:text-base mt-0.5">
                        {ans.prompt || `Question #${idx + 1}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {ans.pointsAwarded || 0} / {ans.maxPoints || 10} pts
                  </span>
                </div>

                {/* Answers Comparison */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      Your Answer:
                    </p>
                    <p className="font-semibold text-sm">{formatAns(ans.userAnswer)}</p>
                  </div>

                  {!isCorrect && (
                    <div className="p-3.5 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-950">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 mb-1">
                        Correct Answer:
                      </p>
                      <p className="font-semibold text-sm">
                        {formatAns(
                          ans.correctAnswer || (ans.acceptedAnswers ? ans.acceptedAnswers[0] : '')
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {ans.explanation && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
                    <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Explanation: </span>
                      <span>{ans.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

