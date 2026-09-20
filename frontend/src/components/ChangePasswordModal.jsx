import React, { useState } from "react";
import { X, Lock, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { evaluatePasswordStrength } from "../utils/validationSchemas";
import { showSuccessAlert, showErrorAlert, showWarningAlert, showSweetToast } from "../utils/sweetAlert";

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const strength = evaluatePasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("All password fields are required.");
      showWarningAlert("Incomplete Form", "Please fill in current password, new password, and confirmation.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      showErrorAlert("Mismatch", "The new passwords entered do not match. Please retype.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg("Your new password cannot be identical to your current password.");
      showWarningAlert("Password Unchanged", "Please choose a different new password.");
      return;
    }

    if (!strength.isValid) {
      setErrorMsg(strength.feedback[0] || "New password does not satisfy security policy requirements.");
      showWarningAlert("Weak Password", strength.feedback[0] || "Please satisfy all password complexity criteria.");
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await changePassword(currentPassword, newPassword);
      setIsSubmitting(false);

      if (res.success) {
        showSuccessAlert(
          "Password Updated",
          '<p class="text-xs text-slate-300">Your password has been changed successfully. Your active session remains authenticated.</p>',
          2000
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to change password.");
        showErrorAlert("Password Update Failed", `<p class="text-xs text-slate-300">${res.error || "Authentication verification failed."}</p>`);
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg("A network error occurred while updating your password.");
    }
  };

  const strengthColors = {
    weak: "bg-rose-500",
    moderate: "bg-amber-500",
    strong: "bg-blue-500",
    exceptional: "bg-emerald-500"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 overflow-hidden">
        {/* Close Button */}
        <button
          id="btn-close-change-password-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Change Account Password</h3>
            <p className="text-xs text-slate-400">
              Update credentials for <span className="text-slate-200 font-semibold">{user?.email}</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Current Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="input-current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your existing password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="input-new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters with upper, lower, digit, symbol"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Meter Bar */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Strength:</span>
                  <span className={`font-semibold capitalize ${
                    strength.level === "exceptional" ? "text-emerald-400" :
                    strength.level === "strong" ? "text-blue-400" :
                    strength.level === "moderate" ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {strength.level} ({strength.score}/100)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[strength.level]}`}
                    style={{ width: `${Math.max(10, strength.score)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Criteria Checklist */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px]">
              <div className={`flex items-center gap-1.5 ${strength.criteria.hasMinLength ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>8+ Characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.criteria.hasUppercase ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Uppercase (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.criteria.hasLowercase ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Lowercase (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${strength.criteria.hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Number (0-9)</span>
              </div>
              <div className={`col-span-2 flex items-center gap-1.5 ${strength.criteria.hasSpecialChar ? "text-emerald-400" : "text-slate-500"}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>Special Symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="input-confirm-new-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype your new password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-change-password"
              disabled={isSubmitting || !strength.isValid || newPassword !== confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
