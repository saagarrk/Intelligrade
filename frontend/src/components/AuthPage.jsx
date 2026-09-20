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
  Shield,
  KeyRound,
  RotateCcw,
  Clock,
  HelpCircle
} from "lucide-react";

export const AuthPage = ({
  onBackToApp,
  defaultRole = "student",
  initialRole,
  defaultMode = "signin"
}) => {
  const { 
    login, 
    register, 
    forgotPassword, 
    resetPassword, 
    isAuthenticated, 
    user, 
    isLoading,
    sessionExpiredAlert 
  } = useAuth();

  const [mode, setMode] = useState(defaultMode); // "signin" | "register" | "forgot" | "reset"
  const [selectedRole, setSelectedRole] = useState(initialRole || defaultRole);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDepartment, setRegDepartment] = useState("Computer Science & Engineering");
  const [regRollNumber, setRegRollNumber] = useState("");
  const [regTitle, setRegTitle] = useState("Assistant Professor");
  const [regAdminKey, setRegAdminKey] = useState("");
  const [regTeacherKey, setRegTeacherKey] = useState("");
  const [showTeacherKey, setShowTeacherKey] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccessData, setForgotSuccessData] = useState(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [newResetPassword, setNewResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  // General Status
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Password strength calculations
  const regStrength = evaluatePasswordStrength(regPassword);
  const resetStrength = evaluatePasswordStrength(newResetPassword);

  const strengthColors = {
    weak: "bg-rose-500",
    moderate: "bg-amber-500",
    strong: "bg-blue-500",
    exceptional: "bg-emerald-500"
  };

  /**
   * Handle Sign In Submission
   */
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg("Please enter your registered institutional email and password.");
      showWarningAlert("Incomplete Credentials", "Please enter your registered institutional email and password to proceed.");
      return;
    }

    setErrorMsg(null);
    const res = await login(signInEmail.trim(), signInPassword, selectedRole, rememberMe);

    if (res.success) {
      setSuccessMsg("Authentication successful! Initializing secure workspace...");
      showSuccessAlert(
        "Welcome Back!",
        `<div class="space-y-1"><p class="font-semibold text-emerald-400">Authenticated successfully as ${selectedRole.toUpperCase()}</p><p class="text-xs text-zinc-400">Session secured until: ${new Date(res.expiresAt).toLocaleTimeString()}</p></div>`,
        1500
      );
      setTimeout(() => {
        setSuccessMsg(null);
        if (onBackToApp) onBackToApp();
      }, 1200);
    } else {
      const err = res.error || "Invalid credentials. Please verify your email and password.";
      setErrorMsg(err);
      if (err.includes("Access Denied")) {
        const accountRole = err.includes("Student") ? "student" : err.includes("Faculty") || err.includes("Teacher") ? "teacher" : "admin";
        showRoleMismatchAlert(accountRole, selectedRole, () => {
          setSelectedRole(accountRole);
          setErrorMsg(null);
          showSweetToast(`Switched to ${accountRole.toUpperCase()} portal`, "info");
        });
      } else {
        showErrorAlert("Authentication Failed", `<p class="text-xs text-zinc-300">${err}</p>`);
      }
    }
  };

  /**
   * Handle Registration Submission
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg("Please complete all required fields.");
      showWarningAlert("Missing Information", "Please complete all required fields in the registration form.");
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
      setErrorMsg(regStrength.feedback[0] || "Password does not satisfy institutional security policy.");
      showWarningAlert("Weak Password", regStrength.feedback[0] || "Password must be at least 8 characters with upper, lower, number, and symbol.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      showErrorAlert("Password Mismatch", "The passwords entered do not match. Please verify and retype.");
      return;
    }

    const VALID_ADMIN_KEYS = ["ADMIN-SEC-2026", "ADMIN-2026-KEY", "admin123"];
    const VALID_TEACHER_KEYS = ["TEACHER-SEC-2026", "FACULTY-2026-KEY", "teacher123"];

    if (selectedRole === "admin" && (!regAdminKey || !VALID_ADMIN_KEYS.includes(regAdminKey.trim()))) {
      setErrorMsg("Invalid Administrator Security Master Key. Contact IT security operations.");
      showErrorAlert("Unauthorized Admin Request", "Invalid Administrator Security Master Key. Security clearance code required.");
      return;
    }

    if (selectedRole === "teacher" && (!regTeacherKey || !VALID_TEACHER_KEYS.includes(regTeacherKey.trim()))) {
      setErrorMsg("Invalid Faculty Authorization Secret Key. Authorized teachers only.");
      showErrorAlert("Unauthorized Faculty Request", "Invalid Faculty Authorization Secret Key. Contact the department office.");
      return;
    }

    setErrorMsg(null);
    const payload = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: selectedRole,
      department: regDepartment,
      rollNumber: selectedRole === "student" ? regRollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: selectedRole === "teacher" ? regTitle : selectedRole === "admin" ? "System Administrator" : undefined,
      adminKey: selectedRole === "admin" ? regAdminKey.trim() : undefined,
      teacherKey: selectedRole === "teacher" ? regTeacherKey.trim() : undefined
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(`Account created successfully for ${regName}! Redirecting to ${selectedRole} workspace...`);
      showSuccessAlert(
        "Account Provisioned!",
        `<div class="space-y-1"><p class="font-bold text-emerald-400">Welcome, ${regName}!</p><p class="text-xs text-zinc-300">Your ${selectedRole.toUpperCase()} account has been created with assigned RBAC permissions.</p></div>`,
        2000
      );
      setTimeout(() => {
        setSuccessMsg(null);
        if (onBackToApp) onBackToApp();
      }, 1500);
    } else {
      const err = res.error || "Registration failed. Please check the information provided.";
      setErrorMsg(err);
      showErrorAlert("Registration Error", `<p class="text-xs text-zinc-300">${err}</p>`);
    }
  };

  /**
   * Handle Forgot Password Submission
   */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg("Please enter your registered institutional email.");
      return;
    }

    setErrorMsg(null);
    setIsForgotSubmitting(true);

    const res = await forgotPassword(forgotEmail.trim());
    setIsForgotSubmitting(false);

    if (res.success) {
      setForgotSuccessData(res);
      showSweetToast("Verification code generated!", "success");
    } else {
      setErrorMsg(res.error || "Failed to initiate password reset.");
    }
  };

  /**
   * Handle Reset Password Submission
   */
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetTokenInput.trim() || !newResetPassword) {
      setErrorMsg("All fields are required to reset your password.");
      return;
    }

    if (!resetStrength.isValid) {
      setErrorMsg(resetStrength.feedback[0] || "New password does not meet security requirements.");
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    setErrorMsg(null);
    setIsResetSubmitting(true);

    const res = await resetPassword({
      email: resetEmail.trim(),
      token: resetTokenInput.trim(),
      newPassword: newResetPassword
    });

    setIsResetSubmitting(false);

    if (res.success) {
      showSuccessAlert(
        "Password Reset Complete",
        `<p class="text-xs text-zinc-300">Your password has been successfully updated. You can now sign in with your new credentials.</p>`,
        2500
      );
      // Pre-fill email in sign in form and switch mode
      setSignInEmail(resetEmail);
      setSignInPassword("");
      setMode("signin");
      setSuccessMsg("Password reset successfully. Please sign in with your new password.");
    } else {
      setErrorMsg(res.error || "Password reset failed. The verification code may have expired.");
    }
  };

  // Role Theme Settings
  const roleTheme =
    selectedRole === "admin"
      ? {
          accent: "amber",
          bgBadge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          btn: "bg-amber-600 hover:bg-amber-500 text-white",
          borderActive: "border-amber-500 ring-1 ring-amber-500/30 bg-amber-500/5",
          icon: ShieldCheck,
          desc: "System Security, RBAC Directory & Audit Ledger"
        }
      : selectedRole === "teacher"
      ? {
          accent: "indigo",
          bgBadge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
          btn: "bg-indigo-600 hover:bg-indigo-500 text-white",
          borderActive: "border-indigo-500 ring-1 ring-indigo-500/30 bg-indigo-500/5",
          icon: BookOpen,
          desc: "Automated Grading, Model Rubrics & OCR Studio"
        }
      : {
          accent: "emerald",
          bgBadge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
          borderActive: "border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-500/5",
          icon: GraduationCap,
          desc: "Student Performance Portal, Knowledge Radar & Appeals"
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
                  PRODUCTION AUTH
                </span>
              </div>
              <p className="text-xs text-zinc-400">Context-Aware Multimodal Grading & Academic Assessment Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                id="btn-back-to-app"
                onClick={onBackToApp}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Workspace</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-start">
          
          {/* Left Column: Role Overview & Enterprise Security */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Institutional Access Control
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                Secure Academic Portal
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Role-based authorization architecture protecting faculty grading rubrics, student evaluations, and institutional assessment ledgers.
              </p>
            </div>

            {/* Role Switcher Cards */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Select Portal Access Level:
              </p>

              {/* 1. Student Card */}
              <div
                id="auth-role-card-student"
                onClick={() => {
                  setSelectedRole("student");
                  setErrorMsg(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRole === "student"
                    ? "bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Student Portal</span>
                    <p className="text-[11px] text-zinc-400">Review graded assessments, radar analytics, and submit remarking appeals.</p>
                  </div>
                </div>
                {selectedRole === "student" && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
              </div>

              {/* 2. Teacher Card */}
              <div
                id="auth-role-card-teacher"
                onClick={() => {
                  setSelectedRole("teacher");
                  setErrorMsg(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRole === "teacher"
                    ? "bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/30"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-indigo-500/30 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">Faculty / Teacher Portal</span>
                    <p className="text-[11px] text-zinc-400">Multimodal OCR transcription, rubric customization & batch evaluation.</p>
                  </div>
                </div>
                {selectedRole === "teacher" && <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />}
              </div>

              {/* 3. Admin Card */}
              <div
                id="auth-role-card-admin"
                onClick={() => {
                  setSelectedRole("admin");
                  setErrorMsg(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedRole === "admin"
                    ? "bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30"
                    : "bg-zinc-900/80 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">System Administrator</span>
                    <p className="text-[11px] text-zinc-400">RBAC directory management, security audit ledger & model controls.</p>
                  </div>
                </div>
                {selectedRole === "admin" && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
              </div>
            </div>

            {/* Quick Demo Credentials Helpers */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pre-Configured Accounts</span>
                </span>
                <span className="text-[10px] text-zinc-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("student");
                    setSignInEmail("student@intelligrade.edu");
                    setSignInPassword("Student@2026");
                    setMode("signin");
                    setErrorMsg(null);
                    showSweetToast("Loaded Student credentials", "info");
                  }}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-emerald-500/40 text-[11px] transition"
                >
                  <span className="block font-semibold text-emerald-400">Student</span>
                  <span className="block text-[9px] text-zinc-500 truncate">student@...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("teacher");
                    setSignInEmail("teacher@intelligrade.edu");
                    setSignInPassword("Faculty@2026");
                    setMode("signin");
                    setErrorMsg(null);
                    showSweetToast("Loaded Faculty credentials", "info");
                  }}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-indigo-500/40 text-[11px] transition"
                >
                  <span className="block font-semibold text-indigo-400">Faculty</span>
                  <span className="block text-[9px] text-zinc-500 truncate">teacher@...</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole("admin");
                    setSignInEmail("admin@intelligrade.edu");
                    setSignInPassword("Admin@2026");
                    setMode("signin");
                    setErrorMsg(null);
                    showSweetToast("Loaded Admin credentials", "info");
                  }}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-[11px] transition"
                >
                  <span className="block font-semibold text-amber-400">Admin</span>
                  <span className="block text-[9px] text-zinc-500 truncate">admin@...</span>
                </button>
              </div>
            </div>

            {/* Security Compliance Note */}
            <div className="pt-2 text-xs text-zinc-400 space-y-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-300 font-medium text-[11px]">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero-Trust Enterprise Compliance</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Passwords are protected using industry-standard bcrypt key derivation with salted stretching. Sessions are cryptographically verified via Bearer tokens.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Sign In / Register / Forgot / Reset) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Mode Toggle Bar: Sign In vs Register */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 mb-6">
                <button
                  id="tab-btn-signin"
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    mode === "signin"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  id="tab-btn-register"
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                    mode === "register"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Create Account
                </button>
                {(mode === "forgot" || mode === "reset") && (
                  <span className="px-3 py-2 text-xs font-semibold text-indigo-400 bg-indigo-950/40 rounded-lg flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>Password Recovery</span>
                  </span>
                )}
              </div>

              {/* Session Expired Notice */}
              {sessionExpiredAlert && mode === "signin" && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Session Expired</p>
                    <p className="text-[11px] text-amber-200/80">Your secure authentication session has elapsed. Please sign in again to continue.</p>
                  </div>
                </div>
              )}

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
                  {errorMsg.includes("Access Denied") && (
                    <div className="pt-2 border-t border-rose-900/40 flex items-center gap-2">
                      <span className="text-[11px] text-zinc-300">Quick fix:</span>
                      {errorMsg.toLowerCase().includes("teacher") && selectedRole !== "teacher" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole("teacher");
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                        >
                          Switch to Faculty Portal
                        </button>
                      )}
                      {errorMsg.toLowerCase().includes("student") && selectedRole !== "student" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole("student");
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                        >
                          Switch to Student Portal
                        </button>
                      )}
                      {errorMsg.toLowerCase().includes("admin") && selectedRole !== "admin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRole("admin");
                            setErrorMsg(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition"
                        >
                          Switch to Admin Console
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
                    Active Portal: <strong className="text-zinc-200">{selectedRole.toUpperCase()}</strong>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700/50">
                  RBAC Policy Active
                </span>
              </div>

              {/* ================================================================= */}
              {/* 1. SIGN IN FORM */}
              {/* ================================================================= */}
              {mode === "signin" && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">Sign In</h2>
                      <p className="text-xs text-zinc-400">Enter your credentials to access the {selectedRole} workspace.</p>
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
                        placeholder={`e.g. ${selectedRole}@intelligrade.edu`}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-zinc-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(signInEmail);
                          setMode("forgot");
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
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
                      <span>Remember session (30-day persistence)</span>
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Bcrypt Hashed Bearer
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
                        <span>Sign In to {selectedRole.toUpperCase()} Console</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ================================================================= */}
              {/* 2. REGISTRATION FORM */}
              {/* ================================================================= */}
              {mode === "register" && (
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
                      onClick={() => setSelectedRole("student")}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === "student"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole("teacher")}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === "teacher"
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Faculty</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      className={`py-2 text-xs font-semibold rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        selectedRole === "admin"
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
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
                                <span className={`text-[10px] font-medium ${!nameStatus.isValid ? "text-rose-400" : "text-emerald-400"}`}>
                                  {!nameStatus.isValid ? (hasNumbers ? "No digits allowed" : "Invalid characters") : "Valid legal name"}
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
                                    ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-200"
                                    : "border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                        Institutional Email Address
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
                  {selectedRole === "student" && (
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

                  {selectedRole === "teacher" && (
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
                            (Demo: TEACHER-SEC-2026)
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-reg-teacherkey"
                            type={showTeacherKey ? "text" : "password"}
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
                          >
                            {showTeacherKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === "admin" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          <span>Administrator Security Master Key</span>
                        </label>
                        <span className="text-[10px] text-zinc-400">
                          (Demo: ADMIN-SEC-2026)
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-adminkey"
                          type={showAdminKey ? "text" : "password"}
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
                        >
                          {showAdminKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Create Password (min 8)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-reg-password"
                          type={showRegPassword ? "text" : "password"}
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
                          type={showRegConfirmPassword ? "text" : "password"}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {regPassword && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Password Strength:</span>
                        <span className={`font-semibold capitalize ${
                          regStrength.level === "exceptional" ? "text-emerald-400" :
                          regStrength.level === "strong" ? "text-blue-400" :
                          regStrength.level === "moderate" ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {regStrength.level} ({regStrength.score}/100)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColors[regStrength.level]}`}
                          style={{ width: `${Math.max(10, regStrength.score)}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span className={`flex items-center gap-1 ${regStrength.criteria.hasMinLength ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                        </span>
                        <span className={`flex items-center gap-1 ${regStrength.criteria.hasUppercase ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Uppercase (A-Z)
                        </span>
                        <span className={`flex items-center gap-1 ${regStrength.criteria.hasLowercase ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Lowercase (a-z)
                        </span>
                        <span className={`flex items-center gap-1 ${regStrength.criteria.hasNumber ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Number (0-9)
                        </span>
                        <span className={`col-span-2 flex items-center gap-1 ${regStrength.criteria.hasSpecialChar ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Special Symbol (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Register Submit Button */}
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading || (regPassword && !regStrength.isValid)}
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

              {/* ================================================================= */}
              {/* 3. FORGOT PASSWORD FORM */}
              {/* ================================================================= */}
              {mode === "forgot" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">Forgot Password</h2>
                      <p className="text-xs text-zinc-400">
                        Initiate credentials recovery for your institutional account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>

                  {!forgotSuccessData ? (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Registered Institutional Email
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-forgot-email"
                            type="email"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="e.g. yourname@intelligrade.edu"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1.5">
                          A 6-digit verification code with 15-minute token validity will be generated.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isForgotSubmitting}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                      >
                        {isForgotSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Issuing recovery code...
                          </span>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Generate 15-Minute Recovery Code</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Verification Code Delivered Banner */
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Recovery Code Dispatched</span>
                        </div>
                        <p className="text-zinc-300">
                          A password reset code has been authorized for <strong className="text-white">{forgotEmail}</strong>.
                        </p>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-center my-2">
                          <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">Your 6-Digit Reset Code:</span>
                          <span className="text-2xl font-mono font-bold tracking-widest text-indigo-400">
                            {forgotSuccessData.resetCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Expires in 15 minutes. Use this code on the reset screen to set your new password.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(forgotEmail);
                          setResetTokenInput(forgotSuccessData.resetCode);
                          setMode("reset");
                          setErrorMsg(null);
                        }}
                        className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                      >
                        <span>Proceed to Reset Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* 4. RESET PASSWORD FORM */}
              {/* ================================================================= */}
              {mode === "reset" && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white">Reset Account Password</h2>
                      <p className="text-xs text-zinc-400">Enter your verification code and choose a new password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="user@university.edu"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Verification Code */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      6-Digit Verification Code / Token
                    </label>
                    <input
                      type="text"
                      required
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* New Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? "text" : "password"}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200"
                        >
                          {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmResetPassword ? "text" : "password"}
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                          className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-200"
                        >
                          {showConfirmResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {newResetPassword && (
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">Password Strength:</span>
                        <span className={`font-semibold capitalize ${
                          resetStrength.level === "exceptional" ? "text-emerald-400" :
                          resetStrength.level === "strong" ? "text-blue-400" :
                          resetStrength.level === "moderate" ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {resetStrength.level} ({resetStrength.score}/100)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColors[resetStrength.level]}`}
                          style={{ width: `${Math.max(10, resetStrength.score)}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <span className={`flex items-center gap-1 ${resetStrength.criteria.hasMinLength ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                        </span>
                        <span className={`flex items-center gap-1 ${resetStrength.criteria.hasUppercase ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Uppercase (A-Z)
                        </span>
                        <span className={`flex items-center gap-1 ${resetStrength.criteria.hasLowercase ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Lowercase (a-z)
                        </span>
                        <span className={`flex items-center gap-1 ${resetStrength.criteria.hasNumber ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Number (0-9)
                        </span>
                        <span className={`col-span-2 flex items-center gap-1 ${resetStrength.criteria.hasSpecialChar ? "text-emerald-400" : "text-zinc-500"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Special Symbol (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isResetSubmitting || !resetStrength.isValid || newResetPassword !== confirmResetPassword}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                  >
                    {isResetSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating password...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password & Return to Sign In</span>
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
                <span>Bcrypt Hash + Authenticated Sessions</span>
              </div>
              <span className="text-zinc-400">Production REST API Enabled</span>
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
