import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  Save
} from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'single_choice', label: 'Single Choice (Radio)', desc: 'One correct option among choices' },
  { id: 'multiple_choice', label: 'Multiple Select (Checkboxes)', desc: 'User selects all correct options' },
  { id: 'true_false', label: 'True / False', desc: 'Binary true or false proposition' },
  { id: 'short_answer', label: 'Short Answer (Text)', desc: 'User types answer, matches accepted list' },
  { id: 'fill_blank', label: 'Fill in the Blank', desc: 'Sentence completion with blank' }
];

export default function QuizEditorModal({ quiz, onClose, onSave }) {
  const isEditing = !!quiz;

  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [category, setCategory] = useState(quiz?.category || 'Operations');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(quiz?.timeLimitMinutes ?? 10);
  const [passingScorePercentage, setPassingScorePercentage] = useState(quiz?.passingScorePercentage ?? 70);
  const [status, setStatus] = useState(quiz?.status || 'published');

  // Questions
  const [questions, setQuestions] = useState(
    quiz?.questions && quiz.questions.length > 0
      ? JSON.parse(JSON.stringify(quiz.questions))
      : [
          {
            id: 'q-new-1',
            type: 'single_choice',
            prompt: 'Enter your first question here...',
            points: 10,
            explanation: '',
            options: [
              { id: 'opt_1', text: 'Option A' },
              { id: 'opt_2', text: 'Option B' }
            ],
            correctAnswer: 'opt_1',
            acceptedAnswers: []
          }
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Question manipulation
  const addQuestion = (type = 'single_choice') => {
    const newId = 'q-' + Date.now();
    let initialOptions = [];
    let initialCorrect = null;

    if (type === 'single_choice') {
      initialOptions = [
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
        { id: 'opt_3', text: 'Option 3' }
      ];
      initialCorrect = 'opt_1';
    } else if (type === 'multiple_choice') {
      initialOptions = [
        { id: 'opt_1', text: 'Option 1' },
        { id: 'opt_2', text: 'Option 2' },
        { id: 'opt_3', text: 'Option 3' }
      ];
      initialCorrect = ['opt_1', 'opt_2'];
    } else if (type === 'true_false') {
      initialOptions = [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' }
      ];
      initialCorrect = 'true';
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: newId,
        type,
        prompt: '',
        points: 10,
        explanation: '',
        options: initialOptions,
        correctAnswer: initialCorrect,
        acceptedAnswers: type === 'short_answer' || type === 'fill_blank' ? [''] : []
      }
    ]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const duplicateQuestion = (idx) => {
    const target = JSON.parse(JSON.stringify(questions[idx]));
    target.id = 'q-' + Date.now();
    target.prompt = `${target.prompt} (Copy)`;
    const updated = [...questions];
    updated.splice(idx + 1, 0, target);
    setQuestions(updated);
  };

  const moveQuestion = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setQuestions(updated);
  };

  const updateQuestion = (idx, updates) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updates };
      return copy;
    });
  };

  // Option actions for choices
  const addOption = (qIdx) => {
    const q = questions[qIdx];
    const optId = 'opt_' + Date.now();
    const newOptions = [...(q.options || []), { id: optId, text: `Option ${(q.options?.length || 0) + 1}` }];
    updateQuestion(qIdx, { options: newOptions });
  };

  const removeOption = (qIdx, optId) => {
    const q = questions[qIdx];
    if ((q.options || []).length <= 2) {
      alert('Multiple choice questions require at least two options.');
      return;
    }
    const newOptions = q.options.filter((o) => o.id !== optId);
    let newCorrect = q.correctAnswer;
    if (q.type === 'single_choice' && q.correctAnswer === optId) {
      newCorrect = newOptions[0]?.id;
    } else if (q.type === 'multiple_choice' && Array.isArray(q.correctAnswer)) {
      newCorrect = q.correctAnswer.filter((id) => id !== optId);
    }
    updateQuestion(qIdx, { options: newOptions, correctAnswer: newCorrect });
  };

  const updateOptionText = (qIdx, optId, text) => {
    const q = questions[qIdx];
    const newOptions = (q.options || []).map((o) => (o.id === optId ? { ...o, text } : o));
    updateQuestion(qIdx, { options: newOptions });
  };

  const setSingleCorrect = (qIdx, optId) => {
    updateQuestion(qIdx, { correctAnswer: optId });
  };

  const toggleMultipleCorrect = (qIdx, optId) => {
    const q = questions[qIdx];
    const list = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
    let updated;
    if (list.includes(optId)) {
      updated = list.filter((id) => id !== optId);
    } else {
      updated = [...list, optId];
    }
    updateQuestion(qIdx, { correctAnswer: updated });
  };

  // Accepted answers for short answer
  const addAcceptedAnswer = (qIdx) => {
    const q = questions[qIdx];
    const list = [...(q.acceptedAnswers || []), ''];
    updateQuestion(qIdx, { acceptedAnswers: list });
  };

  const updateAcceptedAnswer = (qIdx, aIdx, val) => {
    const q = questions[qIdx];
    const list = [...(q.acceptedAnswers || [])];
    list[aIdx] = val;
    updateQuestion(qIdx, { acceptedAnswers: list });
  };

  const removeAcceptedAnswer = (qIdx, aIdx) => {
    const q = questions[qIdx];
    const list = (q.acceptedAnswers || []).filter((_, i) => i !== aIdx);
    updateQuestion(qIdx, { acceptedAnswers: list });
  };

  // Handle Save
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    if (questions.length === 0) {
      setError('Quiz must have at least one question.');
      return;
    }

    // Validation for questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        setError(`Question #${i + 1} has an empty prompt.`);
        return;
      }
      if (q.type === 'single_choice' && !q.correctAnswer) {
        setError(`Question #${i + 1}: Please select a correct answer option.`);
        return;
      }
      if (q.type === 'multiple_choice' && (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0)) {
        setError(`Question #${i + 1}: Please select at least one correct option.`);
        return;
      }
      if ((q.type === 'short_answer' || q.type === 'fill_blank') && (!q.acceptedAnswers || q.acceptedAnswers.filter(Boolean).length === 0)) {
        setError(`Question #${i + 1}: Please enter at least one accepted answer.`);
        return;
      }
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      timeLimitMinutes: Number(timeLimitMinutes) || 0,
      passingScorePercentage: Number(passingScorePercentage) || 70,
      status,
      questions
    };

    try {
      const url = isEditing ? `/api/quizzes/${quiz.id}` : '/api/quizzes';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save quiz');
      }

      onSave(data);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {isEditing ? 'Edit Quiz Assessment' : 'Create New Team Quiz'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure quiz details, add various question types, and set grading criteria.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Metadata Box */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Quiz Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quiz Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Workplace Safety & Emergency Protocols"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what this quiz covers and guidelines for the team member..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Onboarding, Safety, Product"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    placeholder="0 for none"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-400">0 = Unlimited</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Mark (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScorePercentage}
                    onChange={(e) => setPassingScorePercentage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-400">Default: 70%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Publish Status</label>
                <div className="flex items-center space-x-3 mt-1.5">
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-emerald-700 font-bold">Published (Active)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-slate-600">Draft (Hidden)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Question List Builder */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Questions ({questions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Select question types and mark correct solutions.
                </p>
              </div>

              {/* Add Question Menu Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1">+ Add Type:</span>
                <button
                  type="button"
                  onClick={() => addQuestion('single_choice')}
                  className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold border border-brand-200 transition-colors"
                >
                  Single Choice
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('multiple_choice')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition-colors"
                >
                  Multiple Select
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('true_false')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
                >
                  True / False
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('short_answer')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-colors"
                >
                  Short Answer
                </button>
              </div>
            </div>

            {/* Questions Container */}
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm"
                >
                  {/* Question Card Top Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          let newOptions = q.options;
                          let newCorrect = q.correctAnswer;
                          if (newType === 'true_false') {
                            newOptions = [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }];
                            newCorrect = 'true';
                          } else if (newType === 'single_choice' && Array.isArray(newCorrect)) {
                            newCorrect = newCorrect[0] || 'opt_1';
                          } else if (newType === 'multiple_choice' && !Array.isArray(newCorrect)) {
                            newCorrect = [newCorrect];
                          }
                          updateQuestion(idx, { type: newType, options: newOptions, correctAnswer: newCorrect });
                        }}
                        className="text-xs font-bold bg-slate-100 text-slate-800 border-none rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions: Points, Up, Down, Duplicate, Delete */}
                    <div className="flex items-center space-x-1.5">
                      <div className="flex items-center space-x-1 mr-2 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500">Pts:</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={q.points || 10}
                          onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) || 10 })}
                          className="w-12 bg-transparent text-xs font-bold text-slate-900 text-center focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(idx, 1)}
                        disabled={idx === questions.length - 1}
                        title="Move Down"
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateQuestion(idx)}
                        title="Duplicate"
                        className="p-1 text-slate-400 hover:text-brand-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        title="Delete Question"
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Question Prompt <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={q.prompt}
                      onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                      placeholder="e.g. What is the standard protocol when..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {/* Question Type Specific Editor */}
                  {/* Single Choice / Multiple Choice */}
                  {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                    <div className="space-y-2.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {q.type === 'single_choice'
                            ? 'Options (Select the radio of the correct answer):'
                            : 'Options (Check all options that are correct):'}
                        </span>
                        <button
                          type="button"
                          onClick={() => addOption(idx)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {q.options?.map((opt) => {
                          const isCorrect =
                            q.type === 'single_choice'
                              ? q.correctAnswer === opt.id
                              : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id);

                          return (
                            <div key={opt.id} className="flex items-center space-x-2">
                              {q.type === 'single_choice' ? (
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={isCorrect}
                                  onChange={() => setSingleCorrect(idx, opt.id)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isCorrect}
                                  onChange={() => toggleMultipleCorrect(idx, opt.id)}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                  title="Mark as correct option"
                                />
                              )}

                              <input
                                type="text"
                                required
                                value={opt.text}
                                onChange={(e) => updateOptionText(idx, opt.id, e.target.value)}
                                placeholder="Option text..."
                                className={`flex-1 p-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                                  isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-300 font-bold text-emerald-950'
                                    : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              />

                              {isCorrect && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Correct
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => removeOption(idx, opt.id)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* True / False */}
                  {q.type === 'true_false' && (
                    <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200">
                      <span className="block text-xs font-bold text-slate-700 mb-2">
                        Correct Answer:
                      </span>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            name={`tf_${q.id}`}
                            value="true"
                            checked={q.correctAnswer === 'true'}
                            onChange={() => updateQuestion(idx, { correctAnswer: 'true' })}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                            True
                          </span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                          <input
                            type="radio"
                            name={`tf_${q.id}`}
                            value="false"
                            checked={q.correctAnswer === 'false'}
                            onChange={() => updateQuestion(idx, { correctAnswer: 'false' })}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-rose-800 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                            False
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Short Answer / Fill in blank */}
                  {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                    <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Accepted Answers (evaluated case-insensitively):
                        </span>
                        <button
                          type="button"
                          onClick={() => addAcceptedAnswer(idx)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Variation / Synonym</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(q.acceptedAnswers || ['']).map((ans, aIdx) => (
                          <div key={aIdx} className="flex items-center space-x-2">
                            <input
                              type="text"
                              required
                              value={ans}
                              onChange={(e) => updateAcceptedAnswer(idx, aIdx, e.target.value)}
                              placeholder={`Accepted answer ${aIdx + 1}...`}
                              className="flex-1 p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                            />
                            {(q.acceptedAnswers || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAcceptedAnswer(idx, aIdx)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation Field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Explanation / Learning Note (shown to user upon completing quiz)
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
                      placeholder="e.g. This is required by regulatory policy section 4.1..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-brand-600/25 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Quiz...' : isEditing ? 'Update Quiz' : 'Create Quiz'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

