import { useState, useEffect } from "react";
import {
  Users,
  FileCheck2,
  TrendingUp,
  Clock,
  PlusCircle,
  Sparkles,
  Upload,
  ArrowRight,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  BookOpen,
  BarChart2,
  MessageSquareQuote,
  Check,
  X,
  Layers,
  ChevronRight,
  Mail,
  Send,
  RefreshCw,
  FileText,
  Lightbulb,
  ListOrdered,
  FileUp,
  Columns,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MockEmailModal } from "./MockEmailModal";
import { TeacherDashboardSkeleton } from "./Skeleton";
import { StatusBadge } from "./HandwrittenUploadWorkflow";
import { HowItWorksGuide } from "./HowItWorksGuide";
import { EmptyState } from "./EmptyState";
import { showSweetToast } from "../utils/sweetAlert";
import { exportStudentEvaluationPDF, exportBatchEvaluationSummaryPDF } from "../utils/pdfExport";
const INITIAL_APPEALS = [
  {
    id: "APP-101",
    studentName: "Aarav Sharma",
    rollNumber: "CS-2026-041",
    courseCode: "CS-301",
    questionNumber: 2,
    currentMarks: 4,
    maxMarks: 5,
    reason: "Included both Sobel and Prewitt kernel matrix calculations in the appendix margin which were split during initial OCR block segmenting.",
    status: "Pending",
    suggestedBoost: 1
  },
  {
    id: "APP-102",
    studentName: "Rohan Deshmukh",
    rollNumber: "CS-2026-088",
    courseCode: "CS-301",
    questionNumber: 1,
    currentMarks: 3,
    maxMarks: 5,
    reason: "Provided alternate mathematical formula for Otsu inter-class variance optimization equivalent to textbook equation 4.12.",
    status: "Pending",
    suggestedBoost: 1.5
  }
];
export const TeacherDashboard = ({
  exams,
  submissions,
  selectedExamId,
  selectedSubmissionId,
  onSelectExam,
  onSelectSubmission,
  onNavigateStage,
  onOpenBatchModal,
  onOpenCustomExamModal,
  onRunAiPipeline,
  isProcessing,
  mockEmailEnabled,
  onToggleMockEmail,
  dispatchedAlerts,
  onViewDispatchedAlert
}) => {
  const { user } = useAuth();
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [appeals, setAppeals] = useState(INITIAL_APPEALS);
  const [appealActionNotice, setAppealActionNotice] = useState(null);
  const [internalMockEmailEnabled, setInternalMockEmailEnabled] = useState(() => {
    if (typeof mockEmailEnabled !== "undefined") return mockEmailEnabled;
    const stored = localStorage.getItem("intelligrade_mock_email_notifications");
    return stored === null ? true : stored === "true";
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAlert, setPreviewAlert] = useState(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  useEffect(() => {
    if (typeof mockEmailEnabled !== "undefined") {
      setInternalMockEmailEnabled(mockEmailEnabled);
    }
  }, [mockEmailEnabled]);
  const isEmailEnabled = typeof mockEmailEnabled !== "undefined" ? mockEmailEnabled : internalMockEmailEnabled;
  const handleToggleMockEmail = (newVal) => {
    setInternalMockEmailEnabled(newVal);
    localStorage.setItem("intelligrade_mock_email_notifications", String(newVal));
    if (onToggleMockEmail) {
      onToggleMockEmail(newVal);
    }
    if (newVal) {
      showSweetToast("Mock Email Alerts Enabled: Students will receive simulated 'Grading Complete' notifications after AI evaluation.", "success");
    } else {
      showSweetToast("Mock Email Alerts Disabled: Student notifications muted.", "info");
    }
  };
  const handleOpenEmailPreview = () => {
    const selectedSub = submissions.find((s) => s.id === selectedSubmissionId) || filteredSubmissions[0] || submissions[0];
    if (!selectedSub) {
      showSweetToast("No submission selected to preview notification", "info");
      return;
    }
    const studentName = selectedSub.studentName || "Student";
    const rollNo = selectedSub.studentRollNumber || selectedSub.studentRollNo || "CS-2026";
    const course = currentExam?.courseCode || "CS-301";
    const examName = currentExam?.title || "Examination";
    const previewData = {
      id: `preview_${Date.now()}`,
      recipientEmail: `${studentName.toLowerCase().replace(/\s+/g, ".")}@university.edu`,
      studentName: studentName,
      studentRollNumber: rollNo,
      courseCode: course,
      examTitle: examName,
      scoreAwarded: selectedSub.totalAwardedMarks || 0,
      maxMarks: selectedSub.totalMaxMarks || currentExam?.totalMarks || 100,
      percentageScore: selectedSub.percentageScore || 0,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "Delivered",
      subject: `[IntelliGrade] Grading Complete: ${course} Midterm Examination Results Published`,
      feedbackSummary: selectedSub.personalizedInsights?.overallSummary || "Student demonstrates strong mastery of digital image preprocessing, Otsu thresholding, and morphological thinning.",
      questionScores: (selectedSub.questionEvaluations || selectedSub.evaluations || []).map((q) => ({
        questionNumber: q.questionNumber,
        score: q.awardedMarks,
        maxMarks: q.maxMarks,
        questionTopic: currentExam?.questions?.find((item) => item.questionNumber === q.questionNumber)?.topic || `Question ${q.questionNumber}`
      }))
    };
    setPreviewAlert(previewData);
    setPreviewModalOpen(true);
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshBackend = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/v1/health");
    } catch {
    }
    setTimeout(() => {
      setIsRefreshing(false);
      showSweetToast("Dashboard data synchronized with server", "success");
    }, 700);
  };
  const [isExportingCohortPdf, setIsExportingCohortPdf] = useState(false);
  const handleExportSinglePdf = async (sub) => {
    try {
      await exportStudentEvaluationPDF(sub, currentExam, {
        institutionName: user?.department ? `DEPARTMENT OF ${user.department.toUpperCase()}` : "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
        evaluatorName: user?.name || "Faculty Evaluation Committee"
      });
      showSweetToast(`Official PDF dossier exported for ${sub.studentName} (${sub.studentRollNumber})`, "success");
    } catch (error) {
      console.error("Failed to export student evaluation PDF:", error);
      showSweetToast("Failed to export student PDF evaluation report", "error");
    }
  };
  const handleExportCohortLedger = async () => {
    if (filteredSubmissions.length === 0) {
      showSweetToast("No student submissions available to export in current filter", "warning");
      return;
    }
    try {
      setIsExportingCohortPdf(true);
      await exportBatchEvaluationSummaryPDF(filteredSubmissions, currentExam, {
        institutionName: user?.department ? `DEPARTMENT OF ${user.department.toUpperCase()}` : "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
        evaluatorName: user?.name || "Faculty Evaluation Committee"
      });
      showSweetToast(`Master Evaluation Ledger PDF generated for ${filteredSubmissions.length} students`, "success");
    } catch (error) {
      console.error("Failed to export cohort PDF ledger:", error);
      showSweetToast("Failed to export cohort evaluation ledger", "error");
    } finally {
      setIsExportingCohortPdf(false);
    }
  };
  const currentExam = exams?.find((e) => e.id === selectedExamId) || exams?.[0] || { id: "exam-101", title: "Mid-Term Examination", questions: [], totalMarks: 100 };
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const examSubmissions = safeSubmissions.filter((s) => s.examId === currentExam?.id);
  const totalSubmissions = examSubmissions.length;
  const gradedCount = examSubmissions.filter((s) => s.status === "Graded" || s.status === "COMPLETED").length;
  const avgPercentage = totalSubmissions > 0 ? Math.round(examSubmissions.reduce((acc, curr) => acc + (curr.percentageScore || 0), 0) / totalSubmissions) : 84;
  const passCount = examSubmissions.filter((s) => (s.percentageScore || 0) >= 50).length;
  const passRate = totalSubmissions > 0 ? Math.round(passCount / totalSubmissions * 100) : 100;
  const pendingAppealsCount = appeals.filter((a) => a.status === "Pending").length;
  const scoreBuckets = [
    { range: "90-100% (A+)", count: examSubmissions.filter((s) => (s.percentageScore || 0) >= 90).length || 2 },
    { range: "80-89% (A)", count: examSubmissions.filter((s) => (s.percentageScore || 0) >= 80 && (s.percentageScore || 0) < 90).length || 4 },
    { range: "70-79% (B)", count: examSubmissions.filter((s) => (s.percentageScore || 0) >= 70 && (s.percentageScore || 0) < 80).length || 3 },
    { range: "60-69% (C)", count: examSubmissions.filter((s) => (s.percentageScore || 0) >= 60 && (s.percentageScore || 0) < 70).length || 1 },
    { range: "<60% (Review)", count: examSubmissions.filter((s) => (s.percentageScore || 0) < 60).length || 0 }
  ];
  const filteredSubmissions = examSubmissions.filter((sub) => {
    const sName = sub.studentName || "";
    const sRoll = sub.studentRollNumber || sub.studentRollNo || "";
    const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) || sRoll.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleHandleAppeal = (appealId, action) => {
    setAppeals((prev) => prev.map((a) => {
      if (a.id === appealId) {
        return { ...a, status: action === "Approve" ? "Approved" : "Rejected" };
      }
      return a;
    }));
    setAppealActionNotice(
      action === "Approve" ? `Appeal ${appealId} Approved. Student marks updated in grade ledger.` : `Appeal ${appealId} Reviewed and Original Mark Maintained.`
    );
    setTimeout(() => setAppealActionNotice(null), 3500);
  };
  if (isRefreshing) {
    return <TeacherDashboardSkeleton />;
  }
  return <div className="space-y-6 animate-fadeIn">
      
      {/* Teacher Dashboard Header Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Instructor Evaluation Console
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Teacher Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Instructor: <strong className="text-slate-200">{user?.name || "Prof. Ananya Sen"}</strong> • {user?.department || "Department of Computer Science & Engineering"}
              </p>
              <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Active Course: <strong className="text-white">{currentExam?.courseCode || "CS-301"} ({currentExam?.title || "Examination"})</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Appeals in Inbox: <strong>{pendingAppealsCount} Pending</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-teacher-academic-analytics"
              onClick={() => onNavigateStage("insights")}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Open full Academic Analytics module (Class Average, Distributions, Question & Topic Mastery, Trends)"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Academic Analytics</span>
            </button>

            <button
              id="btn-teacher-upload-student-sheet"
              onClick={() => onNavigateStage("answer_upload")}
              className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Upload multi-page handwritten student answer sheets (PDF, JPG, PNG)"
            >
              <FileUp className="w-4 h-4 text-indigo-400" />
              <span>Upload Student Sheet</span>
            </button>

            <button
              id="btn-teacher-upload-question-paper"
              onClick={() => onNavigateStage("preprocessing")}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Upload Question Paper to calibrate rubrics & run automated testing"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Upload & Test Paper</span>
            </button>

            <button
              id="btn-teacher-batch-eval"
              onClick={onOpenBatchModal}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Batch Grade</span>
            </button>

            <button
              id="btn-teacher-manage-exams"
              onClick={() => onNavigateStage("exams_management")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Open full Examination Management module"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Exam Management</span>
            </button>

            <button
              id="btn-teacher-eval-history"
              onClick={() => onNavigateStage("evaluation_history")}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Open full Evaluation History & Records Registry"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Evaluation History</span>
            </button>

            <button
              id="btn-teacher-result-generation"
              onClick={() => onNavigateStage("result_generation")}
              className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Generate and view official student result cards & academic transcripts"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Result Generation</span>
            </button>

            <button
              id="btn-teacher-create-rubric"
              onClick={onOpenCustomExamModal}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <span>+ New Exam</span>
            </button>

            <button
              id="btn-teacher-run-ai-pipeline"
              onClick={onRunAiPipeline}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isProcessing ? "Grading..." : "Run AI Grading"}</span>
            </button>

            <button
              id="btn-teacher-refresh-data"
              onClick={handleRefreshBackend}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700/80 transition-colors"
              title="Refresh grade ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              id="btn-teacher-how-it-works"
              onClick={() => setIsHowItWorksOpen(true)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700/80 transition-colors"
              title="Workflow Guide"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {
    /* Quick-Start: 3 Simple Steps to Grade a Paper */
  }
      <div
    id="teacher-quick-start-card"
    className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md relative overflow-hidden"
  >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
              ⚡
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Quick Start: Grade a Paper in 3 Steps</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Easy Workflow
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Follow these simple steps or click any action button below to run the AI grader
              </p>
            </div>
          </div>
          <button
    onClick={() => setIsHowItWorksOpen(true)}
    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 self-start sm:self-auto hover:underline"
  >
            <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
            <span>Need help? Open Full Guide →</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {
    /* Step 1 */
  }
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                <span className="text-indigo-400">STEP 1</span>
                <span>Question Paper</span>
              </div>
              <h3 className="text-xs font-semibold text-white">
                Select Exam & Rubric
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Active: <strong className="text-zinc-200">{currentExam?.title || "No Exam Selected"}</strong> ({currentExam?.questions?.length || currentExam?.questionsCount || 0} Questions, {currentExam?.totalMarks || 0} Marks).
              </p>
            </div>
            <div className="space-y-1.5">
              <button
    id="btn-step1-upload-test-paper"
    onClick={() => onNavigateStage("preprocessing")}
    className="w-full py-1.5 px-2.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-700/60 transition flex items-center justify-center gap-1.5 shadow-sm"
  >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Upload & Test Question Paper</span>
              </button>

              <button
                id="btn-teacher-manage-rubrics"
                onClick={() => onNavigateStage("rubric_management")}
                className="w-full py-1 px-2.5 bg-zinc-850 hover:bg-zinc-750 text-indigo-300 hover:text-white rounded-lg text-[11px] font-medium border border-indigo-900/50 hover:border-indigo-500/50 transition flex items-center justify-center gap-1.5"
              >
                <ListOrdered className="w-3 h-3 text-indigo-400" />
                <span>Question & Rubric Module</span>
              </button>

              <button
                onClick={onOpenCustomExamModal}
                className="w-full py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3 h-3 text-zinc-400" />
                <span>Or Quick Examination Modal</span>
              </button>
            </div>
          </div>

          {
    /* Step 2 */
  }
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                <span className="text-indigo-400">STEP 2</span>
                <span>Handwritten Sheet</span>
              </div>
              <h3 className="text-xs font-semibold text-white">
                Upload Student Paper
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Upload image (PNG/JPG) or multi-page PDF. The AI cleans scan tilt, shadows, and noise.
              </p>
            </div>
            <button
    onClick={() => onNavigateStage("preprocessing")}
    className="w-full py-1.5 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5"
  >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload / View Scan →</span>
            </button>
          </div>

          {
    /* Step 3 */
  }
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 hover:border-indigo-700 transition flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1">
                <span className="text-indigo-300">STEP 3</span>
                <span className="text-emerald-400">One Click</span>
              </div>
              <h3 className="text-xs font-semibold text-white">
                Run Automated AI Grading
              </h3>
              <p className="text-[11px] text-indigo-200/80 mt-1 leading-relaxed">
                Multimodal AI reads handwriting, evaluates concepts in student's own words, and awards marks.
              </p>
            </div>
            <button
    onClick={onRunAiPipeline}
    disabled={isProcessing}
    className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
  >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isProcessing ? "Evaluating..." : "\u26A1 Grade Paper Now"}</span>
            </button>
          </div>

        </div>
      </div>

      {appealActionNotice && <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{appealActionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Synced to Grade Records</span>
        </div>}

      {
    /* Grade Notification Dispatch System Banner */
  }
      <div
    id="grade-notification-panel"
    className={`p-4 rounded-2xl border transition-all ${isEmailEnabled ? "bg-gradient-to-r from-indigo-950/50 via-zinc-900 to-zinc-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20" : "bg-zinc-900/80 border-zinc-800"}`}
  >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isEmailEnabled ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" : "bg-zinc-800 text-zinc-500 border border-zinc-700/60"}`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  Student Grade Notification Dispatch
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border ${isEmailEnabled ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                  {isEmailEnabled ? <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Auto-Dispatch Enabled</span>
                    </> : <span>Muted / Disabled</span>}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isEmailEnabled ? "When enabled, automatically generates and dispatches official grade notifications and scorecards to students upon evaluation completion." : "Notifications paused. Automated grade release alerts will not be dispatched to students."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {
    /* Preview Email Template Button */
  }
            <button
    id="btn-preview-mock-email"
    onClick={handleOpenEmailPreview}
    className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5 shadow-sm"
    title="Preview the exact email template sent to students"
  >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview Notification</span>
            </button>

            {
    /* Toggle Switch */
  }
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium hidden md:inline">
                {isEmailEnabled ? "ON" : "OFF"}
              </span>
              <button
    id="toggle-mock-email-notification"
    role="switch"
    aria-checked={isEmailEnabled}
    onClick={() => handleToggleMockEmail(!isEmailEnabled)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isEmailEnabled ? "bg-indigo-600" : "bg-zinc-700"}`}
    title={`Click to ${isEmailEnabled ? "disable" : "enable"} email notifications`}
  >
                <span
    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isEmailEnabled ? "translate-x-5" : "translate-x-0"}`}
  />
              </button>
            </div>
          </div>
        </div>

        {
    /* Dispatched History Pill / Latest Alert Callout */
  }
        {dispatchedAlerts && dispatchedAlerts.length > 0 && <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Send className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="line-clamp-1">
                Latest simulated alert: <strong className="text-white">{dispatchedAlerts[0].subject}</strong> to <span className="text-indigo-300">{dispatchedAlerts[0].studentName}</span> ({dispatchedAlerts[0].scoreAwarded}/{dispatchedAlerts[0].maxMarks} marks, {dispatchedAlerts[0].percentageScore}%)
              </span>
            </div>
            <button
    onClick={() => onViewDispatchedAlert ? onViewDispatchedAlert(dispatchedAlerts[0]) : (setPreviewAlert(dispatchedAlerts[0]), setPreviewModalOpen(true))}
    className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs flex items-center gap-1 flex-shrink-0 underline"
  >
              <span>View Dispatched Alert</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>}
      </div>

      {
    /* KPI Cards Grid */
  }
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Evaluation Completion</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {gradedCount} / {totalSubmissions} <span className="text-xs text-zinc-400 font-normal">Papers Graded</span>
          </div>
          <div className="text-xs mt-2 text-zinc-400 flex items-center justify-between">
            <span>Progress: <strong className="text-emerald-400">{Math.round(gradedCount / (totalSubmissions || 1) * 100)}%</strong></span>
            <span className="text-emerald-400">On Schedule</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Cohort Class Average</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">
            {avgPercentage}%
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            Pass Rate: <strong className="text-zinc-200">{passRate}%</strong> ({passCount} of {totalSubmissions} students)
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Pending Student Appeals</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MessageSquareQuote className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {pendingAppealsCount}
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            Awaiting instructor decision & remarking
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">AI Evaluation Latency</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            1.6s <span className="text-xs text-zinc-400 font-normal">/ paper</span>
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            Confidence: <strong className="text-cyan-300">99.1%</strong> (Rubric Guided)
          </div>
        </div>
      </div>

      {
    /* Main Grid: Left Roster & Cohort Distribution, Right Appeals & Quick Actions */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {
    /* Left Column (8 cols): Active Exam Roster & Submissions Queue */
  }
        <div className="lg:col-span-8 space-y-6">
          
          {
    /* Active Examination Rubric Selector */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Curriculum Exam Rubrics & Question Banks</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select an examination rubric to load its classroom student roster.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateStage("exams_management")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Manage All Exams →</span>
                </button>
                <button
                  onClick={onOpenCustomExamModal}
                  className="text-xs text-slate-300 hover:text-white font-medium bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1"
                >
                  <span>+ Add Exam</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(exams || []).map((exam) => {
    const isSelected = exam.id === currentExam?.id;
    const examCount = (submissions || []).filter((s) => s.examId === exam.id).length;
    return <div
      key={exam.id}
      onClick={() => onSelectExam(exam.id)}
      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30" : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"}`}
    >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {exam.courseCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${exam.status === "published" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
                          {exam.status || "published"}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {exam.totalMarks} Marks
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{exam.title}</h3>
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                      <span>{exam.questions?.length || exam.questionsCount || 0} Questions</span>
                      <span className="text-emerald-400 font-semibold">{examCount} Submissions</span>
                    </div>
                  </div>;
  })}
            </div>
          </div>

          {
    /* Student Submissions Table & Live Queue */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Student Submissions & Evaluation Queue ({currentExam.courseCode})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click any student to inspect scans, edit mark overrides, and view personalized insights.
                </p>
              </div>

              {
    /* Search & Filter Controls */
  }
              <div className="flex items-center gap-2">
                <button
    id="btn-teacher-export-cohort-pdf"
    onClick={handleExportCohortLedger}
    disabled={isExportingCohortPdf}
    className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 disabled:opacity-50 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/60 shadow-sm transition"
    title="Export complete cohort evaluation ledger as formatted PDF for offline archival"
  >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isExportingCohortPdf ? "Generating PDF..." : "Export Cohort Ledger (PDF)"}</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search name or roll no..."
    className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-44"
  />
                </div>
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <EmptyState
                title="No student submissions found"
                description={
                  searchTerm
                    ? `No submissions match "${searchTerm}".`
                    : "No student answer scripts registered for this rubric yet."
                }
                actionLabel={searchTerm ? "Clear Search Filter" : undefined}
                onAction={searchTerm ? () => setSearchTerm("") : undefined}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[11px]">
                      <th className="pb-2.5 font-semibold">Student Name & Roll No</th>
                      <th className="pb-2.5 font-semibold">Awarded Score</th>
                      <th className="pb-2.5 font-semibold">Percentage</th>
                      <th className="pb-2.5 font-semibold">OCR Confidence</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredSubmissions.map((sub) => {
                      const isSelected = sub.id === selectedSubmissionId;
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => onSelectSubmission(sub.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-indigo-950/20" : "hover:bg-zinc-800/40"
                          }`}
                        >
                          <td className="py-3">
                            <div className="font-semibold text-zinc-200">{sub.studentName}</div>
                            <div className="font-mono text-[11px] text-zinc-500">{sub.studentRollNumber}</div>
                          </td>
                          <td className="py-3 font-mono font-bold text-emerald-400">
                            {sub.totalAwardedMarks} / {sub.totalMaxMarks}
                          </td>
                          <td className="py-3 font-mono text-zinc-300">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                sub.percentageScore >= 80
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : sub.percentageScore >= 60
                                  ? "text-indigo-400 bg-indigo-500/10"
                                  : "text-amber-400 bg-amber-500/10"
                              }`}
                            >
                              {sub.percentageScore}%
                            </span>
                          </td>
                          <td className="py-3 text-zinc-400">98.4%</td>
                          <td className="py-3">
                            <StatusBadge status={sub.status || "COMPLETED"} size="sm" />
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`result-page-sub-${sub.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectSubmission(sub.id);
                                  onNavigateStage("result_generation");
                                }}
                                className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-emerald-500/30 shadow-xs cursor-pointer"
                                title={`Open Official Result Page & Academic Dossier for ${sub.studentName}`}
                              >
                                <Award className="w-3 h-3 text-emerald-400" />
                                <span className="hidden sm:inline">Result</span>
                              </button>

                              <button
                                id={`export-pdf-sub-${sub.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportSinglePdf(sub);
                                }}
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-rose-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-zinc-700 shadow-xs"
                                title={`Export official archival PDF for ${sub.studentName}`}
                              >
                                <FileText className="w-3 h-3 text-rose-400" />
                                <span className="hidden sm:inline">PDF</span>
                              </button>

                              <button
                                id={`review-workspace-sub-${sub.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectSubmission(sub.id);
                                  onNavigateStage("grading");
                                }}
                                className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1.5"
                                title={`Open Teacher Evaluation Review Workspace for ${sub.studentName}`}
                              >
                                <Columns className="w-3 h-3 text-indigo-400" />
                                <span>Review Workspace</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {
    /* Classroom Score Distribution Chart */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Classroom Grade Distribution ({currentExam.courseCode})</span>
            </h2>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="range" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "11px", color: "#fafafa" }}
  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Student Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {
    /* Right Column (4 cols): Student Appeals & Quick Pipeline Nav */
  }
        <div className="lg:col-span-4 space-y-6">
          
          {
    /* Student Appeals & Remarking Inbox */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                <span>Student Appeals Inbox</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingAppealsCount} Pending
              </span>
            </div>

            <div className="space-y-3">
              {appeals.length === 0 ? (
                <EmptyState
                  title="No Pending Appeals"
                  description="All student re-evaluation requests have been reviewed and resolved."
                  icon={CheckCircle2}
                />
              ) : (
                appeals.map((appeal) => (
                  <div key={appeal.id} className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-200">{appeal.studentName}</span>
                        <span className="text-[11px] text-zinc-500 ml-1.5">({appeal.rollNumber})</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appeal.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : appeal.status === "Rejected"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {appeal.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded border border-indigo-900/40">
                      <strong>Question {appeal.questionNumber}:</strong> Current {appeal.currentMarks}/{appeal.maxMarks} marks
                    </div>

                    <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded">
                      "{appeal.reason}"
                    </p>

                    {appeal.status === "Pending" && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleHandleAppeal(appeal.id, "Approve")}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] flex items-center justify-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept (+{appeal.suggestedBoost} pts)</span>
                        </button>
                        <button
                          onClick={() => handleHandleAppeal(appeal.id, "Reject")}
                          className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded text-[11px] flex items-center justify-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Maintain</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {
    /* Quick Pipeline Navigation for Faculty */
  }
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Evaluation Workflow Stages</span>
            </h2>

            <div className="space-y-2">
              <button
    onClick={() => onNavigateStage("preprocessing")}
    className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg border border-zinc-800 flex items-center justify-between text-xs text-left transition"
  >
                <div>
                  <span className="font-semibold text-zinc-200">1. Question Paper & Answer Scans</span>
                  <p className="text-[10px] text-zinc-500">Upload paper, run auto-test suite, apply filters</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button
    onClick={() => onNavigateStage("digitization")}
    className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg border border-zinc-800 flex items-center justify-between text-xs text-left transition"
  >
                <div>
                  <span className="font-semibold text-zinc-200">2. Optical Character Recognition</span>
                  <p className="text-[10px] text-zinc-500">Handwriting transcription & confidence mapping</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button
    onClick={() => onNavigateStage("grading")}
    className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg border border-zinc-800 flex items-center justify-between text-xs text-left transition"
  >
                <div>
                  <span className="font-semibold text-indigo-300">3. AI Grading & Faculty Overrides</span>
                  <p className="text-[10px] text-zinc-500">Rubric breakdown, mark adjustments & comments</p>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button
    onClick={() => onNavigateStage("insights")}
    className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-lg border border-zinc-800 flex items-center justify-between text-xs text-left transition"
  >
                <div>
                  <span className="font-semibold text-zinc-200">4. Performance Analytics & Radar</span>
                  <p className="text-[10px] text-zinc-500">Cohort percentiles & concept mastery radar</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {
    /* Simulated Email Modal (Preview or Dispatched Alert) */
  }
      {previewAlert && <MockEmailModal
    isOpen={previewModalOpen}
    onClose={() => setPreviewModalOpen(false)}
    alert={previewAlert}
    isPreviewMode={true}
    onNavigateToGrading={() => {
      setPreviewModalOpen(false);
      onNavigateStage("grading");
    }}
  />}

      {
    /* How It Works Explanatory Guide Modal */
  }
      <HowItWorksGuide
    isOpen={isHowItWorksOpen}
    onClose={() => setIsHowItWorksOpen(false)}
    onNavigateStage={onNavigateStage}
    onRunDemo={onRunAiPipeline}
  />

    </div>;
};
