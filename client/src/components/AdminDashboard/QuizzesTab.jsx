import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Search, 
  Clock, 
  Award, 
  CheckCircle2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Sparkles
} from 'lucide-react';
import QuizEditorModal from './QuizEditorModal';

export default function QuizzesTab({ onPreviewQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Editor modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quizzes?includeDrafts=true');
      const data = await res.json();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingQuiz(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setIsEditorOpen(true);
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await fetch(`/api/quizzes/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to duplicate quiz');
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quiz');
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (quiz) => {
    const newStatus = quiz.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quiz, status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update quiz status');
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveQuiz = () => {
    setIsEditorOpen(false);
    setEditingQuiz(null);
    fetchQuizzes();
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(term) ||
      (q.category && q.category.toLowerCase().includes(term)) ||
      (q.description && q.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quiz Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, and organize quizzes for your team with multiple question types.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/20 active:scale-[0.99] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title or category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 hidden sm:block">
          {filteredQuizzes.length} Quizzes configured
        </span>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Quizzes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search ? 'No quizzes match your search criteria.' : 'Click "Create New Quiz" above to add your first assessment.'}
          </p>
          {!search && (
            <button
              onClick={handleCreateNew}
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Quiz</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuizzes.map((quiz) => {
            const isPublished = quiz.status === 'published';
            const totalPoints = quiz.questions
              ? quiz.questions.reduce((acc, q) => acc + (Number(q.points) || 10), 0)
              : 0;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-brand-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Quiz Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100">
                      {quiz.category || 'General'}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(quiz)}
                      title="Click to toggle status"
                      className={`inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors ${
                        isPublished
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                      <span>{isPublished ? 'Active / Published' : 'Draft'}</span>
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                    {quiz.description || 'No description provided.'}
                  </p>

                  {/* Badges / Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.questions?.length || 0} Questions</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalPoints} Total Pts</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pass Mark: {quiz.passingScorePercentage}%</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} mins` : 'Unlimited'}</span>
                    </span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {onPreviewQuiz && (
                    <button
                      onClick={() => onPreviewQuiz(quiz)}
                      title="Preview as candidate"
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDuplicate(quiz.id)}
                    title="Duplicate Quiz"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEdit(quiz)}
                    title="Edit Quiz"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    title="Delete Quiz"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quiz Editor Modal */}
      {isEditorOpen && (
        <QuizEditorModal
          quiz={editingQuiz}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingQuiz(null);
          }}
          onSave={handleSaveQuiz}
        />
      )}
    </div>
  );
}

