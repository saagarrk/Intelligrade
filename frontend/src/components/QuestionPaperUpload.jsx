import { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Award,
  Save,
  Code,
  Play
} from "lucide-react";
import { processUploadedFile, extractQuestionsFromText } from "../utils/fileUploadHelper";
import { showSweetToast } from "../utils/sweetAlert";
import { AutomatedTestingSuite } from "./AutomatedTestingSuite";
const SAMPLE_PRESETS = [
  {
    title: "Operating Systems & Concurrency Midterm",
    subject: "Computer Science",
    courseCode: "CS-301",
    gradeLevel: "Undergraduate",
    durationMinutes: 90,
    totalMarks: 30,
    rawText: `MIDTERM EXAMINATION: CS-301 OPERATING SYSTEMS & CONCURRENCY
Time Allowed: 90 Minutes | Maximum Marks: 30
Instructions: Answer all questions. Concise technical precision is required.

Q1. Explain the concept of Mutual Exclusion and describe how Semaphores solve the Critical Section Problem with wait() and signal() primitives. [10 Marks]
Q2. Describe the working mechanism of Demand Paging and Page Fault handling in virtual memory management. [10 Marks]
Q3. Explain the Banker Algorithm for Deadlock Avoidance. State the necessary data structures: Available, Max, Allocation, and Need matrices. [10 Marks]`
  },
  {
    title: "Data Structures & Algorithms Final Paper",
    subject: "Computer Science",
    courseCode: "CS-204",
    gradeLevel: "Undergraduate",
    durationMinutes: 120,
    totalMarks: 35,
    rawText: `FINAL EXAMINATION: CS-204 DATA STRUCTURES & ALGORITHMS
Time: 120 Minutes | Total Marks: 35
Instructions: Provide asymptotic notation and algorithm invariants where required.

Q1. Contrast average and worst-case search complexity in an AVL Self-Balancing Tree versus an Unbalanced Binary Search Tree. [10 Marks]
Q2. Describe the Bellman-Ford Shortest Path algorithm. Explain how it detects negative weight cycles unlike Dijkstra algorithm. [15 Marks]
Q3. Explain the properties of Hash Tables with Open Addressing versus Chaining for collision resolution. [10 Marks]`
  },
  {
    title: "Digital Systems & Computer Architecture",
    subject: "Electrical & Computer Engineering",
    courseCode: "EE-102",
    gradeLevel: "Freshman / Sophomore",
    durationMinutes: 60,
    totalMarks: 25,
    rawText: `SEMESTER EXAMINATION: EE-102 DIGITAL SYSTEMS
Time: 60 Minutes | Total Marks: 25
Instructions: Show circuit truth tables and state transition steps.

Q1. Explain the operation of a Master-Slave D Flip-Flop and how it eliminates race conditions. [10 Marks]
Q2. Explain the use of Karnaugh Maps (K-Maps) in minimizing 4-variable boolean expressions. [15 Marks]`
  }
];
export const QuestionPaperUpload = ({
  currentExam,
  onUpdateExamPaper,
  onSaveAsNewExam
}) => {
  const [activeTab, setActiveTab] = useState("upload_file");
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState(SAMPLE_PRESETS[0].rawText);
  const [parsedExam, setParsedExam] = useState(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const doc = await processUploadedFile(file);
      setUploadedDoc(doc);
      setCurrentPageIndex(0);
      showSweetToast(`Question paper "${doc.name}" uploaded (${doc.pageCount} page${doc.pageCount > 1 ? "s" : ""})!`, "success");
      await runGeminiParser(doc.extractedText || `Exam paper document ${doc.name}`, doc.name, doc);
    } catch (err) {
      console.error("Question paper upload failed:", err);
      setErrorMsg(err?.message || "Failed to process file. Please upload a valid PDF or image file.");
      showSweetToast("File upload failed. Please verify format.", "error");
    } finally {
      setIsUploading(false);
    }
  };
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };
  const runGeminiParser = async (textToParse, examNameHint, documentAttachment) => {
    setIsParsing(true);
    setErrorMsg(null);
    setParseSuccessMsg(null);
    const activeDoc = documentAttachment || uploadedDoc;
    try {
      const token = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const response = await fetch("/api/v1/gemini/parse-question-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rawText: textToParse,
          pagesDataUrls: activeDoc?.pagesDataUrls || [],
          pdfBase64: activeDoc?.pdfBase64 || "",
          mimeType: activeDoc?.mimeType || "application/pdf",
          subject: currentExam.subject || "Academic Examination",
          examTitle: examNameHint || currentExam.title
        })
      });
      const data = await response.json();
      if (data.success && data.examPaper) {
        const ep = data.examPaper;
        const normalizedExam = {
          id: `exam_${Date.now()}`,
          title: ep.title || examNameHint || "Custom Question Paper",
          subject: ep.subject || currentExam.subject || "Academic Course",
          courseCode: ep.courseCode || currentExam.courseCode || "EXAM-101",
          gradeLevel: ep.gradeLevel || currentExam.gradeLevel || "Undergraduate",
          totalMarks: ep.totalMarks || (ep.questions?.reduce((acc, q) => acc + (q.maxMarks || 10), 0) ?? 30),
          durationMinutes: ep.durationMinutes || 90,
          instructions: ep.instructions || [
            "Answer all questions concisely in standard technical English.",
            "Ensure notation, formulas, and diagrams are clearly explained."
          ],
          questions: (ep.questions || []).map((q, idx) => ({
            id: q.id || `q_${idx + 1}_${Date.now()}`,
            questionNumber: q.questionNumber || idx + 1,
            questionText: q.questionText || `Question ${idx + 1}`,
            maxMarks: q.maxMarks || 10,
            topic: q.topic || "Core Concept",
            difficulty: q.difficulty || "Medium",
            modelAnswer: q.modelAnswer || "Official rubric model answer guideline.",
            keyConcepts: q.keyConcepts || [
              { concept: "Key Concept", weightMarks: q.maxMarks || 10, synonyms: [], description: "Core principle" }
            ]
          })),
          questionPaperFile: activeDoc ? {
            name: activeDoc.name,
            size: activeDoc.size,
            type: activeDoc.type,
            pageCount: activeDoc.pageCount,
            pagesDataUrls: activeDoc.pagesDataUrls,
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
          } : void 0
        };
        setParsedExam(normalizedExam);
        setParseSuccessMsg(`Extracted ${normalizedExam.questions.length} questions totaling ${normalizedExam.totalMarks} marks from the question paper!`);
        onUpdateExamPaper(normalizedExam);
        showSweetToast(`Activated "${normalizedExam.title}" (${normalizedExam.questions.length} Questions) for grading!`, "success");
      } else {
        throw new Error(data.error || "Failed to parse questions structure.");
      }
    } catch (err) {
      console.warn("Parser API notice, extracting questions from raw text or structure:", err);
      const fallbackExamData = extractQuestionsFromText(textToParse, examNameHint, currentExam.subject);
      const fallbackExam = {
        id: `exam_extracted_${Date.now()}`,
        title: fallbackExamData.title || examNameHint || "Custom Question Paper",
        subject: fallbackExamData.subject || currentExam.subject || "Academic Course",
        courseCode: fallbackExamData.courseCode || currentExam.courseCode || "EXAM-101",
        gradeLevel: fallbackExamData.gradeLevel || "Undergraduate",
        totalMarks: fallbackExamData.totalMarks || 30,
        durationMinutes: fallbackExamData.durationMinutes || 90,
        instructions: fallbackExamData.instructions,
        questions: fallbackExamData.questions,
        questionPaperFile: activeDoc ? {
          name: activeDoc.name,
          size: activeDoc.size,
          type: activeDoc.type,
          pageCount: activeDoc.pageCount,
          pagesDataUrls: activeDoc.pagesDataUrls,
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        } : void 0
      };
      setParsedExam(fallbackExam);
      setParseSuccessMsg(`Extracted ${fallbackExam.questions.length} questions from document text.`);
      onUpdateExamPaper(fallbackExam);
      showSweetToast(`Loaded ${fallbackExam.questions.length} new questions from question paper!`, "info");
    } finally {
      setIsParsing(false);
    }
  };
  const handleApplyToActiveExam = () => {
    if (!parsedExam) return;
    onUpdateExamPaper(parsedExam);
    showSweetToast(`Applied "${parsedExam.title}" (${parsedExam.totalMarks} Marks) to active grading session!`, "success");
  };
  const handleSaveAsNew = () => {
    if (!parsedExam) return;
    if (onSaveAsNewExam) {
      onSaveAsNewExam(parsedExam);
    } else {
      onUpdateExamPaper(parsedExam);
    }
    showSweetToast(`Saved new Question Paper: "${parsedExam.title}"!`, "success");
  };
  return <div id="question-paper-manager" className="space-y-6">
      
      {
    /* Active Exam Status Header Banner */
  }
      <div className="p-4 rounded-xl bg-[#121215] border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                ACTIVE QUESTION PAPER SPECIFICATION
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentExam.courseCode || currentExam.subject}
              </span>
              {currentExam.questionPaperFile && <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Attached File: {currentExam.questionPaperFile.name}
                </span>}
            </div>
            <h3 className="text-sm font-semibold text-white mt-0.5">
              {currentExam.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1 text-zinc-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Total Marks: <strong className="text-white">{currentExam.totalMarks}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Questions: <strong className="text-white">{currentExam?.questions?.length || currentExam?.questionsCount || 0}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Duration: <strong className="text-white">{currentExam.durationMinutes || 90} Mins</strong></span>
              </span>
            </div>
          </div>
        </div>

        {
    /* Quick Question Paper Actions */
  }
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
    id="btn-switch-upload-tab"
    onClick={() => {
      setActiveTab("upload_file");
      fileInputRef.current?.click();
    }}
    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
  >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Question Paper</span>
          </button>
        </div>
      </div>

      {
    /* Upload Modes Tabs */
  }
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-[#27272a] bg-[#121215] text-xs">
          <button
    id="tab-upload-file"
    onClick={() => setActiveTab("upload_file")}
    className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 ${activeTab === "upload_file" ? "border-indigo-500 text-white bg-[#18181b]" : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#151518]"}`}
  >
            <UploadCloud className="w-4 h-4 text-indigo-400" />
            <span>Upload Question Paper (PDF / Image / Scan)</span>
          </button>

          <button
    id="tab-paste-text"
    onClick={() => setActiveTab("paste_text")}
    className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 ${activeTab === "paste_text" ? "border-indigo-500 text-white bg-[#18181b]" : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#151518]"}`}
  >
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Paste Questions Text / Markdown</span>
          </button>

          <button
    id="tab-sample-presets"
    onClick={() => setActiveTab("sample_presets")}
    className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 ${activeTab === "sample_presets" ? "border-indigo-500 text-white bg-[#18181b]" : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#151518]"}`}
  >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1-Click Sample Academic Papers</span>
          </button>

          <button
    id="tab-automated-testing"
    onClick={() => setActiveTab("automated_testing")}
    className={`px-4 py-3 font-semibold transition flex items-center gap-2 border-b-2 ${activeTab === "automated_testing" ? "border-indigo-500 text-white bg-[#18181b]" : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#151518]"}`}
  >
            <Play className="w-4 h-4 fill-current text-indigo-400" />
            <span>Automated Testing Suite</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              BENCHMARK
            </span>
          </button>
        </div>

        {
    /* TAB 1: File Upload (PDF / Image) */
  }
        {activeTab === "upload_file" && <div className="p-6 space-y-6">
            <input
    ref={fileInputRef}
    type="file"
    accept=".pdf,image/png,image/jpeg,image/jpg,.txt,.doc,.docx"
    onChange={handleFileInputChange}
    className="hidden"
  />

            {
    /* Drag and Drop Zone */
  }
            <div
    id="question-paper-dropzone"
    onDragOver={(e) => {
      e.preventDefault();
      setDragActive(true);
    }}
    onDragLeave={() => setDragActive(false)}
    onDrop={handleDrop}
    onClick={() => fileInputRef.current?.click()}
    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive ? "border-indigo-500 bg-indigo-950/20" : "border-[#27272a] hover:border-indigo-500/50 bg-[#121215]/60 hover:bg-[#121215]"}`}
  >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6 text-indigo-400 animate-bounce" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                Drag & drop your Question Paper file here, or click to browse
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Supports official PDF question papers, multi-page document scans, PNG/JPG photos, and Word/text exam drafts.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PDF (Multi-page)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PNG / JPG Scans
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  TXT / Markdown
                </span>
              </div>
            </div>

            {
    /* Uploaded Document Info Card & Visual Page Previewer */
  }
            {uploadedDoc && <div className="p-4 rounded-xl bg-[#121215] border border-indigo-500/40 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">{uploadedDoc.name}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-mono font-bold">
                          {uploadedDoc.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {uploadedDoc.pageCount} Page{uploadedDoc.pageCount > 1 ? "s" : ""} • Ready for Automated AI Question Extraction
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadedDoc.pageCount > 1 && <div className="flex items-center space-x-1.5 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                        <button
    onClick={() => currentPageIndex > 0 && setCurrentPageIndex(currentPageIndex - 1)}
    disabled={currentPageIndex === 0}
    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
  >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-zinc-300 px-2">
                          Page {currentPageIndex + 1} of {uploadedDoc.pageCount}
                        </span>
                        <button
    onClick={() => currentPageIndex < uploadedDoc.pagesDataUrls.length - 1 && setCurrentPageIndex(currentPageIndex + 1)}
    disabled={currentPageIndex >= uploadedDoc.pagesDataUrls.length - 1}
    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30"
  >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>}

                    <button
    id="btn-reparse-question-paper"
    onClick={() => runGeminiParser(uploadedDoc.extractedText || uploadedDoc.name, uploadedDoc.name)}
    disabled={isParsing}
    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
  >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isParsing ? "animate-spin" : ""}`} />
                      <span>{isParsing ? "Extracting Questions..." : "Extract with Gemini AI"}</span>
                    </button>
                  </div>
                </div>

                {
    /* Page Canvas Image Preview */
  }
                {uploadedDoc.pagesDataUrls[currentPageIndex] && <div className="border border-[#27272a] rounded-lg overflow-hidden bg-zinc-950 p-2 max-h-96 flex items-center justify-center">
                    <img
    src={uploadedDoc.pagesDataUrls[currentPageIndex]}
    alt={`Question Paper Page ${currentPageIndex + 1}`}
    className="max-h-88 object-contain rounded shadow-md"
    referrerPolicy="no-referrer"
  />
                  </div>}
              </div>}
          </div>}

        {
    /* TAB 2: Paste Raw Exam Text / Markdown */
  }
        {activeTab === "paste_text" && <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Paste Question Paper Content / Syllabus Rubric:
              </label>
              <textarea
    id="textarea-question-paper-text"
    rows={10}
    value={rawText}
    onChange={(e) => setRawText(e.target.value)}
    placeholder="Paste raw examination questions, sections, and mark allocations..."
    className="w-full bg-[#121215] border border-[#27272a] focus:border-indigo-500 rounded-xl p-4 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
  />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Gemini AI will parse questions, mark values, difficulty, and generate model answer rubrics automatically.
              </span>
              <button
    id="btn-parse-pasted-text"
    onClick={() => runGeminiParser(rawText, "Pasted Question Paper")}
    disabled={isParsing || !rawText.trim()}
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
  >
                <Sparkles className={`w-4 h-4 text-amber-300 ${isParsing ? "animate-spin" : ""}`} />
                <span>{isParsing ? "Parsing Questions with AI..." : "Parse Questions with Gemini AI"}</span>
              </button>
            </div>
          </div>}

        {
    /* TAB 3: 1-Click Academic Sample Presets */
  }
        {activeTab === "sample_presets" && <div className="p-6 space-y-4">
            <p className="text-xs text-zinc-400">
              Select a pre-validated academic exam paper to immediately load authentic questions, rubrics, and answer keys:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_PRESETS.map((preset, idx) => <div
    key={idx}
    className="p-4 rounded-xl border border-[#27272a] bg-[#121215] hover:border-indigo-500/60 hover:bg-[#141418] transition flex flex-col justify-between space-y-3 group text-left"
  >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {preset.courseCode}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold">
                        {preset.totalMarks} Marks
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-2 group-hover:text-indigo-300 transition">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-3">
                      {preset.rawText.split("\n").slice(2, 5).join(" ")}
                    </p>
                  </div>

                  <button
    id={`btn-load-preset-${idx}`}
    onClick={async () => {
      setRawText(preset.rawText);
      await runGeminiParser(preset.rawText, preset.title);
    }}
    disabled={isParsing}
    className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Load & Parse This Paper</span>
                  </button>
                </div>)}
            </div>
          </div>}

        {
    /* TAB 4: Automated Testing Suite */
  }
        {activeTab === "automated_testing" && <div className="p-6">
            <AutomatedTestingSuite
    examPaper={parsedExam || currentExam}
    onUpdateExamPaper={(calibrated) => {
      setParsedExam(calibrated);
      onUpdateExamPaper(calibrated);
    }}
    onApplyAsActiveExam={(applied) => {
      onUpdateExamPaper(applied);
      showSweetToast(`Applied "${applied.title}" as active exam paper!`, "success");
    }}
    showSweetToast={showSweetToast}
    isEmbedded={true}
  />
          </div>}
      </div>

      {
    /* Error Notice */
  }
      {errorMsg && <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>}

      {
    /* Success Notice */
  }
      {parseSuccessMsg && <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{parseSuccessMsg}</span>
        </div>}

      {
    /* Parsed Question Paper Rubric Preview & Action Bar */
  }
      {parsedExam && <div className="bg-[#18181b] border border-indigo-500/40 rounded-xl p-5 space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PARSED QUESTION RUBRIC READY
                </span>
                <span className="text-xs text-zinc-400">{parsedExam.courseCode}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {parsedExam.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {parsedExam.questions.length} Questions • Total {parsedExam.totalMarks} Marks • Duration: {parsedExam.durationMinutes || 90} Minutes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
    id="btn-run-automated-test-on-parsed-exam"
    onClick={() => {
      setActiveTab("automated_testing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
  >
                <Play className="w-4 h-4 fill-current text-indigo-400" />
                <span>Run Automated Testing</span>
              </button>

              <button
    id="btn-apply-parsed-exam"
    onClick={handleApplyToActiveExam}
    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
  >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply as Active Exam</span>
              </button>

              <button
    id="btn-save-as-new-exam"
    onClick={handleSaveAsNew}
    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
  >
                <Save className="w-4 h-4" />
                <span>Save as New Exam</span>
              </button>
            </div>
          </div>

          {
    /* Questions Accordion / List */
  }
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Extracted Questions & Grading Rubric
            </h4>

            <div className="space-y-3">
              {parsedExam.questions.map((q, idx) => <div
    key={idx}
    className="p-4 rounded-xl border border-[#27272a] bg-[#121215] space-y-3"
  >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center shrink-0">
                        {q.questionNumber}
                      </span>
                      <div>
                        <h5 className="text-xs font-semibold text-white">
                          {q.questionText}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Topic: {q.topic}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            Difficulty: {q.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-bold shrink-0">
                      {q.maxMarks} Marks
                    </span>
                  </div>

                  {
    /* Model Answer Guideline */
  }
                  {q.modelAnswer && <div className="p-3 bg-[#18181b] rounded-lg border border-[#27272a] text-xs text-zinc-300">
                      <span className="font-bold text-emerald-400 mr-2">Official Solution Guideline:</span>
                      <span>{q.modelAnswer}</span>
                    </div>}

                  {
    /* Key Concepts */
  }
                  {q.keyConcepts && q.keyConcepts.length > 0 && <div className="flex flex-wrap gap-2 pt-1">
                      {q.keyConcepts.map((kc, kIdx) => <span
    key={kIdx}
    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700 flex items-center gap-1"
  >
                          <span className="text-amber-400 font-bold">{kc.weightMarks}M</span>
                          <span>{kc.concept}</span>
                        </span>)}
                    </div>}
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
};
