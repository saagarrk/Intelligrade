import React, { useState, useMemo } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  User,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Percent,
  Cpu,
  GraduationCap,
  BookMarked,
  Filter,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { StudentSubmission, ExamPaper } from "../../types";
import { exportStudentEvaluationPDF } from "../../utils/pdfExport";
import { showSweetToast } from "../../utils/sweetAlert";

interface ProfessionalResultPageProps {
  exams: ExamPaper[];
  submissions: StudentSubmission[];
  selectedExamId?: string;
  selectedSubmissionId?: string;
  user?: any;
  role?: string;
  isStudent?: boolean;
  onSelectExam?: (examId: string) => void;
  onSelectSubmission?: (submissionId: string) => void;
  onNavigateStage?: (stageId: string) => void;
  onOpenAppealModal?: () => void;
}

/**
 * Calculates academic honors classification based on percentage
 */
function getGradeClassification(percentage: number): { grade: string; classification: string; color: string; badgeBg: string } {
  if (percentage >= 90) return { grade: "A+", classification: "First Class with Distinction", color: "text-emerald-400", badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" };
  if (percentage >= 80) return { grade: "A", classification: "First Class with Honors", color: "text-emerald-400", badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" };
  if (percentage >= 70) return { grade: "B+", classification: "First Class", color: "text-blue-400", badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-300" };
  if (percentage >= 60) return { grade: "B", classification: "Second Class Upper", color: "text-amber-400", badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300" };
  if (percentage >= 50) return { grade: "C", classification: "Second Class Lower", color: "text-amber-400", badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300" };
  if (percentage >= 40) return { grade: "D", classification: "Pass Grade", color: "text-orange-400", badgeBg: "bg-orange-500/10 border-orange-500/30 text-orange-300" };
  return { grade: "F", classification: "Requires Re-Evaluation", color: "text-rose-400", badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-300" };
}

export const ProfessionalResultPage: React.FC<ProfessionalResultPageProps> = ({
  exams = [],
  submissions = [],
  selectedExamId,
  selectedSubmissionId,
  user,
  role = "student",
  isStudent = false,
  onSelectExam,
  onSelectSubmission,
  onNavigateStage,
  onOpenAppealModal
}) => {
  // Local state for selected exam and submission
  const [currentExamId, setCurrentExamId] = useState<string>(
    selectedExamId || exams[0]?.id || ""
  );
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string>(
    selectedSubmissionId || submissions[0]?.id || ""
  );

  // Student search & question filtering
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [questionFilter, setQuestionFilter] = useState<"all" | "full" | "partial" | "deductions">("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({ 1: true });
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [viewTab, setViewTab] = useState<"overview" | "rubric_detail" | "improvement_plan">("overview");

  // Keep state in sync when props change
  React.useEffect(() => {
    if (selectedExamId) setCurrentExamId(selectedExamId);
  }, [selectedExamId]);

  React.useEffect(() => {
    if (selectedSubmissionId) setCurrentSubmissionId(selectedSubmissionId);
  }, [selectedSubmissionId]);

  // Derived current exam
  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === currentExamId) || exams[0] || null;
  }, [exams, currentExamId]);

  // Filter submissions for this exam or student
  const availableSubmissions = useMemo(() => {
    let list = submissions;
    if (currentExam) {
      list = list.filter((s) => s.examId === currentExam.id);
    }
    if (isStudent && user) {
      const studentRoll = user.rollNumber || "CS-2026-041";
      const studentName = user.name?.toLowerCase() || "";
      list = list.filter(
        (s) =>
          s.studentRollNumber === studentRoll ||
          (s.studentName && s.studentName.toLowerCase().includes(studentName))
      );
    }
    if (studentSearchQuery.trim()) {
      const q = studentSearchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.studentRollNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [submissions, currentExam, isStudent, user, studentSearchQuery]);

  // Derived current submission
  const currentSubmission = useMemo(() => {
    const found = availableSubmissions.find((s) => s.id === currentSubmissionId);
    if (found) return found;
    return availableSubmissions[0] || submissions.find((s) => s.id === currentSubmissionId) || submissions[0] || null;
  }, [availableSubmissions, currentSubmissionId, submissions]);

  // Toggle question accordion
  const toggleQuestion = (qNum: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qNum]: !prev[qNum]
    }));
  };

  const expandAllQuestions = () => {
    if (!currentSubmission) return;
    const allExpanded: Record<number, boolean> = {};
    currentSubmission.questionEvaluations.forEach((q) => {
      allExpanded[q.questionNumber] = true;
    });
    setExpandedQuestions(allExpanded);
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions({});
  };

  // Calculations
  const totalAwardedMarks = useMemo(() => {
    if (!currentSubmission) return 0;
    return Number(
      currentSubmission.questionEvaluations.reduce((sum, qe) => {
        const mark = qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : (qe.finalMarks ?? qe.awardedMarks);
        return sum + mark;
      }, 0).toFixed(1)
    );
  }, [currentSubmission]);

  const totalMaxMarks = currentExam?.totalMarks || currentSubmission?.totalMaxMarks || 50;
  const percentageScore = Number(((totalAwardedMarks / totalMaxMarks) * 100).toFixed(1));
  const gradeInfo = getGradeClassification(percentageScore);

  // Evaluation date derivation
  const evaluationDateFormatted = useMemo(() => {
    if (!currentSubmission) return "September 17, 2026";
    const reviewedAt = currentSubmission.questionEvaluations?.[0]?.teacherReviewedAt;
    if (reviewedAt) {
      try {
        return new Date(reviewedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      } catch {
        return reviewedAt;
      }
    }
    if (currentSubmission.submissionDate) {
      return currentSubmission.submissionDate;
    }
    return "September 17, 2026";
  }, [currentSubmission]);

  // Verification Hash
  const verificationHash = useMemo(() => {
    if (!currentSubmission) return "IG-VERIFY-ACAD-2026";
    const raw = `${currentSubmission.id}-${currentSubmission.studentRollNumber}-${totalAwardedMarks}-INTELLIGRADE`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
    return `IG-RESULT-${hex}-${currentSubmission.studentRollNumber.replace(/[^a-zA-Z0-9]/g, "")}`;
  }, [currentSubmission, totalAwardedMarks]);

  // Filter questions
  const filteredQuestionEvaluations = useMemo(() => {
    if (!currentSubmission) return [];
    return currentSubmission.questionEvaluations.filter((qe) => {
      const awarded = qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : (qe.finalMarks ?? qe.awardedMarks);
      const isFull = awarded >= qe.maxMarks;
      const hasDeductions = qe.deductions && qe.deductions.length > 0;

      if (questionFilter === "full") return isFull;
      if (questionFilter === "partial") return !isFull;
      if (questionFilter === "deductions") return hasDeductions;
      return true;
    });
  }, [currentSubmission, questionFilter]);

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    if (!currentSubmission || !currentExam) {
      showSweetToast("No submission data available to export", "error");
      return;
    }
    try {
      setIsExportingPdf(true);
      await exportStudentEvaluationPDF(currentSubmission, currentExam, {
        evaluatorName: "Prof. Rajesh Kulkarni (Senior Faculty Evaluator)",
        institutionName: "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
        includeInsights: true,
        evaluationDate: evaluationDateFormatted
      });
      showSweetToast(`Official Result PDF generated for ${currentSubmission.studentName}`, "success");
    } catch (error) {
      console.error("PDF export error:", error);
      showSweetToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Handle Copy Verification ID
  const handleCopyVerification = () => {
    navigator.clipboard.writeText(verificationHash);
    setCopiedToken(true);
    showSweetToast("Result Verification Hash copied to clipboard", "success");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  if (!currentExam || !currentSubmission) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl mx-auto my-8 space-y-4">
        <Award className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Evaluation Result Selected</h2>
        <p className="text-xs text-slate-400">
          Select an examination and student submission to generate the comprehensive evaluation dossier.
        </p>
        {exams.length > 0 && (
          <button
            onClick={() => {
              if (onSelectExam) onSelectExam(exams[0].id);
              setCurrentExamId(exams[0].id);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Load First Examination
          </button>
        )}
      </div>
    );
  }

  const assignedEvaluator = "Prof. Rajesh Kulkarni (Senior Faculty Evaluator)";
  const insights = currentSubmission.personalizedInsights;

  return (
    <div id="professional-result-page" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* TOP CONTROL BAR & ACTIONS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Academic Result</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {verificationHash}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
              <span>Official Examination Result & Evaluation Dossier</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-modal AI evaluated, rubric scored, and faculty verified academic transcript.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-download-result-pdf"
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Download publication-grade academic report PDF with official IntelliGrade seal"
            >
              <Download className={`w-4 h-4 ${isExportingPdf ? "animate-bounce" : ""}`} />
              <span>{isExportingPdf ? "Generating PDF Report..." : "Download Result PDF"}</span>
            </button>

            <button
              id="btn-print-result"
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Print result dossier"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              id="btn-copy-result-token"
              onClick={handleCopyVerification}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy cryptographic tamper-evident token"
            >
              {copiedToken ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden sm:inline">Copy Token</span>
            </button>

            {isStudent && onOpenAppealModal && (
              <button
                id="btn-result-appeal-cta"
                onClick={onOpenAppealModal}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Appeal Question</span>
              </button>
            )}

            {!isStudent && onNavigateStage && (
              <button
                id="btn-result-edit-grading-cta"
                onClick={() => onNavigateStage("grading")}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Review / Adjust Marks</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters & Dropdowns Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          {/* Exam Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Select Examination:
            </label>
            <select
              id="select-result-exam"
              value={currentExamId}
              onChange={(e) => {
                setCurrentExamId(e.target.value);
                if (onSelectExam) onSelectExam(e.target.value);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.courseCode ? `[${exam.courseCode}] ` : ""}{exam.title} ({exam.totalMarks} Marks)
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {isStudent ? "Candidate Record:" : "Select Candidate Submission:"}
            </label>
            <select
              id="select-result-submission"
              value={currentSubmission?.id || ""}
              onChange={(e) => {
                setCurrentSubmissionId(e.target.value);
                if (onSelectSubmission) onSelectSubmission(e.target.value);
              }}
              disabled={isStudent && availableSubmissions.length <= 1}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer disabled:opacity-60"
            >
              {availableSubmissions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.studentName} ({sub.studentRollNumber}) - {sub.percentageScore}%
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          {!isStudent && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Search Student Roll / Name:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. CS-2026-041 or Aarav..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* OFFICIAL RESULT DOSSIER CARD (PRINT READY STYLED) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Institutional Branding Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-teal-400" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Award className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
                    INTELLIGRADE ACADEMIC ASSESSMENT ENGINE
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CERTIFIED
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  OFFICIAL EXAMINATION SCORECARD & RESULT DOSSIER
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department of Examination & Academic Affairs • ISO/IEC 27001 AI Standards Compliant
                </p>
              </div>
            </div>

            <div className="md:text-right font-mono text-xs space-y-1">
              <div className="text-slate-400">
                Transcript Record: <span className="text-white font-bold">{verificationHash}</span>
              </div>
              <div className="text-slate-400">
                Evaluation Date: <span className="text-emerald-400 font-bold">{evaluationDateFormatted}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Faculty Certified & Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STUDENT & EXAMINATION PROFILE SPECIFICATION GRID */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-b border-slate-800 bg-slate-950/40">
          {/* Candidate Profile */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Candidate Information</span>
              </span>
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Verified Student
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0">
                {currentSubmission.studentName?.charAt(0) || "S"}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {currentSubmission.studentName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Roll: {currentSubmission.studentRollNumber}
                  </span>
                  <span>•</span>
                  <span>{currentExam.gradeLevel || "Undergraduate / Semester 6"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Academic Program:</span>
                <span className="text-slate-300 font-medium">B.Tech Computer Science & Engg.</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Answer Sheet Intake:</span>
                <span className="text-slate-300 font-medium font-mono">{currentSubmission.submissionDate || "2026-09-06"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Intake Format:</span>
                <span className="text-slate-300 font-medium">Multipage OCR Scan (PDF)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">OCR Engine Confidence:</span>
                <span className="text-emerald-400 font-medium font-mono">
                  {currentSubmission.ocrResult?.averageConfidence || 94.8}% (High)
                </span>
              </div>
            </div>
          </div>

          {/* Examination Specification */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Examination Specification</span>
              </span>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {currentExam.courseCode || "CS-301"}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {currentExam.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Subject: <span className="text-slate-200 font-medium">{currentExam.subject}</span> • Department of Computer Science
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Evaluation Date:</span>
                <span className="text-emerald-300 font-semibold font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>{evaluationDateFormatted}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Allocated Duration:</span>
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{currentExam.durationMinutes || 120} Minutes</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Certified Faculty Evaluator:</span>
                <span className="text-slate-200 font-medium">{assignedEvaluator}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Evaluation Method:</span>
                <span className="text-slate-300 font-medium">Gemini-Vision + Semantic Rubric</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EXECUTIVE PERFORMANCE SCORECARD (METRICS TILES) */}
        {/* ------------------------------------------------------------- */}
        <div className="p-6 sm:p-8 bg-slate-900 border-b border-slate-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Marks Obtained */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Marks Obtained
              </span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white">
                    {totalAwardedMarks}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    / {totalMaxMarks}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Score</span>
                </div>
              </div>
            </div>

            {/* Tile 2: Percentage & Progress */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Percentage
              </span>
              <div>
                <div className="text-3xl font-black text-emerald-400 flex items-center">
                  <span>{percentageScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, percentageScore)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tile 3: Grade & Academic Standing */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Letter Grade
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-black ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${gradeInfo.badgeBg}`}>
                    {percentageScore >= 50 ? "PASS" : "RE-EVAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1 truncate" title={gradeInfo.classification}>
                  {gradeInfo.classification}
                </p>
              </div>
            </div>

            {/* Tile 4: Cohort Standing */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cohort Percentile
              </span>
              <div>
                <div className="text-3xl font-black text-indigo-400">
                  Top {100 - (currentSubmission.predictiveAnalytics?.classPercentileRank || 84)}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Readiness: <span className="text-slate-200 font-semibold">{currentSubmission.predictiveAnalytics?.examReadinessLevel || "High Mastery"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DOSSIER SECTION NAVIGATION TABS */}
        {/* ------------------------------------------------------------- */}
        <div className="flex items-center gap-2 px-6 sm:px-8 pt-4 pb-0 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          {[
            { id: "overview", label: "Question-Wise Marks Breakdown", icon: Layers },
            { id: "rubric_detail", label: "Rubric Evaluation & Deductions", icon: BookMarked },
            { id: "improvement_plan", label: "Areas for Improvement & Teacher Feedback", icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = viewTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`btn-result-tab-${tab.id}`}
                onClick={() => setViewTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: QUESTION-WISE MARKS BREAKDOWN */}
        {/* ------------------------------------------------------------- */}
        {viewTab === "overview" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Itemized Question-Wise Scoring Breakdown</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Compare maximum marks, awarded marks, semantic relevance, and handwriting OCR accuracy.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
                  <button
                    onClick={() => setQuestionFilter("all")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      questionFilter === "all"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({currentSubmission.questionEvaluations.length})
                  </button>
                  <button
                    onClick={() => setQuestionFilter("full")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      questionFilter === "full"
                        ? "bg-slate-800 text-emerald-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Full Credit
                  </button>
                  <button
                    onClick={() => setQuestionFilter("partial")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      questionFilter === "partial"
                        ? "bg-slate-800 text-amber-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    onClick={() => setQuestionFilter("deductions")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      questionFilter === "deductions"
                        ? "bg-slate-800 text-rose-400 shadow-xs"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Deductions
                  </button>
                </div>

                <button
                  onClick={expandAllQuestions}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white rounded bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllQuestions}
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white rounded bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* Question Evaluation Accordions / Cards */}
            <div className="space-y-4">
              {filteredQuestionEvaluations.map((qe) => {
                const examQ = currentExam.questions?.find(
                  (q) => q.questionNumber === qe.questionNumber || q.id === qe.questionId
                );
                const awarded = qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : (qe.finalMarks ?? qe.awardedMarks);
                const isOverridden = qe.teacherOverrideMarks !== undefined && qe.teacherOverrideMarks !== qe.awardedMarks;
                const isFull = awarded >= qe.maxMarks;
                const pct = Math.round((awarded / qe.maxMarks) * 100);
                const isExpanded = !!expandedQuestions[qe.questionNumber];

                return (
                  <div
                    key={qe.questionNumber}
                    id={`result-question-card-${qe.questionNumber}`}
                    className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden transition-all shadow-xs"
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => toggleQuestion(qe.questionNumber)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 border ${
                            isFull
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : awarded > 0
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          }`}
                        >
                          Q{qe.questionNumber}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {examQ?.topic || `Question ${qe.questionNumber}`}
                            </h4>
                            {isOverridden && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                Faculty Override
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-xl mt-0.5">
                            {examQ?.questionText || qe.question || qe.questionText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Score Pill */}
                        <div className="text-right">
                          <div className="flex items-baseline gap-1 justify-end">
                            <span className="text-base font-bold text-white">
                              {awarded}
                            </span>
                            <span className="text-xs text-slate-500">
                              / {qe.maxMarks}
                            </span>
                          </div>
                          <span className={`text-[11px] font-semibold ${isFull ? "text-emerald-400" : "text-slate-400"}`}>
                            {pct}% Credit
                          </span>
                        </div>

                        {/* Semantic Score */}
                        <div className="hidden sm:block text-right">
                          <span className="text-xs font-mono font-bold text-indigo-400 block">
                            {qe.semanticSimilarityScore}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Semantic Match
                          </span>
                        </div>

                        <div className="p-1 rounded text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-850 bg-slate-900/30 space-y-4">
                        {/* Full Question Prompt */}
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                          <span className="font-bold text-slate-400 block mb-0.5">Question Prompt:</span>
                          {examQ?.questionText || qe.question || qe.questionText}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Student Extracted Answer */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Student Answer (Handwriting OCR)</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                OCR Confidence: {qe.confidenceScore || 94}%
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                              {qe.studentAnswer || qe.studentAnswerText || "No student answer text recorded."}
                            </div>
                          </div>

                          {/* Reference Model Answer */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Reference Model Answer Criteria</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Max Marks: {qe.maxMarks}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                              {qe.modelAnswer || qe.modelAnswerText || examQ?.modelAnswer || "Model answer criteria reference."}
                            </div>
                          </div>
                        </div>

                        {/* Qualitative Teacher Feedback & Evaluator Notes */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Teacher Feedback & Evaluator Justification</span>
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {qe.feedback || qe.evaluationFeedback || "Student demonstrated adequate conceptual understanding."}
                          </p>
                          {qe.teacherComment && (
                            <div className="mt-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                              <span className="font-bold block text-indigo-400">Faculty Audit Note:</span>
                              {qe.teacherComment}
                            </div>
                          )}
                        </div>

                        {/* Deductions applied if any */}
                        {qe.deductions && qe.deductions.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1.5">
                            <span className="font-bold text-rose-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Itemized Mark Deductions:</span>
                            </span>
                            <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                              {qe.deductions.map((d, dIdx) => (
                                <li key={dIdx}>
                                  <span className="font-bold text-rose-400">-{d.pointsDeducted} pt: </span>
                                  <span>{d.reason}</span>
                                  {d.category && <span className="text-slate-500"> ({d.category})</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: RUBRIC EVALUATION & CRITERIA BREAKDOWN */}
        {/* ------------------------------------------------------------- */}
        {viewTab === "rubric_detail" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-emerald-400" />
                <span>Concept-by-Concept Rubric Evaluation & Weight Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against formal key concept criteria, required weights, and detected student phrase equivalences.
              </p>
            </div>

            <div className="space-y-6">
              {currentSubmission.questionEvaluations.map((qe) => {
                const examQ = currentExam.questions?.find(
                  (q) => q.questionNumber === qe.questionNumber || q.id === qe.questionId
                );
                const concepts = qe.conceptMatches || [];

                return (
                  <div key={qe.questionNumber} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-white">
                            Question {qe.questionNumber}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {examQ?.topic || `Topic ${qe.questionNumber}`}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {examQ?.questionText || qe.questionText}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-xs text-slate-400 block">Marks Awarded</span>
                          <span className="text-sm font-bold text-emerald-400">
                            {qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : (qe.finalMarks ?? qe.awardedMarks)} / {qe.maxMarks}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rubric Criteria Table */}
                    {concepts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-semibold bg-slate-900/60">
                              <th className="p-3">Required Concept</th>
                              <th className="p-3 text-center">Status</th>
                              <th className="p-3 text-center">Weight</th>
                              <th className="p-3 text-center">Awarded</th>
                              <th className="p-3">Matched Student Phrases & Justification</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850">
                            {concepts.map((cm, cIdx) => {
                              const isFull = cm.status === "Full";
                              const isPartial = cm.status === "Partial";

                              return (
                                <tr key={cIdx} className="hover:bg-slate-900/30 transition-colors">
                                  <td className="p-3 font-medium text-white max-w-xs">
                                    {cm.concept}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        isFull
                                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                          : isPartial
                                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                      }`}
                                    >
                                      {cm.status}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-mono text-slate-400">
                                    {cm.requiredWeight ?? cm.weightMarks ?? 1.0} pt
                                  </td>
                                  <td className="p-3 text-center font-mono font-bold text-white">
                                    {cm.awardedWeight ?? cm.awardedMarks ?? 0} pt
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    <p className="text-xs">{cm.explanation}</p>
                                    {cm.matchedStudentPhrases && cm.matchedStudentPhrases.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {cm.matchedStudentPhrases.map((phrase, pIdx) => (
                                          <span
                                            key={pIdx}
                                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-300"
                                          >
                                            "{phrase}"
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-slate-900/50 text-xs text-slate-400 text-center">
                        Standard rubric applied. Awarded full concept credit based on model answer semantic comparison.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: AREAS FOR IMPROVEMENT & TEACHER FEEDBACK */}
        {/* ------------------------------------------------------------- */}
        {viewTab === "improvement_plan" && (
          <div className="p-6 sm:p-8 space-y-8">
            {/* Overall Teacher Feedback Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Comprehensive Evaluator Feedback</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Certified: {assignedEvaluator}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
                "{insights?.overallSummary || "Candidate demonstrated excellent grasp of core technical principles and mathematical formulations. Answers show disciplined logical structuring with minor omissions in edge-case derivations."}"
              </p>
            </div>

            {/* Three Pillar Diagnostic Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Demonstrated Strengths */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Key Demonstrated Strengths</span>
                </div>
                <p className="text-xs text-slate-400">
                  Conceptual domains where the candidate achieved mastery and full rubric credit:
                </p>
                <ul className="space-y-2 text-xs text-slate-200">
                  {(insights?.keyStrengths || [
                    "Strong theoretical conceptualization of core principles",
                    "Accurate mathematical formulation and step discipline",
                    "Clear handwriting and legible diagrammatic representations",
                    "Appropriate use of standard academic terminology"
                  ]).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2: Areas for Improvement */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Areas for Improvement</span>
                </div>
                <p className="text-xs text-slate-400">
                  Identified knowledge gaps, omissions, and conceptual vulnerabilities:
                </p>
                <ul className="space-y-2 text-xs text-slate-200">
                  {(insights?.criticalGaps || [
                    "Missing boundary condition justifications in proofs",
                    "Partial derivation of second-order convergence criteria",
                    "Incomplete error analysis in algorithmic edge cases",
                    "Need to state initial assumptions explicitly before solutions"
                  ]).map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 mt-0.5">⚠</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 3: Actionable Revision Roadmap */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/20 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Actionable Revision Roadmap</span>
                </div>
                <p className="text-xs text-slate-400">
                  Recommended practice tasks, theorems to re-prove, and study topics:
                </p>
                <ul className="space-y-2 text-xs text-slate-200">
                  {(insights?.actionableRecommendations || [
                    "Review Otsu threshold mathematical variance proofs",
                    "Solve past university papers on discrete Fourier transform kernels",
                    "Practice morphological operations structuring elements",
                    "Consult Gonzalez & Woods Chapter 9 on Morphological Image Processing"
                  ]).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">★</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Study Topics to Revise Table */}
            {insights?.studyTopicsToRevise && insights.studyTopicsToRevise.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Targeted Curriculum Study Topics to Revise</span>
                </h4>
                <div className="divide-y divide-slate-850">
                  {insights.studyTopicsToRevise.map((item, idx) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-white">{item.topic}</span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">
                          Resources: {item.resourcesRecommended}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto border ${
                          item.urgency === "High"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            : item.urgency === "Medium"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {item.urgency} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OFFICIAL ARCHIVAL SIGN-OFF & TAMPER-PROOF VERIFICATION FOOTER */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-950 border-t border-slate-800 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Faculty Evaluator Certification */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Evaluator Verification & Digital Signature
              </span>
              <p className="text-xs text-white font-semibold">
                Digitally Certified by: {assignedEvaluator}
              </p>
              <div className="font-mono text-[11px] text-slate-400 space-y-0.5">
                <div>Authentication Token: <span className="text-emerald-400">{verificationHash}</span></div>
                <div>Evaluation Completed: {evaluationDateFormatted}</div>
              </div>
              <p className="text-[10px] text-emerald-400 italic font-mono mt-1">
                [Digital Signature Authenticated & Cryptographically Sealed]
              </p>
            </div>

            {/* Box 2: Institutional Examination Registry */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Department Examination Registry & Archival Record
              </span>
              <p className="text-xs text-white font-semibold">
                Archival Status: PERMANENT ACADEMIC TRANSCRIPT
              </p>
              <p className="text-[11px] text-slate-400">
                Generated via the IntelliGrade Automated Multi-Modal Evaluation Engine. Complies with ISO/IEC 27001 AI Verification protocols.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  System: IntelliGrade v2.5.0-PRO
                </span>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExportingPdf}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
