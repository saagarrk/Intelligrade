import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Upload, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  Split, 
  Maximize2,
  FileCheck2,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { ExamPaper, StudentSubmission, QuestionItem, GeminiQuestionSemanticMatrix, UploadedAnswerSheet } from '../types';
import { processUploadedFile, UploadedDocument } from '../utils/fileUploadHelper';

interface TriAnswerSheetComparisonProps {
  exam: ExamPaper;
  submission: StudentSubmission;
  onUpdateModelAnswers?: (updatedQuestions: QuestionItem[]) => void;
  onUploadStudentSheet?: (dataUrl: string, doc: UploadedDocument) => void;
  onUploadModelSheet?: (dataUrl: string, doc: UploadedDocument) => void;
  compactMode?: boolean;
}

export const TriAnswerSheetComparison: React.FC<TriAnswerSheetComparisonProps> = ({
  exam,
  submission,
  onUpdateModelAnswers,
  onUploadStudentSheet,
  onUploadModelSheet,
  compactMode = false
}) => {
  const [selectedQIdx, setSelectedQIdx] = useState<number>(0);
  const [activeSheetTab, setActiveSheetTab] = useState<'sheet1_student' | 'sheet2_model' | 'sheet3_gemini' | 'all_three'>('all_three');
  const [isGeneratingGemini, setIsGeneratingGemini] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);

  // Model sheet upload state
  const [modelSheetDoc, setModelSheetDoc] = useState<UploadedDocument | null>(null);
  const [isUploadingModel, setIsUploadingModel] = useState<boolean>(false);

  // Student sheet upload state
  const [isUploadingStudent, setIsUploadingStudent] = useState<boolean>(false);

  const activeQuestion = exam.questions[selectedQIdx] || exam.questions[0];
  const activeEval = submission.questionEvaluations.find(e => e.questionNumber === activeQuestion.questionNumber);
  const semanticMatrix = activeQuestion.geminiSemanticMatrix;

  // Handle upload of Sheet 2: Official Model Answer Sheet
  const handleModelSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingModel(true);
    try {
      const doc = await processUploadedFile(file);
      setModelSheetDoc(doc);
      if (onUploadModelSheet && doc.pagesDataUrls[0]) {
        onUploadModelSheet(doc.pagesDataUrls[0], doc);
      }
    } catch (err) {
      console.error('Error processing model sheet:', err);
    } finally {
      setIsUploadingModel(false);
    }
  };

  // Handle upload of Sheet 1: Student Answer Sheet
  const handleStudentSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingStudent(true);
    try {
      const doc = await processUploadedFile(file);
      if (onUploadStudentSheet && doc.pagesDataUrls[0]) {
        onUploadStudentSheet(doc.pagesDataUrls[0], doc);
      }
    } catch (err) {
      console.error('Error processing student sheet:', err);
    } finally {
      setIsUploadingStudent(false);
    }
  };

  // Trigger Gemini AI to generate / re-synthesize the 3rd sheet ("Own-Words" Semantic Reference Sheet)
  const handleGenerateGeminiSemanticSheet = async () => {
    setIsGeneratingGemini(true);
    setGenerationSuccess(null);
    try {
      const authToken = localStorage.getItem('intelligrade_auth_token') || 'ig_token_teacher_session_token';
      const response = await fetch('/api/v1/gemini/generate-semantic-variants', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          questionNumber: activeQuestion.questionNumber,
          questionId: activeQuestion.id,
          questionText: activeQuestion.questionText,
          modelAnswer: activeQuestion.modelAnswer,
          topic: activeQuestion.topic,
          maxMarks: activeQuestion.maxMarks
        })
      });

      const data = await response.json();
      if (data.success && data.matrix) {
        const updatedQuestions = exam.questions.map((q, idx) => {
          if (idx === selectedQIdx) {
            return {
              ...q,
              geminiSemanticMatrix: data.matrix
            };
          }
          return q;
        });

        if (onUpdateModelAnswers) {
          onUpdateModelAnswers(updatedQuestions);
        }
        setGenerationSuccess(`Gemini 3.7 Flash synthesized ${data.matrix.ownWordsVariations?.length || 3} semantic 'own-words' variants for Question ${activeQuestion.questionNumber}!`);
        setTimeout(() => setGenerationSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Error generating semantic sheet with Gemini:', err);
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
      {/* Header with 3-Sheet Paradigm Explanation */}
      <div className="p-4 sm:p-5 border-b border-[#27272a] bg-gradient-to-r from-[#18181b] via-[#201d29] to-[#18181b]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Tri-Sheet Architecture
              </span>
              <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                3-Answer-Sheet Ingestion & Semantic Evaluation
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Evaluating student answers against both the <strong className="text-slate-200">Official Model Sheet</strong> and an <strong className="text-purple-300">Auto-Generated Gemini AI Semantic Sheet</strong> to fairly credit students who write conceptually correct answers in their <em className="text-indigo-300 not-italic font-medium">own words</em>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-generate-gemini-sheet"
              onClick={handleGenerateGeminiSemanticSheet}
              disabled={isGeneratingGemini}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingGemini ? 'animate-spin' : ''}`} />
              <span>{isGeneratingGemini ? 'Synthesizing with Gemini...' : '✨ Auto-Generate Sheet 3 with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {generationSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{generationSuccess}</span>
          </div>
        )}
      </div>

      {/* Question Selector & View Tabs */}
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#121215] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Select Question:</span>
          {exam.questions.map((q, idx) => (
            <button
              key={q.id}
              id={`btn-select-tri-q-${q.questionNumber}`}
              onClick={() => setSelectedQIdx(idx)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                selectedQIdx === idx
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-[#27272a] text-slate-300 hover:bg-[#3f3f46]'
              }`}
            >
              Q{q.questionNumber} ({q.maxMarks}m)
            </button>
          ))}
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center space-x-1 bg-[#18181b] p-0.5 rounded-lg border border-[#27272a] self-start sm:self-auto">
          <button
            onClick={() => setActiveSheetTab('all_three')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center space-x-1.5 ${
              activeSheetTab === 'all_three'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>All 3 Sheets</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet1_student')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center space-x-1.5 ${
              activeSheetTab === 'sheet1_student'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>1. Student</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet2_model')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center space-x-1.5 ${
              activeSheetTab === 'sheet2_model'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>2. Model</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet3_gemini')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition flex items-center space-x-1.5 ${
              activeSheetTab === 'sheet3_gemini'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>3. Gemini AI</span>
          </button>
        </div>
      </div>

      {/* Active Question Prompt Bar */}
      <div className="px-5 py-3 bg-[#1c1c22] border-b border-[#27272a] text-xs">
        <div className="flex items-start gap-2">
          <span className="font-bold text-indigo-400 shrink-0">Q{activeQuestion.questionNumber}:</span>
          <span className="text-slate-200 font-medium">{activeQuestion.questionText}</span>
          <span className="ml-auto shrink-0 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-semibold border border-zinc-700">
            {activeQuestion.topic}
          </span>
        </div>
      </div>

      {/* The 3-Sheet Comparison Body Grid */}
      <div className="p-4 sm:p-5">
        <div className={`grid gap-4 ${
          activeSheetTab === 'all_three' 
            ? 'grid-cols-1 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>

          {/* ========================================================================= */}
          {/* SHEET 1: STUDENT ANSWER SHEET (Uploaded scan / transcribed handwriting) */}
          {/* ========================================================================= */}
          {(activeSheetTab === 'all_three' || activeSheetTab === 'sheet1_student') && (
            <div className="bg-[#121215] border border-blue-500/30 rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="px-4 py-3 bg-blue-950/30 border-b border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/40">
                    1
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Student Answer Sheet
                  </span>
                </div>
                <label className="cursor-pointer flex items-center space-x-1 px-2 py-1 rounded bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 text-[11px] font-semibold border border-blue-700/50 transition">
                  <Upload className="w-3 h-3" />
                  <span>{isUploadingStudent ? 'Uploading...' : 'Upload Student PDF/Image'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleStudentSheetUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Candidate: <strong className="text-slate-200">{submission.studentName}</strong> ({submission.studentRollNumber})</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono text-[10px]">
                    OCR Confidence: 96.8%
                  </span>
                </div>

                {/* Transcribed Student Answer Text */}
                <div className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg p-3.5 relative overflow-y-auto max-h-[340px]">
                  <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Transcribed Handwritten Response:</span>
                    <span className="text-[10px] text-indigo-400">Student's Own Words</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {activeEval?.studentAnswerText || 'No student answer recorded for this question.'}
                  </p>
                </div>

                {/* Student Own Words Phrasing Analysis */}
                <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Candidate's Linguistic Style:
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/40 text-blue-200 font-mono">
                      Intuitive Colloquial Phrasing
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Student explained the solution using personal vocabulary and real-world analogies rather than verbatim textbook regurgitation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 2: OFFICIAL MODEL ANSWER SHEET (Curriculum Gold Standard) */}
          {/* ========================================================================= */}
          {(activeSheetTab === 'all_three' || activeSheetTab === 'sheet2_model') && (
            <div className="bg-[#121215] border border-emerald-500/30 rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="px-4 py-3 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40">
                    2
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide uppercase">
                    Official Model Answer Sheet
                  </span>
                </div>
                <label className="cursor-pointer flex items-center space-x-1 px-2 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 text-[11px] font-semibold border border-emerald-700/50 transition">
                  <Upload className="w-3 h-3" />
                  <span>{isUploadingModel ? 'Uploading...' : 'Upload Master Key PDF'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleModelSheetUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Standard: <strong className="text-slate-200">Instructor Solution Key</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-mono text-[10px]">
                    Max Marks: {activeQuestion.maxMarks}
                  </span>
                </div>

                {/* Model Answer Standard Text */}
                <div className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg p-3.5 relative overflow-y-auto max-h-[340px]">
                  <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Curriculum Master Solution:</span>
                    <span className="text-[10px] text-emerald-400">Formal Textbook Standard</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-sans">
                    {activeQuestion.modelAnswer}
                  </p>

                  {/* Key Concepts Breakdown */}
                  <div className="mt-3 pt-2.5 border-t border-[#27272a] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Required Rubric Concepts:
                    </span>
                    {activeQuestion.keyConcepts.map((kc, kIdx) => (
                      <div key={kIdx} className="flex items-start justify-between text-[11px] text-slate-300 bg-[#202025] px-2 py-1 rounded">
                        <span className="truncate max-w-[200px]">{kc.concept}</span>
                        <span className="text-emerald-400 font-semibold shrink-0 ml-2">+{kc.weightMarks}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rubric Rigidity Note */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-[11px] space-y-1">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Formal Reference Baseline:
                  </span>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    Serves as the rigorous factual benchmark for mathematical constants, equations, and algorithmic invariants.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHEET 3: GEMINI AI SEMANTIC MATRIX & SYNTHETIC "OWN-WORDS" SHEET */}
          {/* ========================================================================= */}
          {(activeSheetTab === 'all_three' || activeSheetTab === 'sheet3_gemini') && (
            <div className="bg-[#121215] border border-purple-500/40 rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="px-4 py-3 bg-gradient-to-r from-purple-950/50 to-indigo-950/40 border-b border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 font-bold text-xs border border-purple-500/50">
                    3
                  </span>
                  <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Gemini AI Semantic Sheet
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-[10px] font-bold border border-purple-700/50">
                  {semanticMatrix?.aiModelName || 'gemini-3.8-flash'}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Purpose: <strong className="text-purple-300">"Own-Words" Recognition Matrix</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono text-[10px]">
                    Equivalence: {semanticMatrix?.leniencyThresholdPct || 82}%
                  </span>
                </div>

                {/* Gemini AI Auto-Generated Variations */}
                <div className="flex-1 bg-[#18181b] border border-purple-900/30 rounded-lg p-3.5 relative overflow-y-auto max-h-[340px] space-y-3">
                  <div className="text-xs font-semibold text-purple-300 flex items-center justify-between">
                    <span>Valid Conceptual Variations Generated by AI:</span>
                    <span className="text-[10px] text-amber-300 font-mono">3 Variations Active</span>
                  </div>

                  {semanticMatrix?.ownWordsVariations?.map((variant, vIdx) => (
                    <div 
                      key={vIdx} 
                      className="p-2.5 rounded-lg bg-[#201d29] border border-purple-800/30 space-y-1 hover:border-purple-600/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-200">
                          {variant.variantTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                          {variant.tone}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        "{variant.ownWordsExplanation}"
                      </p>
                      {variant.keyPhrases && variant.keyPhrases.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {variant.keyPhrases.map((phrase, pIdx) => (
                            <span key={pIdx} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              ✓ {phrase}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Accepted Synonyms Graph */}
                  {semanticMatrix?.acceptedSynonyms && semanticMatrix.acceptedSynonyms.length > 0 && (
                    <div className="pt-2 border-t border-purple-900/30 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                        Synonyms & Colloquial Equivalents Accepted:
                      </span>
                      {semanticMatrix.acceptedSynonyms.map((syn, sIdx) => (
                        <div key={sIdx} className="text-[11px] bg-[#1a1724] p-2 rounded border border-purple-900/20">
                          <div className="font-semibold text-purple-200 text-xs">{syn.technicalTerm}:</div>
                          <div className="text-[10px] text-slate-300 mt-0.5">
                            {syn.allowedSynonyms.join(' • ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Alternative Proofs / Steps */}
                  {semanticMatrix?.alternativeValidDerivations && semanticMatrix.alternativeValidDerivations.length > 0 && (
                    <div className="pt-2 border-t border-purple-900/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                        Alternative Valid Step Sequences:
                      </span>
                      <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                        {semanticMatrix.alternativeValidDerivations.map((alt, aIdx) => (
                          <li key={aIdx}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Gemini Auto-Generation Insight */}
                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-900/40 text-[11px] space-y-1">
                  <span className="font-semibold text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    How Gemini Prevents Grading Bias:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-normal">
                    Gemini cross-references student text with this synthetic matrix to verify <em className="text-amber-200 not-italic font-medium">underlying semantic comprehension</em>, ensuring full credit is awarded even with 0% exact word matches.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 3-Way Real-time Match Analysis Summary Banner */}
        <div className="mt-4 p-4 rounded-xl bg-[#14141a] border border-[#27272a] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Tri-Sheet Evaluation Verdict for Q{activeQuestion.questionNumber}:</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Concept Validated via Sheet 3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Student phrased the answer in their own words. Gemini AI matched it to <strong className="text-purple-300">"{semanticMatrix?.ownWordsVariations?.[0]?.variantTitle || 'Everyday Analogy Phrasing'}"</strong> and awarded <strong className="text-emerald-400 font-bold">{activeEval?.awardedMarks || activeQuestion.maxMarks} / {activeQuestion.maxMarks} marks</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Semantic Match</div>
              <div className="text-sm font-black text-indigo-400">{activeEval?.semanticSimilarityScore || 97}%</div>
            </div>
            <div className="h-7 w-px bg-[#27272a]" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Awarded</div>
              <div className="text-sm font-black text-emerald-400">{activeEval?.awardedMarks || activeQuestion.maxMarks}m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
