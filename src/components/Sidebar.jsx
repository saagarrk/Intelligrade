import React from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Home,
  Sliders,
  Cpu,
  CheckCircle2,
  BarChart3,
  Users,
  Database,
  Layers,
  PlusCircle,
  Clock,
  HelpCircle,
  Palette,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  FileText,
  UserCheck,
  BookOpen,
  X,
  KeyRound,
  ListOrdered,
  FileUp,
  Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export const Sidebar = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onOpenBatchModal,
  onOpenCustomExamModal,
  onOpenAppealModal,
  onOpenAuthPage,
  onOpenHowItWorks,
  onOpenChangePassword,
  exams = [],
  selectedExamId
}) => {
  const { user, role, isStudent, isTeacher, isAdmin, logout, switchRole } = useAuth();
  const { setIsThemeModalOpen } = useTheme();

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const navItems = [
    {
      id: "landing",
      label: "Platform Overview",
      shortLabel: "Overview",
      icon: Home,
      badge: "Info",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "dashboard",
      label: isStudent ? "My Scorecard" : isTeacher ? "Faculty Dashboard" : "Admin Console",
      icon: LayoutDashboard,
      badge: "Console",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "evaluation_history",
      label: isStudent ? "My Previous Evaluations" : "Evaluation History",
      shortLabel: "History",
      icon: Clock,
      badge: isStudent ? "Archive" : "Records",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "result_generation",
      label: isStudent ? "My Official Result Card" : "Result Generation & Scorecard",
      shortLabel: "Results",
      icon: Award,
      badge: "Report",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "answer_upload",
      label: isStudent ? "Upload Answer Sheet" : "Student Answer Upload",
      shortLabel: "Upload",
      icon: FileUp,
      badge: "Submit",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "exams_management",
      label: "Exam Management",
      shortLabel: "Exams",
      icon: BookOpen,
      badge: "Curriculum",
      roles: ["teacher", "admin"]
    },
    {
      id: "rubric_management",
      label: "Question & Rubrics",
      shortLabel: "Rubrics",
      icon: ListOrdered,
      badge: "Criteria",
      roles: ["teacher", "admin"]
    },
    {
      id: "preprocessing",
      label: "1. Paper & Scan Prep",
      shortLabel: "Scan Prep",
      icon: Sliders,
      badge: "Stage 1",
      roles: ["teacher", "admin"]
    },
    {
      id: "digitization",
      label: "2. Handwriting OCR",
      shortLabel: "Vision OCR",
      icon: Cpu,
      badge: "Stage 2",
      roles: ["teacher", "admin"]
    },
    {
      id: "grading",
      label: isStudent ? "Grading Review" : "3. AI Tri-Sheet Grading",
      shortLabel: "AI Grading",
      icon: CheckCircle2,
      badge: "Stage 3",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "insights",
      label: isStudent ? "Academic Analytics" : "4. Academic Analytics",
      shortLabel: "Analytics",
      icon: BarChart3,
      badge: isStudent ? "Metrics" : "Stage 4",
      roles: ["student", "teacher", "admin"]
    },
    {
      id: "user_management",
      label: "User & RBAC Directory",
      shortLabel: "Users",
      icon: Users,
      badge: "Admin",
      roles: ["admin"]
    },
    {
      id: "architecture",
      label: "Architecture & APIs",
      shortLabel: "Backend",
      icon: Database,
      badge: "Specs",
      roles: ["teacher", "admin"]
    }
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 select-none">
      {/* Top Section: Brand Header & Workspace */}
      <div>
        {/* Brand Bar */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <button
            onClick={() => handleNavClick("landing")}
            className="flex items-center gap-3 overflow-hidden text-left hover:opacity-90 transition-opacity"
            title="Go to Platform Overview"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white tracking-tight truncate">
                    IntelliGrade
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    SaaS
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  Academic Evaluation Engine
                </span>
              </div>
            )}
          </button>

          {/* Desktop Collapse Toggle / Mobile Close Button */}
          {mobileOpen ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Current Active Course context pill (when expanded) */}
        {!isCollapsed && currentExam && (
          <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-850/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-400" />
                Active Course
              </span>
              <span className="font-mono text-[10px] text-indigo-300 font-semibold">
                {currentExam.courseCode}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 truncate">
              {currentExam.title}
            </p>
          </div>
        )}

        {/* Navigation List */}
        <div className="px-2 py-3 space-y-1">
          <div
            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
              isCollapsed ? "text-center" : ""
            }`}
          >
            {isCollapsed ? "•••" : "Workspace"}
          </div>

          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? "bg-indigo-700/80 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700/60"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Section: Quick Tools */}
        {(isTeacher || isAdmin) && (
          <div className="px-2 pt-3 border-t border-slate-800/80 space-y-1">
            <div
              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
                isCollapsed ? "text-center" : ""
              }`}
            >
              {isCollapsed ? "•••" : "Quick Actions"}
            </div>

            <button
              id="sidebar-quick-batch"
              onClick={() => {
                onOpenBatchModal();
                if (mobileOpen && onMobileClose) onMobileClose();
              }}
              title="Batch Grade Class"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {!isCollapsed && <span>Batch Grade Papers</span>}
            </button>

            <button
              id="sidebar-quick-rubric"
              onClick={() => {
                onOpenCustomExamModal();
                if (mobileOpen && onMobileClose) onMobileClose();
              }}
              title="Create New Rubric"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              {!isCollapsed && <span>+ New Rubric</span>}
            </button>

            <button
              id="sidebar-quick-appeals"
              onClick={() => {
                onOpenAppealModal();
                if (mobileOpen && onMobileClose) onMobileClose();
              }}
              title="Re-evaluation Appeals"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {!isCollapsed && <span>Review Appeals</span>}
            </button>
          </div>
        )}

        {isStudent && (
          <div className="px-2 pt-3 border-t border-slate-800/80 space-y-1">
            <div
              className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
                isCollapsed ? "text-center" : ""
              }`}
            >
              {isCollapsed ? "•••" : "Student Actions"}
            </div>
            <button
              id="sidebar-student-appeal"
              onClick={() => {
                onOpenAppealModal();
                if (mobileOpen && onMobileClose) onMobileClose();
              }}
              title="Request Mark Re-evaluation"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {!isCollapsed && <span>Request Appeal</span>}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: User Profile & Role Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-lg bg-slate-850 border border-slate-800 ${
            isCollapsed ? "justify-center p-1.5" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Academic User"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isAdmin
                      ? "bg-amber-400"
                      : isTeacher
                      ? "bg-indigo-400"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action icons row */}
        <div
          className={`flex items-center gap-1 pt-1 ${
            isCollapsed ? "flex-col" : "justify-between"
          }`}
        >
          <button
            onClick={onOpenHowItWorks}
            title="How It Works Guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsThemeModalOpen(true)}
            title="Customize Theme & Palette"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAuthPage}
            title="Switch Persona / Account"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          {onOpenChangePassword && (
            <button
              onClick={onOpenChangePassword}
              title="Change Password"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block flex-shrink-0 transition-all duration-200 z-30 ${
          isCollapsed ? "w-18" : "w-64"
        }`}
      >
        <div className="fixed inset-y-0 left-0 z-30 transition-all duration-200 ${isCollapsed ? 'w-18' : 'w-64'}">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay & Slide-over Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
