import React, { useState } from 'react';
import { UserRole, User, RegisterData } from '../types';
import { useAuth } from '../context/AuthContext';
import { validateLegalName } from '../utils/nameValidation';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showRoleMismatchAlert, 
  showSweetToast, 
  showWarningAlert 
} from '../utils/sweetAlert';
import { 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Sparkles,
  ArrowLeft,
  Key,
  Fingerprint,
  Building,
  Shield
} from 'lucide-react';

interface AuthPageProps {
  onBackToApp?: () => void;
  defaultRole?: UserRole;
  initialRole?: UserRole;
  defaultMode?: 'signin' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onBackToApp,
  defaultRole = 'student',
  initialRole,
  defaultMode = 'signin'
}) => {
  const { login, register, isAuthenticated, user, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>(defaultMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || defaultRole);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [showSignInPassword, setShowSignInPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register Form States
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regDepartment, setRegDepartment] = useState<string>('Computer Science & Engineering');
  const [regRollNumber, setRegRollNumber] = useState<string>('');
  const [regTitle, setRegTitle] = useState<string>('Assistant Professor');
  const [regAdminKey, setRegAdminKey] = useState<string>('');
  const [regTeacherKey, setRegTeacherKey] = useState<string>('');
  const [showTeacherKey, setShowTeacherKey] = useState<boolean>(false);
  const [showAdminKey, setShowAdminKey] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter your registered institutional email and password.');
      showWarningAlert('Incomplete Credentials', 'Please enter your registered institutional email and password to proceed.');
      return;
    }
    setErrorMsg(null);
    const res = await login(signInEmail.trim(), signInPassword, selectedRole);
    if (res.success) {
      setSuccessMsg('Authentication successful! Initializing secure workspace...');
      showSuccessAlert(
        'Welcome Back!', 
        `<div class="space-y-1"><p class="font-semibold text-emerald-400">Authenticated successfully as ${selectedRole.toUpperCase()}</p><p class="text-xs text-zinc-400">Initializing your secure grading environment...</p></div>`,
        1500
      );
      setTimeout(() => {
        setSuccessMsg(null);
        if (onBackToApp) onBackToApp();
      }, 1200);
    } else {
      const err = res.error || 'Invalid credentials. Please verify your email and password.';
      setErrorMsg(err);

      if (err.includes('Access Denied')) {
        // Extract role if present
        const accountRole = err.includes('Student') ? 'student' : err.includes('Faculty') || err.includes('Teacher') ? 'teacher' : 'admin';
        showRoleMismatchAlert(accountRole, selectedRole, () => {
          setSelectedRole(accountRole as UserRole);
          setErrorMsg(null);
          showSweetToast(`Switched to ${accountRole.toUpperCase()} portal`, 'info');
        });
      } else {
        showErrorAlert('Authentication Failed', `<p class="text-xs text-zinc-300">${err}</p>`);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      showWarningAlert('Missing Information', 'Please complete all required fields in the registration form.');
      return;
    }

    const nameCheck = validateLegalName(regName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || 'Invalid Full Legal Name.');
      showErrorAlert('Invalid Full Legal Name', `<div class="space-y-1"><p class="text-xs text-zinc-300">${nameCheck.error}</p><p class="text-[11px] text-amber-400">Institutional records require a valid legal name without numbers or special symbols.</p></div>`);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      showWarningAlert('Password Too Short', 'Security policy requires passwords to be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      showErrorAlert('Password Mismatch', 'The passwords entered do not match. Please verify and retype.');
      return;
    }

    const VALID_ADMIN_KEYS = ['ADMIN-SEC-2026', 'ADMIN-2026-KEY', 'admin123'];
    const VALID_TEACHER_KEYS = ['TEACHER-SEC-2026', 'FACULTY-2026-KEY', 'teacher123'];

    if (selectedRole === 'admin' && (!regAdminKey || !VALID_ADMIN_KEYS.includes(regAdminKey.trim()))) {
      setErrorMsg('Invalid Administrator Security Master Key. Contact IT security operations.');
      showErrorAlert('Unauthorized Admin Request', 'Invalid Administrator Security Master Key. Security clearance code required.');
      return;
    }

    if (selectedRole === 'teacher' && (!regTeacherKey || !VALID_TEACHER_KEYS.includes(regTeacherKey.trim()))) {
      setErrorMsg('Invalid Faculty Authorization Secret Key. Contact your department chair.');
      showErrorAlert('Unauthorized Faculty Request', 'Invalid Faculty Authorization Secret Key. Only verified teachers and faculty members possess this authorization key.');
      return;
    }

    setErrorMsg(null);
    const payload: RegisterData = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: selectedRole,
      department: regDepartment,
      rollNumber: selectedRole === 'student' ? (regRollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}`) : undefined,
      title: selectedRole === 'teacher' ? regTitle : selectedRole === 'admin' ? 'System Administrator' : undefined,
      adminKey: selectedRole === 'admin' ? regAdminKey.trim() : undefined,
      teacherKey: selectedRole === 'teacher' ? regTeacherKey.trim() : undefined
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(`Account created successfully for ${regName}! Redirecting to ${selectedRole} workspace...`);
      showSuccessAlert(
        'Account Provisioned!',
        `<div class="space-y-1"><p class="font-bold text-emerald-400">Welcome, ${regName}!</p><p class="text-xs text-zinc-300">Your ${selectedRole.toUpperCase()} account has been created with assigned RBAC permissions.</p></div>`,
        2000
      );
      setTimeout(() => {
        setSuccessMsg(null);
        if (onBackToApp) onBackToApp();
      }, 1500);
    } else {
      const err = res.error || 'Registration failed. Please check the information provided.';
      setErrorMsg(err);
      showErrorAlert('Registration Error', `<p class="text-xs text-zinc-300">${err}</p>`);
    }
  };

  const roleTheme = 
    selectedRole === 'admin' ? {
      accent: 'amber',
      bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white',
      borderActive: 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-500/5',
      icon: ShieldCheck,
      desc: 'System Security, RBAC Directory & Audit Ledger'
    } : selectedRole === 'teacher' ? {
      accent: 'indigo',
      bgBadge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      borderActive: 'border-indigo-500 ring-1 ring-indigo-500/30 bg-indigo-500/5',
      icon: BookOpen,
      desc: 'Automated Grading, Model Rubrics & OCR Studio'
    } : {
      accent: 'emerald',
      bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      borderActive: 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-500/5',
      icon: GraduationCap,
      desc: 'Student Performance Portal, Knowledge Radar & Appeals'
    };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">IntelliGrade</span>
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                  PRODUCTION PORTAL
                </span>
              </div>
              <p className="text-xs text-zinc-400">Context-Aware Multimodal Grading & Academic Assessment Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && onBackToApp && (
              <button
                id="btn-return-to-workspace"
                onClick={onBackToApp}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Workspace ({user?.role})</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
              <span>REST Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Institutional Value & Role Selector */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                Academic Portal Login
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Please select your designated portal role and sign in with your verified institutional credentials.
              </p>

              {/* 3 Role Preset Selection Cards */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Select Access Portal
                </div>

                {/* 1. Student Card */}
                <div
                  id="auth-role-card-student"
                  onClick={() => {
                    setSelectedRole('student');
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedRole === 'student'
                      ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Student Portal</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Review graded assessments, radar analytics, and submit remarking appeals.</p>
                    </div>
                  </div>
                  {selectedRole === 'student' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </div>

                {/* 2. Teacher Card */}
                <div
                  id="auth-role-card-teacher"
                  onClick={() => {
                    setSelectedRole('teacher');
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedRole === 'teacher'
                      ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Faculty / Teacher Portal</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">Multimodal OCR transcription, rubric customization & batch evaluation.</p>
                    </div>
                  </div>
                  {selectedRole === 'teacher' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                  )}
                </div>

                {/* 3. Admin Card */}
                <div
                  id="auth-role-card-admin"
                  onClick={() => {
                    setSelectedRole('admin');
                    setErrorMsg(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    selectedRole === 'admin'
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">System Administrator</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">RBAC directory management, security audit ledger & model controls.</p>
                    </div>
                  </div>
                  {selectedRole === 'admin' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Enterprise Security Features */}
            <div className="mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enterprise Security & Compliance</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Sessions are cryptographically signed with fine-grained role authorization tokens to ensure institutional assessment integrity.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Sign In / Register) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col justify-between">
            
            <div>
              {/* Mode Toggle Bar: Sign In vs Register */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-6">
                <button
                  id="tab-btn-signin"
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    mode === 'signin'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  id="tab-btn-register"
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    mode === 'register'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Status Messages */}
              {successMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span className="font-medium">{errorMsg}</span>
                  </div>
                  {/* Dynamic Role Switch Helper */}
                  {errorMsg.includes('Access Denied') && (
                    <div className="pt-2 border-t border-rose-900/40 flex items-center gap-2">
                      <span className="text-[11px] text-zinc-300">Quick fix:</span>
                      {errorMsg.toLowerCase().includes('teacher') && selectedRole !== 'teacher' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole('teacher');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                        >
                          Switch to Faculty / Teacher Portal
                        </button>
                      )}
                      {errorMsg.toLowerCase().includes('student') && selectedRole !== 'student' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole('student');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                        >
                          Switch to Student Portal
                        </button>
                      )}
                      {errorMsg.toLowerCase().includes('admin') && selectedRole !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole('admin');
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition"
                        >
                          Switch to Admin Portal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Security Policy Badge */}
              <div className="mb-4 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Portal Target: <strong className="text-zinc-200">{selectedRole.toUpperCase()}</strong> credentials required
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
                  Strict Validation Active
                </span>
              </div>

              {/* ================================================================= */}
              {/* 1. SIGN IN FORM */}
              {/* ================================================================= */}
              {mode === 'signin' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">Sign In</h2>
                      <p className="text-xs text-zinc-400">Enter your credentials to access the {selectedRole} portal.</p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${roleTheme.bgBadge}`}>
                      {selectedRole.toUpperCase()}
                    </span>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signin-email"
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder={`e.g. yourname@university.edu`}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-zinc-300">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signin-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      Encrypted Bearer Session
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-signin"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg ${roleTheme.btn} disabled:opacity-50`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating credentials...
                      </span>
                    ) : (
                      <>
                        <span>Sign In as {selectedRole.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ================================================================= */}
              {/* 2. REGISTRATION FORM */}
              {/* ================================================================= */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">Create New Account</h2>
                      <p className="text-xs text-zinc-400">Register as a student, faculty member, or system admin.</p>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${roleTheme.bgBadge}`}>
                      {selectedRole.toUpperCase()}
                    </span>
                  </div>

                  {/* Role Selection Pills in Register */}
                  <div className="grid grid-cols-3 gap-2 pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === 'student'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === 'teacher'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Faculty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === 'admin'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </button>
                  </div>

                  {/* Name & Email Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      {(() => {
                        const nameStatus = regName.trim() ? validateLegalName(regName) : null;
                        const hasNumbers = /\d/.test(regName);
                        return (
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-zinc-300">
                                Full Legal Name
                              </label>
                              {nameStatus && (
                                <span className={`text-[10px] font-medium ${!nameStatus.isValid ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  {!nameStatus.isValid ? (hasNumbers ? 'No digits allowed' : 'Invalid characters') : 'Valid format (letters only)'}
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                id="input-reg-name"
                                type="text"
                                required
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                placeholder="e.g. Jordan Hayes"
                                className={`w-full bg-zinc-950 border rounded-xl pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition ${
                                  nameStatus && !nameStatus.isValid
                                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-200'
                                    : 'border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                }`}
                              />
                            </div>
                            {nameStatus && !nameStatus.isValid && (
                              <p className="text-[11px] text-rose-400 mt-1 flex items-start gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>{nameStatus.error}</span>
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-email"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="user@university.edu"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role Specific Dynamic Fields */}
                  {selectedRole === 'student' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Student Roll / ID Number
                        </label>
                        <input
                          id="input-reg-roll"
                          type="text"
                          value={regRollNumber}
                          onChange={(e) => setRegRollNumber(e.target.value)}
                          placeholder="e.g. CS-2026-089"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Academic Department
                        </label>
                        <select
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                          <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                          <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Information Technology">Information Technology</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'teacher' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Academic Title / Designation
                          </label>
                          <input
                            id="input-reg-title"
                            type="text"
                            value={regTitle}
                            onChange={(e) => setRegTitle(e.target.value)}
                            placeholder="e.g. Associate Professor"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Department
                          </label>
                          <select
                            value={regDepartment}
                            onChange={(e) => setRegDepartment(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Department of Computer Science">Department of Computer Science</option>
                            <option value="Department of Data Science & AI">Department of Data Science & AI</option>
                            <option value="Department of Mathematics & Computing">Department of Mathematics & Computing</option>
                            <option value="School of Engineering">School of Engineering</option>
                          </select>
                        </div>
                      </div>

                      {/* Teacher Confidential Secret Key */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Faculty Authorization Secret Key</span>
                          </label>
                          <span className="text-[10px] text-zinc-400">
                            Confidential • Faculty Only
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-reg-teacherkey"
                            type={showTeacherKey ? 'text' : 'password'}
                            required
                            value={regTeacherKey}
                            onChange={(e) => setRegTeacherKey(e.target.value)}
                            placeholder="Enter confidential faculty secret key"
                            className="w-full bg-zinc-950 border border-indigo-500/40 rounded-xl pl-10 pr-10 py-2 text-xs text-indigo-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTeacherKey(!showTeacherKey)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                            title={showTeacherKey ? "Hide key" : "Show key"}
                          >
                            {showTeacherKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Private security key issued exclusively to verified department faculty members.
                        </p>
                      </div>
                    </>
                  )}

                  {selectedRole === 'admin' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          <span>Administrator Security Master Key</span>
                        </label>
                        <span className="text-[10px] text-zinc-400">
                          Confidential • IT Security Operations
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-adminkey"
                          type={showAdminKey ? 'text' : 'password'}
                          required
                          value={regAdminKey}
                          onChange={(e) => setRegAdminKey(e.target.value)}
                          placeholder="Enter administrator security master key"
                          className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl pl-10 pr-10 py-2 text-xs text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminKey(!showAdminKey)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                          title={showAdminKey ? "Hide key" : "Show key"}
                        >
                          {showAdminKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Root security clearance key required to authorize system administrative privileges.
                      </p>
                    </div>
                  )}

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Create Password (min 6)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-confirm-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg ${roleTheme.btn} disabled:opacity-50 mt-2`}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account & assigning RBAC tokens...
                      </span>
                    ) : (
                      <>
                        <span>Register & Create {selectedRole.toUpperCase()} Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>

            {/* Bottom Security Info */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
                <span>JWT Token Cryptography + Session Storage</span>
              </div>
              <span className="text-zinc-400">Institutional REST API Enabled</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-3 px-6 text-center text-xs text-zinc-400">
        <p>IntelliGrade AI Academic Assessment Suite • Multi-Role Authentication & Access Control System</p>
      </footer>

    </div>
  );
};
