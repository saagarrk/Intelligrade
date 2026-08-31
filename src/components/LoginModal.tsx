import React, { useState } from 'react';
import { 
  UserRole 
} from '../types';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  X, 
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetRole
}) => {
  const { login, user, role: currentRole, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');
  const [selectedRole, setSelectedRole] = useState<UserRole>(targetRole || 'teacher');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg(null);
    const demo = DEMO_USERS[role];
    const res = await login(demo.email, role === 'student' ? 'student123' : role === 'teacher' ? 'teacher123' : 'admin123', role);
    if (res.success) {
      setSuccessMsg(`Authenticated successfully as ${demo.name} (${role.toUpperCase()})`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      setErrorMsg(res.error || 'Authentication failed');
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }
    setErrorMsg(null);
    const res = await login(email, password);
    if (res.success) {
      setSuccessMsg('Authentication successful!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      setErrorMsg(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-login-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Authentication & Role Authorization
            </h2>
            <p className="text-xs text-zinc-400">
              Select one of the 3 pre-configured role profiles or enter credentials.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            id="tab-quick-role-select"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'quick'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1-Click 3-Role Demo Login
          </button>
          <button
            id="tab-custom-creds"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'custom'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Custom Credentials
          </button>
        </div>

        {activeTab === 'quick' ? (
          <div className="space-y-3">
            {/* 1. STUDENT LOGIN CARD */}
            <div 
              onClick={() => handleQuickLogin('student')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                currentRole === 'student'
                  ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-zinc-800/40 border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{DEMO_USERS.student.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Student
                    </span>
                    {currentRole === 'student' && (
                      <span className="text-[10px] text-zinc-400 font-normal">(Active)</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{DEMO_USERS.student.email} • Roll: {DEMO_USERS.student.rollNumber}</p>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    Permissions: View Graded Papers, OCR Breakdown, Radar Skills, Appeal Remarking
                  </p>
                </div>
              </div>
              <button 
                id="btn-login-student-role"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition shadow-sm"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. TEACHER LOGIN CARD */}
            <div 
              onClick={() => handleQuickLogin('teacher')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                currentRole === 'teacher'
                  ? 'bg-indigo-950/20 border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : 'bg-zinc-800/40 border-zinc-800 hover:border-indigo-500/40 hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{DEMO_USERS.teacher.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Teacher
                    </span>
                    {currentRole === 'teacher' && (
                      <span className="text-[10px] text-zinc-400 font-normal">(Active)</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{DEMO_USERS.teacher.email} • {DEMO_USERS.teacher.title}</p>
                  <p className="text-[11px] text-indigo-400/80 mt-1">
                    Permissions: Preprocessing Engine, OCR Edit, AI Grading, Mark Overrides, Batch Mode
                  </p>
                </div>
              </div>
              <button 
                id="btn-login-teacher-role"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition shadow-sm"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. ADMIN LOGIN CARD */}
            <div 
              onClick={() => handleQuickLogin('admin')}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between group ${
                currentRole === 'admin'
                  ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-zinc-800/40 border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100">{DEMO_USERS.admin.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Admin
                    </span>
                    {currentRole === 'admin' && (
                      <span className="text-[10px] text-zinc-400 font-normal">(Active)</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{DEMO_USERS.admin.email} • {DEMO_USERS.admin.title}</p>
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    Permissions: Full Root Access, User & Role Management, Audit Logs, Spring Boot Admin
                  </p>
                </div>
              </div>
              <button 
                id="btn-login-admin-role"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 opacity-90 group-hover:opacity-100 transition shadow-sm"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  id="input-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. teacher@intelligrade.edu"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Demo emails: student@intelligrade.edu, teacher@intelligrade.edu, admin@intelligrade.edu
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  id="input-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Demo passwords: student123, teacher123, admin123
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                id="btn-submit-custom-login"
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            RBAC Authorization Active
          </span>
          <span>IntelliGrade v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
