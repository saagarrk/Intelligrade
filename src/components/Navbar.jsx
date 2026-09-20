import { useState } from "react";
import {
  Sliders,
  Cpu,
  CheckCircle2,
  BarChart3,
  Database,
  Sparkles,
  Layers,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User as UserIcon,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Palette,
  Lightbulb,
  Menu,
  ChevronRight,
  Bell,
  KeyRound
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { showLogoutConfirmation, showSweetToast } from "../utils/sweetAlert";
import { HowItWorksGuide } from "./HowItWorksGuide";

export const Navbar = ({
  activeTab,
  onSelectTab,
  exams = [],
  selectedExamId,
  onSelectExam,
  submissions = [],
  selectedSubmissionId,
  onSelectSubmission,
  onRunAiPipeline,
  isProcessing,
  pipelineProgress,
  onOpenBatchModal,
  onOpenLoginModal,
  onOpenAuthPage,
  onOpenAppealModal,
  onToggleSidebar,
  onOpenHowItWorks,
  onOpenChangePassword
}) => {
  const { user, role, switchRole, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const currentSub = submissions.find((s) => s.id === selectedSubmissionId) || submissions[0];

  const stages = isStudent
    ? [
        { id: "landing", label: "Overview", stepNumber: "00", icon: GraduationCap, authorized: true },
        { id: "dashboard", label: "Grade Report", stepNumber: "01", icon: GraduationCap, authorized: true }
      ]
    : isTeacher
    ? [
        { id: "landing", label: "Overview", stepNumber: "00", icon: LayoutDashboard, authorized: true },
        { id: "dashboard", label: "Dashboard", stepNumber: "01", icon: LayoutDashboard, authorized: true },
        { id: "preprocessing", label: "1. Scan Prep", stepNumber: "02", icon: Sliders, authorized: true },
        { id: "digitization", label: "2. OCR Vision", stepNumber: "03", icon: Cpu, authorized: true },
        { id: "grading", label: "3. AI Grading", stepNumber: "04", icon: CheckCircle2, authorized: true },
        { id: "insights", label: "4. Analytics", stepNumber: "05", icon: BarChart3, authorized: true }
      ]
    : [
        { id: "landing", label: "Overview", stepNumber: "00", icon: LayoutDashboard, authorized: true },
        { id: "dashboard", label: "Console", stepNumber: "01", icon: LayoutDashboard, authorized: true },
        { id: "user_management", label: "1. RBAC", stepNumber: "02", icon: ShieldCheck, authorized: true },
        { id: "grading", label: "2. Auditor", stepNumber: "03", icon: CheckCircle2, authorized: true },
        { id: "insights", label: "3. Analytics", stepNumber: "04", icon: BarChart3, authorized: true },
        { id: "architecture", label: "4. Specs", stepNumber: "05", icon: Database, authorized: true }
      ];

  const activeStage = stages.find((s) => s.id === activeTab) || stages[0];

  const roleBadgeStyle =
    role === "admin"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : role === "teacher"
      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  const RoleIcon = role === "admin" ? ShieldCheck : role === "teacher" ? BookOpen : GraduationCap;

  return (
    <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Menu Trigger & Context Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle sidebar navigation"
              aria-label="Toggle sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-semibold text-slate-400 hidden sm:inline">
                Academic Evaluation
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline flex-shrink-0" />
              {currentExam && (
                <span className="font-mono font-medium text-indigo-400 truncate hidden md:inline">
                  {currentExam.courseCode}
                </span>
              )}
              {currentExam && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden md:inline flex-shrink-0" />
              )}
              <span className="font-semibold text-slate-100 truncate">
                {activeStage.label}
              </span>
            </div>
          </div>

          {/* Right: Selectors & Primary SaaS Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Exam Paper Dropdown Selector */}
            <div className="relative">
              <select
                id="exam-selector"
                value={selectedExamId}
                onChange={(e) => onSelectExam(e.target.value)}
                aria-label="Select examination paper"
                className="appearance-none bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-100 border border-slate-700/80 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors max-w-[150px] sm:max-w-[210px] truncate"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-slate-900 text-white">
                    {ex.courseCode || "Exam"} - {ex.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Student Submission Selector (Teachers/Admins) */}
            {(isTeacher || isAdmin) && submissions.length > 0 && (
              <div className="relative hidden sm:block">
                <select
                  id="submission-selector"
                  value={selectedSubmissionId}
                  onChange={(e) => onSelectSubmission(e.target.value)}
                  aria-label="Select student paper submission"
                  className="appearance-none bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-100 border border-slate-700/80 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors max-w-[140px] md:max-w-[180px] truncate"
                >
                  {submissions.map((sub) => (
                    <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                      {sub.studentName} ({sub.percentageScore}%)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            )}

            {/* Batch Grade Action Button */}
            {(isTeacher || isAdmin) && (
              <button
                id="open-batch-modal-btn"
                onClick={onOpenBatchModal}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 transition-colors shadow-2xs"
                title="Batch Grade Entire Cohort"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Batch Grade</span>
              </button>
            )}

            {/* Primary Action: Run AI Grading Button */}
            {(isTeacher || isAdmin) && (
              <button
                id="run-pipeline-btn"
                onClick={onRunAiPipeline}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Execute AI multimodal grading pipeline"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Grading</span>
                  </>
                )}
              </button>
            )}

            {/* Student Action: Appeal Re-evaluation */}
            {isStudent && (
              <button
                id="btn-student-appeal-trigger"
                onClick={onOpenAppealModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Appeal</span>
              </button>
            )}

            {/* Guide Button */}
            <button
              id="btn-nav-how-it-works"
              onClick={() => {
                if (onOpenHowItWorks) onOpenHowItWorks();
                else setIsHowItWorksOpen(true);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
              title="Workflow Guide"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Profile / Role Switcher Menu */}
            <div className="relative">
              <button
                id="btn-active-user-profile"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors bg-slate-800 hover:bg-slate-750 border-slate-700/80"
              >
                <RoleIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-white hidden sm:inline">
                  {user?.name?.split(" ")[0] || "User"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                  {role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Role Switcher Menu Popup */}
              {isRoleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn text-xs"
                  onMouseLeave={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-2">
                    <p className="font-bold text-slate-100">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
                        {role} Role Active
                      </span>
                    </div>
                  </div>

                  {/* Switch Role Quick Actions */}
                  <div className="space-y-1 px-1 mb-2">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1">
                      Switch Role
                    </p>

                    {role !== "teacher" && (
                      <button
                        onClick={async () => {
                          setIsRoleDropdownOpen(false);
                          await switchRole("teacher");
                          showSweetToast("Switched to Faculty Portal", "success");
                        }}
                        className="w-full px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 rounded-lg transition"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Faculty Portal</span>
                      </button>
                    )}

                    {role !== "student" && (
                      <button
                        onClick={async () => {
                          setIsRoleDropdownOpen(false);
                          await switchRole("student");
                          showSweetToast("Switched to Student Portal", "info");
                        }}
                        className="w-full px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 rounded-lg transition"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Student Portal</span>
                      </button>
                    )}

                    {role !== "admin" && (
                      <button
                        onClick={async () => {
                          setIsRoleDropdownOpen(false);
                          await switchRole("admin");
                          showSweetToast("Switched to Administrator Console", "success");
                        }}
                        className="w-full px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 rounded-lg transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Administrator Console</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-1 space-y-1 px-1">
                    <button
                      id="btn-dropdown-theme-picker"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsThemeModalOpen(true);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center justify-between rounded-lg transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Theme Palette</span>
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-700"
                        style={{ backgroundColor: currentTheme.colors.accentPrimary }}
                      />
                    </button>

                    <button
                      id="btn-open-auth-page"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onOpenAuthPage();
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 rounded-lg transition"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Management</span>
                    </button>

                    <button
                      id="btn-navbar-change-password"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        if (onOpenChangePassword) onOpenChangePassword();
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 rounded-lg transition"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Change Password</span>
                    </button>

                    <button
                      id="btn-logout-navbar"
                      onClick={async () => {
                        setIsRoleDropdownOpen(false);
                        const confirmed = await showLogoutConfirmation();
                        if (confirmed) {
                          logout();
                          showSweetToast("Signed out of session", "info");
                          onOpenAuthPage();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Sub-Header: Stage Sequence Pills for quick switching */}
      <div className="bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none" aria-label="Pipeline Stages">
            {stages.filter((s) => s.authorized).map((stage) => {
              const Icon = stage.icon;
              const isActive = activeTab === stage.id;
              return (
                <button
                  key={stage.id}
                  id={`nav-stage-${stage.id}`}
                  onClick={() => onSelectTab(stage.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                      isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {stage.stepNumber}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* How It Works Explanatory Guide Modal */}
      <HowItWorksGuide
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onNavigateStage={onSelectTab}
        onRunDemo={onRunAiPipeline}
      />
    </header>
  );
};
