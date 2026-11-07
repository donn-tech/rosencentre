import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginView from './components/LoginView';

// Member Views
import QuizList from './components/UserView/QuizList';
import QuizRunner from './components/UserView/QuizRunner';
import QuizResult from './components/UserView/QuizResult';
import MyHistory from './components/UserView/MyHistory';

// Admin Views
import OverviewTab from './components/AdminDashboard/OverviewTab';
import QuizzesTab from './components/AdminDashboard/QuizzesTab';
import WhitelistTab from './components/AdminDashboard/WhitelistTab';
import SubmissionsTab from './components/AdminDashboard/SubmissionsTab';
import MusicTab from './components/AdminDashboard/MusicTab';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';

export default function App() {
  const { user, isAdmin, isAuthenticated, loginMember } = useAuth();

  // Active navigation tab
  // For Admin: 'overview' | 'quizzes' | 'whitelist' | 'submissions' | 'music'
  // For Member: 'available' | 'history'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'overview' : 'available');

  // Sub-views for Quiz Taking workflow: 'list' | 'taking' | 'result'
  const [memberWorkflowState, setMemberWorkflowState] = useState('list');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  // Inspector modal target from Overview tab
  const [inspectedSub, setInspectedSub] = useState(null);

  // Handle switching tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setMemberWorkflowState('list');
    setCurrentQuiz(null);
  };

  // Member Quiz Taking Handlers
  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setMemberWorkflowState('taking');
  };

  const handleCancelQuiz = () => {
    if (window.confirm('Are you sure you want to exit? Your answers will not be saved.')) {
      setMemberWorkflowState('list');
      setCurrentQuiz(null);
    }
  };

  const handleCompleteQuiz = (submissionData) => {
    setCurrentResult(submissionData);
    setMemberWorkflowState('result');
  };

  const handleViewResult = (submission) => {
    setCurrentResult(submission);
    setMemberWorkflowState('result');
  };

  const handleRetakeQuiz = () => {
    if (currentQuiz) {
      setMemberWorkflowState('taking');
    } else if (currentResult?.quizId) {
      // Fetch quiz and launch
      fetch(`/api/quizzes/${currentResult.quizId}?forTake=true`)
        .then((res) => res.json())
        .then((quiz) => {
          setCurrentQuiz(quiz);
          setMemberWorkflowState('taking');
        })
        .catch(() => {
          setMemberWorkflowState('list');
        });
    } else {
      setMemberWorkflowState('list');
    }
  };

  const handleBackToQuizzes = () => {
    setMemberWorkflowState('list');
    setCurrentQuiz(null);
    setCurrentResult(null);
    setActiveTab('available');
  };

  // Admin Quick Switch to Member
  const handleQuickLoginAs = async (email, firstName) => {
    await loginMember(email, firstName);
    setActiveTab('available');
    setMemberWorkflowState('list');
  };

  // Admin Preview Quiz
  const handleAdminPreview = (quiz) => {
    setCurrentQuiz(quiz);
    setMemberWorkflowState('taking');
  };

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentView={memberWorkflowState}
        setCurrentView={() => {
          setMemberWorkflowState('list');
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isAdmin ? (
          /* ================= ADMIN CONSOLE ================= */
          memberWorkflowState === 'taking' && currentQuiz ? (
            <QuizRunner
              quiz={currentQuiz}
              onCancel={() => {
                setMemberWorkflowState('list');
                setCurrentQuiz(null);
              }}
              onComplete={handleCompleteQuiz}
            />
          ) : memberWorkflowState === 'result' && currentResult ? (
            <QuizResult
              submission={currentResult}
              onRetake={handleRetakeQuiz}
              onBackToQuizzes={() => {
                setMemberWorkflowState('list');
                setCurrentResult(null);
              }}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  onInspectSubmission={(sub) => {
                    setInspectedSub(sub);
                    setActiveTab('submissions');
                  }}
                  onGoToQuizzes={() => setActiveTab('quizzes')}
                  onGoToWhitelist={() => setActiveTab('whitelist')}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizzesTab onPreviewQuiz={handleAdminPreview} />
              )}

              {activeTab === 'whitelist' && (
                <WhitelistTab onQuickLoginAs={handleQuickLoginAs} />
              )}

              {activeTab === 'submissions' && (
                <SubmissionsTab
                  inspectedSub={inspectedSub}
                  onClearInspect={() => setInspectedSub(null)}
                />
              )}

              {activeTab === 'music' && (
                <MusicTab />
              )}
            </>
          )
        ) : (
          /* ================= TEAM MEMBER PORTAL ================= */
          <>
            {memberWorkflowState === 'taking' && currentQuiz ? (
              <QuizRunner
                quiz={currentQuiz}
                onCancel={handleCancelQuiz}
                onComplete={handleCompleteQuiz}
              />
            ) : memberWorkflowState === 'result' && currentResult ? (
              <QuizResult
                submission={currentResult}
                onRetake={handleRetakeQuiz}
                onBackToQuizzes={handleBackToQuizzes}
              />
            ) : activeTab === 'history' ? (
              <MyHistory onViewResult={handleViewResult} />
            ) : (
              <QuizList
                onStartQuiz={handleStartQuiz}
                onViewResult={handleViewResult}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Global YouTube Music Player */}
      <MusicPlayer />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            TeamQuiz Pro &copy; {new Date().getFullYear()} — Enterprise Quiz & Certification Platform
          </p>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>Role: <strong className="text-slate-700 capitalize">{user?.role}</strong></span>
            <span>•</span>
            <span>User: <strong className="text-slate-700">{user?.firstName || user?.name}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

