import { useState, useEffect } from "react";
import {
  FileText,
  FileCheck,
  Cpu,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  Info,
  Check,
  XCircle,
  HelpCircle,
  Hash,
  Calendar,
  Lock,
  Search,
  Filter,
  BarChart2
} from "lucide-react";
import { showSweetToast } from "../utils/sweetAlert";

// The 7 Required Sequential Stages
export const PIPELINE_STAGES = [
  {
    key: "uploaded_paper",
    stepNumber: 1,
    title: "Uploaded Paper",
    shortTitle: "Upload",
    description: "Multi-page scan intake & file validation",
    icon: FileText,
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/20"
  },
  {
    key: "image_processing",
    stepNumber: 2,
    title: "PDF/Image Processing",
    shortTitle: "Image Prep",
    description: "Contrast boost, deskew, noise cleaning & binarization",
    icon: Sliders,
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
  },
  {
    key: "ocr_recognition",
    stepNumber: 3,
    title: "OCR/Handwriting Recognition",
    shortTitle: "OCR Vision",
    description: "Multimodal Gemini vision handwriting transcription",
    icon: Cpu,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  },
  {
    key: "extracted_text",
    stepNumber: 4,
    title: "Extracted Text",
    shortTitle: "Transcription",
    description: "Clean text synthesis, page collation & confidence audit",
    icon: FileCheck,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    key: "question_detection",
    stepNumber: 5,
    title: "Question Detection",
    shortTitle: "Q-Detection",
    description: "Regex & NLP boundary detection (e.g. 'Ans 1:', 'Q2.')",
    icon: Search,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    key: "answer_segmentation",
    stepNumber: 6,
    title: "Answer Segmentation",
    shortTitle: "Segmentation",
    description: "Discrete answer chunking and line-range indexing",
    icon: Scissors,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    key: "question_mapping",
    stepNumber: 7,
    title: "Question Mapping",
    shortTitle: "Mapping",
    description: "Mapping student answers to exam syllabus questions",
    icon: CheckCircle2,
    accent: "text-teal-400 bg-teal-500/10 border-teal-500/20"
  }
];

export const HandwrittenPipelineView = ({
  submission,
  exam,
  onPipelineUpdated,
  className = ""
}) => {
  const [pipelineData, setPipelineData] = useState(submission?.pipelineExecution || null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeTab, setActiveTab] = useState("mappings"); // 'mappings' | 'segmentation' | 'extracted_text' | 'pages' | 'diagnostics'
  const [selectedStageKey, setSelectedStageKey] = useState("question_mapping");
  const [simulatingFailure, setSimulatingFailure] = useState(false);
  const [previewPageUrl, setPreviewPageUrl] = useState(null);

  // Sync when submission changes
  useEffect(() => {
    if (submission?.pipelineExecution) {
      setPipelineData(submission.pipelineExecution);
    } else {
      fetchPipelineStatus();
    }
  }, [submission?.id, submission?.pipelineExecution]);

  const fetchPipelineStatus = async () => {
    if (!submission?.id) return;
    try {
      const token = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const res = await fetch(`/api/v1/submissions/${submission.id}/pipeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pipeline) {
          setPipelineData(data.pipeline);
        }
      }
    } catch (e) {
      console.warn("Could not fetch remote pipeline status:", e);
    }
  };

  const handleRunPipeline = async (failureType = null) => {
    if (!submission?.id) return;
    setIsRunningPipeline(true);
    try {
      const token = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      let endpoint = `/api/v1/submissions/${submission.id}/process-pipeline`;
      let bodyPayload = {};

      if (failureType) {
        endpoint = `/api/v1/submissions/${submission.id}/test-ocr-failure`;
        bodyPayload = { failureType };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const result = await res.json();
      if (result.pipelineExecution) {
        setPipelineData(result.pipelineExecution);
        if (onPipelineUpdated && result.submission) {
          onPipelineUpdated(result.submission);
        }
      }

      if (result.success) {
        showSweetToast(
          `Handwritten pipeline finished in ${result.pipelineExecution?.durationMs || 0}ms (${result.pipelineExecution?.averageOcrConfidence || 95}% OCR confidence)`,
          "success"
        );
      } else {
        showSweetToast(
          result.message || `Pipeline stopped at ${result.pipelineExecution?.currentStage}`,
          failureType ? "info" : "error"
        );
        setActiveTab("diagnostics");
      }
    } catch (err) {
      console.error("Pipeline run error:", err);
      showSweetToast("Failed to communicate with pipeline server", "error");
    } finally {
      setIsRunningPipeline(false);
      setSimulatingFailure(false);
    }
  };

  const handleRetryPipeline = async () => {
    if (!submission?.id) return;
    setIsRunningPipeline(true);
    try {
      const token = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const res = await fetch(`/api/v1/submissions/${submission.id}/retry-pipeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.pipelineExecution) {
        setPipelineData(result.pipelineExecution);
        if (onPipelineUpdated && result.submission) {
          onPipelineUpdated(result.submission);
        }
      }
      if (result.success) {
        showSweetToast("Pipeline recovered and completed successfully!", "success");
      } else {
        showSweetToast(result.message || "Retry failed", "error");
      }
    } catch (err) {
      showSweetToast("Retry error", "error");
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Derive status presentation
  const overallStatus = pipelineData?.overallStatus || (submission?.status === "PROCESSING" ? "PROCESSING" : submission?.status === "FAILED" ? "FAILED" : submission?.status === "UPLOADED" ? "WAITING" : "COMPLETED");

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "COMPLETED",
          bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          dot: "bg-emerald-400",
          icon: CheckCircle2,
          desc: "All 7 stages executed and verified"
        };
      case "PROCESSING":
        return {
          label: "PROCESSING",
          bg: "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse",
          dot: "bg-amber-400 animate-ping",
          icon: RefreshCw,
          desc: "Multi-stage pipeline actively computing"
        };
      case "FAILED":
        return {
          label: "FAILED",
          bg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          dot: "bg-rose-400",
          icon: AlertTriangle,
          desc: "Halted at current stage - inspection needed"
        };
      case "WAITING":
      default:
        return {
          label: "WAITING",
          bg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          dot: "bg-sky-400",
          icon: Clock,
          desc: "Answer sheet received; queued for execution"
        };
    }
  };

  const statusBadge = getStatusBadge(overallStatus);
  const StatusIcon = statusBadge.icon;

  // Metadata items
  const originalFile = pipelineData?.originalFile || {
    fileName: submission?.originalFileName || "student_answer_sheet.pdf",
    mimeType: submission?.mimeType || "application/pdf",
    fileSizeFormatted: submission?.fileSizeFormatted || "1.2 MB",
    uploadedAt: submission?.submissionDate || new Date().toISOString()
  };

  const pagesCount = pipelineData?.pages?.length || submission?.pageCount || 1;
  const ocrConfidence = pipelineData?.averageOcrConfidence || submission?.ocrResult?.averageConfidence || 0;
  const detectedQuestions = pipelineData?.detectedQuestions || [];
  const segmentedAnswers = pipelineData?.segmentedAnswers || [];
  const questionMappings = pipelineData?.questionMappings || [];
  const errorObj = pipelineData?.error || null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Main Header & Overall Processing Status Banner */}
      <div className="bg-[#121216] border border-[#222228] rounded-2xl p-5 shadow-lg relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs border border-indigo-500/30">
                <Cpu className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Handwritten Answer Processing Pipeline
              </h2>

              {/* Status Badge */}
              <div
                id="pipeline-status-badge"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                <StatusIcon className={`w-3.5 h-3.5 ${overallStatus === "PROCESSING" ? "animate-spin" : ""}`} />
                <span>{statusBadge.label}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              7-stage pipeline transcribing handwritten student responses, segmenting individual questions,
              and mapping answers against official exam rubrics with per-question confidence tracking.
            </p>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center gap-2">
            {overallStatus === "FAILED" ? (
              <button
                type="button"
                id="btn-retry-pipeline"
                disabled={isRunningPipeline}
                onClick={handleRetryPipeline}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningPipeline ? "animate-spin" : ""}`} />
                <span>Retry Pipeline</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-execute-pipeline"
                disabled={isRunningPipeline}
                onClick={() => handleRunPipeline()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isRunningPipeline ? "animate-spin text-amber-300" : "text-amber-300"}`} />
                <span>{isRunningPipeline ? "Executing 7 Stages..." : "Run 7-Stage Pipeline"}</span>
              </button>
            )}

            {/* Simulated OCR Failure Dropdown for Robust Error Demonstration */}
            <div className="relative group">
              <button
                type="button"
                id="btn-test-ocr-failures"
                disabled={isRunningPipeline}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1c1c22] hover:bg-[#272730] text-slate-300 border border-[#2e2e38] transition-all cursor-pointer disabled:opacity-50"
                title="Test how the system handles image blurs, unreadable handwriting, and blank pages"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Failure Modes</span>
              </button>

              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#18181f] border border-[#2d2d38] rounded-xl shadow-2xl p-2 z-50 hidden group-hover:block transition-all">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#272732] mb-1">
                  Simulate Pipeline Failures
                </div>
                <button
                  type="button"
                  id="btn-sim-unreadable"
                  disabled={isRunningPipeline}
                  onClick={() => handleRunPipeline("unreadable")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center justify-between"
                >
                  <span>Unreadable Handwriting</span>
                  <span className="text-[10px] font-mono text-slate-500">Low OCR</span>
                </button>
                <button
                  type="button"
                  id="btn-sim-blur"
                  disabled={isRunningPipeline}
                  onClick={() => handleRunPipeline("blur")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center justify-between"
                >
                  <span>Severe Camera Blur</span>
                  <span className="text-[10px] font-mono text-slate-500">Defocus</span>
                </button>
                <button
                  type="button"
                  id="btn-sim-blank"
                  disabled={isRunningPipeline}
                  onClick={() => handleRunPipeline("blank")}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-700/30 transition-colors flex items-center justify-between"
                >
                  <span>Blank / Low Ink Page</span>
                  <span className="text-[10px] font-mono text-slate-500">No Content</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              id="btn-refresh-pipeline-telemetry"
              onClick={fetchPipelineStatus}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#1c1c22] border border-[#2e2e38] transition-all cursor-pointer"
              title="Refresh Pipeline Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Metadata Strip (Original file, Page Number, Extracted Text, Question Number, Status, Timestamp, Confidence) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-[#222228] text-xs">
          {/* 1. Original file */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              Original File
            </span>
            <div className="font-mono text-slate-200 truncate mt-1 text-[11px] font-medium" title={originalFile.fileName}>
              {originalFile.fileName}
            </div>
            <span className="text-[10px] text-slate-400">{originalFile.fileSizeFormatted || "1.2 MB"}</span>
          </div>

          {/* 2. Page Number */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              Page Number
            </span>
            <div className="font-bold text-white mt-1 text-sm">
              {pagesCount} {pagesCount === 1 ? "Page" : "Pages"}
            </div>
            <span className="text-[10px] text-indigo-400">Indexed 1 to {pagesCount}</span>
          </div>

          {/* 3. OCR Confidence */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              OCR Confidence
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`font-mono font-bold text-sm ${ocrConfidence >= 90 ? "text-emerald-400" : ocrConfidence >= 75 ? "text-amber-400" : "text-rose-400"}`}>
                {ocrConfidence ? `${ocrConfidence}%` : "Pending"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Gemini 3.8 Flash Vision</span>
          </div>

          {/* 4. Question Detection */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              Question Numbers
            </span>
            <div className="font-bold text-white mt-1 text-sm">
              {detectedQuestions.length > 0 ? `${detectedQuestions.length} Found` : "Pending"}
            </div>
            <span className="text-[10px] text-slate-400">
              {detectedQuestions.map(q => `Q${q.detectedQuestionNumber}`).join(", ") || "Awaiting scan"}
            </span>
          </div>

          {/* 5. Processing Status */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              Processing Status
            </span>
            <div className="font-bold text-slate-200 mt-1 flex items-center gap-1 text-[11px]">
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <span>{overallStatus}</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block">
              {pipelineData?.currentStage ? `Stage: ${pipelineData.currentStage}` : "Initialized"}
            </span>
          </div>

          {/* 6. Processing Timestamp */}
          <div className="bg-[#0b0b0e] border border-[#1e1e24] p-2.5 rounded-xl">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider block">
              Timestamp
            </span>
            <div className="font-mono text-slate-300 mt-1 text-[10px] truncate" title={pipelineData?.completedAt || pipelineData?.startedAt || submission?.submissionDate}>
              {new Date(pipelineData?.completedAt || pipelineData?.startedAt || submission?.submissionDate || Date.now()).toLocaleTimeString()}
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">
              {pipelineData?.durationMs ? `${pipelineData.durationMs}ms total` : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. The 7-Stage Interactive Pipeline Flowchart Stepper */}
      <div className="bg-[#121216] border border-[#222228] rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Structured Workflow Stepper (7 Stages)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Uploaded Paper → PDF/Image → OCR → Text → Q-Detection → Segmentation → Q-Mapping
          </span>
        </div>

        {/* Responsive Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3 pt-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const stageExec = pipelineData?.stages?.[stage.key];
            const stageStatus = stageExec?.status || (overallStatus === "COMPLETED" ? "COMPLETED" : "WAITING");
            const isCurrent = pipelineData?.currentStage === stage.key;
            const isFailed = stageStatus === "FAILED";
            const isCompleted = stageStatus === "COMPLETED";
            const isProcessing = stageStatus === "PROCESSING" || (isRunningPipeline && isCurrent);
            const isSelected = selectedStageKey === stage.key;
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                id={`stepper-stage-${stage.key}`}
                onClick={() => {
                  setSelectedStageKey(stage.key);
                  if (stage.key === "question_mapping") setActiveTab("mappings");
                  else if (stage.key === "answer_segmentation" || stage.key === "question_detection") setActiveTab("segmentation");
                  else if (stage.key === "extracted_text" || stage.key === "ocr_recognition") setActiveTab("extracted_text");
                  else if (stage.key === "uploaded_paper" || stage.key === "image_processing") setActiveTab("pages");
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "ring-2 ring-indigo-500/70 border-indigo-500/50 bg-[#171720]"
                    : "bg-[#0b0b0e] hover:bg-[#14141a] border-[#1e1e24]"
                }`}
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isFailed
                      ? "bg-rose-500"
                      : isCompleted
                      ? "bg-emerald-500"
                      : isProcessing
                      ? "bg-amber-400 animate-pulse"
                      : "bg-slate-700"
                  }`}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {stage.stepNumber}
                    </span>

                    {/* Stage icon status */}
                    <div>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isProcessing && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />}
                      {isFailed && <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />}
                      {!isCompleted && !isProcessing && !isFailed && (
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {stage.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Stage bottom metric */}
                <div className="mt-3 pt-2 border-t border-[#1a1a20] flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold font-mono ${
                      isFailed
                        ? "text-rose-400"
                        : isCompleted
                        ? "text-emerald-400"
                        : isProcessing
                        ? "text-amber-400"
                        : "text-slate-500"
                    }`}
                  >
                    {stageStatus}
                  </span>
                  {stageExec?.durationMs !== undefined && (
                    <span className="text-slate-400 font-mono">{stageExec.durationMs}ms</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Failure Diagnostic Banner (Rendered when OCR or any stage fails) */}
      {overallStatus === "FAILED" && errorObj && (
        <div
          id="pipeline-failure-diagnostic-box"
          className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-5 space-y-4 shadow-xl text-rose-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Stage Failure: {errorObj.stage || pipelineData?.currentStage}
                  </span>
                  <span className="text-xs font-mono text-rose-400">Error: {errorObj.code}</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  {errorObj.message}
                </h3>
                {errorObj.technicalDetails && (
                  <p className="text-xs text-rose-300/80 font-mono mt-1 bg-black/40 p-2 rounded-lg border border-rose-500/20">
                    {errorObj.technicalDetails}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetryPipeline}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Pipeline Now</span>
            </button>
          </div>

          {/* Remediation Guidance */}
          {errorObj.remediationTips && errorObj.remediationTips.length > 0 && (
            <div className="bg-black/30 p-3 rounded-xl border border-rose-500/20">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Faculty & Student Remediation Steps:</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                {errorObj.remediationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-black/20 p-2 rounded-lg">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5. Detailed Inspection Workspace Tabs */}
      <div className="bg-[#121216] border border-[#222228] rounded-2xl p-5 shadow-lg space-y-4">
        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-[#222228] pb-3 overflow-x-auto gap-2">
          <div className="flex items-center space-x-2">
            {[
              { id: "mappings", label: "Question Mappings (Store)", icon: CheckCircle2, count: questionMappings.length },
              { id: "segmentation", label: "Answer Segmentation & Headers", icon: Scissors, count: segmentedAnswers.length },
              { id: "extracted_text", label: "Extracted Text & OCR", icon: FileText, count: ocrConfidence ? `${ocrConfidence}%` : null },
              { id: "pages", label: "Processed Pages & Files", icon: Layers, count: pagesCount },
              { id: "diagnostics", label: "Diagnostics & Telemetry", icon: BarChart2, count: overallStatus }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-pipeline-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-[#0b0b0e] text-slate-400 hover:text-white border border-[#1e1e24]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isSelected ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Vault Key: <span className="text-emerald-400">{submission?.secureFileId || "vault_token_active"}</span>
          </div>
        </div>

        {/* Tab 1: Question Mappings (Stores Question Number, Page Number, Extracted Text, Status, Timestamp, Confidence) */}
        {activeTab === "mappings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Each question in the examination is verified against segmented handwritten answers with confidence grading.
              </span>
              <span className="font-mono text-indigo-400">
                {questionMappings.filter(m => m.mappingStatus === "MAPPED").length} of {questionMappings.length || exam?.questions?.length || 0} Questions Mapped
              </span>
            </div>

            <div className="space-y-3">
              {questionMappings.length > 0 ? (
                questionMappings.map(mapping => {
                  const examQ = exam?.questions?.find(q => q.questionNumber === mapping.questionNumber);
                  return (
                    <div
                      key={mapping.questionNumber}
                      id={`card-mapping-q${mapping.questionNumber}`}
                      className="bg-[#0b0b0e] border border-[#1e1e24] rounded-xl p-4 space-y-3 transition-all hover:border-indigo-500/30"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18181f] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold font-mono text-xs border border-indigo-500/20">
                            Question {mapping.questionNumber}
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {examQ?.questionText || mapping.questionText || `Question ${mapping.questionNumber}`}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({mapping.maxMarks || examQ?.maxMarks || 10} Marks)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            Page {mapping.pageNumber || 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            mapping.ocrConfidence >= 90
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {mapping.ocrConfidence}% OCR Conf.
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            mapping.mappingStatus === "MAPPED"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}>
                            {mapping.mappingStatus}
                          </span>
                        </div>
                      </div>

                      {/* Stored Extracted Text */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Stored Extracted Answer Text:
                        </span>
                        <div className="p-3 bg-[#131317] rounded-lg border border-[#1e1e24] text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {mapping.extractedAnswerText || (
                            <span className="text-slate-500 italic">No answer text extracted for this question yet.</span>
                          )}
                        </div>
                      </div>

                      {/* Metadata Footer */}
                      <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Processed: {new Date(mapping.processingTimestamp || Date.now()).toLocaleTimeString()}
                        </span>
                        <span className="text-slate-400">
                          {mapping.mappingReason || "Extracted via sequential header detection"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-[#0b0b0e] border border-[#1e1e24] rounded-xl space-y-3">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No question mappings available. Click "Run 7-Stage Pipeline" above to transcribe and map answers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Answer Segmentation & Question Detection */}
        {activeTab === "segmentation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Question Detections */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Detected Question Boundaries ({detectedQuestions.length})</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {detectedQuestions.length > 0 ? (
                    detectedQuestions.map((dq, i) => (
                      <div key={i} className="bg-[#0b0b0e] border border-[#1e1e24] p-3 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300 font-mono">
                            {dq.questionLabel || `Question ${dq.detectedQuestionNumber}`}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            Line {dq.boundingLineRange ? `${dq.boundingLineRange[0]}-${dq.boundingLineRange[1]}` : "1-5"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Page {dq.pageNumber}</span>
                          <span className="text-emerald-400 font-mono">{dq.confidence || 95}% match</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-[#0b0b0e] rounded-xl border border-[#1e1e24]">
                      Question headers pending pipeline run.
                    </div>
                  )}
                </div>
              </div>

              {/* Segmented Answers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Segmented Answers ({segmentedAnswers.length})</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {segmentedAnswers.length > 0 ? (
                    segmentedAnswers.map((seg, i) => (
                      <div key={i} className="bg-[#0b0b0e] border border-[#1e1e24] p-3 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between border-b border-[#18181f] pb-1.5">
                          <span className="font-bold text-emerald-400 font-mono">
                            {seg.questionLabel || `Ans ${seg.questionNumber}`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Page {seg.pageNumber} · Lines {seg.startLine}-{seg.endLine}
                          </span>
                        </div>
                        <p className="font-mono text-slate-200 text-[11px] leading-relaxed line-clamp-3">
                          {seg.extractedText}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-[#0b0b0e] rounded-xl border border-[#1e1e24]">
                      Answer segments pending pipeline run.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Extracted Full Text & OCR Transcript */}
        {activeTab === "extracted_text" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Full transcribed handwriting output synthesized across all uploaded pages:
              </span>
              <span className="font-mono text-emerald-400 text-xs">
                Average Confidence: {ocrConfidence}%
              </span>
            </div>

            <textarea
              readOnly
              rows={12}
              value={pipelineData?.extractedText || submission?.ocrResult?.fullExtractedText || "Handwritten text extraction pending."}
              className="w-full bg-[#0b0b0e] text-slate-200 font-mono text-xs p-4 rounded-xl border border-[#1e1e24] focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* Tab 4: Processed Pages & Files */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Each page is preprocessed for noise reduction, skew angle correction, and Otsu binarization before OCR text extraction.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(pipelineData?.pages && pipelineData.pages.length > 0 ? pipelineData.pages : [
                {
                  pageNumber: 1,
                  status: "COMPLETED",
                  ocrConfidence: ocrConfidence || 95,
                  originalFileName: originalFile.fileName,
                  extractedTextSnippet: (pipelineData?.extractedText || submission?.ocrResult?.fullExtractedText || "").substring(0, 120) + "..."
                }
              ]).map((page, i) => (
                <div
                  key={i}
                  className="bg-[#0b0b0e] border border-[#1e1e24] p-3.5 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#18181f] pb-2">
                    <span className="font-bold text-white font-mono">
                      Page {page.pageNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {page.ocrConfidence || ocrConfidence || 95}% OCR
                    </span>
                  </div>

                  {/* Thumbnail / Page view */}
                  <div className="h-36 bg-[#141419] rounded-lg border border-[#202028] flex items-center justify-center overflow-hidden relative group">
                    {submission?.originalScanUrl ? (
                      <img
                        src={submission.originalScanUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <FileText className="w-8 h-8" />
                        <span className="text-[10px]">Secure Vault Token</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {page.extractedTextSnippet || "Page transcribed successfully."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Diagnostics & Telemetry */}
        {activeTab === "diagnostics" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Complete JSON telemetry object recorded for auditability:</span>
              <span className="font-mono text-indigo-400 text-xs">
                Execution ID: {submission?.id}
              </span>
            </div>

            <pre className="bg-[#09090c] border border-[#1e1e24] p-4 rounded-xl text-[11px] font-mono text-slate-300 max-h-96 overflow-auto leading-relaxed">
              {JSON.stringify(
                {
                  submissionId: submission?.id,
                  studentRollNumber: submission?.studentRollNumber,
                  examId: submission?.examId,
                  overallStatus,
                  originalFile,
                  stages: pipelineData?.stages || {},
                  detectedQuestions,
                  segmentedAnswers,
                  questionMappings,
                  error: pipelineData?.error || null,
                  durationMs: pipelineData?.durationMs || 0
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandwrittenPipelineView;
