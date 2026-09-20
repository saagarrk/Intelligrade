import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  FileText,
  Check,
  Clock,
  UserCheck,
  ShieldCheck,
  Award,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Flag,
  FlagOff,
  Edit3,
  Save,
  ThumbsUp,
  X,
  Eye,
  Layers,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Undo,
  Sliders,
  Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { showSweetToast } from "../utils/sweetAlert";
import {
  teacherReviewAnswer,
  teacherAcceptAiSuggestion,
  teacherRevertToAi,
  teacherFlagAnswer,
  teacherUnflagAnswer,
  teacherUpdateFeedback,
  getSubmissionEvaluationSummary,
  getConfidenceBadgeMeta
} from "../utils/aiEvaluationEngine";

export const TeacherEvaluationReviewWorkspace = ({
  submission,
  exam,
  onUpdateEvaluation,
  onClose,
  initialQuestionIndex = 0
}) => {
  const { user } = useAuth();

  // Questions and evaluations list
  const questions = exam?.questions || [];
  const [evaluations, setEvaluations] = useState(submission?.questionEvaluations || []);
  const [currentQIndex, setCurrentQIndex] = useState(
    Math.min(Math.max(0, initialQuestionIndex), Math.max(0, questions.length - 1))
  );

  // Active question and its evaluation record
  const currentQuestion = questions[currentQIndex] || {
    id: "q1",
    questionNumber: 1,
    questionText: "Sample Question",
    maxMarks: 10,
    modelAnswer: "Sample model answer",
    keyConcepts: []
  };

  const activeEval = evaluations.find(
    (e) =>
      e.questionId === currentQuestion.id ||
      e.questionNumber === currentQuestion.questionNumber
  ) || {
    question: currentQuestion.questionText,
    studentAnswer: "No student answer recorded.",
    modelAnswer: currentQuestion.modelAnswer || "",
    maxMarks: currentQuestion.maxMarks || 10,
    aiSuggestedMarks: 0,
    confidenceScore: 85,
    evaluationFeedback: "Pending automated evaluation.",
    teacherAdjustedMarks: null,
    finalMarks: null,
    evaluationStatus: "AI_SUGGESTED",
    questionId: currentQuestion.id,
    questionNumber: currentQuestion.questionNumber,
    questionText: currentQuestion.questionText,
    awardedMarks: 0,
    studentAnswerText: "No student answer recorded.",
    modelAnswerText: currentQuestion.modelAnswer || "",
    semanticSimilarityScore: 80,
    conceptMatches: [],
    deductions: [],
    feedback: "Pending automated evaluation.",
    strengths: [],
    weaknesses: []
  };

  // State for teacher adjustments on current question
  const [adjustedMarks, setAdjustedMarks] = useState(
    activeEval.teacherAdjustedMarks !== null && activeEval.teacherAdjustedMarks !== undefined
      ? activeEval.teacherAdjustedMarks
      : activeEval.finalMarks !== null && activeEval.finalMarks !== undefined
      ? activeEval.finalMarks
      : activeEval.aiSuggestedMarks ?? 0
  );
  const [teacherNotes, setTeacherNotes] = useState(activeEval.teacherComment || "");
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [customFeedback, setCustomFeedback] = useState(
    activeEval.evaluationFeedback || activeEval.feedback || ""
  );
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReasonInput, setFlagReasonInput] = useState(
    activeEval.flagReason || "Requires manual instructor verification"
  );

  // Update local inputs when question changes
  useEffect(() => {
    const ev = evaluations.find(
      (e) =>
        e.questionId === currentQuestion.id ||
        e.questionNumber === currentQuestion.questionNumber
    );
    if (ev) {
      setAdjustedMarks(
        ev.teacherAdjustedMarks !== null && ev.teacherAdjustedMarks !== undefined
          ? ev.teacherAdjustedMarks
          : ev.finalMarks !== null && ev.finalMarks !== undefined
          ? ev.finalMarks
          : ev.aiSuggestedMarks ?? 0
      );
      setTeacherNotes(ev.teacherComment || "");
      setCustomFeedback(ev.evaluationFeedback || ev.feedback || "");
      setIsEditingFeedback(false);
      setFlagReasonInput(ev.flagReason || "Requires manual instructor verification");
    }
  }, [currentQIndex, evaluations, currentQuestion]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in input or textarea
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;

      if (e.key === "ArrowRight" || (e.altKey && e.key === "n")) {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key === "ArrowLeft" || (e.altKey && e.key === "p")) {
        e.preventDefault();
        handlePrevQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQIndex, questions.length]);

  // Left panel: Handwritten paper viewer state
  const [zoomLevel, setZoomLevel] = useState(100); // 50% to 220%
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(3, submission?.pages?.length || 3);
  const [fitMode, setFitMode] = useState("width"); // 'width' | 'custom'
  const canvasRef = useRef(null);

  // Auto-switch page based on question
  useEffect(() => {
    // Map questions to pages logically:
    // Q1 & Q2 -> Page 1, Q3 & Q4 -> Page 2, Q5+ -> Page 3
    const mappedPage = Math.min(
      totalPages,
      Math.max(1, Math.ceil(currentQuestion.questionNumber / 2))
    );
    setCurrentPage(mappedPage);
  }, [currentQuestion.questionNumber, totalPages]);

  // Render handwritten paper preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Realistic dimensions
    const width = 850;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    // Canvas background - realistic lined paper
    ctx.fillStyle = "#faf9f6";
    ctx.fillRect(0, 0, width, height);

    // Subtle paper noise / grain simulation
    ctx.fillStyle = "rgba(0, 0, 0, 0.015)";
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Header margin line (red)
    ctx.strokeStyle = "#f87171";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(110, 20);
    ctx.lineTo(110, height - 20);
    ctx.stroke();

    // Ruled blue horizontal lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 140; y < height - 30; y += 32) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
    }

    // Institutional Header Box
    ctx.fillStyle = "#0f172a";
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `EXAMINATION: ${(exam?.title || "MIDTERM EXAMINATION").toUpperCase()}`,
      130,
      50
    );

    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      `Candidate: ${submission?.studentName || "Student"}   |   Roll No: ${
        submission?.studentRollNumber || "CS-2026-001"
      }   |   Course: ${exam?.courseCode || "CS301"}   |   Page ${currentPage} of ${totalPages}`,
      130,
      76
    );

    // Top rule divider
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(130, 95);
    ctx.lineTo(width - 40, 95);
    ctx.stroke();

    // Determine questions shown on this page
    const questionsForThisPage = questions.filter((q) => {
      const expectedPage = Math.min(
        totalPages,
        Math.max(1, Math.ceil(q.questionNumber / 2))
      );
      return expectedPage === currentPage;
    });

    let currentY = 155;

    questionsForThisPage.forEach((q) => {
      const ev = evaluations.find(
        (e) => e.questionId === q.id || e.questionNumber === q.questionNumber
      );
      const isCurrentlyInspected = q.id === currentQuestion.id;

      // Draw question bounding highlight box if inspected
      if (isCurrentlyInspected) {
        ctx.fillStyle = "rgba(168, 85, 247, 0.08)"; // Soft purple OCR focus zone
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(40, currentY - 24, width - 80, 240);
        ctx.fillRect(40, currentY - 24, width - 80, 240);
        ctx.setLineDash([]);

        // Label in margin
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = "#9333ea";
        ctx.fillText("AI BOUNDS", 45, currentY - 8);
      }

      // Question Answer Label
      ctx.font = 'italic bold 17px "JetBrains Mono", monospace';
      ctx.fillStyle = isCurrentlyInspected ? "#7e22ce" : "#1e40af";
      ctx.fillText(`Ans ${q.questionNumber}:`, 50, currentY);

      // Answer handwriting text
      ctx.font =
        '500 16px "Caveat", "Segoe Print", "Comic Sans MS", "Plus Jakarta Sans", cursive, sans-serif';
      ctx.fillStyle = "#1e293b";

      const answerText =
        ev?.studentAnswer ||
        ev?.studentAnswerText ||
        "Student response transcribed from handwritten script addressing question criteria.";
      const words = answerText.split(" ");
      let line = "";
      const maxWidth = width - 160;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, 130, currentY);
          line = words[n] + " ";
          currentY += 32;
        } else {
          line = testLine;
        }
      }
      if (line.length > 0) {
        ctx.fillText(line, 130, currentY);
        currentY += 32;
      }

      currentY += 36; // Spacing between questions
    });
  }, [
    currentPage,
    totalPages,
    exam,
    submission,
    questions,
    evaluations,
    currentQuestion
  ]);

  // Overall Evaluation Summary
  const summary = getSubmissionEvaluationSummary(evaluations, exam?.totalMarks);
  const confidenceMeta = getConfidenceBadgeMeta(activeEval.confidenceScore || 85);

  // Status checks for current question
  const isFinalized =
    activeEval.evaluationStatus === "TEACHER_FINALIZED" &&
    activeEval.finalMarks !== null &&
    activeEval.finalMarks !== undefined;
  const isPendingTeacher = !isFinalized;
  const isFlagged = Boolean(activeEval.isFlagged);

  // Delta between teacher marks and AI suggestion
  const scoreDelta =
    adjustedMarks !== null && activeEval.aiSuggestedMarks !== null
      ? Number((adjustedMarks - activeEval.aiSuggestedMarks).toFixed(1))
      : 0;

  // Propagate evaluation update locally and upstream to parent
  const applyUpdatedEvaluation = (updated) => {
    const updatedList = evaluations.map((e) =>
      (e.questionId && e.questionId === updated.questionId) ||
      e.questionNumber === updated.questionNumber
        ? updated
        : e
    );
    setEvaluations(updatedList);
    if (onUpdateEvaluation) {
      onUpdateEvaluation(updated, updatedList);
    }
  };

  // ACTION 1: Accept AI suggestion
  const handleAcceptAiSuggestion = () => {
    const updated = teacherAcceptAiSuggestion(
      activeEval,
      teacherNotes || "Accepted AI suggested grading.",
      user
    );
    applyUpdatedEvaluation(updated);
    showSweetToast(
      `Accepted AI marks (${activeEval.aiSuggestedMarks} pts) for Question ${currentQuestion.questionNumber}`,
      "success"
    );

    // Synchronize with backend API
    const evalId = activeEval.id || activeEval.evaluationId || `eval_${submission?.id}_${currentQuestion.questionNumber}`;
    const token = localStorage.getItem('token');
    fetch(`/api/v1/evaluations/${evalId}/accept-ai?questionNumber=${currentQuestion.questionNumber}&submissionId=${submission?.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        teacherComment: teacherNotes || "Accepted AI suggested grading.",
        teacherNotes: teacherNotes || "Accepted AI suggested grading."
      })
    }).catch(err => console.debug('Backend evaluation sync error:', err));
  };

  // ACTION 2 & 5: Save Evaluation (with current adjusted marks & notes)
  const handleSaveEvaluation = () => {
    const finalScore = Number(adjustedMarks);
    if (isNaN(finalScore) || finalScore < 0 || finalScore > currentQuestion.maxMarks) {
      showSweetToast(
        `Please enter a valid mark between 0 and ${currentQuestion.maxMarks}`,
        "warning"
      );
      return;
    }

    let updated = teacherReviewAnswer(
      activeEval,
      finalScore,
      teacherNotes,
      true, // Teacher finalizes upon clicking Save
      user
    );

    if (isEditingFeedback && customFeedback.trim()) {
      updated = teacherUpdateFeedback(updated, customFeedback);
      setIsEditingFeedback(false);
    }

    applyUpdatedEvaluation(updated);
    showSweetToast(
      `Saved & Finalized Question ${currentQuestion.questionNumber} (${finalScore} / ${currentQuestion.maxMarks} marks)`,
      "success"
    );

    // Synchronize with backend API
    const evalId = activeEval.id || activeEval.evaluationId || `eval_${submission?.id}_${currentQuestion.questionNumber}`;
    const token = localStorage.getItem('token');
    fetch(`/api/v1/evaluations/${evalId}/finalize?questionNumber=${currentQuestion.questionNumber}&submissionId=${submission?.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        finalMarks: finalScore,
        teacherComment: teacherNotes,
        teacherNotes: teacherNotes
      })
    }).catch(err => console.debug('Backend evaluation sync error:', err));
  };

  // ACTION 3: Edit Feedback
  const handleToggleEditFeedback = () => {
    if (isEditingFeedback) {
      // Save feedback
      const updated = teacherUpdateFeedback(activeEval, customFeedback);
      applyUpdatedEvaluation(updated);
      setIsEditingFeedback(false);
      showSweetToast("Updated qualitative feedback for this question", "success");

      // Synchronize with backend API
      const evalId = activeEval.id || activeEval.evaluationId || `eval_${submission?.id}_${currentQuestion.questionNumber}`;
      const token = localStorage.getItem('token');
      fetch(`/api/v1/evaluations/${evalId}?questionNumber=${currentQuestion.questionNumber}&submissionId=${submission?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          feedback: customFeedback,
          teacherComment: customFeedback
        })
      }).catch(err => console.debug('Backend evaluation feedback sync error:', err));
    } else {
      setIsEditingFeedback(true);
    }
  };

  const handleResetFeedbackToAi = () => {
    const originalAiFeedback =
      activeEval.strengths?.length > 0 || activeEval.weaknesses?.length > 0
        ? `Rubric Alignment: ${activeEval.semanticSimilarityScore}% match. Strengths: ${activeEval.strengths.join(
            "; "
          )}. Areas to clarify: ${activeEval.weaknesses.join("; ")}`
        : activeEval.evaluationFeedback || "AI evaluation generated based on rubric key concepts.";
    setCustomFeedback(originalAiFeedback);
    const updated = teacherUpdateFeedback(activeEval, originalAiFeedback);
    applyUpdatedEvaluation(updated);
    setIsEditingFeedback(false);
    showSweetToast("Reverted feedback to original AI rubric analysis", "info");
  };

  // ACTION 4: Flag Answer
  const handleConfirmFlag = () => {
    const updated = teacherFlagAnswer(activeEval, flagReasonInput, user);
    applyUpdatedEvaluation(updated);
    setIsFlagModalOpen(false);
    showSweetToast(
      `Question ${currentQuestion.questionNumber} flagged for audit: "${flagReasonInput}"`,
      "warning"
    );
  };

  const handleUnflag = () => {
    const updated = teacherUnflagAnswer(activeEval);
    applyUpdatedEvaluation(updated);
    showSweetToast(`Flag removed from Question ${currentQuestion.questionNumber}`, "info");
  };

  // ACTION 6: Next Question
  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  // ACTION 7: Previous Question
  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  // Quick preset adjusters
  const handleQuickAddMarks = (amount) => {
    const nextVal = Math.min(
      currentQuestion.maxMarks,
      Math.max(0, Number((Number(adjustedMarks) + amount).toFixed(1)))
    );
    setAdjustedMarks(nextVal);
  };

  return (
    <div className="bg-[#09090b] text-slate-100 rounded-xl border border-zinc-800 shadow-2xl flex flex-col h-[calc(100vh-8.5rem)] min-h-[640px] overflow-hidden">
      {/* Top Workspace Header Bar */}
      <div className="bg-[#121215] border-b border-zinc-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        {/* Left: Student & Exam Metadata */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            TE
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                Teacher Evaluation Review Workspace
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {exam?.courseCode}
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center space-x-2">
              <span>Candidate: <strong className="text-zinc-200">{submission?.studentName}</strong> ({submission?.studentRollNumber})</span>
              <span>•</span>
              <span className="text-zinc-300">{exam?.title}</span>
            </p>
          </div>
        </div>

        {/* Center: Question Navigation Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-md">
          {questions.map((q, idx) => {
            const ev = evaluations.find(
              (e) => e.questionId === q.id || e.questionNumber === q.questionNumber
            );
            const isSelected = idx === currentQIndex;
            const qFinalized =
              ev?.evaluationStatus === "TEACHER_FINALIZED" && ev?.finalMarks !== null;
            const qFlagged = Boolean(ev?.isFlagged);

            return (
              <button
                key={q.id || idx}
                onClick={() => setCurrentQIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 flex-shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400 shadow-sm"
                    : qFlagged
                    ? "bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60"
                    : qFinalized
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40"
                    : "bg-zinc-800/70 text-zinc-300 hover:bg-zinc-750 border border-zinc-700/60"
                }`}
              >
                <span>Q{q.questionNumber}</span>
                {qFlagged ? (
                  <Flag className="w-3 h-3 text-rose-400 fill-rose-400" />
                ) : qFinalized ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="AI Suggested (Awaiting Review)" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Progress & Close */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-zinc-200">
              {summary.finalizedCount} of {summary.totalQuestions} Finalized
            </div>
            <div className="w-28 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(summary.finalizedCount / (summary.totalQuestions || 1)) * 100}%`
                }}
              />
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition border border-zinc-700"
              title="Close Workspace"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT PANEL: Original Handwritten Paper & Page Navigation  */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-[#0f0f12] border-r border-zinc-800/80 flex flex-col h-full overflow-hidden">
          {/* Left Panel Toolbar: Zoom, Rotate, Page Navigation */}
          <div className="bg-[#18181c] px-3 py-2 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs flex-shrink-0">
            {/* Page Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-zinc-200 font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
                (Q{currentQuestion.questionNumber} on this page)
              </span>
            </div>

            {/* Zoom & View Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-zinc-300 w-11 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(100);
                  setRotation(0);
                }}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition"
                title="Reset to 100%"
              >
                Reset
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Paper Viewport */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950/90 relative">
            <div
              className="transition-transform duration-200 origin-center shadow-2xl rounded-sm border border-zinc-700/60"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                maxWidth: "100%"
              }}
            >
              <canvas
                ref={canvasRef}
                className="block max-w-full h-auto shadow-md"
                style={{ width: "620px" }}
              />
            </div>

            {/* Float Badge: Focus bounding box indicator */}
            <div className="absolute bottom-4 left-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/80 rounded-md px-2.5 py-1 text-[11px] text-zinc-300 shadow-md flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>
                Inspecting: <strong className="text-white">Ans {currentQuestion.questionNumber}</strong> (Purple Region)
              </span>
            </div>
          </div>

          {/* Page Thumbnails Strip */}
          <div className="bg-[#121216] border-t border-zinc-800 p-2 flex items-center space-x-3 overflow-x-auto flex-shrink-0">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider pl-1">
              Pages:
            </span>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pgNum) => {
              const isActive = pgNum === currentPage;
              return (
                <button
                  key={pgNum}
                  onClick={() => setCurrentPage(pgNum)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-mono transition flex items-center space-x-2 ${
                    isActive
                      ? "bg-indigo-600/30 border-indigo-500 text-white font-bold ring-1 ring-indigo-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <FileText className="w-3 h-3 text-zinc-400" />
                  <span>Page {pgNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: Question, Rubric, AI vs Teacher Evaluation   */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 bg-[#0a0a0c] flex flex-col h-full overflow-hidden">
          {/* Top Status & Score Comparison Card */}
          <div className="bg-[#141418] border-b border-zinc-800 p-3.5 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Question Headline */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs border border-indigo-500/30">
                    Question {currentQuestion.questionNumber}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    Max Marks: <strong className="text-zinc-200">{currentQuestion.maxMarks}</strong>
                  </span>
                  {isFlagged && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[10px] flex items-center space-x-1">
                      <Flag className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>FLAGGED</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {isFinalized ? (
                  <div className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center space-x-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Teacher Finalized</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-medium flex items-center space-x-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Suggested (Review Pending)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clear Side-by-Side Highlight: AI Suggestion vs Teacher Value */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {/* Box 1: AI Suggested Marks (Purple Brand) */}
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/50 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI Suggested</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${confidenceMeta.badgeBg} ${confidenceMeta.textColor} ${confidenceMeta.borderColor}`}>
                    {activeEval.confidenceScore}% Conf
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-purple-200 mt-1">
                  {activeEval.aiSuggestedMarks} <span className="text-xs text-purple-400 font-normal">/ {currentQuestion.maxMarks}</span>
                </div>
                <p className="text-[10px] text-purple-400/80 mt-0.5">
                  Algorithmic estimate (non-final)
                </p>
              </div>

              {/* Box 2: Teacher Marks (Emerald/Amber) */}
              <div
                className={`p-2.5 rounded-lg border relative ${
                  isFinalized
                    ? "bg-emerald-950/30 border-emerald-800/50"
                    : "bg-amber-950/30 border-amber-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold flex items-center space-x-1 ${
                      isFinalized ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>{isFinalized ? "Final Marks" : "Teacher Draft"}</span>
                  </span>
                  {scoreDelta !== 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        scoreDelta > 0
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                    </span>
                  )}
                </div>
                <div
                  className={`text-xl font-bold font-mono mt-1 ${
                    isFinalized ? "text-emerald-300" : "text-amber-200"
                  }`}
                >
                  {isFinalized ? activeEval.finalMarks : adjustedMarks}{" "}
                  <span className="text-xs text-zinc-400 font-normal">/ {currentQuestion.maxMarks}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {isFinalized
                    ? `Authorized by ${activeEval.teacherReviewedBy || "Faculty"}`
                    : "Pending teacher authorization"}
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Inspector Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Flagged Alert Banner (if flagged) */}
            {isFlagged && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-200 flex items-start justify-between gap-2 shadow-sm">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-xs text-rose-300">
                      Answer Flagged for Review
                    </span>
                    <span className="text-[11px] text-rose-200">
                      Reason: {activeEval.flagReason || "Manual verification needed."}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleUnflag}
                  className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-white font-medium text-[10px] border border-rose-700 transition"
                >
                  Remove Flag
                </button>
              </div>
            )}

            {/* Section 1: Extracted Answer */}
            <div className="bg-[#141418] border border-zinc-800 rounded-lg p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>OCR-Extracted Student Answer</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {activeEval.studentAnswer?.length || 0} characters
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 font-mono text-[11px] text-zinc-200 leading-relaxed max-h-32 overflow-y-auto select-text">
                {activeEval.studentAnswer || activeEval.studentAnswerText || "No student answer text."}
              </div>
            </div>

            {/* Section 2: Model Answer */}
            <div className="bg-[#141418] border border-zinc-800 rounded-lg p-3 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Model Reference Answer</span>
                </span>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  Official Standard
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-300 leading-relaxed max-h-28 overflow-y-auto select-text">
                {currentQuestion.modelAnswer || activeEval.modelAnswer || activeEval.modelAnswerText || "Standard rubric answer definition."}
              </div>
            </div>

            {/* Section 3: Rubric Breakdown */}
            <div className="bg-[#141418] border border-zinc-800 rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Evaluation Rubric Criteria & Concept Matches</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  {activeEval.conceptMatches?.length || currentQuestion.keyConcepts?.length || 0} Criteria
                </span>
              </div>

              {activeEval.conceptMatches && activeEval.conceptMatches.length > 0 ? (
                <div className="space-y-1.5">
                  {activeEval.conceptMatches.map((cm, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-zinc-950 border border-zinc-850 flex items-start justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              cm.status === "Full"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : cm.status === "Partial"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {cm.status}
                          </span>
                          <span className="font-medium text-zinc-200 text-xs">
                            {cm.concept}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                          {cm.explanation}
                        </p>
                      </div>
                      <div className="text-right font-mono flex-shrink-0">
                        <span className="font-bold text-zinc-200">{cm.awardedWeight}</span>
                        <span className="text-zinc-500 text-[10px]"> / {cm.requiredWeight} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentQuestion.keyConcepts && currentQuestion.keyConcepts.length > 0 ? (
                <div className="space-y-1.5">
                  {currentQuestion.keyConcepts.map((kc, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-zinc-200 font-medium text-xs">{kc.concept}</span>
                        {kc.synonyms && kc.synonyms.length > 0 && (
                          <span className="text-[10px] text-zinc-500 block">
                            Accepts: {kc.synonyms.join(", ")}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-zinc-300 font-bold">
                        {kc.weightMarks} marks
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded bg-zinc-950 text-zinc-500 text-[11px] italic">
                  Standard qualitative rubric criteria applied based on semantic similarity.
                </div>
              )}
            </div>

            {/* Section 4: AI Feedback & Edit Feedback */}
            <div className="bg-[#141418] border border-zinc-800 rounded-lg p-3 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Evaluation Feedback & Diagnostics</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleEditFeedback}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingFeedback ? "Save Feedback" : "Edit Feedback"}</span>
                  </button>
                  {isEditingFeedback && (
                    <button
                      onClick={handleResetFeedbackToAi}
                      className="text-[10px] text-zinc-400 hover:text-zinc-300 hover:underline"
                    >
                      Reset to AI
                    </button>
                  )}
                </div>
              </div>

              {isEditingFeedback ? (
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="Refine evaluation feedback provided to student..."
                    className="w-full p-2 bg-zinc-950 border border-indigo-500/60 rounded text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                  />
                  <span className="text-[10px] text-zinc-500 block">
                    Modifying this feedback will update the student's report card.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-850 text-[11px] text-zinc-300 leading-relaxed">
                  {customFeedback || activeEval.evaluationFeedback || activeEval.feedback || "Evaluated against syllabus rubric standards."}
                </div>
              )}

              {/* Strengths & Weaknesses chips */}
              {(activeEval.strengths?.length > 0 || activeEval.weaknesses?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {activeEval.strengths?.length > 0 && (
                    <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30">
                      <span className="text-[10px] font-semibold text-emerald-400 block mb-1">
                        Detected Strengths
                      </span>
                      <ul className="text-[10px] text-emerald-300/90 space-y-0.5 list-disc pl-3">
                        {activeEval.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeEval.weaknesses?.length > 0 && (
                    <div className="p-2 rounded bg-amber-950/20 border border-amber-900/30">
                      <span className="text-[10px] font-semibold text-amber-400 block mb-1">
                        Conceptual Gaps / Deductions
                      </span>
                      <ul className="text-[10px] text-amber-300/90 space-y-0.5 list-disc pl-3">
                        {activeEval.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 5: Teacher-Adjusted Marks & Comments */}
            <div className="bg-[#141418] border border-zinc-800 rounded-lg p-3.5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Teacher Marks Adjustment & Audit Commentary</span>
                </span>
                <span className="text-[10px] text-zinc-400">
                  Step 9 & 10 Authorization
                </span>
              </div>

              {/* Stepper & Numeric Input */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleQuickAddMarks(-0.5)}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono font-bold flex items-center justify-center text-xs transition"
                    title="-0.5 marks"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={currentQuestion.maxMarks}
                    value={adjustedMarks}
                    onChange={(e) => setAdjustedMarks(Number(e.target.value))}
                    className="w-16 py-1 px-2 text-center bg-zinc-950 border border-zinc-700 rounded text-sm font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleQuickAddMarks(0.5)}
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono font-bold flex items-center justify-center text-xs transition"
                    title="+0.5 marks"
                  >
                    +
                  </button>
                  <span className="text-xs font-mono text-zinc-400">
                    / {currentQuestion.maxMarks} marks
                  </span>
                </div>

                {/* Quick Fill Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setAdjustedMarks(activeEval.aiSuggestedMarks)}
                    className="px-2 py-1 rounded bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-800/50 text-[10px] font-medium transition"
                    title="Set to AI suggested score"
                  >
                    Match AI ({activeEval.aiSuggestedMarks})
                  </button>
                  <button
                    onClick={() => setAdjustedMarks(currentQuestion.maxMarks)}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition"
                    title="Give full marks"
                  >
                    Full ({currentQuestion.maxMarks})
                  </button>
                  <button
                    onClick={() => setAdjustedMarks(0)}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition"
                    title="Give 0 marks"
                  >
                    Zero (0)
                  </button>
                </div>
              </div>

              {/* Teacher Audit Comments Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 block">
                  Teacher Review Notes / Audit Justification
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Optional instructor justification or feedback to candidate..."
                  className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BOTTOM ACTIONS BAR: All Specified Instructor Actions      */}
          {/* ========================================================= */}
          <div className="bg-[#121215] border-t border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
            {/* Left Actions: Previous Question & Flag Answer */}
            <div className="flex items-center space-x-2">
              <button
                disabled={currentQIndex <= 0}
                onClick={handlePrevQuestion}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 disabled:opacity-40 text-zinc-300 text-xs font-semibold border border-zinc-700 transition flex items-center space-x-1.5"
                title="Previous Question (Left Arrow)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Q</span>
              </button>

              <button
                onClick={() => {
                  if (isFlagged) {
                    handleUnflag();
                  } else {
                    setIsFlagModalOpen(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 ${
                  isFlagged
                    ? "bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border-rose-700"
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                }`}
                title={isFlagged ? "Remove Flag" : "Flag for audit"}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-rose-400 text-rose-400" : "text-zinc-400"}`} />
                <span>{isFlagged ? "Flagged" : "Flag Answer"}</span>
              </button>
            </div>

            {/* Right Actions: Accept AI Suggestion, Save Evaluation, Next Question */}
            <div className="flex items-center space-x-2">
              {/* Action 1: Accept AI suggestion */}
              <button
                onClick={handleAcceptAiSuggestion}
                className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 text-purple-200 text-xs font-semibold border border-purple-700/60 transition flex items-center space-x-1.5 shadow-sm"
                title="Accept AI suggested mark and authorize"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Accept AI ({activeEval.aiSuggestedMarks} pts)</span>
              </button>

              {/* Action 5: Save Evaluation */}
              <button
                onClick={handleSaveEvaluation}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-md"
                title="Save & Finalize this question"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Evaluation</span>
              </button>

              {/* Action 6: Next Question */}
              <button
                disabled={currentQIndex >= questions.length - 1}
                onClick={handleNextQuestion}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                title="Next Question (Right Arrow)"
              >
                <span>Next Q</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Reason Modal */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#18181c] border border-zinc-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <Flag className="w-4 h-4 fill-rose-400" />
                <span>Flag Question {currentQuestion.questionNumber} for Audit</span>
              </div>
              <button
                onClick={() => setIsFlagModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Flagging halts automated mark publication for this question and adds it to the senior faculty verification queue.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] uppercase font-semibold text-zinc-400 block">
                Select Reason or Describe:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  "Illegible or unclear handwriting in scanned paper",
                  "Alternative proof / non-standard derivation requires domain check",
                  "Suspected plagiarism or unauthorized verbatim reproduction",
                  "Disputed question rubric criteria",
                  "Needs senior professor second opinion"
                ].map((reasonOption) => (
                  <button
                    key={reasonOption}
                    onClick={() => setFlagReasonInput(reasonOption)}
                    className={`text-left px-2.5 py-1.5 rounded text-xs transition border ${
                      flagReasonInput === reasonOption
                        ? "bg-rose-950/50 border-rose-600 text-rose-200 font-semibold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {reasonOption}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={flagReasonInput}
                onChange={(e) => setFlagReasonInput(e.target.value)}
                placeholder="Custom audit flag notes..."
                className="w-full mt-2 p-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsFlagModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFlag}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Flag className="w-3.5 h-3.5 fill-white" />
                <span>Confirm Flag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
