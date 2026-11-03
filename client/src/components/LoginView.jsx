import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Shield, 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

export default function LoginView() {
  const { loginMember, loginAdmin, authError, clearError, loading } = useAuth();
  
  const [tab, setTab] = useState('member'); // 'member' | 'admin'
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    await loginMember(email.trim(), firstName.trim());
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim()) return;
    await loginAdmin(adminEmail.trim(), adminPassword.trim());
  };

  const fillMemberDemo = (demoEmail, demoName) => {
    setEmail(demoEmail);
    setFirstName(demoName);
    clearError();
  };

  const fillAdminDemo = () => {
    setAdminEmail('admin@company.com');
    setAdminPassword('admin');
    clearError();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-xl shadow-brand-500/25 mb-2">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Knowledge Assessment
          </h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Log in with your authorized company email to access assigned team quizzes and track your progress.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setTab('member'); clearError(); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'member'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>Team Member</span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('admin'); clearError(); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                tab === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Admin Portal</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error banner */}
            {authError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Access Restriction</p>
                  <p className="leading-relaxed">{authError}</p>
                </div>
              </div>
            )}

            {tab === 'member' ? (
              <form onSubmit={handleMemberSubmit} className="space-y-4">
                {/* First Name Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Sarah"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your name will be displayed on your quiz results and admin report.
                  </p>
                </div>

                {/* Email Address Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Work Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must be pre-authorized by your quiz administrator.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying Authorization...</span>
                  ) : (
                    <>
                      <span>Enter Quiz Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Pre-fill for testing */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick Test Authorized Accounts:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { email: 'sarah@company.com', name: 'Sarah' },
                      { email: 'alex@company.com', name: 'Alex' },
                      { email: 'michael@company.com', name: 'Michael' },
                      { email: 'team@company.com', name: 'Taylor' }
                    ].map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => fillMemberDemo(account.email, account.name)}
                        className="text-[11px] bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium"
                      >
                        {account.name} ({account.email.split('@')[0]})
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Admin console allows creating quizzes, authorizing emails, and tracking scores.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-slate-900/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Sign In as Admin</span>
                </button>

                {/* 1-Click Demo Fill */}
                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={fillAdminDemo}
                    className="text-xs text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center space-x-1"
                  >
                    <span>Autofill Default Admin Credentials (admin@company.com / admin)</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security badge note */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Access strictly restricted to authorized team members</span>
        </div>
      </div>
    </div>
  );
}

