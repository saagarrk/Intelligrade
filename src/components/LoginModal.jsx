import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { validateLegalName } from "../utils/nameValidation";
import { evaluatePasswordStrength } from "../utils/validationSchemas";
import {
  showSuccessAlert,
  showErrorAlert,
  showRoleMismatchAlert,
  showSweetToast,
  showWarningAlert
} from "../utils/sweetAlert";
import {
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
  Key,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  KeyRound
} from "lucide-react";

export const LoginModal = ({ isOpen, onClose, onOpenAuthPage }) => {
  const { user, login, register, forgotPassword, resetPassword, logout, isLoading } = useAuth();
  const currentRole = user?.role;

  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "register" | "forgot"
  const [selectedRole, setSelectedRole] = useState(currentRole || "student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState("student");
  const [regDepartment, setRegDepartment] = useState("Computer Science & Engineering");
  const [regRollNumber, setRegRollNumber] = useState("");
  const [regAdminKey, setRegAdminKey] = useState("");
  const [regTeacherKey, setRegTeacherKey] = useState("");

  // Forgot Password Fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDelivered, setForgotDelivered] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const regStrength = evaluatePasswordStrength(regPassword);

  const strengthColors = {
    weak: "bg-rose-500",
    moderate: "bg-amber-500",
    strong: "bg-blue-500",
    exceptional: "bg-emerald-500"
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter your email and password.");
      showWarningAlert("Missing Credentials", "Please enter your email and password.");
      return;
    }

    setErrorMsg(null);
    const res = await login(email.trim(), password, selectedRole);

    if (res.success) {
      setSuccessMsg(`Authentication successful!`);
      showSweetToast(`Welcome! Signed in as ${selectedRole.toUpperCase()}`, "success");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } else {
      const err = res.error || "Invalid credentials.";
      setErrorMsg(err);
      if (err.includes("Access Denied")) {
        const accountRole = err.includes("Student") ? "student" : err.includes("Faculty") || err.includes("Teacher") ? "teacher" : "admin";
        showRoleMismatchAlert(accountRole, selectedRole, () => {
          setSelectedRole(accountRole);
          setErrorMsg(null);
          showSweetToast(`Switched to ${accountRole.toUpperCase()} portal`, "info");
        });
      } else {
        showErrorAlert("Sign In Failed", `<p class="text-xs text-zinc-300">${err}</p>`);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg("Please fill in all required fields.");
      showWarningAlert("Incomplete Form", "Please fill in all required fields.");
      return;
    }

    const nameCheck = validateLegalName(regName);
    if (!nameCheck.isValid) {
      setErrorMsg(nameCheck.error || "Invalid Full Legal Name.");
      showErrorAlert(
        "Invalid Full Legal Name",
        `<div class="space-y-1"><p class="text-xs text-zinc-300">${nameCheck.error}</p><p class="text-[11px] text-amber-400">Institutional records require a valid legal name without numbers or special symbols.</p></div>`
      );
      return;
    }

    if (!regStrength.isValid) {
      setErrorMsg(regStrength.feedback[0] || "Password must be at least 8 characters with upper, lower, number, and symbol.");
      showWarningAlert("Weak Password", regStrength.feedback[0] || "Please fulfill password criteria.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const VALID_ADMIN_KEYS = ["ADMIN-SEC-2026", "ADMIN-2026-KEY", "admin123"];
    const VALID_TEACHER_KEYS = ["TEACHER-SEC-2026", "FACULTY-2026-KEY", "teacher123"];

    if (regRole === "admin" && (!regAdminKey || !VALID_ADMIN_KEYS.includes(regAdminKey.trim()))) {
      setErrorMsg("Invalid Administrator Security Master Key.");
      showErrorAlert("Invalid Admin Key", "Please provide a valid Administrator Security Key. Authorization required.");
      return;
    }

    if (regRole === "teacher" && (!regTeacherKey || !VALID_TEACHER_KEYS.includes(regTeacherKey.trim()))) {
      setErrorMsg("Invalid Faculty Authorization Secret Key.");
      showErrorAlert("Invalid Teacher Key", "Please provide a valid Faculty Authorization Secret Key. Only verified teachers possess this key.");
      return;
    }

    setErrorMsg(null);
    const payload = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      department: regDepartment,
      rollNumber: regRole === "student" ? regRollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: regRole === "teacher" ? "Faculty Instructor" : regRole === "admin" ? "System Administrator" : undefined,
      adminKey: regRole === "admin" ? regAdminKey.trim() : undefined,
      teacherKey: regRole === "teacher" ? regTeacherKey.trim() : undefined
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(`Registered successfully as ${regName} (${regRole.toUpperCase()})!`);
      showSuccessAlert(
        "Account Created",
        `<p class="text-xs text-zinc-300">Successfully registered as <strong>${regName}</strong> (${regRole.toUpperCase()}).</p>`,
        1500
      );
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      const err = res.error || "Registration failed.";
      setErrorMsg(err);
      showErrorAlert("Registration Error", `<p class="text-xs text-zinc-300">${err}</p>`);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg("Please enter your registered institutional email.");
      return;
    }

    setErrorMsg(null);
    const res = await forgotPassword(forgotEmail.trim());

    if (res.success) {
      setForgotDelivered(res);
      showSuccessAlert(
        "Recovery Code Issued",
        `<div class="space-y-1"><p class="text-xs text-zinc-300">A 6-digit verification code has been authorized for <strong>${forgotEmail}</strong>.</p><p class="text-xs font-mono text-indigo-400 font-bold">Code: ${res.resetCode}</p></div>`
      );
    } else {
      setErrorMsg(res.error || "Failed to generate recovery code.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-login-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Institutional Authentication
            </h2>
            <p className="text-xs text-zinc-400">
              Sign in with your verified credentials or register an academic profile.
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-zinc-800 mb-5">
          <button
            id="tab-signin-modal"
            onClick={() => {
              setActiveTab("signin");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === "signin"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-register-modal"
            onClick={() => {
              setActiveTab("register");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === "register"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Create Account
          </button>
          <button
            id="tab-forgot-modal"
            onClick={() => {
              setActiveTab("forgot");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === "forgot"
                ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* 1. SIGN IN TAB */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Target Role Portal
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`py-2 text-xs font-medium rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "student"
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("teacher")}
                  className={`py-2 text-xs font-medium rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "teacher"
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`py-2 text-xs font-medium rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "admin"
                      ? "bg-amber-950/60 border-amber-500 text-amber-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`e.g. ${selectedRole}@intelligrade.edu`}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setActiveTab("forgot");
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-10 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
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

            {/* Quick Demo Autofill Bar */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
              <span>Quick Demo Fill:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("student");
                    setEmail("student@intelligrade.edu");
                    setPassword("Student@2026");
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("teacher");
                    setEmail("teacher@intelligrade.edu");
                    setPassword("Faculty@2026");
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-400 transition"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("admin");
                    setEmail("admin@intelligrade.edu");
                    setPassword("Admin@2026");
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition"
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onOpenAuthPage && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthPage();
                  }}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Full Portal View
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. REGISTRATION TAB */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jordan Hayes"
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Role Designation</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole("student")}
                  className={`py-1.5 text-xs font-medium rounded-xl border text-center transition ${
                    regRole === "student"
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("teacher")}
                  className={`py-1.5 text-xs font-medium rounded-xl border text-center transition ${
                    regRole === "teacher"
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  }`}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("admin")}
                  className={`py-1.5 text-xs font-medium rounded-xl border text-center transition ${
                    regRole === "admin"
                      ? "bg-amber-950/60 border-amber-500 text-amber-300"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-400"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Secret key fields */}
            {regRole === "teacher" && (
              <div>
                <label className="block text-xs font-medium text-indigo-300 mb-1">
                  Faculty Secret Key (Demo: TEACHER-SEC-2026)
                </label>
                <input
                  type="password"
                  required
                  value={regTeacherKey}
                  onChange={(e) => setRegTeacherKey(e.target.value)}
                  placeholder="Enter teacher authorization key"
                  className="w-full bg-zinc-800/80 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {regRole === "admin" && (
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Admin Master Key (Demo: ADMIN-SEC-2026)
                </label>
                <input
                  type="password"
                  required
                  value={regAdminKey}
                  onChange={(e) => setRegAdminKey(e.target.value)}
                  placeholder="Enter admin security key"
                  className="w-full bg-zinc-800/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Password (min 8)</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Strength indicator */}
            {regPassword && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Strength:</span>
                  <span className="capitalize font-semibold text-indigo-400">{regStrength.level}</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColors[regStrength.level]}`}
                    style={{ width: `${Math.max(10, regStrength.score)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (regPassword && !regStrength.isValid)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                <span>Register Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD TAB */}
        {activeTab === "forgot" && (
          <div className="space-y-4">
            {!forgotDelivered ? (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. yourname@university.edu"
                    className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Send Recovery Verification Code</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset Token Issued</span>
                  </div>
                  <p className="text-zinc-300">
                    Your 6-digit code for <strong>{forgotEmail}</strong> is:
                  </p>
                  <div className="bg-zinc-950 p-2 text-center rounded-lg font-mono text-xl text-indigo-400 font-bold">
                    {forgotDelivered.resetCode}
                  </div>
                </div>

                {onOpenAuthPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthPage();
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open Reset Screen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className="text-zinc-400 hover:text-white underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
