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
  HelpCircle,
  LogOut,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { ExamPaper, StudentSubmission, UserRole, PipelineStage } from '../types';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

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
  onOpenAppealModal,
}) => {
  const { user, role, switchRole, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  const stages: { 
    id: PipelineStage; 
    label: string; 
    stepNumber: string; 
    icon: React.ComponentType<{ className?: string }>;
    authorized: boolean;
    badge?: string;
  }[] = isStudent
    ? [
        { id: 'dashboard', label: 'My Student Dashboard & Performance Portal', stepNumber: '01', icon: GraduationCap, authorized: true, badge: 'Active' },
      ]
    : isTeacher
    ? [
        { id: 'dashboard', label: 'Teacher Dashboard', stepNumber: '00', icon: LayoutDashboard, authorized: true, badge: 'Home' },
        { id: 'grading', label: '1. Grading Studio & Overrides', stepNumber: '01', icon: CheckCircle2, authorized: true },
        { id: 'preprocessing', label: '2. Input & Noise Filters', stepNumber: '02', icon: Sliders, authorized: true },
        { id: 'digitization', label: '3. OCR & 3-Sheet Keys', stepNumber: '03', icon: Cpu, authorized: true },
        { id: 'insights', label: '4. Class Radar & Analytics', stepNumber: '04', icon: BarChart3, authorized: true },
        { id: 'architecture', label: '5. Backend Architecture', stepNumber: '05', icon: Database, authorized: true },
      ]
    : [
        { id: 'dashboard', label: 'Admin Dashboard', stepNumber: '00', icon: LayoutDashboard, authorized: true, badge: 'Console' },
        { id: 'user_management', label: '1. RBAC & Security Audit', stepNumber: '01', icon: ShieldCheck, authorized: true },
        { id: 'grading', label: '2. Pipeline Inspector', stepNumber: '02', icon: CheckCircle2, authorized: true },
        { id: 'insights', label: '3. Department Analytics', stepNumber: '03', icon: BarChart3, authorized: true },
        { id: 'architecture', label: '4. Architecture & Microservices', stepNumber: '04', icon: Database, authorized: true },
      ];

  const roleBadgeStyle = 
    role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
    role === 'teacher' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  const RoleIcon = role === 'admin' ? ShieldCheck : role === 'teacher' ? BookOpen : GraduationCap;

  return (
    <header className="sticky top-0 z-40 bg-[#09090b] border-b border-[#27272a]">
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
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#18181b] text-slate-400 rounded border border-[#27272a]">
                  v2.5.0-RBAC
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
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
                className="appearance-none bg-[#18181b] text-xs font-medium text-[#fafafa] border border-[#27272a] rounded-lg pl-3 pr-8 py-1.5 hover:border-[#3f3f46] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    📋 {ex.title} ({ex.totalMarks} Marks)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Student Submission Selector (Only for Teachers/Admins; fixed for student) */}
            {isTeacher || isAdmin ? (
              <div className="relative">
                <select
                  id="submission-selector"
                  value={selectedSubmissionId}
                  onChange={(e) => onSelectSubmission(e.target.value)}
                  aria-label="Select student paper submission"
                  className="appearance-none bg-[#18181b] text-xs font-medium text-[#fafafa] border border-[#27272a] rounded-lg pl-3 pr-8 py-1.5 hover:border-[#3f3f46] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  {submissions.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      👤 {sub.studentName} ({sub.percentageScore}%)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>My Paper: Alex Rivera (CS-2026-041)</span>
              </div>
            )}

            {/* User Role Profile Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-active-user-profile"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-sm bg-[#18181b] hover:bg-[#27272a] ${roleBadgeStyle}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="font-semibold text-zinc-100">{user?.name?.split(' ')[0] || 'User'}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">({role})</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Role Switcher Menu */}
              {isRoleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn text-xs"
                  onMouseLeave={() => setIsRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="font-bold text-zinc-100">{user?.name}</p>
                    <p className="text-[11px] text-zinc-400">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${roleBadgeStyle}`}>
                        {role} Role Active
                      </span>
                    </div>
                  </div>

                  <p className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Switch Authenticated Account
                  </p>

                  <button
                    id="switch-to-student-btn"
                    onClick={() => {
                      switchRole('student');
                      onSelectTab('dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                      role === 'student' ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs">Student: Alex Rivera</p>
                        <p className="text-[10px] text-zinc-500">View grades, scorecards & appeal</p>
                      </div>
                    </div>
                    {role === 'student' && <span className="text-[10px] text-emerald-400 font-bold">✓</span>}
                  </button>

                  <button
                    id="switch-to-teacher-btn"
                    onClick={() => {
                      switchRole('teacher');
                      onSelectTab('dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                      role === 'teacher' ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs">Teacher: Prof. Sarah Jenkins</p>
                        <p className="text-[10px] text-zinc-500">Grading, overrides & batch mode</p>
                      </div>
                    </div>
                    {role === 'teacher' && <span className="text-[10px] text-indigo-400 font-bold">✓</span>}
                  </button>

                  <button
                    id="switch-to-admin-btn"
                    onClick={() => {
                      switchRole('admin');
                      onSelectTab('dashboard');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition ${
                      role === 'admin' ? 'bg-amber-950/40 text-amber-300 font-semibold' : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs">Admin: Dr. Eleanor Vance</p>
                        <p className="text-[10px] text-zinc-500">Full system access, RBAC & logs</p>
                      </div>
                    </div>
                    {role === 'admin' && <span className="text-[10px] text-amber-400 font-bold">✓</span>}
                  </button>

                  <div className="pt-1 mt-1 border-t border-zinc-800 flex items-center justify-between px-1">
                    <button
                      id="btn-open-login-dialog"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 rounded hover:bg-zinc-800 transition"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Switch Credentials</span>
                    </button>
                    <button
                      id="btn-logout-navbar"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        logout();
                        onOpenLoginModal();
                      }}
                      className="px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 rounded hover:bg-rose-950/30 transition"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student Action: Appeal Re-evaluation Button */}
            {isStudent && (
              <button
                id="btn-student-appeal-trigger"
                onClick={onOpenAppealModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-800/60 shadow-sm transition"
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
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-medium rounded-lg border border-[#27272a] transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
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
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Execute Full AI Grading</span>
                  </>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Pipeline Stages Sequential Breadcrumbs Tab Bar */}
      <div className="bg-[#18181b] border-t border-[#27272a]">
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
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-[#fafafa] hover:bg-[#27272a]/60 border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-[#27272a] text-slate-400'
                  }`}>
                    {stage.stepNumber}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
