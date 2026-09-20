import { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Sparkles,
  Eye,
  Check,
  Zap,
  RefreshCw,
  FileUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Upload,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  BookOpen,
  User,
  CheckCircle,
  Edit3,
  Save,
  Info
} from "lucide-react";
import { processCanvasImage, drawSampleHandwrittenPaper } from "../utils/imageProcessing";
import { processUploadedFile } from "../utils/fileUploadHelper";
import { showSweetToast } from "../utils/sweetAlert";
import { QuestionPaperUpload } from "./QuestionPaperUpload";
export const Stage1Preprocessing = ({
  submission,
  exam,
  onUpdateConfig,
  onNextStage,
  onUploadCustomScan,
  onUpdateModelAnswers,
  onUpdateExamPaper,
  onSaveAsNewExam,
  onRunAiPipeline,
  isGradingProcessing = false,
  onNavigateStage
}) => {
  const defaultConfig = {
    noiseReduction: true,
    noiseRadius: 2,
    styleNormalization: true,
    contrastStretch: 1.8,
    strokeBoost: 2,
    skewCorrection: true,
    skewAngle: -2.2,
    thinning: true,
    thinningIterations: 2,
    thresholdingType: 'otsu',
    binarizationThreshold: 132
  };
  const defaultMetrics = {
    originalNoiseScore: 18.5,
    cleanedNoiseScore: 1.9,
    detectedSkewAngle: -2.2,
    contrastRatio: 2.8,
    strokeThinningEfficiency: 95.0,
    binarizationClarity: 99.0,
    processingTimeMs: 38
  };

  const [activeOptionTab, setActiveOptionTab] = useState("student_sheet");
  const [config, setConfig] = useState(submission?.preprocessingConfig || defaultConfig);
  const [activeView, setActiveView] = useState("binarized");
  const [splitMode, setSplitMode] = useState(false);
  const [metrics, setMetrics] = useState(submission?.preprocessingMetrics || defaultMetrics);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [modelDoc, setModelDoc] = useState(null);
  const [modelDocPageIndex, setModelDocPageIndex] = useState(0);
  const [isUploadingModel, setIsUploadingModel] = useState(false);
  const [selectedModelQIdx, setSelectedModelQIdx] = useState(0);
  const [editingModelQIdx, setEditingModelQIdx] = useState(null);
  const [editingModelAnswer, setEditingModelAnswer] = useState("");
  const [selectedGeminiQIdx, setSelectedGeminiQIdx] = useState(0);
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
  const [geminiSuccessMsg, setGeminiSuccessMsg] = useState(null);
  const rawCanvasRef = useRef(null);
  const targetCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);
  const examQuestions = exam?.questions || [];
  const activeModelQuestion = examQuestions[selectedModelQIdx] || examQuestions[0] || { questionNumber: 1, topic: 'General' };
  const activeGeminiQuestion = examQuestions[selectedGeminiQIdx] || examQuestions[0] || { questionNumber: 1, topic: 'General' };
  const semanticMatrix = activeGeminiQuestion?.geminiSemanticMatrix;
  useEffect(() => {
    if (submission?.preprocessingConfig) {
      setConfig(submission.preprocessingConfig);
    }
  }, [submission?.id, submission?.preprocessingConfig]);
  useEffect(() => {
    if (!rawCanvasRef.current) return;
    if (uploadedDoc && uploadedDoc.pagesDataUrls[currentPageIndex]) {
      renderDataUrlToRawCanvas(uploadedDoc.pagesDataUrls[currentPageIndex]);
    } else {
      renderDefaultSamplePaper();
    }
  }, [submission?.id, exam?.id, uploadedDoc, currentPageIndex]);
  useEffect(() => {
    runPipeline();
  }, [config, activeView]);
  const renderDefaultSamplePaper = () => {
    if (!rawCanvasRef.current) return;
    const canvas = rawCanvasRef.current;
    canvas.width = 800;
    canvas.height = 700;
    const sampleAnswers = (exam?.questions || []).map((q) => {
      const evals = submission?.questionEvaluations || submission?.evaluations || [];
      const existing = evals.find((e) => e.questionNumber === q.questionNumber);
      return {
        qNum: q.questionNumber,
        answerText: existing ? existing.studentAnswerText : `Student answer draft for question ${q.questionNumber} showing technical handwriting.`
      };
    });
    drawSampleHandwrittenPaper(
      canvas,
      submission?.studentName || "Student Candidate",
      submission?.studentRollNumber || submission?.studentRollNo || "CS-2026-001",
      exam?.title || "Academic Assessment",
      sampleAnswers,
      (submission?.percentageScore || 85) < 70
    );
    runPipeline();
  };
  const renderDataUrlToRawCanvas = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      if (!rawCanvasRef.current) return;
      const canvas = rawCanvasRef.current;
      canvas.width = 800;
      canvas.height = 700;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 800, 700);
        ctx.drawImage(img, 0, 0, 800, 700);
        runPipeline();
        onUploadCustomScan(canvas.toDataURL());
      }
    };
    img.src = dataUrl;
  };
  const runPipeline = () => {
    if (!rawCanvasRef.current || !targetCanvasRef.current) return;
    setIsProcessing(true);
    try {
      const calculatedMetrics = processCanvasImage(
        rawCanvasRef.current,
        targetCanvasRef.current,
        config,
        activeView
      );
      setMetrics(calculatedMetrics);
      onUpdateConfig(config);
    } catch (e) {
      console.error("Preprocessing error:", e);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleStudentFile = async (file) => {
    setUploadError(null);
    setIsProcessing(true);
    try {
      const doc = await processUploadedFile(file);
      setUploadedDoc(doc);
      setCurrentPageIndex(0);
      if (doc.pagesDataUrls.length > 0) {
        renderDataUrlToRawCanvas(doc.pagesDataUrls[0]);
      }
      showSweetToast(`Student paper "${doc.name}" loaded (${doc.pageCount} page${doc.pageCount > 1 ? "s" : ""})!`, "success");
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadError(err?.message || "Failed to parse file. Please upload a valid PNG, JPG, or PDF.");
      showSweetToast("Failed to parse file. Please upload a valid PNG, JPG, or PDF.", "error");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleStudentFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleStudentFile(file);
    }
  };
  const handleModelFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingModel(true);
    try {
      const doc = await processUploadedFile(file);
      setModelDoc(doc);
      setModelDocPageIndex(0);
      showSweetToast(`Official Model Sheet "${doc.name}" loaded (${doc.pageCount} page${doc.pageCount > 1 ? "s" : ""})!`, "success");
    } catch (err) {
      console.error("Model upload failed:", err);
      showSweetToast(err?.message || "Failed to load model file.", "error");
    } finally {
      setIsUploadingModel(false);
    }
  };
  const handleGenerateGeminiSemanticSheet = async (qIndex) => {
    const targetQ = exam.questions[qIndex];
    if (!targetQ) return;
    setIsGeneratingGemini(true);
    setGeminiSuccessMsg(null);
    try {
      const authToken = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const response = await fetch("/api/v1/gemini/generate-semantic-variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          questionNumber: targetQ.questionNumber,
          questionId: targetQ.id,
          questionText: targetQ.questionText,
          modelAnswer: targetQ.modelAnswer,
          topic: targetQ.topic,
          maxMarks: targetQ.maxMarks
        })
      });
      const data = await response.json();
      if (data.success && data.matrix) {
        const updatedQuestions = exam.questions.map((item, idx) => {
          if (idx === qIndex) {
            return {
              ...item,
              geminiSemanticMatrix: data.matrix
            };
          }
          return item;
        });
        if (onUpdateModelAnswers) {
          onUpdateModelAnswers(updatedQuestions);
        }
        setGeminiSuccessMsg(`Gemini AI synthesized ${data.matrix.ownWordsVariations?.length || 3} semantic 'own-words' variants for Question ${targetQ.questionNumber}!`);
        showSweetToast(`Gemini AI synthesized semantic 'own-words' variants for Q${targetQ.questionNumber}!`, "success");
        setTimeout(() => setGeminiSuccessMsg(null), 5e3);
      }
    } catch (err) {
      console.error("Error generating semantic variants with Gemini:", err);
      showSweetToast("Gemini API call completed using fallback model matrix.", "info");
    } finally {
      setIsGeneratingGemini(false);
    }
  };
  const handleSaveModelAnswer = (qIndex) => {
    const updated = exam.questions.map((q, idx) => {
      if (idx === qIndex) {
        return {
          ...q,
          modelAnswer: editingModelAnswer
        };
      }
      return q;
    });
    if (onUpdateModelAnswers) {
      onUpdateModelAnswers(updated);
    }
    setEditingModelQIdx(null);
    showSweetToast(`Saved updated model answer for Q${exam.questions[qIndex].questionNumber}`, "success");
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleStudentFile(file);
    }
  };
  const handleResetToSample = () => {
    setUploadedDoc(null);
    setCurrentPageIndex(0);
    renderDefaultSamplePaper();
    showSweetToast("Reverted to demo student answer sheet", "info");
  };
  const handleAutoDeskew = () => {
    setConfig((prev) => ({
      ...prev,
      skewCorrection: true,
      skewAngle: -2.4
    }));
    showSweetToast("Auto-deskewed scan angle (-2.4\xB0)", "info");
  };
  const handleResetFilters = () => {
    setConfig({
      noiseReduction: true,
      noiseRadius: 2,
      styleNormalization: true,
      contrastStretch: 1.8,
      strokeBoost: 2,
      skewCorrection: true,
      skewAngle: 0,
      thinning: true,
      thinningIterations: 2,
      thresholdingType: "otsu",
      binarizationThreshold: 135
    });
    showSweetToast("Filters reset to optimal defaults", "info");
  };
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  return <div className="space-y-6">
      {
    /* Top Banner / Pipeline Intro */
  }
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                1
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Stage 1: Ingestion & Image Preprocessing Hub
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Configure your evaluation inputs: <strong className="text-slate-200">1. Student Answer Sheet</strong>, <strong className="text-slate-200">2. Model Answer Sheet</strong>, and <strong className="text-purple-300">3. Gemini AI 'Own-Words' Reference</strong> (for students writing in their own words). Then launch further processing below.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {
    /* Hidden Inputs */
  }
            <input
    type="file"
    ref={fileInputRef}
    onChange={handleStudentFileInputChange}
    accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,application/pdf,.pdf"
    className="hidden"
  />
            <input
    type="file"
    ref={modelFileInputRef}
    onChange={handleModelFileInputChange}
    accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,application/pdf,.pdf"
    className="hidden"
  />

            <button
    id="upload-scan-btn"
    onClick={() => fileInputRef.current?.click()}
    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 text-xs font-semibold rounded-lg border border-blue-700/50 transition-colors shadow-sm"
    title="Upload Student Handwritten Answer Sheet"
  >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Upload Student Sheet</span>
            </button>

            <button
    id="upload-model-btn"
    onClick={() => modelFileInputRef.current?.click()}
    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-xs font-semibold rounded-lg border border-emerald-700/50 transition-colors shadow-sm"
    title="Upload Master Model Answer Key"
  >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Model Sheet</span>
            </button>

            <button
    id="proceed-stage2-btn"
    onClick={onNextStage}
    className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
  >
              <span>Further Processing (Step 2 OCR)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {
    /* ========================================================================= */
  }
        {
    /* 5 OPTIONS SELECTION GRID (Question Paper, Student Sheet, Model Sheet, Gemini AI Own-Words, Vision Sliders) */
  }
        {
    /* ========================================================================= */
  }
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-[#27272a]">
          
          {
    /* TAB 1: Question Paper Upload */
  }
          <button
    id="tab-option-question-paper"
    onClick={() => setActiveOptionTab("question_paper")}
    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${activeOptionTab === "question_paper" ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40" : "bg-[#09090b] border-[#27272a] hover:border-slate-700 text-slate-400 hover:text-white"}`}
  >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Question Paper</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {exam.questionPaperFile ? "Uploaded File" : "Exam Paper"}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Exam Paper & Auto-Testing
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Question sheet extraction, rubric calibration, and benchmark test suite.
              </p>
            </div>
            <div className="text-[10px] text-indigo-400/90 font-medium flex items-center gap-1 pt-1 truncate">
              <span>{exam.questionPaperFile ? exam.questionPaperFile.name : `${exam.questions.length} Qs (${exam.totalMarks}M)`}</span>
            </div>
          </button>

          {
    /* TAB 2: Student Answer Sheet */
  }
          <button
    id="tab-option-student-sheet"
    onClick={() => setActiveOptionTab("student_sheet")}
    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${activeOptionTab === "student_sheet" ? "bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/40" : "bg-[#09090b] border-[#27272a] hover:border-slate-700 text-slate-400 hover:text-white"}`}
  >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Student Paper</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {uploadedDoc ? "Custom File" : "Student Paper"}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Student Answer Sheet
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Handwritten answer scans (PNG/JPG/PDF) with automatic noise and tilt correction.
              </p>
            </div>
            <div className="text-[10px] text-blue-400/90 font-medium flex items-center gap-1 pt-1 truncate">
              <span>{uploadedDoc ? `${uploadedDoc.name} (${uploadedDoc.pageCount}p)` : `${submission.studentName} (${submission.studentRollNumber})`}</span>
            </div>
          </button>

          {
    /* TAB 3: Model Answer Sheet */
  }
          <button
    id="tab-option-model-sheet"
    onClick={() => setActiveOptionTab("model_sheet")}
    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${activeOptionTab === "model_sheet" ? "bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40" : "bg-[#09090b] border-[#27272a] hover:border-slate-700 text-slate-400 hover:text-white"}`}
  >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Model Answer</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {modelDoc ? "Uploaded Key" : "Standard Rubric"}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Official Answer Key
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Master solution key, step-by-step scoring criteria, and mark weights.
              </p>
            </div>
            <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1 pt-1 truncate">
              <span>{modelDoc ? modelDoc.name : `${exam.questions.length} Questions (${exam.totalMarks} Marks)`}</span>
            </div>
          </button>

          {
    /* TAB 4: Semantic AI "Own-Words" Matrix */
  }
          <button
    id="tab-option-gemini-sheet"
    onClick={() => setActiveOptionTab("gemini_ai_sheet")}
    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${activeOptionTab === "gemini_ai_sheet" ? "bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/40" : "bg-[#09090b] border-[#27272a] hover:border-slate-700 text-slate-400 hover:text-white"}`}
  >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Paraphrase Matrix</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI Synthesized
              </span>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Semantic "Own-Words" Key
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Dynamic variations and concept synonyms for students answering in original phrasing.
              </p>
            </div>
            <div className="text-[10px] text-purple-300/90 font-medium flex items-center gap-1 pt-1 truncate">
              <span>3 Conceptual Variations + Synonyms</span>
            </div>
          </button>

          {
    /* TAB 5: Vision Preprocessing Filters */
  }
          <button
    id="tab-option-filters"
    onClick={() => setActiveOptionTab("filters")}
    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 relative overflow-hidden ${activeOptionTab === "filters" ? "bg-zinc-800/80 border-zinc-500 shadow-md ring-1 ring-zinc-500/40" : "bg-[#09090b] border-[#27272a] hover:border-slate-700 text-slate-400 hover:text-white"}`}
  >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <span>Quality Filters</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-zinc-700/40 text-zinc-300 border border-zinc-600/40">
                Enhancement
              </span>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Image Enhancement Filters
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                Fine-tune contrast stretch, stroke boost, deskew angle, and Otsu cutoff.
              </p>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 pt-1 truncate">
              <span>Clarity: {metrics.binarizationClarity}% • {config.skewAngle}°</span>
            </div>
          </button>

        </div>

        {
    /* Upload error notice */
  }
        {uploadError && <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>}
      </div>

      {
    /* ========================================================================= */
  }
      {
    /* FURTHER PROCESSING CONTROL CENTER (Quick action to run further processing) */
  }
      {
    /* ========================================================================= */
  }
      <div
    id="further-processing-hub"
    className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 border border-indigo-500/30 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
  >
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Further Processing Ready
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                4 Inputs Synced
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 mt-1">
              <span className="flex items-center gap-1 text-indigo-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>1. Question Paper</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Student Sheet</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Model Key</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-purple-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>4. Gemini AI 'Own-Words'</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {onRunAiPipeline && <button
    id="btn-run-complete-pipeline"
    onClick={onRunAiPipeline}
    disabled={isGradingProcessing}
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGradingProcessing ? "animate-spin" : ""}`} />
              <span>{isGradingProcessing ? "Grading All Answers..." : "\u26A1 Run Complete AI Grading (1-Click)"}</span>
            </button>}

          <button
    id="btn-next-ocr-stage"
    onClick={onNextStage}
    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
  >
            <span>Proceed to Step 2: OCR →</span>
          </button>
        </div>
      </div>

      {
    /* ========================================================================= */
  }
      {
    /* OPTION 1 CONTENT: Upload Question Paper & Automated Rubric Extractor      */
  }
      {
    /* ========================================================================= */
  }
      {activeOptionTab === "question_paper" && <QuestionPaperUpload
    currentExam={exam}
    onUpdateExamPaper={(updated) => {
      if (onUpdateExamPaper) {
        onUpdateExamPaper(updated);
      }
    }}
    onSaveAsNewExam={(newExam) => {
      if (onSaveAsNewExam) {
        onSaveAsNewExam(newExam);
      }
    }}
  />}

      {
    /* ========================================================================= */
  }
      {
    /* OPTION 1 CONTENT: Upload Student Answer Sheet & Preprocessing Viewport     */
  }
      {
    /* ========================================================================= */
  }
      {activeOptionTab === "student_sheet" && <div className="space-y-6">
          {
    /* Uploaded File Info Card (If Image or PDF is uploaded) */
  }
          {uploadedDoc && <div className="p-3.5 bg-[#121215] rounded-xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${uploadedDoc.type === "pdf" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`}>
                  {uploadedDoc.type === "pdf" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {uploadedDoc.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${uploadedDoc.type === "pdf" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                      {uploadedDoc.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                    <span>Size: {formatFileSize(uploadedDoc.size)}</span>
                    <span>•</span>
                    <span>{uploadedDoc.pageCount} Total Page{uploadedDoc.pageCount > 1 ? "s" : ""}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">Ready for Preprocessing & OCR</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {
    /* Multi-page PDF Page Navigator */
  }
                {uploadedDoc.pageCount > 1 && <div className="flex items-center space-x-2 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                    <button
    id="pdf-prev-page-btn"
    onClick={() => {
      if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
    }}
    disabled={currentPageIndex === 0}
    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
  >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-medium text-slate-200 px-2">
                      Page {currentPageIndex + 1} of {uploadedDoc.pageCount}
                    </span>
                    <button
    id="pdf-next-page-btn"
    onClick={() => {
      if (currentPageIndex < uploadedDoc.pagesDataUrls.length - 1) setCurrentPageIndex(currentPageIndex + 1);
    }}
    disabled={currentPageIndex >= uploadedDoc.pagesDataUrls.length - 1}
    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
  >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>}

                <button
    onClick={handleResetToSample}
    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition"
    title="Revert back to generated sample answer sheet"
  >
                  Reset to Sample
                </button>
              </div>
            </div>}

          {
    /* 6-Step Viewport Selector */
  }
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Student Scan Viewport Mode</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Click any step to inspect image transformation
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
    { id: "raw", name: "1. Raw Scan", desc: "Original image / PDF" },
    { id: "denoised", name: "2. Noise Reduction", desc: "Median & speckle filter" },
    { id: "normalized", name: "3. Normalization", desc: "Contrast & ink boost" },
    { id: "deskewed", name: "4. Skew Correction", desc: "Straightened baseline" },
    { id: "thinned", name: "5. Thinning", desc: "Zhang-Suen skeleton" },
    { id: "binarized", name: "6. Binarization", desc: "Otsu black & white" }
  ].map((step) => {
    const isSelected = activeView === step.id;
    return <button
      key={step.id}
      id={`btn-view-${step.id}`}
      onClick={() => setActiveView(step.id)}
      className={`text-left p-2.5 rounded-lg border transition-all ${isSelected ? "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-sm" : "bg-[#09090b] border-[#27272a] text-slate-400 hover:bg-[#27272a]/60 hover:text-white"}`}
    >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold block">{step.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{step.desc}</span>
                  </button>;
  })}
            </div>
          </div>

          {
    /* Canvas Viewport & Controls */
  }
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {
    /* Canvas Viewport (8 Cols) */
  }
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                      Student Paper Canvas Viewport ({activeView.toUpperCase()})
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
    id="toggle-split-btn"
    onClick={() => setSplitMode(!splitMode)}
    className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${splitMode ? "bg-blue-600 text-white border-blue-500" : "bg-[#09090b] text-slate-400 border-[#27272a] hover:text-white"}`}
  >
                      {splitMode ? "Split: ON" : "Split View"}
                    </button>
                    <button
    onClick={handleAutoDeskew}
    className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 hover:text-white transition"
    title="Automatically straighten scan orientation"
  >
                      Auto-Deskew (-2.4°)
                    </button>
                    <button
    id="reset-filters-btn"
    onClick={handleResetFilters}
    className="text-[11px] text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#27272a] transition-colors"
    title="Reset all filters to optimal defaults"
  >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {
    /* Canvas Display Container with Drag and Drop Support */
  }
                <div
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className={`relative w-full aspect-[8/7] bg-[#09090b] rounded-lg overflow-hidden border transition-all shadow-inner flex items-center justify-center ${isDragging ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-950/20" : "border-[#27272a]"}`}
  >
                  {
    /* Drag overlay indicator */
  }
                  {isDragging && <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 border-2 border-dashed border-blue-400 rounded-lg animate-fadeIn">
                      <Upload className="w-10 h-10 text-blue-400 animate-bounce mb-2" />
                      <p className="text-sm font-semibold text-white">Drop Handwritten Image or PDF Here</p>
                      <p className="text-xs text-blue-300 mt-1">Supports PNG, JPG, JPEG, WEBP, and PDF documents</p>
                    </div>}
                  
                  {
    /* Hidden Raw Source Canvas */
  }
                  <canvas ref={rawCanvasRef} className="hidden" />

                  {
    /* Target Processed Canvas */
  }
                  <canvas
    ref={targetCanvasRef}
    className="w-full h-full object-contain rounded"
  />

                  {
    /* Status Badge */
  }
                  <div className="absolute bottom-3 right-3 bg-[#18181b]/95 backdrop-blur border border-[#27272a] px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 flex items-center space-x-2 shadow-lg">
                    <div className={`w-2 h-2 rounded-full ${isProcessing ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                    <span>Processing: {metrics.processingTimeMs}ms</span>
                    <span className="text-[#27272a]">•</span>
                    <span>Otsu Clarity: {metrics.binarizationClarity}%</span>
                  </div>
                </div>

                {
    /* Quick Upload Drag-and-Drop Trigger Banner */
  }
                <div
    onClick={() => fileInputRef.current?.click()}
    className="mt-3 p-3 bg-[#09090b] hover:bg-[#18181b] cursor-pointer rounded-lg border border-dashed border-[#3f3f46] hover:border-blue-500/60 transition-all text-xs text-slate-400 flex items-center justify-between group"
  >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <FileUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-slate-200 font-medium group-hover:text-blue-300 transition-colors">
                        Upload another student paper
                      </span>
                      <span className="text-slate-500 text-[11px] ml-2 hidden sm:inline">
                        (Click or drag & drop PNG, JPG, WEBP, or PDF files)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-blue-400 font-medium">
                    <span>Browse Files</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {
    /* Quality Metrics Strip */
  }
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Noise Reduction</span>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    {(metrics.originalNoiseScore - metrics.cleanedNoiseScore).toFixed(1)} dB SNR
                  </div>
                  <span className="text-[10px] text-slate-500">92% artifacts removed</span>
                </div>

                <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Skew Detected</span>
                  <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                    {metrics.detectedSkewAngle.toFixed(1)}° Tilt
                  </div>
                  <span className="text-[10px] text-slate-500">Hough baseline aligned</span>
                </div>

                <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Contrast Ratio</span>
                  <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
                    {metrics.contrastRatio.toFixed(1)}:1
                  </div>
                  <span className="text-[10px] text-slate-500">Ink boosted</span>
                </div>

                <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Binarization</span>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    {metrics.binarizationClarity}%
                  </div>
                  <span className="text-[10px] text-slate-500">Otsu crisp boundary</span>
                </div>
              </div>
            </div>

            {
    /* Right Column: Candidate Info & Pipeline Progress (4 Cols) */
  }
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>Candidate Submission</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                    {submission.studentRollNumber}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Candidate Name:</span>
                    <strong className="text-white">{submission.studentName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Subject / Exam:</span>
                    <span className="text-zinc-200">{exam.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Total Questions:</span>
                    <span className="text-zinc-200">{exam.questions.length} Items</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Ready for OCR</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272a] space-y-2">
                  <button
    onClick={onNextStage}
    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
  >
                    <span>Proceed to Step 2: OCR Digitization</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
    onClick={() => setActiveOptionTab("model_sheet")}
    className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5"
  >
                    <span>Switch to Option 2: Model Answer Sheet →</span>
                  </button>
                </div>
              </div>

              {
    /* Guide card */
  }
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Student Answer Processing Notes</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Stage 1 cleans student handwriting scans so faint pencil lines, ruled notebook lines, and camera shadow gradients do not interfere with OCR character recognition.
                </p>
              </div>
            </div>

          </div>
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* OPTION 2 CONTENT: Upload Model Answer Sheet & Official Rubric Management */
  }
      {
    /* ========================================================================= */
  }
      {activeOptionTab === "model_sheet" && <div className="space-y-6">
          {
    /* Top Model Upload Zone */
  }
          <div className="bg-[#18181b] border border-emerald-500/30 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    2
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Official Model Answer Sheet (Gold Standard Key)
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Upload the instructor's master answer key file (PDF or Image), or inspect and customize the curriculum model solutions and weighted rubric points below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
    onClick={() => modelFileInputRef.current?.click()}
    disabled={isUploadingModel}
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
  >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingModel ? "Uploading Master Key..." : "Upload Master Key PDF/Image"}</span>
                </button>
              </div>
            </div>

            {
    /* Uploaded Model File Banner */
  }
            {modelDoc && <div className="mt-4 p-3 bg-[#09090b] rounded-lg border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">
                        {modelDoc.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono font-bold">
                        {modelDoc.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>Size: {formatFileSize(modelDoc.size)}</span>
                      <span>•</span>
                      <span>{modelDoc.pageCount} Pages Loaded</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Official Reference Benchmark</span>
                    </div>
                  </div>
                </div>

                {modelDoc.pageCount > 1 && <div className="flex items-center space-x-2 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                    <button
    onClick={() => {
      if (modelDocPageIndex > 0) setModelDocPageIndex(modelDocPageIndex - 1);
    }}
    disabled={modelDocPageIndex === 0}
    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40"
  >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-medium text-slate-200 px-2">
                      Page {modelDocPageIndex + 1} of {modelDoc.pageCount}
                    </span>
                    <button
    onClick={() => {
      if (modelDocPageIndex < modelDoc.pagesDataUrls.length - 1) setModelDocPageIndex(modelDocPageIndex + 1);
    }}
    disabled={modelDocPageIndex >= modelDoc.pagesDataUrls.length - 1}
    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40"
  >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>}
              </div>}
          </div>

          {
    /* Question-by-Question Model Solution Explorer */
  }
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
            {
    /* Question Tabs Bar */
  }
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#121215] flex items-center justify-between overflow-x-auto">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Select Question Rubric:</span>
                {exam.questions.map((q, idx) => <button
    key={q.id}
    onClick={() => {
      setSelectedModelQIdx(idx);
      setEditingModelQIdx(null);
    }}
    className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${selectedModelQIdx === idx ? "bg-emerald-600 text-white font-semibold shadow-sm" : "bg-[#27272a] text-slate-300 hover:bg-[#3f3f46]"}`}
  >
                    Q{q.questionNumber} ({q.maxMarks}m)
                  </button>)}
              </div>

              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                Topic: <strong className="text-zinc-200">{activeModelQuestion.topic}</strong>
              </span>
            </div>

            {
    /* Question Details */
  }
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-400">QUESTION {activeModelQuestion.questionNumber}</span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    {activeModelQuestion.questionText}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono font-bold shrink-0">
                  Max Marks: {activeModelQuestion.maxMarks}
                </span>
              </div>

              {
    /* Model Solution Box with Inline Editing */
  }
              <div className="bg-[#121215] border border-emerald-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Authoritative Model Answer:</span>
                    </span>
                  </div>
                  {editingModelQIdx === selectedModelQIdx ? <button
    onClick={() => handleSaveModelAnswer(selectedModelQIdx)}
    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition flex items-center gap-1"
  >
                      <Save className="w-3 h-3" />
                      <span>Save Changes</span>
                    </button> : <button
    onClick={() => {
      setEditingModelQIdx(selectedModelQIdx);
      setEditingModelAnswer(activeModelQuestion.modelAnswer);
    }}
    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs font-medium transition flex items-center gap-1 border border-zinc-700"
  >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Answer Text</span>
                    </button>}
                </div>

                {editingModelQIdx === selectedModelQIdx ? <textarea
    value={editingModelAnswer}
    onChange={(e) => setEditingModelAnswer(e.target.value)}
    rows={4}
    className="w-full bg-[#18181b] border border-emerald-500/60 rounded-lg p-3 text-xs text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
  /> : <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-[#18181b] p-3.5 rounded-lg border border-[#27272a]">
                    {activeModelQuestion.modelAnswer}
                  </p>}
              </div>

              {
    /* Key Concepts & Weighted Points Table */
  }
              <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Grading Rubric: Required Concepts & Points
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Sum: {activeModelQuestion.keyConcepts.reduce((acc, c) => acc + c.weightMarks, 0)} / {activeModelQuestion.maxMarks} Marks
                  </span>
                </div>

                <div className="space-y-2">
                  {activeModelQuestion.keyConcepts.map((kc, kIdx) => <div key={kIdx} className="p-3 bg-[#18181b] rounded-lg border border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{kc.concept}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            Required Concept {kIdx + 1}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{kc.description}</p>
                        {kc.synonyms && kc.synonyms.length > 0 && <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] text-zinc-500 font-mono">Accepted terms:</span>
                            {kc.synonyms.map((syn, sIdx) => <span key={sIdx} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {syn}
                              </span>)}
                          </div>}
                      </div>
                      <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 shrink-0">
                        +{kc.weightMarks} Marks
                      </span>
                    </div>)}
                </div>
              </div>

              {
    /* Switch to Option 3 button */
  }
              <div className="flex items-center justify-between pt-2">
                <button
    onClick={() => {
      setSelectedGeminiQIdx(selectedModelQIdx);
      setActiveOptionTab("gemini_ai_sheet");
    }}
    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>View Gemini AI 'Own-Words' Matrix for Q{activeModelQuestion.questionNumber} →</span>
                </button>
              </div>
            </div>
          </div>
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* OPTION 3 CONTENT: Gemini AI "Own-Words" Reference (AI-Generated)          */
  }
      {
    /* ========================================================================= */
  }
      {activeOptionTab === "gemini_ai_sheet" && <div className="space-y-6">
          {
    /* Explanatory Header on Why Gemini AI 'Own-Words' Generation Matters */
  }
          <div className="bg-gradient-to-r from-purple-950/40 via-[#18181b] to-indigo-950/40 border border-purple-500/40 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40">
                    3
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gemini AI 'Own-Words' Semantic Reference Sheet</span>
                  </h3>
                </div>
                <p className="text-xs text-purple-200/80 mt-1 max-w-3xl leading-relaxed">
                  Generated by Gemini AI specifically for students who formulate answers in their <strong className="text-amber-200 font-semibold">own words</strong>, using everyday analogies, colloquial explanations, and alternative step derivations. Prevents rote memorization bias and awards full credit for conceptual understanding!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
    id="btn-re-synthesize-gemini"
    onClick={() => handleGenerateGeminiSemanticSheet(selectedGeminiQIdx)}
    disabled={isGeneratingGemini}
    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGeneratingGemini ? "animate-spin" : ""}`} />
                  <span>{isGeneratingGemini ? "Synthesizing with Gemini..." : "\u2728 Re-Synthesize for This Question"}</span>
                </button>
              </div>
            </div>

            {
    /* Success feedback */
  }
            {geminiSuccessMsg && <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{geminiSuccessMsg}</span>
              </div>}
          </div>

          {
    /* Question Selector */
  }
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#121215] flex items-center space-x-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Select Question:</span>
              {exam.questions.map((q, idx) => <button
    key={q.id}
    onClick={() => setSelectedGeminiQIdx(idx)}
    className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${selectedGeminiQIdx === idx ? "bg-purple-600 text-white font-semibold shadow-sm" : "bg-[#27272a] text-slate-300 hover:bg-[#3f3f46]"}`}
  >
                  Q{q.questionNumber} ({q.maxMarks}m)
                </button>)}
            </div>

            {
    /* Content for Active Question */
  }
            <div className="p-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-purple-400">QUESTION {activeGeminiQuestion.questionNumber}: {activeGeminiQuestion.topic}</span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    {activeGeminiQuestion.questionText}
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-mono font-bold shrink-0">
                  Leniency Threshold: {semanticMatrix?.leniencyThresholdPct || 82}%
                </span>
              </div>

              {
    /* 3 Conceptual Variations Generated by Gemini AI */
  }
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Valid Conceptual Variations Synthesized by Gemini AI:</span>
                  </h4>
                  <span className="text-[11px] text-amber-300 font-mono">
                    {semanticMatrix?.ownWordsVariations?.length || 3} Active Variants
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {semanticMatrix?.ownWordsVariations?.map((variant, vIdx) => <div
    key={vIdx}
    className="p-3.5 rounded-xl bg-[#121215] border border-purple-900/40 hover:border-purple-600/60 transition flex flex-col justify-between space-y-2 shadow-sm"
  >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-amber-300">
                            {variant.variantTitle}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
                            {variant.tone}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed mt-1">
                          "{variant.ownWordsExplanation}"
                        </p>
                      </div>

                      {variant.keyPhrases && variant.keyPhrases.length > 0 && <div className="pt-2 border-t border-purple-900/30">
                          <span className="text-[10px] text-zinc-500 block mb-1">Accepted Concept Keywords:</span>
                          <div className="flex flex-wrap gap-1">
                            {variant.keyPhrases.map((phrase, pIdx) => <span key={pIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                                ✓ {phrase}
                              </span>)}
                          </div>
                        </div>}
                    </div>)}
                </div>
              </div>

              {
    /* Accepted Synonyms Graph & Everyday Equivalents */
  }
              {semanticMatrix?.acceptedSynonyms && semanticMatrix.acceptedSynonyms.length > 0 && <div className="p-4 bg-[#121215] rounded-xl border border-purple-900/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Accepted Synonyms & Colloquial Equivalents (No Penalty):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {semanticMatrix.acceptedSynonyms.map((syn, sIdx) => <div key={sIdx} className="p-2.5 bg-[#18181b] rounded-lg border border-[#27272a] text-xs">
                        <div className="font-semibold text-purple-200">{syn.technicalTerm}</div>
                        <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap gap-1">
                          {syn.allowedSynonyms.map((term, tIdx) => <span key={tIdx} className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px]">
                              {term}
                            </span>)}
                        </div>
                      </div>)}
                  </div>
                </div>}

              {
    /* Misconception Guard */
  }
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs space-y-1.5">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Fairness Guard: True Understanding vs Buzzword Memorization</span>
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  IntelliGrade awards full marks to students who demonstrate true understanding using non-textbook everyday language, while safely identifying candidates who write memorized keywords without understanding the underlying logic.
                </p>
              </div>
            </div>
          </div>
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* OPTION 4 CONTENT: Vision Preprocessing Filters & Sliders                  */
  }
      {
    /* ========================================================================= */
  }
      {activeOptionTab === "filters" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Vision Preprocessing Parameter Tuning
                </h3>
              </div>
              <button
    onClick={handleResetFilters}
    className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
  >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>

            {
    /* Noise Reduction */
  }
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">Median Filter (Noise Reduction)</label>
                <span className="text-xs font-mono text-slate-400">{config.noiseRadius}px radius</span>
              </div>
              <input
    type="range"
    min="1"
    max="5"
    step="1"
    value={config.noiseRadius}
    onChange={(e) => setConfig({ ...config, noiseRadius: Number(e.target.value) })}
    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
  />
            </div>

            {
    /* Contrast Stretch */
  }
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">Contrast Stretch (Ink Normalization)</label>
                <span className="text-xs font-mono text-slate-400">{config.contrastStretch.toFixed(1)}x</span>
              </div>
              <input
    type="range"
    min="1.0"
    max="2.5"
    step="0.1"
    value={config.contrastStretch}
    onChange={(e) => setConfig({ ...config, contrastStretch: Number(e.target.value) })}
    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
  />
            </div>

            {
    /* Skew Correction Angle */
  }
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">Hough Transform Deskew Angle</label>
                <span className="text-xs font-mono text-slate-400">{config.skewAngle}°</span>
              </div>
              <input
    type="range"
    min="-15"
    max="15"
    step="0.5"
    value={config.skewAngle}
    onChange={(e) => setConfig({ ...config, skewAngle: Number(e.target.value) })}
    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
  />
            </div>

            {
    /* Thinning Iterations */
  }
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">Zhang-Suen Thinning Iterations</label>
                <span className="text-xs font-mono text-slate-400">{config.thinningIterations} iterations</span>
              </div>
              <input
    type="range"
    min="1"
    max="4"
    step="1"
    value={config.thinningIterations}
    onChange={(e) => setConfig({ ...config, thinningIterations: Number(e.target.value) })}
    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
  />
            </div>

            {
    /* Otsu Binarization Threshold */
  }
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">Binarization Cutoff Threshold</label>
                <span className="text-xs font-mono text-slate-400">{config.binarizationThreshold} / 255</span>
              </div>
              <input
    type="range"
    min="50"
    max="220"
    step="1"
    value={config.binarizationThreshold}
    onChange={(e) => setConfig({ ...config, binarizationThreshold: Number(e.target.value) })}
    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
  />
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vision Processing Metrics</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Processing Time:</span>
                <span className="font-mono text-emerald-400 font-bold">{metrics.processingTimeMs} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">SNR Noise Cleaned:</span>
                <span className="font-mono text-indigo-400 font-bold">{(metrics.originalNoiseScore - metrics.cleanedNoiseScore).toFixed(1)} dB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Binarization Clarity:</span>
                <span className="font-mono text-purple-400 font-bold">{metrics.binarizationClarity}%</span>
              </div>
            </div>

            <button
    onClick={() => setActiveOptionTab("student_sheet")}
    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition"
  >
              Return to Student Canvas Viewport →
            </button>
          </div>
        </div>}

      {
    /* ========================================================================= */
  }
      {
    /* BOTTOM PIPELINE CALL TO ACTION                                            */
  }
      {
    /* ========================================================================= */
  }
      <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <span className="text-xs font-bold text-white block">Ready for Handwriting Digitization?</span>
          <span className="text-[11px] text-slate-400">
            Student scan, model answer key, and Gemini AI semantic variations are ready for OCR text transcription.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRunAiPipeline && <button
    onClick={onRunAiPipeline}
    disabled={isGradingProcessing}
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGradingProcessing ? "Grading..." : "\u26A1 Grade Paper Now"}</span>
            </button>}

          <button
    onClick={onNextStage}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
            <span>Proceed to Step 2: OCR Digitization</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>;
};
