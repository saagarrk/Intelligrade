import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Edit3,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  HelpCircle,
  FileText,
  Check,
  Clock,
  UserCheck,
  ShieldCheck,
  Award,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronRight,
  ThumbsUp,
  Columns,
  Table as TableIcon,
  Flag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { exportStudentEvaluationPDF } from "../utils/pdfExport";
import { showSweetToast } from "../utils/sweetAlert";
import { TeacherEvaluationReviewWorkspace } from "./TeacherEvaluationReviewWorkspace";
import {
  EVALUATION_WORKFLOW_STAGES,
  teacherReviewAnswer,
  teacherAcceptAiSuggestion,
  teacherRevertToAi,
  teacherFinalizeAllAnswers,
  getSubmissionEvaluationSummary,
  getConfidenceBadgeMeta
} from "../utils/aiEvaluationEngine";

export const Stage3Grading = ({
  submission,
  exam,
  onUpdateEvaluation,
  onNextStage,
  onOpenAppealModal
}) => {
  const { user, isStudent } = useAuth();
  const [viewMode, setViewMode] = useState(isStudent ? "table" : "workspace");
  const [evaluations, setEvaluations] = useState(submission?.questionEvaluations || submission?.evaluations || []);
  const [selectedQId, setSelectedQId] = useState(exam?.questions?.[0]?.id || "");
  const [overrideMode, setOverrideMode] = useState(false);
  const [teacherComments, setTeacherComments] = useState({});
  const [tempAdjustedScores, setTempAdjustedScores] = useState({});
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(9); // Default to Teacher Review step in focus
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const evals = submission?.questionEvaluations || submission?.evaluations || [];
    if (evals.length > 0) {
      setEvaluations(evals);
      // Initialize local temp score buffer
      const scores = {};
      const comments = {};
      evals.forEach((e) => {
        const key = e.questionId || e.questionNumber;
        scores[key] = e.teacherAdjustedMarks !== null && e.teacherAdjustedMarks !== undefined
          ? e.teacherAdjustedMarks
          : e.teacherOverrideMarks !== undefined
          ? e.teacherOverrideMarks
          : e.aiSuggestedMarks !== undefined
          ? e.aiSuggestedMarks
          : e.awardedMarks;
        comments[key] = e.teacherComment || "";
      });
      setTempAdjustedScores(scores);
      setTeacherComments(comments);
    }
  }, [submission]);

  const activeEval = evaluations.find((e) => e.questionId === selectedQId) || evaluations[0];
  const examQuestionsList = exam?.questions || [];
  const activeQuestion = examQuestionsList.find((q) => q.id === selectedQId || q.questionNumber === activeEval?.questionNumber) || examQuestionsList[0] || { questionNumber: 1, topic: 'General' };

  // Summary Metrics
  const summary = getSubmissionEvaluationSummary(evaluations, exam?.totalMarks || 100);

  // Single Question Actions
  const handleScoreInputChange = (qId, val) => {
    if (isStudent) return;
    setTempAdjustedScores((prev) => ({ ...prev, [qId]: val }));
  };

  const handleTeacherCommentChange = (qId, comment) => {
    if (isStudent) return;
    setTeacherComments((prev) => ({ ...prev, [qId]: comment }));
  };

  const handleAcceptAiSuggestion = (qId) => {
    if (isStudent) return;
    const target = evaluations.find((e) => e.questionId === qId);
    if (!target) return;

    const updatedEval = teacherAcceptAiSuggestion(
      target,
      teacherComments[qId] || "AI suggested marks accepted and validated by instructor.",
      user
    );

    const updatedList = evaluations.map((e) => (e.questionId === qId ? updatedEval : e));
    setEvaluations(updatedList);
    setTempAdjustedScores((prev) => ({ ...prev, [qId]: updatedEval.finalMarks }));
    onUpdateEvaluation(updatedList);
    showSweetToast(`Q${target.questionNumber}: AI suggestion (${updatedEval.aiSuggestedMarks} pts) finalized by teacher`, "success");
  };

  const handleFinalizeSingleQuestion = (qId) => {
    if (isStudent) return;
    const target = evaluations.find((e) => e.questionId === qId);
    if (!target) return;

    const assignedScore = tempAdjustedScores[qId] !== undefined
      ? parseFloat(tempAdjustedScores[qId]) || 0
      : target.aiSuggestedMarks;

    const updatedEval = teacherReviewAnswer(
      target,
      assignedScore,
      teacherComments[qId] || target.teacherComment || "Teacher verified and finalized.",
      true,
      user
    );

    const updatedList = evaluations.map((e) => (e.questionId === qId ? updatedEval : e));
    setEvaluations(updatedList);
    onUpdateEvaluation(updatedList);
    showSweetToast(`Q${target.questionNumber}: Marks finalized at ${updatedEval.finalMarks} / ${target.maxMarks} pts`, "success");
  };

  const handleRevertToAi = (qId) => {
    if (isStudent) return;
    const target = evaluations.find((e) => e.questionId === qId);
    if (!target) return;

    const reverted = teacherRevertToAi(target);
    const updatedList = evaluations.map((e) => (e.questionId === qId ? reverted : e));
    setEvaluations(updatedList);
    setTempAdjustedScores((prev) => ({ ...prev, [qId]: reverted.aiSuggestedMarks }));
    setTeacherComments((prev) => ({ ...prev, [qId]: "" }));
    onUpdateEvaluation(updatedList);
    showSweetToast(`Q${target.questionNumber}: Reverted to unfinalized AI suggestion`, "info");
  };

  // Batch Finalization Action
  const handleBatchFinalizeAll = () => {
    if (isStudent) return;
    const finalized = teacherFinalizeAllAnswers(
      evaluations,
      user,
      "Batch audited and approved by faculty instructor."
    );
    setEvaluations(finalized);
    const scores = {};
    finalized.forEach((e) => {
      scores[e.questionId] = e.finalMarks;
    });
    setTempAdjustedScores(scores);
    onUpdateEvaluation(finalized);
    setShowBatchModal(false);
    showSweetToast(`All ${finalized.length} answers finalized and published by instructor!`, "success");
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await exportStudentEvaluationPDF(
        { ...submission, questionEvaluations: evaluations },
        exam,
        {
          institutionName: "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
          evaluatorName: isStudent ? "Faculty Evaluation Board" : user?.name || "Faculty Evaluator"
        }
      );
      showSweetToast(`Official evaluation report PDF exported for ${submission.studentName}`, "success");
    } catch (error) {
      console.error("Failed to export PDF from Stage 3:", error);
      showSweetToast("Failed to export PDF report", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const activeConfidenceMeta = getConfidenceBadgeMeta(activeEval?.confidenceScore || 85);

  return (
    <div className="space-y-6" id="stage3-ai-evaluation-engine">
      {/* 10-Step AI Evaluation Engine Workflow Stepper */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5 mb-3">
          <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[11px] font-bold">
              ⚡
            </span>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              AI-Assisted Answer Evaluation Engine Workflow
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              <span>Steps 1–8: AI Engine (Suggested)</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Steps 9–10: Human Finalization</span>
            </span>
          </div>
        </div>

        {/* Workflow Breadcrumb Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 overflow-x-auto pb-1">
          {EVALUATION_WORKFLOW_STAGES.map((st) => {
            const isAiStep = st.step <= 8;
            const isTeacherStep = st.step === 9;
            const isFinalStep = st.step === 10;
            const isActive = activeWorkflowStep === st.step;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveWorkflowStep(st.step)}
                className={`p-2 rounded-lg text-left transition border flex flex-col justify-between ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/80 ring-1 ring-indigo-500"
                    : isAiStep
                    ? "bg-[#09090b] border-[#27272a] hover:border-purple-500/40"
                    : isTeacherStep
                    ? "bg-amber-950/20 border-amber-800/40 hover:border-amber-500/50"
                    : "bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{st.step}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAiStep
                        ? "bg-purple-400"
                        : isTeacherStep
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                </div>
                <div className="mt-1">
                  <span
                    className={`block text-[11px] font-semibold truncate ${
                      isAiStep
                        ? "text-purple-200"
                        : isTeacherStep
                        ? "text-amber-200"
                        : "text-emerald-200"
                    }`}
                  >
                    {st.name}
                  </span>
                  <span className="block text-[9px] text-slate-500 truncate">
                    {st.category === "ai_engine"
                      ? "AI Generated"
                      : st.category === "teacher_audit"
                      ? "Teacher Review"
                      : st.category === "final"
                      ? "Final Marks"
                      : "Input / Model"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Informational Guidance on Selected Workflow Step */}
        <div className="mt-2.5 pt-2.5 border-t border-[#27272a]/60 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              <strong className="text-white">
                Step {activeWorkflowStep}: {EVALUATION_WORKFLOW_STAGES[activeWorkflowStep - 1]?.name}
              </strong>
              {" — "}
              {EVALUATION_WORKFLOW_STAGES[activeWorkflowStep - 1]?.description}
            </span>
          </div>
          <span className="text-[11px] font-medium text-amber-300/90 hidden sm:inline">
            🔒 Rule: AI suggestions never automatically become final marks without teacher review.
          </span>
        </div>
      </div>

      {/* Primary Header & Actions */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                3
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {isStudent ? "Candidate Graded Scorecard & Teacher Audits" : "Stage 3: AI-Assisted Evaluation & Teacher Authorization"}
              </h2>
              {isStudent ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Student Portal
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Faculty Review Console
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {isStudent
                ? `Evaluation results for ${submission.studentName} (${submission.studentRollNumber}) on ${exam.title}. Only teacher-finalized marks are official.`
                : "Machine learning extracts key concepts, scores rubric adherence, and outputs suggested marks with confidence metrics. Human instructors review, adjust, and authorize all final grades."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="stage3-export-pdf-btn"
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-950/40 hover:bg-rose-900/50 disabled:opacity-50 text-rose-300 border border-rose-800/60 shadow-sm transition"
              title="Export formatted PDF evaluation report for offline archival"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>{isExportingPdf ? "Exporting PDF..." : "Export Archival PDF"}</span>
            </button>

            {isStudent ? (
              <button
                id="btn-appeal-from-stage3"
                onClick={onOpenAppealModal}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60 shadow-sm transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Re-Evaluation</span>
              </button>
            ) : (
              <>
                <button
                  id="btn-batch-finalize-all"
                  onClick={() => setShowBatchModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {summary.isFullyFinalized ? "All Finalized ✓" : `Finalize All (${summary.pendingReviewCount} Pending)`}
                  </span>
                </button>

                <button
                  id="toggle-teacher-override-btn"
                  onClick={() => setOverrideMode(!overrideMode)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                    overrideMode
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                      : "bg-[#09090b] text-slate-300 hover:text-white border-[#27272a]"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{overrideMode ? "Quick Edit: Active" : "Enable Quick In-Table Edits"}</span>
                </button>
              </>
            )}

            {!isStudent && (
              <div className="flex items-center space-x-1 p-0.5 bg-[#09090b] border border-[#27272a] rounded-lg">
                <button
                  id="tab-btn-two-panel-workspace"
                  type="button"
                  onClick={() => setViewMode("workspace")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    viewMode === "workspace"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Switch to the two-panel Evaluation Review Workspace"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Review Workspace</span>
                </button>
                <button
                  id="tab-btn-table-ledger"
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                    viewMode === "table"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Switch to tabular ledger breakdown"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>
              </div>
            )}

            <button
              id="proceed-stage4-btn"
              onClick={onNextStage}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>Proceed to Stage 4: Insights & Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Student View Notice if Still Pending Review */}
        {isStudent && !summary.isFullyFinalized && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center space-x-3 text-xs text-amber-200">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Faculty Review in Progress:</span> Some question marks are currently AI suggestions undergoing instructor validation. Your official grade will reflect finalized marks once reviewed by faculty.
            </div>
          </div>
        )}

        {/* Executive Score Summary Banner with Explicit Separation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#27272a]">
          {/* Card 1: AI Suggested Marks */}
          <div className="bg-[#09090b] p-3 rounded-lg border border-purple-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-purple-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI Suggested Total</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                Non-Final
              </span>
            </div>
            <div className="text-xl font-bold text-purple-300 font-mono mt-1">
              {summary.totalAiSuggested} <span className="text-xs text-slate-500 font-normal">/ {summary.totalMaxMarks} pts</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Avg AI Confidence: <strong className="text-purple-300">{summary.avgConfidence}%</strong>
            </div>
          </div>

          {/* Card 2: Teacher Finalized Marks */}
          <div className="bg-[#09090b] p-3 rounded-lg border border-emerald-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center space-x-1">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>Teacher Finalized Total</span>
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  summary.isFullyFinalized
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                    : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                }`}
              >
                {summary.isFullyFinalized ? "Authorized" : "Pending Review"}
              </span>
            </div>
            <div className="text-xl font-bold font-mono mt-1">
              {summary.isFullyFinalized ? (
                <span className="text-emerald-400">{summary.totalFinalMarks} <span className="text-xs text-slate-500 font-normal">/ {summary.totalMaxMarks} pts</span></span>
              ) : (
                <span className="text-amber-400 text-sm font-semibold">
                  Awaiting Finalization ({summary.pendingReviewCount} left)
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {summary.isFullyFinalized
                ? `Official Grade: ${summary.finalPercentage}%`
                : `${summary.finalizedCount} of ${summary.totalQuestions} questions finalized`}
            </div>
          </div>

          {/* Card 3: Review Progress */}
          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Teacher Audit Progress</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {summary.finalizedCount} / {summary.totalQuestions}{" "}
              <span className="text-xs text-slate-400 font-normal">Finalized</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(summary.finalizedCount / (summary.totalQuestions || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 4: Status / Authentication */}
          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Evaluation State</span>
            <div className="text-sm font-semibold flex items-center space-x-1.5 mt-1">
              {summary.isFullyFinalized ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Teacher Authorized</span>
                </span>
              ) : (
                <span className="text-amber-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Under Teacher Review</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {summary.isFullyFinalized ? "Grades locked & official" : "AI recommendations active"}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode Content: Review Workspace vs Table Breakdown */}
      {viewMode === "workspace" && !isStudent ? (
        <TeacherEvaluationReviewWorkspace
          submission={submission}
          exam={exam}
          onUpdateEvaluation={(singleUpdated, allUpdated) => {
            const fullList =
              allUpdated ||
              (Array.isArray(singleUpdated)
                ? singleUpdated
                : evaluations.map((e) =>
                    e.questionId === singleUpdated?.questionId ||
                    e.questionNumber === singleUpdated?.questionNumber
                      ? singleUpdated
                      : e
                  ));
            setEvaluations(fullList);
            onUpdateEvaluation(fullList);
          }}
          onClose={() => setViewMode("table")}
          initialQuestionIndex={Math.max(
            0,
            exam.questions.findIndex((q) => q.id === selectedQId)
          )}
        />
      ) : (
        <>
      {/* Main Table: Question-by-Question Evaluation Breakdown */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#27272a] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Question-by-Question Evaluation Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Compare AI suggestions against teacher-finalized marks. Select any row to review or adjust.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
              Purple: AI Suggested
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              Green: Teacher Finalized
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" id="evaluation-breakdown-table">
            <thead className="bg-[#09090b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#27272a]">
              <tr>
                <th className="px-4 py-3">Q#</th>
                <th className="px-4 py-3">Question Prompt</th>
                <th className="px-4 py-3 text-center">Max</th>
                <th className="px-4 py-3 text-center text-purple-300 bg-purple-950/20">
                  AI Suggested
                </th>
                <th className="px-4 py-3 text-center">AI Confidence</th>
                <th className="px-4 py-3 text-center text-amber-300">
                  Teacher Adjusted
                </th>
                <th className="px-4 py-3 text-center text-emerald-300 bg-emerald-950/20">
                  Final Marks
                </th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {evaluations.map((ev) => {
                const isSelected = ev.questionId === selectedQId;
                const isFinalized = ev.evaluationStatus === "TEACHER_FINALIZED" && ev.finalMarks !== null;
                const confMeta = getConfidenceBadgeMeta(ev.confidenceScore || 85);
                const aiMarks = ev.aiSuggestedMarks !== undefined ? ev.aiSuggestedMarks : ev.awardedMarks;
                const teacherMarks = ev.teacherAdjustedMarks !== null && ev.teacherAdjustedMarks !== undefined
                  ? ev.teacherAdjustedMarks
                  : ev.teacherOverrideMarks !== undefined
                  ? ev.teacherOverrideMarks
                  : null;

                return (
                  <tr
                    key={ev.questionId}
                    onClick={() => setSelectedQId(ev.questionId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-500/10 border-l-2 border-l-indigo-500"
                        : "hover:bg-[#27272a]/40"
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold text-white">Q{ev.questionNumber}</td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-300 font-medium">
                      {ev.question || ev.questionText}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-400">
                      {ev.maxMarks}
                    </td>

                    {/* AI Suggested Marks Column */}
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-purple-300 bg-purple-950/10">
                      <span>{aiMarks}</span>
                    </td>

                    {/* AI Confidence Column */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] border ${confMeta.badgeBg} ${confMeta.textColor} ${confMeta.borderColor}`}>
                        {ev.confidenceScore || 85}%
                      </span>
                    </td>

                    {/* Teacher Adjusted Column */}
                    <td
                      className="px-4 py-3.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isStudent && overrideMode ? (
                        <input
                          type="number"
                          min="0"
                          max={ev.maxMarks}
                          step="0.5"
                          value={tempAdjustedScores[ev.questionId] !== undefined ? tempAdjustedScores[ev.questionId] : aiMarks}
                          onChange={(e) => handleScoreInputChange(ev.questionId, e.target.value)}
                          className="w-16 bg-[#09090b] text-center font-mono text-xs font-bold text-amber-300 border border-amber-500/50 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono text-xs text-amber-300">
                          {teacherMarks !== null ? `${teacherMarks} pts` : <span className="text-slate-500 italic">—</span>}
                        </span>
                      )}
                    </td>

                    {/* Final Marks Column */}
                    <td className="px-4 py-3.5 text-center bg-emerald-950/10 font-mono">
                      {isFinalized ? (
                        <span className="font-bold text-emerald-400 text-xs flex items-center justify-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{ev.finalMarks} pts</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-400/90 italic flex items-center justify-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {isFinalized ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                            <UserCheck className="w-3 h-3" />
                            <span>Teacher Finalized</span>
                          </span>
                        ) : ev.evaluationStatus === "TEACHER_REVIEWED" ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 inline-flex items-center space-x-1">
                            <Edit3 className="w-3 h-3" />
                            <span>Teacher Draft</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center space-x-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Suggested</span>
                          </span>
                        )}
                        {ev.isFlagged && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-semibold inline-flex items-center gap-1">
                            <Flag className="w-2.5 h-2.5 text-amber-400" />
                            <span>Flagged</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        {!isStudent && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQId(ev.questionId);
                              setViewMode("workspace");
                            }}
                            className="text-xs px-2 py-1 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 transition flex items-center space-x-1"
                            title="Inspect this question in the Two-Panel Review Workspace"
                          >
                            <Columns className="w-3 h-3" />
                            <span className="hidden sm:inline">Workspace</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedQId(ev.questionId)}
                          className={`text-xs px-2.5 py-1 rounded transition-colors ${
                            isSelected
                              ? "bg-indigo-600 text-white font-medium"
                              : "text-slate-300 hover:text-white bg-[#09090b] border border-[#27272a]"
                          }`}
                        >
                          {isStudent ? "View Details" : isFinalized ? "Edit Final" : "Review"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-Depth Question Evaluation & Teacher Authorization Inspector */}
      {activeEval && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="active-question-inspector">
          {/* Left 7 Columns: Extracted Answer, Model Answer, Rubric Concepts, AI Diagnostics */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-indigo-600/30 text-indigo-300 rounded text-xs font-bold">
                    Question {activeEval.questionNumber}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {activeQuestion?.topic || "Core Subject Module"}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                  <span>
                    Max Marks: <strong className="text-white">{activeEval.maxMarks}</strong>
                  </span>
                  <span className="text-purple-300">
                    AI Suggested: <strong>{activeEval.aiSuggestedMarks ?? activeEval.awardedMarks}</strong>
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-200">
                <span className="font-semibold text-slate-400 block mb-1 text-[11px] uppercase tracking-wider">
                  Target Question Prompt:
                </span>
                {activeEval.question || activeEval.questionText}
              </div>

              {/* Side-by-side: Extracted Answer vs Model Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Student Extracted Answer
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">OCR Extracted</span>
                  </div>
                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono text-slate-200 min-h-[140px] leading-relaxed select-text">
                    {activeEval.studentAnswer || activeEval.studentAnswerText || "No response extracted."}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Reference Model Answer
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">Official Rubric</span>
                  </div>
                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-emerald-200 min-h-[140px] leading-relaxed select-text">
                    {activeEval.modelAnswer || activeEval.modelAnswerText || "Reference model answer text."}
                  </div>
                </div>
              </div>

              {/* Rubric Key Concepts Evaluation */}
              <div className="space-y-2 pt-2 border-t border-[#27272a]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Rubric Concept Coverage & Marks Attribution</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Semantic Match: {Math.round(activeEval.semanticSimilarityScore || 85)}%
                  </span>
                </div>

                <div className="space-y-2">
                  {activeEval.conceptMatches?.map((cm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{cm.concept}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            cm.status === "Full"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : cm.status === "Partial"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {cm.awardedWeight} / {cm.requiredWeight} pts ({cm.status})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{cm.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Evaluation Qualitative Feedback */}
              <div className="p-3 bg-[#09090b] rounded-lg border border-purple-900/30 space-y-1.5">
                <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Evaluation Feedback & Diagnostic Strengths</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeEval.evaluationFeedback || activeEval.feedback}
                </p>
              </div>

              {/* Deductions if any */}
              {activeEval.deductions && activeEval.deductions.length > 0 && (
                <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 space-y-1.5">
                  <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Identified Gaps & Deductions</span>
                  </span>
                  {activeEval.deductions.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                      <span>• [{d.category}] {d.reason}</span>
                      <span className="font-mono text-rose-400 font-semibold">-{d.pointsDeducted} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Dedicated Teacher Review & Authorization Console */}
          <div className="lg:col-span-5 space-y-4">
            {/* Teacher Review Workspace Card */}
            <div className="bg-[#18181b] border-2 border-amber-500/40 rounded-xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Teacher Review & Final Authorization (Q{activeEval.questionNumber})
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    activeEval.evaluationStatus === "TEACHER_FINALIZED" && activeEval.finalMarks !== null
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {activeEval.evaluationStatus === "TEACHER_FINALIZED" && activeEval.finalMarks !== null
                    ? "Status: Finalized"
                    : "Status: Awaiting Review"}
                </span>
              </div>

              {/* Side-by-side Score Attribution Comparison */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#09090b] rounded-lg border border-[#27272a]">
                <div className="border-r border-[#27272a] pr-2">
                  <span className="text-[10px] font-semibold uppercase text-purple-400 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI Suggested</span>
                  </span>
                  <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                    {activeEval.aiSuggestedMarks ?? activeEval.awardedMarks}
                    <span className="text-xs text-slate-500 font-normal"> / {activeEval.maxMarks}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Non-final algorithm score
                  </span>
                </div>

                <div className="pl-2">
                  <span className="text-[10px] font-semibold uppercase text-emerald-400 flex items-center space-x-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>Final Authorized</span>
                  </span>
                  <div className="text-xl font-bold font-mono mt-1">
                    {activeEval.finalMarks !== null && activeEval.finalMarks !== undefined ? (
                      <span className="text-emerald-400">
                        {activeEval.finalMarks}
                        <span className="text-xs text-slate-500 font-normal"> / {activeEval.maxMarks}</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-semibold italic">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {activeEval.teacherReviewedBy || "Requires faculty review"}
                  </span>
                </div>
              </div>

              {/* AI Confidence Meter */}
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-300">
                    AI Confidence Score:
                  </span>
                  <span className={`font-mono font-bold ${activeConfidenceMeta.textColor}`}>
                    {activeEval.confidenceScore || 85}% ({activeConfidenceMeta.label})
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (activeEval.confidenceScore || 85) >= 90
                        ? "bg-emerald-400"
                        : (activeEval.confidenceScore || 85) >= 75
                        ? "bg-indigo-400"
                        : "bg-amber-400"
                    }`}
                    style={{ width: `${activeEval.confidenceScore || 85}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {activeConfidenceMeta.description}
                </p>
              </div>

              {/* Teacher Interactive Review Controls */}
              {!isStudent ? (
                <div className="space-y-3 pt-2">
                  {/* Quick Action: Accept AI Suggestion */}
                  <div className="flex items-center justify-between p-2.5 bg-purple-950/20 border border-purple-800/40 rounded-lg">
                    <div>
                      <span className="text-xs font-semibold text-purple-200 block">
                        Accept AI Suggestion as Final
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Authorize {activeEval.aiSuggestedMarks ?? activeEval.awardedMarks} pts with 1-click
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAcceptAiSuggestion(activeEval.questionId)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Accept AI Marks</span>
                    </button>
                  </div>

                  {/* Manual Mark Adjustment */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
                      Or Set Teacher-Adjusted Marks (0 to {activeEval.maxMarks}):
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max={activeEval.maxMarks}
                        step="0.5"
                        value={
                          tempAdjustedScores[activeEval.questionId] !== undefined
                            ? tempAdjustedScores[activeEval.questionId]
                            : activeEval.aiSuggestedMarks ?? activeEval.awardedMarks
                        }
                        onChange={(e) => handleScoreInputChange(activeEval.questionId, e.target.value)}
                        className="flex-1 bg-[#09090b] text-white font-mono text-sm font-bold p-2 rounded-lg border border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter marks..."
                      />
                      <button
                        type="button"
                        onClick={() => handleFinalizeSingleQuestion(activeEval.questionId)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Finalize Mark</span>
                      </button>
                    </div>
                  </div>

                  {/* Teacher Audit Comments / Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Teacher Audit Remarks & Student Guidance:</span>
                    </label>
                    <textarea
                      rows={3}
                      value={teacherComments[activeEval.questionId] || activeEval.teacherComment || ""}
                      onChange={(e) => handleTeacherCommentChange(activeEval.questionId, e.target.value)}
                      placeholder="Add instructor comments or justification for score adjustment..."
                      className="w-full bg-[#09090b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Revert option */}
                  {activeEval.evaluationStatus === "TEACHER_FINALIZED" && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleRevertToAi(activeEval.questionId)}
                        className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Revert to Unfinalized AI Suggestion</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Student View of Teacher Audit */
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">
                      Instructor Validation Notice:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      {activeEval.teacherComment ||
                        (activeEval.finalMarks !== null
                          ? "Instructor has reviewed the answer, verified concept matches against rubric, and authorized this mark."
                          : "This question is awaiting instructor review. Check back soon for finalized marks.")}
                    </p>
                    {activeEval.teacherReviewedAt && (
                      <span className="text-[10px] text-slate-500 block pt-1">
                        Reviewed by {activeEval.teacherReviewedBy || "Course Faculty"} on{" "}
                        {new Date(activeEval.teacherReviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tri-Sheet Semantic Matrix Card */}
            <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gemini Semantic Matrix Verified</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50 font-mono">
                  Own-Words Recognized
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                Candidate's response was evaluated against the model answer and synonym derivations. Conceptual equivalence in student's own words was recognized with fair credit allocation.
              </p>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Batch Finalize Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Batch Finalize All Answer Evaluations
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to authorize and lock in official grades for all{" "}
              <strong className="text-white">{evaluations.length} questions</strong> in this submission.
            </p>
            <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Questions:</span>
                <span className="font-mono text-white">{evaluations.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Currently Pending Review:</span>
                <span className="font-mono text-amber-400 font-bold">{summary.pendingReviewCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Projected Final Score:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {summary.totalAiSuggested} / {summary.totalMaxMarks} Marks ({summary.aiPercentage}%)
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Note: For any questions where you have not entered manual override marks, the AI suggested marks will be accepted as final. You can still adjust individual marks later if needed.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchFinalizeAll}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Finalize All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
