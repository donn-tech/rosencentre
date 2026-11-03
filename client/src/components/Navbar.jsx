import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Shield, 
  User, 
  LogOut, 
  BookOpen, 
  Users, 
  BarChart3, 
  FileCheck2, 
  Layers
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentView, setCurrentView }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('main')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Team<span className="text-brand-600">Quiz</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Team Knowledge & Assessment Hub</p>
            </div>
          </div>

          {/* Navigation Links based on role */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'quizzes'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Manage Quizzes</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('whitelist')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'whitelist'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Authorized Emails</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'submissions'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Submissions</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('available')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'available'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Available Quizzes</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'history'
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>My Quiz Results</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2.5 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isAdmin ? 'bg-amber-600' : 'bg-brand-600'
                  }`}>
                    {isAdmin ? <Shield className="w-4 h-4" /> : user.firstName?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left text-xs hidden sm:block">
                    <p className="font-semibold text-slate-800 leading-none">
                      {isAdmin ? 'Administrator' : user.firstName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-normal leading-none mt-1">
                      {user.email}
                    </p>
                  </div>
                  {isAdmin && (
                    <span className="hidden sm:inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        {user && (
          <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'overview' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'quizzes' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('whitelist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'whitelist' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  Authorized Emails
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'submissions' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  Submissions
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'available' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  Available Quizzes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    activeTab === 'history' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`}
                >
                  My Results
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

