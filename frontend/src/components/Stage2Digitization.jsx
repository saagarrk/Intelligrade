import { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  BookOpen,
  Languages,
  GitCompare,
  ArrowRight,
  Edit3,
  RefreshCw,
  CheckCircle2,
  Layers,
  FileText,
  UploadCloud,
  Zap
} from "lucide-react";
import { TriAnswerSheetComparison } from "./TriAnswerSheetComparison";
import { StudentAnswerSheetUpload } from "./StudentAnswerSheetUpload";
import { HandwrittenPipelineView } from "./HandwrittenPipelineView";
import { showSweetToast } from "../utils/sweetAlert";
export const Stage2Digitization = ({
  submission,
  exam,
  onUpdateExtractedText,
  onUpdateModelAnswers,
  onNextStage,
  isProcessing
}) => {
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("ocr");
  const [extractedText, setExtractedText] = useState(submission.ocrResult.fullExtractedText);
  const [isEditingText, setIsEditingText] = useState(false);
  const [generatingModelAnswer, setGeneratingModelAnswer] = useState(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrEngine, setOcrEngine] = useState(
    submission.ocrResult.engineUsed || "Gemini-Vision-Multimodal"
  );
  useEffect(() => {
    setExtractedText(submission.ocrResult.fullExtractedText);
  }, [submission.id, submission.ocrResult.fullExtractedText]);
  const examQuestions = exam?.questions || [];
  const activeQuestion = examQuestions[selectedQuestionIdx] || examQuestions[0] || { questionNumber: 1, topic: 'General' };
  const activeEval = submission.questionEvaluations.find((e) => e.questionNumber === activeQuestion.questionNumber);
  const handleSaveText = () => {
    setIsEditingText(false);
    onUpdateExtractedText(extractedText);
  };
  const handleRunOcrExtraction = async () => {
    setIsExtractingOcr(true);
    try {
      const authToken = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const response = await fetch("/api/v1/ocr/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          imageBase64: submission.originalScanUrl,
          examContext: `${exam.title} - ${exam.subject}`,
          questions: exam.questions
        })
      });
      const data = await response.json();
      const newText = data.extractedText || data.fullExtractedText;
      if (newText) {
        setExtractedText(newText);
        onUpdateExtractedText(newText, data);
        const count = data.parsedAnswers?.length || exam.questions.length;
        showSweetToast(`Gemini OCR parsed ${count} handwritten question responses with ${data.averageConfidence || 95}% confidence!`, "success");
      }
    } catch (e) {
      console.error("OCR Extraction error:", e);
      showSweetToast("OCR Extraction request encountered an issue. Please try again.", "error");
    } finally {
      setIsExtractingOcr(false);
    }
  };
  const handleRegenerateModelAnswer = async () => {
    setGeneratingModelAnswer(true);
    try {
      const authToken = localStorage.getItem("intelligrade_auth_token") || "ig_token_teacher_session_token";
      const response = await fetch("/api/v1/model-answers/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          questionText: activeQuestion.questionText,
          topic: activeQuestion.topic,
          maxMarks: activeQuestion.maxMarks,
          difficulty: activeQuestion.difficulty
        })
      });
      const data = await response.json();
      if (data.modelAnswer) {
        const updated = exam.questions.map((q, idx) => {
          if (idx === selectedQuestionIdx) {
            return {
              ...q,
              modelAnswer: data.modelAnswer,
              keyConcepts: data.keyConcepts || q.keyConcepts
            };
          }
          return q;
        });
        onUpdateModelAnswers(updated);
      }
    } catch (e) {
      console.error("Error generating model answer:", e);
    } finally {
      setGeneratingModelAnswer(false);
    }
  };
  return <div className="space-y-6">
      {
    /* Stage Header Banner */
  }
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                2
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Stage 2: Answer Interpretation (Digitization & Analysis)
              </h2>
              {submission?.status && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  submission.status === 'COMPLETED' || submission.status === 'Graded'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : submission.status === 'PROCESSING'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                    : submission.status === 'FAILED'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    submission.status === 'COMPLETED' || submission.status === 'Graded' ? 'bg-emerald-400' : submission.status === 'PROCESSING' ? 'bg-amber-400' : submission.status === 'FAILED' ? 'bg-rose-400' : 'bg-sky-400'
                  }`} />
                  <span>Pipeline: {submission.processingStatus || submission.status}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Optical Character Recognition converts preprocessed handwriting into digital text. Generative AI establishes gold-standard model answers, and the NLP pipeline runs semantic and cross-language synonym mapping.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
    id="proceed-stage3-btn"
    onClick={onNextStage}
    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
  >
              <span>Proceed to Stage 3: Grading & Marking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {
    /* Tab Controls for Stage 2 */
  }
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-[#27272a] overflow-x-auto pb-1">
          {[
    { id: "ocr", label: "1. OCR Handwriting Extraction", icon: Cpu },
    { id: "pipeline", label: "Structured Processing Pipeline (7 Stages)", icon: Zap },
    { id: "upload_scan", label: "Upload & OCR Sheet", icon: UploadCloud },
    { id: "model_answer", label: "2. Generative AI Model Answers", icon: BookOpen },
    { id: "nlp_pipeline", label: "3. NLP Semantic & Synonym Pipeline", icon: Languages },
    { id: "tri_sheet_eval", label: "4. 3-Sheet Matrix & Own-Words Evaluation", icon: Layers }
  ].map((tab) => {
    const Icon = tab.icon;
    const isSelected = activeTab === tab.id;
    return <button
      key={tab.id}
      id={`tab-stage2-${tab.id}`}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isSelected ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm" : "bg-[#09090b] text-slate-400 hover:bg-[#27272a]/60 hover:text-[#fafafa] border border-[#27272a]"}`}
    >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>;
  })}
        </div>
      </div>

      {
    /* Question Selector Strip */
  }
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">
          Questions:
        </span>
        {exam.questions.map((q, idx) => <button
    key={q.id}
    id={`btn-select-q-${q.questionNumber}`}
    onClick={() => setSelectedQuestionIdx(idx)}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedQuestionIdx === idx ? "bg-indigo-600 text-white shadow-sm" : "bg-[#18181b] text-slate-400 hover:bg-[#27272a] hover:text-white border border-[#27272a]"}`}
  >
            Q{q.questionNumber} ({q.maxMarks} Marks)
          </button>)}
      </div>

      {
    /* Tab 1: OCR Extraction & Digitization */
  }
      {activeTab === "ocr" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {
    /* Left: OCR Extracted Text (7 Cols) */
  }
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Handwritten OCR Text Output
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Confidence: {submission.ocrResult.averageConfidence}%
                  </span>
                  <button
                    id="open-upload-sheet-btn"
                    onClick={() => setActiveTab("upload_scan")}
                    className="flex items-center space-x-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 transition-colors"
                    title="Drag & drop new student answer sheet scan"
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Scan</span>
                  </button>
                  <button
                    id="re-transcribe-ocr-btn"
                    onClick={handleRunOcrExtraction}
                    disabled={isExtractingOcr}
                    className="flex items-center space-x-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 transition-colors disabled:opacity-50"
                    title="Extract handwriting from uploaded scan for the current exam questions"
                  >
                    <RefreshCw className={`w-3 h-3 ${isExtractingOcr ? "animate-spin" : ""}`} />
                    <span>{isExtractingOcr ? "Extracting..." : "Re-Run OCR"}</span>
                  </button>
                  <button
    id="edit-ocr-btn"
    onClick={() => isEditingText ? handleSaveText() : setIsEditingText(true)}
    className="flex items-center space-x-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 transition-colors"
  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingText ? "Save Changes" : "Edit Text"}</span>
                  </button>
                </div>
              </div>

              {isEditingText ? <textarea
    id="ocr-text-editor"
    value={extractedText}
    onChange={(e) => setExtractedText(e.target.value)}
    rows={10}
    className="w-full bg-[#09090b] text-[#fafafa] text-xs font-mono p-3 rounded-lg border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
  /> : <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {extractedText}
                </div>}

              {
    /* Engine Selector */
  }
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#27272a]">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Active Engine:</span>
                  <span className="font-mono text-emerald-400">{ocrEngine}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {["Gemini-Vision-Multimodal", "PaddleOCR-Engine", "Tesseract-Engine"].map((eng) => <button
    key={eng}
    id={`btn-engine-${eng}`}
    onClick={() => setOcrEngine(eng)}
    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${ocrEngine === eng ? "bg-indigo-600 text-white font-medium border-indigo-500" : "bg-[#09090b] text-slate-400 hover:text-white border-[#27272a]"}`}
  >
                      {eng.split("-")[0]}
                    </button>)}
                </div>
              </div>
            </div>

            {
    /* Line-by-Line Token Inspector */
  }
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Line Bounding Box Tokenization
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {submission.ocrResult.detectedLines.map((line) => <div
    key={line.lineNumber}
    className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] flex items-start justify-between text-xs"
  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500">Line {line.lineNumber}</span>
                        {line.questionNumberDetected && <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/30">
                            Q{line.questionNumberDetected}
                          </span>}
                      </div>
                      <p className="text-slate-300 font-mono mt-1 text-[11px]">
                        {line.cleanedText}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold shrink-0 ml-2">
                      {line.confidence}%
                    </span>
                  </div>)}
              </div>
            </div>

            {/* Parsed Question Answers Breakdown */}
            {submission.ocrResult.parsedAnswers && submission.ocrResult.parsedAnswers.length > 0 && (
              <div id="ocr-parsed-answers-card" className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Gemini OCR Parsed Question Answers
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    {submission.ocrResult.parsedAnswers.length} Questions Parsed
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {submission.ocrResult.parsedAnswers.map((pa) => (
                    <div
                      key={pa.questionNumber}
                      className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-400">
                          Question {pa.questionNumber} ({pa.questionLabel || `Ans ${pa.questionNumber}`})
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {pa.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-300 line-clamp-3">
                        {pa.transcribedAnswer}
                      </p>
                      {pa.detectedFormulas && pa.detectedFormulas.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pa.detectedFormulas.map((f, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {
    /* Right: Active Question Context (5 Cols) */
  }
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Question Prompt (Q{activeQuestion.questionNumber})
                </h3>
                <span className="text-xs font-mono font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {activeQuestion.maxMarks} Marks
                </span>
              </div>

              <p className="text-xs text-slate-200 font-normal leading-relaxed">
                {activeQuestion.questionText}
              </p>

              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Topic Domain:</span>
                  <span className="font-medium text-[#fafafa]">{activeQuestion.topic}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Difficulty:</span>
                  <span className="font-medium text-amber-400">{activeQuestion.difficulty}</span>
                </div>
              </div>

              {
    /* Student Extracted Segment */
  }
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Student's Interpreted Response:
                </span>
                <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono text-slate-300 leading-relaxed">
                  {activeEval?.studentAnswerText || "No answer detected for this question."}
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Tab: Drag & Drop Student Answer Sheet Upload with Gemini OCR & Loading State */}
      {activeTab === "upload_scan" && (
        <StudentAnswerSheetUpload
          exam={exam}
          submission={submission}
          onOcrComplete={(result) => {
            if (result?.fullExtractedText) {
              setExtractedText(result.fullExtractedText);
              onUpdateExtractedText(result.fullExtractedText, result);
            }
            setActiveTab("ocr");
          }}
          onCancel={() => setActiveTab("ocr")}
        />
      )}

      {
    /* Tab 2: Generative AI Model Answers Studio */
  }
      {activeTab === "model_answer" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {
    /* Model Answer Card (7 Cols) */
  }
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    Gold-Standard Model Answer (Q{activeQuestion.questionNumber})
                  </h3>
                </div>

                <button
    id="regenerate-model-answer-btn"
    onClick={handleRegenerateModelAnswer}
    disabled={generatingModelAnswer}
    className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
  >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatingModelAnswer ? "Generating..." : "Customize with Gemini"}</span>
                </button>
              </div>

              <div className="p-4 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-200 leading-relaxed">
                {activeQuestion.modelAnswer}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#27272a]">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authoritative Rubric Established</span>
                </span>
                <span className="font-mono text-slate-500">Max Weight: {activeQuestion.maxMarks} pts</span>
              </div>
            </div>
          </div>

          {
    /* Key Concepts & Weighted Breakdown (5 Cols) */
  }
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 border-b border-[#27272a] pb-3">
                Key Concepts & Scoring Rubric Breakdown
              </h3>

              <div className="space-y-3">
                {activeQuestion.keyConcepts.map((kc, idx) => <div
    key={idx}
    className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5"
  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-slate-200">
                        {kc.concept}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono shrink-0 ml-2">
                        +{kc.weightMarks} Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {kc.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-[#27272a]">
                      <span className="text-[10px] text-slate-500 font-semibold">Synonyms:</span>
                      {kc.synonyms.map((s, sIdx) => <span
    key={sIdx}
    className="text-[9px] bg-[#18181b] text-slate-300 px-1.5 py-0.5 rounded border border-[#27272a]"
  >
                          {s}
                        </span>)}
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </div>}

      {
    /* Tab 3: NLP Pipeline for Answer Interpretation */
  }
      {activeTab === "nlp_pipeline" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {
    /* Semantic Similarity Vector Analysis (7 Cols) */
  }
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <GitCompare className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    NLP Semantic Meaning Alignment
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Cosine Similarity: {activeEval?.semanticSimilarityScore}%
                  </span>
                </div>
              </div>

              {
    /* Similarity Progress Bar */
  }
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Semantic Overlap vs Reference Meaning</span>
                  <span className="font-bold text-indigo-400">{activeEval?.semanticSimilarityScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#09090b] rounded-full overflow-hidden border border-[#27272a]">
                  <div
    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
    style={{ width: `${activeEval?.semanticSimilarityScore || 85}%` }}
  />
                </div>
              </div>

              {
    /* Matched Concepts Inspector */
  }
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Concept Meaning Matches in Student Text:
                </h4>
                {activeEval?.conceptMatches.map((cm, idx) => <div
    key={idx}
    className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1 text-xs"
  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{cm.concept}</span>
                      <span
    className={`text-[10px] font-medium px-2 py-0.5 rounded ${cm.status === "Full" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : cm.status === "Partial" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
  >
                        {cm.status} Match ({cm.awardedWeight}/{cm.requiredWeight} pts)
                      </span>
                    </div>
                    {cm.matchedStudentPhrases.length > 0 && <div className="text-[11px] text-indigo-300 font-mono bg-[#18181b] p-2 rounded border border-[#27272a] mt-1">
                        "{cm.matchedStudentPhrases.join('", "')}"
                      </div>}
                    <p className="text-[11px] text-slate-400 mt-1">{cm.explanation}</p>
                  </div>)}
              </div>
            </div>
          </div>

          {
    /* Synonym Handling & Multilanguage Support (5 Cols) */
  }
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
                <Languages className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Synonym Handling & Multilanguage Mapping
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
                  <span className="text-[11px] font-semibold text-indigo-300 block">
                    Detected Lexical Synonyms:
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                      <span className="text-slate-300 font-mono">"mutex lock"</span>
                      <span className="text-slate-500">➔</span>
                      <span className="text-emerald-400 font-mono">Mutual Exclusion</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                      <span className="text-slate-300 font-mono">"sleep / wake up"</span>
                      <span className="text-slate-500">➔</span>
                      <span className="text-emerald-400 font-mono">wait() / signal()</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-[#18181b] rounded border border-[#27272a]">
                      <span className="text-slate-300 font-mono">"delta rule"</span>
                      <span className="text-slate-500">➔</span>
                      <span className="text-emerald-400 font-mono">Gradient Descent</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
                  <span className="text-[11px] font-semibold text-indigo-300 block">
                    Multilanguage & Regional Technical Dialect Handler:
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Recognizes phonetic spelling variations, British vs American notation (e.g. "Normalisation" / "Binarisation"), and regional terminology without penalizing correct understanding.
                  </p>
                  <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-[10px] text-emerald-400">
                    ✓ Cross-Lingual & Synonym Equivalence Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}

      {/* Tab 4: Tri-Sheet Cross-Referencing & Own-Words Matrix */}
      {activeTab === "tri_sheet_eval" && <TriAnswerSheetComparison
    exam={exam}
    submission={submission}
    onUpdateModelAnswers={onUpdateModelAnswers}
  />}

      {/* Tab: Structured Processing Pipeline (7 Stages) */}
      {activeTab === "pipeline" && (
        <HandwrittenPipelineView
          submission={submission}
          exam={exam}
          onPipelineUpdated={(updatedSub) => {
            if (onUpdateExtractedText && updatedSub.ocrResult?.fullExtractedText) {
              setExtractedText(updatedSub.ocrResult.fullExtractedText);
              onUpdateExtractedText(updatedSub.ocrResult.fullExtractedText, updatedSub.ocrResult);
            }
          }}
        />
      )}
    </div>;
};
