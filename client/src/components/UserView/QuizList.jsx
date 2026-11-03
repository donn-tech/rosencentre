import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

export default function QuizList({ onStartQuiz, onViewResult }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchQuizzesAndHistory();
  }, [user.email]);

  const fetchQuizzesAndHistory = async () => {
    setLoading(true);
    try {
      // Fetch published quizzes
      const qRes = await fetch('/api/quizzes?forTake=true');
      const qData = await qRes.json();
      setQuizzes(Array.isArray(qData) ? qData : []);

      // Fetch user's previous submissions
      const sRes = await fetch(`/api/submissions?userEmail=${encodeURIComponent(user.email)}`);
      const sData = await sRes.json();
      setUserSubmissions(Array.isArray(sData) ? sData : []);
    } catch (err) {
      console.error('Error fetching quiz data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Map quizId to user's latest submission
  const submissionsByQuiz = {};
  userSubmissions.forEach((sub) => {
    if (!submissionsByQuiz[sub.quizId]) {
      submissionsByQuiz[sub.quizId] = sub; // latest submission because sorted desc
    }
  });

  const categories = ['all', ...new Set(quizzes.map((q) => q.category).filter(Boolean))];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-700/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Authorized Team Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-brand-100 text-sm leading-relaxed">
            Select an assessment below to test and certify your knowledge. Your scores and answers will be recorded directly to the management dashboard.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-4/5"></div>
              <div className="h-10 bg-slate-200 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Quizzes Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== 'all'
              ? 'Try adjusting your search query or category filter.'
              : 'No quizzes have been published yet by your administrator.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const latestSub = submissionsByQuiz[quiz.id];
            const hasCompleted = !!latestSub;
            const passed = latestSub?.passed;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-100">
                      {quiz.category || 'General'}
                    </span>

                    {hasCompleted && (
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-md ${
                          passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed ({latestSub.percentage}%)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Failed ({latestSub.percentage}%)</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Complete this quiz to test your mastery of this topic.'}
                  </p>

                  {/* Meta stats */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Questions</p>
                      <p className="font-extrabold text-slate-800 mt-0.5">{quiz.questionCount}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Pass Mark</p>
                      <p className="font-extrabold text-slate-800 mt-0.5">{quiz.passingScorePercentage}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Time</p>
                      <p className="font-extrabold text-slate-800 mt-0.5">
                        {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes}m` : 'None'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  {hasCompleted ? (
                    <>
                      <button
                        onClick={() => onViewResult(latestSub)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onStartQuiz(quiz)}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-brand-600/20 transition-all"
                    >
                      <span>Start Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

