import React from "react";
import { ShieldAlert, Lock, ArrowLeft, KeyRound, UserCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const UnauthorizedAccess = ({
  requiredRole = "teacher",
  attemptedFeature = "Faculty Evaluation Tools",
  onGoHome,
  onOpenLogin
}) => {
  const { user, role } = useAuth();

  const roleLabels = {
    student: "Student",
    teacher: "Faculty / Teacher",
    admin: "System Administrator"
  };

  const getExplanation = () => {
    if (role === "student") {
      return "Under institutional academic integrity policy, students are strictly forbidden from accessing faculty grading engines, model answer keys, OCR digitizers, and administrative controls.";
    }
    if (role === "teacher" && requiredRole === "admin") {
      return "Faculty members are authorized for academic grading and rubric formulation, but restricted from accessing institution-wide RBAC user directories, master security keys, and system audit ledgers.";
    }
    return `Access to ${attemptedFeature} requires authorized ${roleLabels[requiredRole] || requiredRole} credentials.`;
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-400 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-mono font-medium mb-4">
          <Lock className="w-3 h-3" />
          <span>HTTP 403 • ROLE_UNAUTHORIZED</span>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
          Access Denied: Restricted Portal
        </h2>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {getExplanation()}
        </p>

        {/* Detailed Credential Status Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-6 text-left space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Current Identity:</span>
            <span className="text-slate-200 font-semibold">{user?.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Assigned Role:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
              {roleLabels[role] || role}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Required Clearance:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase border border-amber-500/30">
              {roleLabels[requiredRole] || requiredRole}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Resource Target:</span>
            <span className="text-indigo-300 font-semibold">{attemptedFeature}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoHome && (
            <button
              id="btn-unauthorized-home"
              onClick={onGoHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          )}

          {onOpenLogin && (
            <button
              id="btn-unauthorized-switch"
              onClick={onOpenLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
            >
              <KeyRound className="w-4 h-4" />
              <span>Authenticate as {roleLabels[requiredRole] || requiredRole}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
