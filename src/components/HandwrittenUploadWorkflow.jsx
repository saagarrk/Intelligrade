import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileUp,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Trash2,
  Plus,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  GraduationCap,
  Sparkles,
  Check,
  Lock,
  ExternalLink,
  BookOpen
} from "lucide-react";
import {
  validateUploadFiles,
  processMultipleFilesToPages,
  rotatePageDataUrl
} from "../utils/fileUploadHelper";
import { HandwrittenPipelineView } from "./HandwrittenPipelineView";
import { showSweetToast } from "../utils/sweetAlert";

// Status configuration for all 6 required submission statuses
export const SUBMISSION_STATUS_CONFIG = {
  UPLOADED: {
    label: "UPLOADED",
    description: "Answer sheet securely received and stored. Awaiting processing.",
    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    badgeDot: "bg-sky-400",
    step: 1
  },
  PROCESSING: {
    label: "PROCESSING",
    description: "Scan preprocessing, noise cleaning, or OCR digitization in progress.",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    badgeDot: "bg-amber-400 animate-pulse",
    step: 2
  },
  EVALUATED: {
    label: "EVALUATED",
    description: "AI Tri-Sheet rubric evaluation completed. Ready for review.",
    color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    badgeDot: "bg-indigo-400",
    step: 3
  },
  UNDER_REVIEW: {
    label: "UNDER_REVIEW",
    description: "Paper under faculty moderation, teacher override, or student appeal.",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    badgeDot: "bg-orange-400",
    step: 4
  },
  COMPLETED: {
    label: "COMPLETED",
    description: "Finalized evaluation verified. Official grades and scorecard published.",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badgeDot: "bg-emerald-400",
    step: 5
  },
  FAILED: {
    label: "FAILED",
    description: "Submission corrupt, unreadable handwriting, or pipeline exception.",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    badgeDot: "bg-rose-400",
    step: 0
  },
  // Backward compatibility mappings
  Graded: {
    label: "COMPLETED",
    description: "Evaluation complete and scorecard available.",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    badgeDot: "bg-emerald-400",
    step: 5
  },
  "Under Review": {
    label: "UNDER_REVIEW",
    description: "Under instructor or appeal review.",
    color: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    badgeDot: "bg-orange-400",
    step: 4
  },
  Flagged: {
    label: "UNDER_REVIEW",
    description: "Flagged for teacher inspection.",
    color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    badgeDot: "bg-rose-400",
    step: 4
  }
};

export const StatusBadge = ({ status, size = "md", showDescription = false }) => {
  const config = SUBMISSION_STATUS_CONFIG[status] || SUBMISSION_STATUS_CONFIG.UPLOADED;
  const isSm = size === "sm";

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${config.color} ${
          isSm ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.badgeDot}`} />
        {config.label}
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-400 mt-1 max-w-xs">{config.description}</span>
      )}
    </div>
  );
};

export const HandwrittenUploadWorkflow = ({
  exams = [],
  selectedExamId,
  user,
  onSubmissionComplete,
  onViewSubmission,
  onNavigateStage
}) => {
  // Target Exam Selection
  const [currentExamId, setCurrentExamId] = useState(selectedExamId || exams[0]?.id || "");
  const currentExam = exams.find((e) => e.id === currentExamId) || exams[0] || {};

  // Student Identity Fields
  const [studentRoll, setStudentRoll] = useState(user?.rollNumber || "CS-2026-041");
  const [studentName, setStudentName] = useState(user?.name || "Aarav Sharma");

  // Multi-page state
  const [pages, setPages] = useState([]);
  const [primaryFileName, setPrimaryFileName] = useState("");
  const [fileFormat, setFileFormat] = useState("pdf");
  const [totalFileSizeBytes, setTotalFileSizeBytes] = useState(0);

  // Drag-and-drop & UI state
  const [dragActive, setDragActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionMessage, setExtractionMessage] = useState("");

  // Preview Modal
  const [previewPageIndex, setPreviewPageIndex] = useState(null);

  // Duplicate Submission Protection
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [allowOverwrite, setAllowOverwrite] = useState(false);

  // Submission Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCheck1, setConfirmCheck1] = useState(false);
  const [confirmCheck2, setConfirmCheck2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStageMessage, setUploadStageMessage] = useState("");

  // Completed Submission State
  const [submittedResult, setSubmittedResult] = useState(null);

  const fileInputRef = useRef(null);
  const appendFileInputRef = useRef(null);

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Sync user info if auth changes
  useEffect(() => {
    if (user?.rollNumber) setStudentRoll(user.rollNumber);
    if (user?.name) setStudentName(user.name);
  }, [user]);

  // Sync selected exam id if prop changes
  useEffect(() => {
    if (selectedExamId) setCurrentExamId(selectedExamId);
  }, [selectedExamId]);

  // Check for duplicate submission whenever exam or roll number changes
  useEffect(() => {
    let isMounted = true;

    async function checkDuplicate() {
      if (!currentExamId || !studentRoll?.trim()) {
        setExistingSubmission(null);
        return;
      }

      try {
        setDuplicateCheckLoading(true);
        const authToken = localStorage.getItem("intelligrade_auth_token");
        const res = await fetch(
          `/api/v1/submissions/check-duplicate?examId=${encodeURIComponent(
            currentExamId
          )}&studentRollNumber=${encodeURIComponent(studentRoll.trim())}`,
          {
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.hasDuplicate && data.existingSubmission) {
              setExistingSubmission(data.existingSubmission);
            } else {
              setExistingSubmission(null);
            }
          }
        }
      } catch (err) {
        console.warn("Duplicate check network fallback:", err);
      } finally {
        if (isMounted) setDuplicateCheckLoading(false);
      }
    }

    const timer = setTimeout(checkDuplicate, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentExamId, studentRoll]);

  // Handle incoming files (from drop or file picker)
  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);

    // 1. File and Size Validation
    const validation = validateUploadFiles(filesArray);
    if (!validation.valid) {
      showSweetToast(validation.errors[0], "error");
      return;
    }

    if (validation.warnings.length > 0) {
      showSweetToast(validation.warnings[0], "info");
    }

    setIsExtracting(true);
    setExtractionProgress(10);
    setExtractionMessage("Validating file signatures & structure...");

    try {
      const result = await processMultipleFilesToPages(filesArray, (pct, msg) => {
        setExtractionProgress(pct);
        setExtractionMessage(msg);
      });

      setPages(result.pages);
      setPrimaryFileName(result.primaryFileName);
      setFileFormat(result.fileFormat);
      setTotalFileSizeBytes(result.totalBytes);

      setExtractionProgress(100);
      setExtractionMessage("Pages ready for review & reordering.");
      showSweetToast(`Extracted ${result.pages.length} page(s) successfully.`, "success");
    } catch (err) {
      console.error("Error processing upload files:", err);
      showSweetToast("Failed to process files. Please verify format and retry.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle appending additional files/pages to current list
  const handleAppendFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);

    const validation = validateUploadFiles(filesArray);
    if (!validation.valid) {
      showSweetToast(validation.errors[0], "error");
      return;
    }

    setIsExtracting(true);
    try {
      const result = await processMultipleFilesToPages(filesArray);
      
      setPages((prevPages) => {
        const startNumber = prevPages.length + 1;
        const renumberedAppended = result.pages.map((p, idx) => ({
          ...p,
          pageNumber: startNumber + idx
        }));
        return [...prevPages, ...renumberedAppended];
      });

      setTotalFileSizeBytes((prev) => prev + result.totalBytes);
      showSweetToast(`Added ${result.pages.length} additional page(s).`, "success");
    } catch (err) {
      console.error("Error appending files:", err);
      showSweetToast("Could not append pages.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Page Management: Move Page Left / Up
  const handleMovePageLeft = (index) => {
    if (index <= 0) return;
    const newPages = [...pages];
    const temp = newPages[index - 1];
    newPages[index - 1] = newPages[index];
    newPages[index] = temp;

    // Renumber pages sequentially
    const renumbered = newPages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    setPages(renumbered);
  };

  // Page Management: Move Page Right / Down
  const handleMovePageRight = (index) => {
    if (index >= pages.length - 1) return;
    const newPages = [...pages];
    const temp = newPages[index + 1];
    newPages[index + 1] = newPages[index];
    newPages[index] = temp;

    const renumbered = newPages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    setPages(renumbered);
  };

  // Page Management: Remove Page
  const handleRemovePage = (index) => {
    const updated = pages.filter((_, idx) => idx !== index);
    const renumbered = updated.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1
    }));
    setPages(renumbered);
    showSweetToast(`Page ${index + 1} removed.`, "info");
  };

  // Page Management: Rotate Page 90 deg Clockwise
  const handleRotatePage = async (index) => {
    const targetPage = pages[index];
    const nextRotation = ((targetPage.rotation || 0) + 90) % 360;

    try {
      const rotatedDataUrl = await rotatePageDataUrl(targetPage.dataUrl, 90);
      const updated = [...pages];
      updated[index] = {
        ...targetPage,
        dataUrl: rotatedDataUrl,
        rotation: nextRotation
      };
      setPages(updated);
      showSweetToast(`Rotated page ${index + 1} to ${nextRotation}°`, "success");
    } catch (err) {
      console.error("Rotate page failed:", err);
      showSweetToast("Could not rotate image.", "error");
    }
  };

  // Load Built-in Realistic Multi-Page Sample
  const handleLoadSampleSheet = () => {
    setIsExtracting(true);
    setExtractionProgress(30);
    setExtractionMessage("Generating realistic 3-page academic exam script...");

    // Create 3 realistic ruled pages using Canvas
    setTimeout(() => {
      const samplePages = [1, 2, 3].map((num) => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 1050;
        const ctx = canvas.getContext("2d");

        // Paper background
        ctx.fillStyle = "#fafafa";
        ctx.fillRect(0, 0, 800, 1050);

        // Ruled lines
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        for (let y = 100; y < 1000; y += 28) {
          ctx.beginPath();
          ctx.moveTo(50, y);
          ctx.lineTo(750, y);
          ctx.stroke();
        }

        // Left margin
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(110, 50);
        ctx.lineTo(110, 1000);
        ctx.stroke();

        // Header
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 15px sans-serif";
        ctx.fillText(
          `${currentExam.courseCode || "CS-301"}: ${currentExam.title || "Academic Examination"}`,
          130,
          75
        );
        ctx.fillStyle = "#64748b";
        ctx.font = "12px sans-serif";
        ctx.fillText(
          `Candidate: ${studentName} (${studentRoll}) • Sheet Page ${num} of 3`,
          130,
          95
        );

        // Handwritten answers
        ctx.fillStyle = "#1e1b4b";
        ctx.font = 'italic 16px "Caveat", "Segoe Print", cursive, sans-serif';

        if (num === 1) {
          ctx.fillText("Q1. Explain the OSI Model and its layers.", 130, 140);
          ctx.fillText("Ans 1: The Open Systems Interconnection (OSI) model is a conceptual", 130, 196);
          ctx.fillText("framework by ISO that standardizes network telecommunications into 7 layers.", 130, 224);
          ctx.fillText("1. Physical Layer: Transmits raw bit streams over physical media (cables, RF).", 130, 280);
          ctx.fillText("2. Data Link Layer: Frame packaging, MAC addressing, and error detection (CRC).", 130, 336);
          ctx.fillText("3. Network Layer: Logical IP addressing, packet routing across subnetworks.", 130, 392);
          ctx.fillText("4. Transport Layer: End-to-end reliability via TCP segmentation or UDP datagrams.", 130, 448);
          ctx.fillText("5. Session Layer: Establishes, manages, and terminates conversational sessions.", 130, 504);
          ctx.fillText("6. Presentation Layer: Syntax translation, TLS/SSL encryption, data compression.", 130, 560);
          ctx.fillText("7. Application Layer: End-user protocols like HTTP/HTTPS, DNS, and SMTP.", 130, 616);
          ctx.fillText("Example: Accessing https://intelligrade.edu initiates HTTP at Application Layer,", 130, 672);
          ctx.fillText("segments via TCP Port 443 at Transport, and encapsulates into IP packets.", 130, 700);
        } else if (num === 2) {
          ctx.fillText("Q2. Mutual Exclusion and Semaphore Mechanisms.", 130, 140);
          ctx.fillText("Ans 2: Mutual exclusion ensures no two concurrent threads reside in critical section.", 130, 196);
          ctx.fillText("A Counting Semaphore S maintains an integer value with atomic operations:", 130, 252);
          ctx.fillText("wait(S) [P]: while(S <= 0); S = S - 1;", 130, 308);
          ctx.fillText("signal(S) [V]: S = S + 1; // wakes blocked thread", 130, 364);
          ctx.fillText("Binary semaphore initialized to 1 operates as a Mutex lock.", 130, 420);
          ctx.fillText("It satisfies: 1. Mutual Exclusion  2. Progress  3. Bounded Waiting.", 130, 476);
        } else {
          ctx.fillText("Q3. Demand Paging and Page Fault Handling.", 130, 140);
          ctx.fillText("Ans 3: Virtual memory uses demand paging to load frames only when referenced.", 130, 196);
          ctx.fillText("Page Fault Sequence:", 130, 252);
          ctx.fillText("Step 1: CPU MMU checks valid/invalid bit in Page Table.", 130, 308);
          ctx.fillText("Step 2: If invalid, OS triggers page-fault trap interrupt.", 130, 364);
          ctx.fillText("Step 3: OS finds free physical frame in RAM.", 130, 420);
          ctx.fillText("Step 4: Disk I/O fetches page from swap space backing store.", 130, 476);
          ctx.fillText("Step 5: OS updates Page Table valid bit and restarts faulted instruction.", 130, 532);
        }

        return {
          id: `sample_pg_${num}_${Date.now()}`,
          pageNumber: num,
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          rotation: 0,
          fileName: `handwritten_answers_p${num}.jpg`,
          fileSize: 345000
        };
      });

      setPages(samplePages);
      setPrimaryFileName("handwritten_exam_script.pdf");
      setFileFormat("pdf");
      setTotalFileSizeBytes(samplePages.length * 345000);

      setIsExtracting(false);
      showSweetToast("Loaded 3-page handwritten academic answer script.", "success");
    }, 450);
  };

  // Open Submission Confirmation Modal
  const handleOpenConfirmModal = () => {
    if (pages.length === 0) {
      showSweetToast("Please upload or add at least one answer-sheet page.", "error");
      return;
    }
    if (!studentRoll.trim()) {
      showSweetToast("Student Roll Number is required.", "error");
      return;
    }
    if (!currentExamId) {
      showSweetToast("Please select a target examination.", "error");
      return;
    }

    // Check duplicate protection warning
    if (existingSubmission && !allowOverwrite) {
      showSweetToast(
        "A submission already exists for this exam. Please acknowledge overwrite to continue.",
        "warning"
      );
    }

    setConfirmCheck1(false);
    setConfirmCheck2(false);
    setShowConfirmModal(true);
  };

  // Final Dispatch: Send to Backend API
  const handleExecuteSubmission = async () => {
    if (!confirmCheck1 || !confirmCheck2) {
      showSweetToast("Please verify all verification checkboxes before proceeding.", "warning");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);
    setUploadStageMessage("Verifying file signatures & student credential lock...");

    try {
      // Step 1: Simulated progress stages
      setTimeout(() => {
        setUploadProgress(40);
        setUploadStageMessage("Encrypting payload and raster pages...");
      }, 300);

      setTimeout(() => {
        setUploadProgress(70);
        setUploadStageMessage("Transmitting to secure in-memory file vault...");
      }, 600);

      const payload = {
        examId: currentExamId,
        studentName: studentName.trim(),
        studentRollNumber: studentRoll.trim(),
        originalFileName: primaryFileName || "student_answer_sheet.pdf",
        fileFormat,
        fileSizeBytes: totalFileSizeBytes,
        pages: pages.map((p) => ({
          pageNumber: p.pageNumber,
          dataUrl: p.dataUrl,
          rotation: p.rotation || 0,
          fileName: p.fileName,
          fileSize: p.fileSize
        })),
        allowOverwrite
      };

      const authToken = localStorage.getItem("intelligrade_auth_token");
      const res = await fetch("/api/v1/submissions/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      setUploadProgress(95);
      setUploadStageMessage("Generating opaque file tokens & audit receipts...");

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.code === "DUPLICATE_SUBMISSION") {
          setExistingSubmission(data.existingSubmission);
          throw new Error(data.error || "Duplicate submission detected for this exam.");
        }
        throw new Error(data.error || "Failed to upload answer sheet.");
      }

      setUploadProgress(100);
      setUploadStageMessage("Answer sheet uploaded securely with status UPLOADED.");

      setSubmittedResult(data.submission);
      setShowConfirmModal(false);
      showSweetToast(
        `Answer sheet submitted successfully! Status: UPLOADED (${pages.length} Pages)`,
        "success"
      );

      if (onSubmissionComplete) {
        onSubmissionComplete(data.submission);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      showSweetToast(err.message || "Upload failed. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset workflow to upload another sheet
  const handleResetWorkflow = () => {
    setPages([]);
    setPrimaryFileName("");
    setTotalFileSizeBytes(0);
    setSubmittedResult(null);
    setAllowOverwrite(false);
    setExistingSubmission(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Workflow Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Handwritten Answer-Sheet Submission
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Upload scanned multi-page handwritten test scripts in PDF, JPG, or PNG formats.
                Reorder or rotate pages, preview high-res sheets, and submit with full duplicate protection.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSampleSheet}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Load Sample 3-Page Script
            </button>
            {pages.length > 0 && (
              <button
                type="button"
                onClick={handleResetWorkflow}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submission Status Timeline Pill Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {["UPLOADED", "PROCESSING", "EVALUATED", "UNDER_REVIEW", "COMPLETED", "FAILED"].map(
          (st) => {
            const cfg = SUBMISSION_STATUS_CONFIG[st];
            const isCurrent = submittedResult?.status === st;
            return (
              <div
                key={st}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-2 h-2 rounded-full ${cfg.badgeDot}`} />
                  <span className="text-[10px] font-mono text-slate-400">Step {cfg.step || "-"}</span>
                </div>
                <p className="text-xs font-bold text-white mt-1.5">{cfg.label}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{cfg.description}</p>
              </div>
            );
          }
        )}
      </div>

      {/* Step 1: Target Exam & Student Roll Configuration Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Examination & Candidate Verification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Examination */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Examination Paper <span className="text-rose-400">*</span>
            </label>
            <select
              value={currentExamId}
              onChange={(e) => setCurrentExamId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.courseCode ? `[${ex.courseCode}] ` : ""}
                  {ex.title} ({ex.totalMarks} Marks)
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Subject: {currentExam.subject || "Academic"} • {currentExam.questions?.length || 0} Questions
            </span>
          </div>

          {/* Student Roll Number */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Student Roll Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                placeholder="e.g. CS-2026-041"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
              />
              {duplicateCheckLoading && (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin absolute right-3 top-3" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Unique institutional ID for submission ledger and scorecard binding.
            </span>
          </div>

          {/* Student Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Candidate Full Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Verified against enrolled cohort roster.
            </span>
          </div>
        </div>

        {/* Duplicate Submission Warning Alert */}
        {existingSubmission && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-amber-300">
                  Existing Submission Detected for Roll Number {studentRoll}
                </p>
                <StatusBadge status={existingSubmission.status} size="sm" />
              </div>
              <p className="text-slate-300 mt-1">
                A prior answer sheet was already submitted on{" "}
                <strong className="text-white">{existingSubmission.submissionDate}</strong> containing{" "}
                <strong className="text-white">{existingSubmission.pageCount} page(s)</strong>.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowOverwrite}
                    onChange={(e) => setAllowOverwrite(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-amber-500/40 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-amber-200 font-semibold">
                    I acknowledge and confirm overwriting my previous submission with new sheets
                  </span>
                </label>
                {onViewSubmission && (
                  <button
                    type="button"
                    onClick={() => onViewSubmission(existingSubmission.id)}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer ml-auto"
                  >
                    View Existing Submission <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Upload Zone Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Upload Answer Sheet (PDF, JPG, PNG)
            </h2>
          </div>
          <span className="text-xs text-slate-400">Max 25 MB per file • Max 50 MB total</span>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.005]"
              : "border-slate-700/80 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white">
              Drag & Drop your Handwritten Answer Sheets here
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Supports <strong className="text-indigo-300 font-mono">.PDF</strong>,{" "}
              <strong className="text-indigo-300 font-mono">.JPG/.JPEG</strong>, and{" "}
              <strong className="text-indigo-300 font-mono">.PNG</strong> formats. Multi-page files
              or multiple single-page images are automatically assembled.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 transition-colors">
                <FileUp className="w-3.5 h-3.5" />
                Browse Files from Device
              </span>
              <span className="text-xs text-slate-500 font-medium">or drop files directly</span>
            </div>

            {/* Supported file badge chips */}
            <div className="flex items-center gap-2 mt-5">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                PDF
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                JPG / JPEG
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                PNG
              </span>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Multiple Pages
              </span>
            </div>
          </div>
        </div>

        {/* Extraction Progress Indicator */}
        {isExtracting && (
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {extractionMessage || "Extracting pages from document..."}
              </span>
              <span className="font-mono font-bold text-white">{extractionProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Page Review, Reordering & Management */}
      {pages.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Page Preview, Reordering & Arrangement
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Total: <strong className="text-white">{pages.length} Pages</strong> • Total Size:{" "}
                <strong className="text-white">{formatFileSize(totalFileSizeBytes)}</strong> • Primary
                Source: <strong className="text-indigo-300">{primaryFileName}</strong>
              </p>
            </div>

            {/* Actions: Add More Pages */}
            <div className="flex items-center gap-2">
              <input
                ref={appendFileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleAppendFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => appendFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More Pages
              </button>
            </div>
          </div>

          {/* Grid of Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id || `pg_${idx}`}
                className="group relative rounded-xl bg-slate-800/70 border border-slate-700 overflow-hidden flex flex-col transition-all hover:border-indigo-500/50 hover:shadow-md"
              >
                {/* Page Card Header */}
                <div className="p-2.5 bg-slate-800 flex items-center justify-between border-b border-slate-700/80">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Page {page.pageNumber} of {pages.length}
                  </span>
                  {page.rotation > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {page.rotation}°
                    </span>
                  )}
                </div>

                {/* Page Thumbnail Image */}
                <div
                  onClick={() => setPreviewPageIndex(idx)}
                  className="relative aspect-[3/4] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
                      <Eye className="w-3.5 h-3.5" /> Fullscreen View
                    </span>
                  </div>
                </div>

                {/* Page Controls Toolbar */}
                <div className="p-2 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between gap-1">
                  {/* Reordering Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePageLeft(idx)}
                      title="Move Page Left / Earlier"
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === pages.length - 1}
                      onClick={() => handleMovePageRight(idx)}
                      title="Move Page Right / Later"
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rotate & Delete Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRotatePage(idx)}
                      title="Rotate Page 90° Clockwise"
                      className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePage(idx)}
                      title="Remove this page"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submission Pre-flight Summary Card */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Ready to submit {pages.length} verified page(s) for {studentRoll}
                </p>
                <p className="text-[11px] text-slate-400">
                  Target Exam: {currentExam.title} ({currentExam.courseCode || "EXAM"})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenConfirmModal}
              disabled={existingSubmission && !allowOverwrite}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              Proceed to Confirmation & Submit
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Submission Verification & Lock</h3>
                  <p className="text-[11px] text-slate-400">Review details before sending to vault</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Metadata Table */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Examination Paper:</span>
                <span className="font-bold text-white text-right max-w-xs truncate">
                  {currentExam.title}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Student Roll Number:</span>
                <span className="font-mono font-bold text-indigo-300">{studentRoll}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Candidate Name:</span>
                <span className="font-semibold text-white">{studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/50">
                <span className="text-slate-400">Total Pages Attached:</span>
                <span className="font-bold text-emerald-400">{pages.length} Pages</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Initial Submission Status:</span>
                <StatusBadge status="UPLOADED" size="sm" />
              </div>
            </div>

            {/* Student Verification Checklist */}
            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmCheck1}
                  onChange={(e) => setConfirmCheck1(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-sm border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">
                  I confirm that all handwritten answers are clearly legible and correspond to this examination.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmCheck2}
                  onChange={(e) => setConfirmCheck2(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-sm border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-300">
                  I have verified that all pages are organized sequentially from first to last page.
                </span>
              </label>
            </div>

            {/* Live Upload Progress */}
            {isSubmitting && (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-300 font-semibold">{uploadStageMessage}</span>
                  <span className="font-mono font-bold text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmCheck1 || !confirmCheck2 || isSubmitting}
                onClick={handleExecuteSubmission}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Submitting Answer Sheet...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm & Dispatch Submission
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Success State Card */}
      {submittedResult && (
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 shadow-md space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Answer Sheet Uploaded Successfully!</h3>
                <p className="text-xs text-emerald-300">
                  Submission ID: <strong className="font-mono">{submittedResult.id}</strong>
                </p>
              </div>
            </div>

            <StatusBadge status={submittedResult.status || "UPLOADED"} size="lg" showDescription />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block">Candidate Roll No</span>
              <span className="font-mono font-bold text-white mt-1 block">
                {submittedResult.studentRollNumber}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block">Submitted Pages</span>
              <span className="font-bold text-white mt-1 block">
                {submittedResult.pageCount || submittedResult.pages?.length || 1} Pages
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block">Timestamp</span>
              <span className="font-mono text-slate-300 mt-1 block">
                {submittedResult.submissionDate}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block">Storage Vault</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> Secure Vault Token
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onNavigateStage && (
              <button
                type="button"
                onClick={() => onNavigateStage("preprocessing")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Open Scan Preprocessing Pipeline
              </button>
            )}
            {onViewSubmission && (
              <button
                type="button"
                onClick={() => onViewSubmission(submittedResult.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all cursor-pointer"
              >
                View Submission Scorecard
              </button>
            )}
            <button
              type="button"
              onClick={handleResetWorkflow}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 ml-auto cursor-pointer"
            >
              Upload Another Answer Sheet
            </button>
          </div>

          {/* Structured 7-Stage Pipeline Workflow & Execution Panel */}
          <div className="pt-4 border-t border-slate-800/80">
            <HandwrittenPipelineView
              submission={submittedResult}
              exam={currentExam}
              onPipelineUpdated={(updatedSub) => {
                setSubmittedResult(updatedSub);
                if (onSubmissionComplete) {
                  onSubmissionComplete(updatedSub);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Fullscreen Page Preview Modal */}
      {previewPageIndex !== null && pages[previewPageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Page {previewPageIndex + 1} of {pages.length}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {pages[previewPageIndex].fileName || primaryFileName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={previewPageIndex === 0}
                onClick={() => setPreviewPageIndex((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={previewPageIndex === pages.length - 1}
                onClick={() => setPreviewPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewPageIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 ml-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={pages[previewPageIndex].dataUrl}
              alt={`Page ${previewPageIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HandwrittenUploadWorkflow;
