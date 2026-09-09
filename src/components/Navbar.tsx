import React, { useState } from 'react';
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
  Users,
  HelpCircle,
  LogOut,
  Lock,
  LayoutDashboard,
  Palette,
  Lightbulb
} from 'lucide-react';
import { ExamPaper, StudentSubmission, UserRole, PipelineStage } from '../types';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { showLogoutConfirmation, showSweetToast } from '../utils/sweetAlert';
import { HowItWorksGuide } from './HowItWorksGuide';

interface NavbarProps {
  activeTab: PipelineStage;
  onSelectTab: (tab: PipelineStage) => void;
  exams: ExamPaper[];
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
  submissions: StudentSubmission[];
  selectedSubmissionId: string;
  onSelectSubmission: (submissionId: string) => void;
  onRunAiPipeline: () => void;
  isProcessing: boolean;
  onOpenBatchModal: () => void;
  onOpenLoginModal: () => void;
  onOpenAuthPage: () => void;
  onOpenAppealModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  exams,
  selectedExamId,
  onSelectExam,
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onRunAiPipeline,
  isProcessing,
  onOpenBatchModal,
  onOpenLoginModal,
  onOpenAuthPage,
  onOpenAppealModal,
}) => {
  const { user, role, switchRole, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { currentTheme, setIsThemeModalOpen, toggleThemeMode, themeMode } = useTheme();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  // Logical, chronologically ordered stages for clarity
  const stages: { 
    id: PipelineStage; 
    label: string; 
    stepNumber: string; 
    icon: React.ComponentType<{ className?: string }>;
    authorized: boolean;
    badge?: string;
  }[] = isStudent
    ? [
        { id: 'dashboard', label: 'My Report Card & Performance', stepNumber: '01', icon: GraduationCap, authorized: true, badge: 'Active' },
      ]
    : isTeacher
    ? [
        { id: 'dashboard', label: 'Dashboard', stepNumber: '00', icon: LayoutDashboard, authorized: true, badge: 'Home' },
        { id: 'preprocessing', label: '1. Upload & Scan', stepNumber: '01', icon: Sliders, authorized: true },
        { id: 'digitization', label: '2. Read Handwriting (OCR)', stepNumber: '02', icon: Cpu, authorized: true },
        { id: 'grading', label: '3. AI Grading & Marks', stepNumber: '03', icon: CheckCircle2, authorized: true },
        { id: 'insights', label: '4. Report & Analytics', stepNumber: '04', icon: BarChart3, authorized: true },
        { id: 'architecture', label: '5. System Specs', stepNumber: '05', icon: Database, authorized: true },
      ]
    : [
        { id: 'dashboard', label: 'Admin Dashboard', stepNumber: '00', icon: LayoutDashboard, authorized: true, badge: 'Console' },
        { id: 'user_management', label: '1. Users & Security', stepNumber: '01', icon: ShieldCheck, authorized: true },
        { id: 'grading', label: '2. Grading Inspector', stepNumber: '02', icon: CheckCircle2, authorized: true },
        { id: 'insights', label: '3. Dept Analytics', stepNumber: '03', icon: BarChart3, authorized: true },
        { id: 'architecture', label: '4. Microservices Architecture', stepNumber: '04', icon: Database, authorized: true },
      ];

  const roleBadgeStyle = 
    role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
    role === 'teacher' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  const RoleIcon = role === 'admin' ? ShieldCheck : role === 'teacher' ? BookOpen : GraduationCap;

  return (
    <header className="sticky top-0 z-40 bg-[#121215] border-b border-[#27272a] text-white shadow-md">
      {/* Top Brand & Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold tracking-tight text-white">
                  IntelliGrade
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  v2.5.0-RBAC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Automated Handwritten Student Answer Sheet Evaluation Engine
              </p>
            </div>
          </div>

          {/* Quick Selectors, Role Switcher, and Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Exam Paper Selector */}
            <div className="relative">
              <select
                id="exam-selector"
                value={selectedExamId}
                onChange={(e) => onSelectExam(e.target.value)}
                aria-label="Select examination paper"
                className="appearance-none bg-zinc-800/90 text-xs font-medium text-white border border-zinc-700 rounded-lg pl-3 pr-8 py-1.5 hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-zinc-900 text-white">
                    📋 {ex.title} ({ex.totalMarks} Marks)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Student Submission Selector (Only for Teachers/Admins; fixed for student) */}
            {isTeacher || isAdmin ? (
              <div className="relative">
                <select
                  id="submission-selector"
                  value={selectedSubmissionId}
                  onChange={(e) => onSelectSubmission(e.target.value)}
                  aria-label="Select student paper submission"
                  className="appearance-none bg-zinc-800/90 text-xs font-medium text-white border border-zinc-700 rounded-lg pl-3 pr-8 py-1.5 hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  {submissions.map(sub => (
                    <option key={sub.id} value={sub.id} className="bg-zinc-900 text-white">
                      👤 {sub.studentName} ({sub.percentageScore}%)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-zinc-800/90 border border-zinc-700 rounded-lg text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>My Paper: {user?.name || 'Aarav Sharma'} ({user?.rollNumber || 'CS-2026-041'})</span>
              </div>
            )}

            {/* User Role Profile Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-active-user-profile"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-sm bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700"
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="font-semibold text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">({role})</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Role Switcher Menu */}
              {isRoleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn text-xs"
                  onMouseLeave={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                    <p className="font-bold text-zinc-100">{user?.name}</p>
                    <p className="text-[11px] text-zinc-400">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
                        {role} Portal Active
                      </span>
                    </div>
                    {user?.department && (
                      <p className="text-[10px] text-zinc-400 mt-1">Dept: {user.department}</p>
                    )}
                    {user?.rollNumber && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Roll ID: {user.rollNumber}</p>
                    )}
                  </div>

                  <div className="space-y-1 px-1">
                    <button
                      id="btn-open-auth-page"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onOpenAuthPage();
                      }}
                      className="w-full px-2.5 py-2 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/40 flex items-center justify-between rounded-lg transition border border-indigo-800/50 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Switch User / Portal Login</span>
                      </span>
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">PORTAL</span>
                    </button>

                    <button
                      id="btn-dropdown-theme-picker"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsThemeModalOpen(true);
                      }}
                      className="w-full px-2.5 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center justify-between rounded-lg transition border border-zinc-800"
                    >
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Color Theme Palette</span>
                      </span>
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-zinc-700 shadow-sm"
                        style={{ backgroundColor: currentTheme.colors.accentPrimary }}
                      />
                    </button>

                    <button
                      id="btn-logout-navbar"
                      onClick={async () => {
                        setIsRoleDropdownOpen(false);
                        const confirmed = await showLogoutConfirmation();
                        if (confirmed) {
                          logout();
                          showSweetToast('Signed out of session', 'info');
                          onOpenAuthPage();
                        }
                      }}
                      className="w-full px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 rounded-lg transition border border-transparent hover:border-rose-900/50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How It Works Guide Button (Prominent & Clear) */}
            <button
              id="btn-nav-how-it-works"
              onClick={() => setIsHowItWorksOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/40 shadow-sm transition"
              title="Learn how IntelliGrade evaluates handwritten papers in simple steps"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>How It Works</span>
            </button>

            {/* Quick 1-Click Role Switcher */}
            {isStudent ? (
              <button
                id="btn-nav-quick-teacher-switch"
                onClick={async () => {
                  await switchRole('teacher');
                  showSweetToast('Switched to Teacher Mode: You can now upload papers & run grading!', 'success');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                title="Switch to Teacher Mode to upload new handwritten answer sheets and run AI grading"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Switch to Teacher Mode</span>
              </button>
            ) : isTeacher ? (
              <button
                id="btn-nav-quick-student-switch"
                onClick={async () => {
                  await switchRole('student');
                  showSweetToast('Switched to Student Portal: Viewing candidate scorecard', 'info');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-800/60 shadow-sm transition"
                title="Switch to Student view to see student report card and appeal options"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>View as Student</span>
              </button>
            ) : null}

            {/* Quick Theme Color Picker Button */}
            <button
              id="btn-nav-theme-palette"
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold rounded-lg border border-zinc-700 shadow-sm transition"
              title={`Active Theme: ${currentTheme.name}. Click to view colors.`}
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Theme</span>
              <span 
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: currentTheme.colors.accentPrimary }}
              />
            </button>

            {/* Direct Login & Registration Portal Button */}
            <button
              id="btn-nav-auth-portal"
              onClick={onOpenAuthPage}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold rounded-lg border border-zinc-700 shadow-sm transition"
              title="Open Full Login & Registration Screen"
            >
              <UserIcon className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Auth Portal</span>
            </button>

            {/* Direct Logout Button */}
            <button
              id="btn-nav-direct-logout"
              onClick={async () => {
                const confirmed = await showLogoutConfirmation();
                if (confirmed) {
                  logout();
                  showSweetToast('Signed out of session', 'info');
                  onOpenAuthPage();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/90 hover:bg-rose-950/60 text-zinc-200 hover:text-rose-200 text-xs font-semibold rounded-lg border border-zinc-700 hover:border-rose-700 shadow-sm transition"
              title="Sign Out of Account & Return to Login"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>

            {/* Student Action: Appeal Re-evaluation Button */}
            {isStudent && (
              <button
                id="btn-student-appeal-trigger"
                onClick={onOpenAppealModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40 shadow-sm transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Appeal / Remark Request</span>
              </button>
            )}

            {/* Teacher/Admin: Batch Grading Modal Trigger */}
            {(isTeacher || isAdmin) && (
              <button
                id="open-batch-modal-btn"
                onClick={onOpenBatchModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-300" />
                <span>Batch Grade Class</span>
              </button>
            )}

            {/* Teacher/Admin: Full AI Grading Run Action Button */}
            {(isTeacher || isAdmin) && (
              <button
                id="run-pipeline-btn"
                onClick={onRunAiPipeline}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Evaluating Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Execute Full AI Grading</span>
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Pipeline Stages Sequential Breadcrumbs Tab Bar */}
      <div className="bg-[#101014] border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Pipeline Stages">
            {stages.filter(s => s.authorized).map((stage) => {
              const Icon = stage.icon;
              const isActive = activeTab === stage.id;
              return (
                <button
                  key={stage.id}
                  id={`nav-stage-${stage.id}`}
                  onClick={() => onSelectTab(stage.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white border border-indigo-500 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {stage.stepNumber}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
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
