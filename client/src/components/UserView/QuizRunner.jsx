import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Check, 
  X,
  Send,
  Flag
} from 'lucide-react';

export default function QuizRunner({ quiz, onCancel, onComplete }) {
  const { user } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(
    quiz.timeLimitMinutes > 0 ? quiz.timeLimitMinutes * 60 : null
  );
  const startTimeRef = useRef(Date.now());

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) {
      handleForceSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Answer handler
  const setSingleAnswer = (val) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val
    }));
  };

  const toggleMultipleAnswer = (optId) => {
    const currentList = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
    let updated;
    if (currentList.includes(optId)) {
      updated = currentList.filter((id) => id !== optId);
    } else {
      updated = [...currentList, optId];
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated
    }));
  };

  const setTextAnswer = (text) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text
    }));
  };

  // Is question answered
  const isAnswered = (q) => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'string') return ans.trim().length > 0;
    return true;
  };

  const answeredCount = questions.filter(isAnswered).length;
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100);

  const handleForceSubmit = () => {
    submitQuiz();
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          userEmail: user.email,
          firstName: user.firstName,
          answers,
          timeSpentSeconds
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      onComplete(data);
    } catch (err) {
      alert('Error submitting quiz: ' + err.message);
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Top Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Exit Quiz"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1">
              {quiz.title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Candidate: <span className="text-slate-800 font-semibold">{user.firstName}</span> ({user.email})
            </p>
          </div>
        </div>

        {/* Timer & Progress */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          {timeRemaining !== null && (
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors ${
                timeRemaining < 120
                  ? 'bg-rose-50 text-rose-600 border-rose-200 pulse-warning'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Answered: <span className="text-brand-600 font-bold">{answeredCount}</span>/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      {currentQ ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-100 space-y-8">
          {/* Question Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {currentQ.points || 10} Points
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-relaxed">
              {currentQ.prompt}
            </h3>

            {/* Instruction helper by type */}
            <p className="text-xs font-medium text-slate-500 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              {currentQ.type === 'single_choice' && <span>Select one answer option below.</span>}
              {currentQ.type === 'multiple_choice' && (
                <span className="text-brand-700 font-semibold">
                  Multiple Select: Choose all options that apply.
                </span>
              )}
              {currentQ.type === 'true_false' && <span>Choose whether this statement is True or False.</span>}
              {(currentQ.type === 'short_answer' || currentQ.type === 'fill_blank') && (
                <span>Type your answer in the field provided below.</span>
              )}
            </p>
          </div>

          {/* Question Body / Controls */}
          <div className="pt-2">
            {/* Single Choice Radio */}
            {currentQ.type === 'single_choice' && (
              <div className="space-y-3">
                {currentQ.options?.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingleAnswer(opt.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start space-x-4 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-md shadow-brand-500/10'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                      </div>
                      <span className="text-sm sm:text-base font-semibold leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Multiple Choice Checkboxes */}
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQ.options?.map((opt) => {
                  const list = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                  const isChecked = list.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMultipleAnswer(opt.id)}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start space-x-4 ${
                        isChecked
                          ? 'border-brand-600 bg-brand-50/70 text-brand-950 shadow-md shadow-brand-500/10'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-sm sm:text-base font-semibold leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False Toggle */}
            {currentQ.type === 'true_false' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { val: 'true', label: 'True', icon: Check, color: 'emerald' },
                  { val: 'false', label: 'False', icon: X, color: 'rose' }
                ].map((item) => {
                  const isSelected = answers[currentQ.id] === item.val;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setSingleAnswer(item.val)}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-2 ${
                        isSelected
                          ? item.val === 'true'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-600/10'
                            : 'border-rose-600 bg-rose-50 text-rose-900 shadow-md shadow-rose-600/10'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected
                            ? item.val === 'true'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-lg font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer / Fill in Blank */}
            {(currentQ.type === 'short_answer' || currentQ.type === 'fill_blank') && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 text-base sm:text-lg bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-slate-900"
                  autoFocus
                />
                <p className="text-xs text-slate-400">
                  Note: Answers are evaluated case-insensitively.
                </p>
              </div>
            )}
          </div>

          {/* Navigation & Submit Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {/* Question Quick Jump Dots */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
              {questions.map((q, idx) => {
                const answered = isAnswered(q);
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                        : answered
                        ? 'bg-brand-100 text-brand-800 hover:bg-brand-200'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-600/20 transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Ready to submit your quiz?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have completed <strong className="text-slate-900">{answeredCount} of {questions.length}</strong> questions.
                {answeredCount < questions.length && (
                  <span className="block mt-1 text-amber-600 font-semibold">
                    Warning: You still have {questions.length - answeredCount} unanswered question(s).
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Review Answers
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={submitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-2"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Confirm & Finish</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

