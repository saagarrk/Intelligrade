import React, { useState } from 'react';
import { UserRole, RegisterData } from '../types';
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
  Shield,
  GraduationCap, 
  BookOpen, 
  User as UserIcon, 
  Lock, 
  Mail, 
  X, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Key
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthPage?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenAuthPage }) => {
  const { user, login, register, logout, isLoading } = useAuth();
  const currentRole = user?.role;

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'student');

  // Custom Sign In States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register States
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regDepartment, setRegDepartment] = useState<string>('Computer Science & Engineering');
  const [regRollNumber, setRegRollNumber] = useState<string>('');
  const [regAdminKey, setRegAdminKey] = useState<string>('');
  const [regTeacherKey, setRegTeacherKey] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      showWarningAlert('Missing Credentials', 'Please enter your email and password.');
      return;
    }
    setErrorMsg(null);
    const res = await login(email.trim(), password, selectedRole);
    if (res.success) {
      setSuccessMsg(`Authentication successful!`);
      showSweetToast(`Welcome! Signed in as ${selectedRole.toUpperCase()}`, 'success');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } else {
      const err = res.error || 'Invalid credentials.';
      setErrorMsg(err);
      if (err.includes('Access Denied')) {
        const accountRole = err.includes('Student') ? 'student' : err.includes('Faculty') || err.includes('Teacher') ? 'teacher' : 'admin';
        showRoleMismatchAlert(accountRole, selectedRole, () => {
          setSelectedRole(accountRole as UserRole);
          setErrorMsg(null);
          showSweetToast(`Switched to ${accountRole.toUpperCase()} portal`, 'info');
        });
      } else {
        showErrorAlert('Sign In Failed', `<p class="text-xs text-zinc-300">${err}</p>`);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      showWarningAlert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    const nameCheck = validateLegalName(regName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || 'Invalid Full Legal Name.');
      showErrorAlert('Invalid Full Legal Name', `<div class="space-y-1"><p class="text-xs text-zinc-300">${nameCheck.error}</p><p class="text-[11px] text-amber-400">Institutional records require a valid legal name without numbers or special symbols.</p></div>`);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      showWarningAlert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }

    const VALID_ADMIN_KEYS = ['ADMIN-SEC-2026', 'ADMIN-2026-KEY', 'admin123'];
    const VALID_TEACHER_KEYS = ['TEACHER-SEC-2026', 'FACULTY-2026-KEY', 'teacher123'];

    if (regRole === 'admin' && (!regAdminKey || !VALID_ADMIN_KEYS.includes(regAdminKey.trim()))) {
      setErrorMsg('Invalid Administrator Security Master Key.');
      showErrorAlert('Invalid Admin Key', 'Please provide a valid Administrator Security Key. Authorization required.');
      return;
    }

    if (regRole === 'teacher' && (!regTeacherKey || !VALID_TEACHER_KEYS.includes(regTeacherKey.trim()))) {
      setErrorMsg('Invalid Faculty Authorization Secret Key.');
      showErrorAlert('Invalid Teacher Key', 'Please provide a valid Faculty Authorization Secret Key. Only verified teachers possess this key.');
      return;
    }

    setErrorMsg(null);
    const payload: RegisterData = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      department: regDepartment,
      rollNumber: regRole === 'student' ? (regRollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}`) : undefined,
      title: regRole === 'teacher' ? 'Faculty Instructor' : regRole === 'admin' ? 'System Administrator' : undefined,
      adminKey: regRole === 'admin' ? regAdminKey.trim() : undefined,
      teacherKey: regRole === 'teacher' ? regTeacherKey.trim() : undefined
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(`Registered successfully as ${regName} (${regRole.toUpperCase()})!`);
      showSuccessAlert('Account Created', `<p class="text-xs text-zinc-300">Successfully registered as <strong>${regName}</strong> (${regRole.toUpperCase()}).</p>`, 1500);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      const err = res.error || 'Registration failed.';
      setErrorMsg(err);
      showErrorAlert('Registration Error', `<p class="text-xs text-zinc-300">${err}</p>`);
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
              Institutional Authentication
            </h2>
            <p className="text-xs text-zinc-400">
              Sign in with your verified credentials or create a new academic account.
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
            id="tab-signin-modal"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'signin'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-register-modal"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Target Role Portal
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    selectedRole === 'student'
                      ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    selectedRole === 'teacher'
                      ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    selectedRole === 'admin'
                      ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`e.g. yourname@university.edu`}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-9 pr-10 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                {(() => {
                  const nameStatus = regName.trim() ? validateLegalName(regName) : null;
                  const hasNumbers = /\d/.test(regName);
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-zinc-300">Full Legal Name</label>
                        {nameStatus && (
                          <span className={`text-[10px] font-medium ${!nameStatus.isValid ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {!nameStatus.isValid ? (hasNumbers ? 'No digits' : 'Letters only') : 'Valid'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Jordan Hayes"
                          className={`w-full bg-zinc-800/80 border rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none transition ${
                            nameStatus && !nameStatus.isValid
                              ? 'border-rose-500/80 focus:border-rose-500 text-rose-200'
                              : 'border-zinc-700 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                      {nameStatus && !nameStatus.isValid && (
                        <p className="text-[10px] text-rose-400 mt-1 flex items-start gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>{nameStatus.error}</span>
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@university.edu"
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Role Designation</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('student')}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition ${
                    regRole === 'student' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('teacher')}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition ${
                    regRole === 'teacher' ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                  }`}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('admin')}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition ${
                    regRole === 'admin' ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {regRole === 'student' && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Student Roll Number</label>
                <input
                  type="text"
                  value={regRollNumber}
                  onChange={(e) => setRegRollNumber(e.target.value)}
                  placeholder="e.g. CS-2026-042"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {regRole === 'teacher' && (
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-1">Faculty Authorization Secret Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regTeacherKey}
                    onChange={(e) => setRegTeacherKey(e.target.value)}
                    placeholder="Enter confidential faculty key"
                    className="w-full bg-zinc-800/80 border border-indigo-500/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-indigo-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Confidential key issued only to verified faculty.</p>
              </div>
            )}

            {regRole === 'admin' && (
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">Administrator Master Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={regAdminKey}
                    onChange={(e) => setRegAdminKey(e.target.value)}
                    placeholder="Enter Master Key"
                    className="w-full bg-zinc-800/80 border border-amber-500/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Confidential security clearance key for system admins.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <span>Register Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Link to Full Auth Page */}
        {onOpenAuthPage && (
          <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenAuthPage();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition inline-flex items-center gap-1 font-medium"
            >
              <span>Open Full Academic Portal Page</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
