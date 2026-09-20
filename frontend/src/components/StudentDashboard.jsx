import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  HelpCircle,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Download,
  Target,
  Sparkles,
  BookMarked,
  Layers,
  Lightbulb,
  FileUp,
  Search,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { HowItWorksGuide } from "./HowItWorksGuide";
import { exportStudentEvaluationPDF } from "../utils/pdfExport";
import { showSweetToast } from "../utils/sweetAlert";

// Modular Subcomponents
import { StudentDashboardMetrics } from "./student/StudentDashboardMetrics";
import { StudentExaminationsSection } from "./student/StudentExaminationsSection";
import { StudentEvaluationTracker } from "./student/StudentEvaluationTracker";
import { StudentPerformanceCharts } from "./student/StudentPerformanceCharts";
import { StudentResultsAndFeedback } from "./student/StudentResultsAndFeedback";
import { ExamDetailsModal } from "./student/ExamDetailsModal";
import { StudentSubmitPaperModal } from "./student/StudentSubmitPaperModal";
import { StudentAcademicAnalytics } from "./analytics/StudentAcademicAnalytics";
import { EvaluationHistoryModule } from "./history/EvaluationHistoryModule";
import { ProfessionalResultPage } from "./results/ProfessionalResultPage";
import { calculateStudentAnalytics } from "../utils/academicAnalyticsData";

export const StudentDashboard = ({
  exams = [],
  submissions = [],
  selectedExamId,
  selectedSubmissionId,
  onSelectExam,
  onSelectSubmission,
  onOpenAppealModal,
  onNavigateTab,
  onAddSubmission,
  initialTab = "exams"
}) => {
  const { user, switchRole } = useAuth();
  const { currentTheme } = useTheme();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [modalExam, setModalExam] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Student Roll Number & Filtered Submissions
  const studentRollNumber = user?.rollNumber || "CS-2026-041";
  const mySubmissions = submissions.filter(
    (s) =>
      s.studentRollNumber === studentRollNumber ||
      (s.studentName && s.studentName.toLowerCase().includes("aarav")) ||
      (s.studentName && s.studentName.toLowerCase().includes("alex"))
  );

  // Active Selected Exam & Submission
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const activeSubmission =
    submissions.find((s) => s.examId === currentExam?.id && s.id === selectedSubmissionId) ||
    mySubmissions.find((s) => s.examId === currentExam?.id) ||
    mySubmissions[0] ||
    submissions[0];

  // Calculated Metrics
  const gradedSubmissions = mySubmissions.filter((s) => s.status === "Graded" || s.status === "COMPLETED");
  const averageScore = gradedSubmissions.length > 0
    ? Math.round(
        (gradedSubmissions.reduce((sum, s) => sum + s.percentageScore, 0) / gradedSubmissions.length) * 10
      ) / 10
    : 89.2;

  const availableExamsCount = exams.filter((e) => e.status !== "draft").length;
  const upcomingExamsCount = 2; // Scheduled on academic calendar

  // Question Score Breakdown Data
  const questionScoreData = (activeSubmission?.questionEvaluations || []).map((e) => ({
    name: `Q${e.questionNumber}`,
    score: e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks,
    max: e.maxMarks,
    percentage: Math.round(
      ((e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks) / (e.maxMarks || 1)) * 100
    )
  }));

  // PDF Export Handler
  const handleDownloadReport = async () => {
    if (!activeSubmission || !currentExam) {
      showSweetToast("No graded submission selected to export", "info");
      return;
    }

    try {
      setIsExportingPdf(true);
      await exportStudentEvaluationPDF(activeSubmission, currentExam, {
        institutionName: user?.department
          ? `DEPARTMENT OF ${user.department.toUpperCase()}`
          : "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
        evaluatorName: "Faculty Examination Board"
      });
      showSweetToast(`Official Grade Transcript exported for ${activeSubmission.studentName}`, "success");
    } catch (error) {
      console.error("Error exporting transcript:", error);
      showSweetToast("Could not generate PDF transcript. Please try again.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenExamModal = (exam) => {
    setModalExam(exam);
    setIsExamModalOpen(true);
  };

  const handleOpenSubmitModal = (exam) => {
    setModalExam(exam || currentExam);
    setIsSubmitModalOpen(true);
  };

  const studentAnalytics = calculateStudentAnalytics(
    studentRollNumber,
    currentExam,
    submissions,
    exams
  );

  return (
    <div id="student-dashboard-root" className="space-y-6 animate-fadeIn">
      {/* 1. Student Portal Header Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Welcome back, {user?.name || "Aarav Sharma"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Student Examination Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Roll Number: <strong className="text-emerald-400 font-mono">{studentRollNumber}</strong> • {user?.department || "Computer Science & Engineering"} • Semester 6
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <strong>{exams.length}</strong> Enrolled Courses
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{mySubmissions.length || 1}</strong> Submitted Papers
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Aggregate Score: <strong>{averageScore}% (Grade A)</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-student-submit-paper"
              onClick={() => handleOpenSubmitModal(currentExam)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Submit a handwritten answer sheet for any available examination"
            >
              <FileUp className="w-4 h-4" />
              <span>Submit Answer Paper</span>
            </button>

            <button
              id="btn-student-academic-analytics"
              onClick={() => onNavigateTab && onNavigateTab("insights")}
              className="px-3.5 py-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/70 text-indigo-300 text-xs font-semibold border border-indigo-800/60 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Open full academic analytics, personal trends, and topic mastery"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Academic Analytics</span>
            </button>

            <button
              id="btn-student-how-it-works"
              onClick={() => setIsHowItWorksOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>How It Works</span>
            </button>

            <button
              id="btn-student-appeal-dash"
              onClick={onOpenAppealModal}
              className="px-3.5 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/60 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Request Appeal</span>
            </button>

            <button
              id="btn-student-official-result"
              onClick={() => {
                if (onNavigateTab) onNavigateTab("result_generation");
                else setActiveTab("official_result");
              }}
              className="px-3.5 py-2 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Open Official Result Page & Download Signed Academic Transcript PDF"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Official Result Card</span>
            </button>

            <button
              id="btn-student-download-transcript"
              onClick={handleDownloadReport}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Download official evaluation report and grade transcript as formatted PDF"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExportingPdf ? "Generating..." : "Download Transcript (PDF)"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-800 overflow-x-auto pb-1">
          {[
            { id: "exams", label: "1. Available & Upcoming Examinations", icon: BookOpen },
            { id: "scorecard", label: "2. Final Marks & Performance Trends", icon: Award },
            { id: "tracking", label: "3. Evaluation Status Tracker", icon: Clock },
            { id: "feedback", label: "4. Question-Wise Marks & Teacher Feedback", icon: Layers },
            { id: "appeals", label: "5. Re-Evaluation Appeals Center", icon: HelpCircle },
            { id: "analytics", label: "6. Academic Analytics & Mastery", icon: BarChart3 },
            { id: "history", label: "7. Previous Evaluations History", icon: Clock },
            { id: "official_result", label: "8. Official Result Card & PDF", icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`student-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-white border border-slate-700 shadow-2xs"
                    : "bg-slate-950/50 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-slate-850"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Key Performance Indicators & Status Overview */}
      <StudentDashboardMetrics
        averageScore={averageScore}
        availableCount={availableExamsCount}
        upcomingCount={upcomingExamsCount}
        submittedCount={mySubmissions.length}
        gradedCount={gradedSubmissions.length}
        evaluationStatus={activeSubmission?.status || "Graded & Published"}
        performanceTrendDelta="+4.8%"
        gpa="3.84"
        classPercentile={activeSubmission?.predictiveAnalytics?.classPercentileRank || 89}
        onSelectTab={(t) => setActiveTab(t)}
      />

      {/* 3. TAB CONTENT */}

      {/* TAB 1: Examinations & Submissions Center */}
      {activeTab === "exams" && (
        <StudentExaminationsSection
          exams={exams}
          submissions={submissions}
          currentExam={currentExam}
          activeSubmission={activeSubmission}
          onSelectExam={onSelectExam}
          onSelectSubmission={onSelectSubmission}
          onViewExamDetails={handleOpenExamModal}
          onSubmitPaper={handleOpenSubmitModal}
          onNavigateTab={(t) => {
            if (t === "scorecard") setActiveTab("scorecard");
            else if (t === "tracking") setActiveTab("tracking");
            else if (t === "questions") setActiveTab("feedback");
            else if (onNavigateTab) onNavigateTab(t);
          }}
          user={user}
        />
      )}

      {/* TAB 2: Scorecard & Performance Trends */}
      {activeTab === "scorecard" && (
        <div className="space-y-6">
          <StudentPerformanceCharts
            questionScoreData={questionScoreData}
            currentExam={currentExam}
            activeSubmission={activeSubmission}
            onSelectQuestion={() => setActiveTab("feedback")}
          />

          <StudentResultsAndFeedback
            exams={exams}
            submissions={submissions}
            currentExam={currentExam}
            activeSubmission={activeSubmission}
            onSelectExam={onSelectExam}
            onSelectSubmission={onSelectSubmission}
            onDownloadReport={handleDownloadReport}
            onNavigateResultPage={() => setActiveTab("official_result")}
            isExportingPdf={isExportingPdf}
            user={user}
          />
        </div>
      )}

      {/* TAB 3: Evaluation Status Tracker */}
      {activeTab === "tracking" && (
        <StudentEvaluationTracker
          submission={activeSubmission}
          exam={currentExam}
          onViewResults={() => setActiveTab("feedback")}
        />
      )}

      {/* TAB 4: Question-Wise Marks & Teacher Feedback */}
      {activeTab === "feedback" && (
        <StudentResultsAndFeedback
          exams={exams}
          submissions={submissions}
          currentExam={currentExam}
          activeSubmission={activeSubmission}
          onSelectExam={onSelectExam}
          onSelectSubmission={onSelectSubmission}
          onDownloadReport={handleDownloadReport}
          isExportingPdf={isExportingPdf}
          user={user}
        />
      )}

      {/* TAB 5: Re-Evaluation Appeals Center */}
      {activeTab === "appeals" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span>Re-Evaluation Appeal & Remarking Center</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Track status and submit re-evaluation tickets for instructor verification and remarking.
              </p>
            </div>

            <button
              id="btn-open-appeal-ticket-cta"
              onClick={onOpenAppealModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>+ Submit New Appeal Request</span>
            </button>
          </div>

          {/* Active Appeal Tickets */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    APP-101
                  </span>
                  <span className="text-xs font-bold text-white">
                    {currentExam.courseCode}: Question 2 Sobel Matrix Calculation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Instructor Review</span>
                </span>
              </div>

              <p className="text-xs text-slate-300">
                "Included both Sobel and Prewitt kernel matrix calculations in the appendix margin which were split during initial OCR block segmenting."
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850">
                <span>Submitted: Today at 10:38 AM</span>
                <span>Assigned to: Faculty Examination Board</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Academic Analytics & Mastery */}
      {activeTab === "analytics" && (
        <StudentAcademicAnalytics
          studentAnalytics={studentAnalytics}
          currentExam={currentExam}
        />
      )}

      {/* TAB 7: Previous Evaluations History */}
      {activeTab === "history" && (
        <EvaluationHistoryModule
          submissions={submissions}
          exams={exams}
          isStudent={true}
          currentUser={user}
          onNavigateStage={(stage) => {
            if (onNavigateTab) onNavigateTab(stage);
          }}
          onSelectSubmission={onSelectSubmission}
          onSelectExam={onSelectExam}
          onOpenAppealModal={onOpenAppealModal}
        />
      )}

      {/* TAB 8: Official Result Card & PDF Dossier */}
      {activeTab === "official_result" && (
        <ProfessionalResultPage
          exams={exams}
          submissions={submissions}
          selectedExamId={currentExam?.id}
          selectedSubmissionId={activeSubmission?.id}
          user={user}
          role="student"
          isStudent={true}
          onSelectExam={onSelectExam}
          onSelectSubmission={onSelectSubmission}
          onOpenAppealModal={onOpenAppealModal}
        />
      )}

      {/* Examination Details Blueprint Modal */}
      <ExamDetailsModal
        exam={modalExam}
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        onSubmitPaper={(exam) => handleOpenSubmitModal(exam)}
        isSubmitted={mySubmissions.some((s) => s.examId === modalExam?.id)}
        submission={mySubmissions.find((s) => s.examId === modalExam?.id)}
      />

      {/* Submit Answer Paper Modal */}
      <StudentSubmitPaperModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        exams={exams}
        selectedExam={modalExam || currentExam}
        user={user}
        onAddSubmission={(newSub) => {
          if (onAddSubmission) onAddSubmission(newSub);
          if (onSelectExam) onSelectExam(newSub.examId);
          if (onSelectSubmission) onSelectSubmission(newSub.id);
          setActiveTab("scorecard");
        }}
        onNavigateTab={onNavigateTab}
      />

      {/* How It Works Explanatory Guide Modal */}
      <HowItWorksGuide
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </div>
  );
};
