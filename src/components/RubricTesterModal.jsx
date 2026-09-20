import React, { useState } from "react";
import {
  X,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Layers,
  FileText,
  Sliders,
  RotateCcw
} from "lucide-react";
import { API_ENDPOINTS } from "../constants/theme";
import { evaluateQuestionDynamically } from "../utils/dynamicGrading";

export const RubricTesterModal = ({
  isOpen,
  onClose,
  question,
  examTitle = "IntelliGrade Examination"
}) => {
  if (!isOpen || !question) return null;

  // Sample student answer preset based on question topic
  const isOsi = question.questionText?.toLowerCase().includes("osi");
  const defaultSampleAnswer = isOsi
    ? "The OSI model stands for Open Systems Interconnection, which is a conceptual 7-layer reference framework created by ISO for computer networking. The 7 layers from bottom to top are: 1. Physical (cable bits), 2. Data Link (Ethernet frames & MAC), 3. Network (IP addressing & routers), 4. Transport (TCP and UDP end-to-end reliability), 5. Session, 6. Presentation (SSL encryption), and 7. Application (HTTP, DNS). For example, when opening a website, HTTP is at the application layer, TCP segments it at transport, IP addresses packets at network, and Ethernet transmits raw frames over the physical wire. It provides clear modular design across systems."
    : "A comprehensive response covering the foundational principles. The mechanism operates through successive phases, demonstrating the primary concept and providing concrete practical applications.";

  const [studentAnswerText, setStudentAnswerText] = useState(defaultSampleAnswer);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evalError, setEvalError] = useState(null);

  const handleRunAiEvaluation = async () => {
    setIsEvaluating(true);
    setEvalError(null);

    try {
      // 1. Attempt server AI evaluation
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(API_ENDPOINTS.GRADE_EVALUATE, {
        method: "POST",
        headers,
        body: JSON.stringify({
          studentName: "Interactive Rubric Tester",
          questions: [question],
          studentAnswers: [
            {
              questionNumber: question.questionNumber || 1,
              answerText: studentAnswerText
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.evaluations && data.evaluations.length > 0) {
          setEvaluationResult(data.evaluations[0]);
          return;
        }
      }

      // 2. Fallback to client-side dynamic grading engine if server offline/unauthenticated
      const dynamicEval = evaluateQuestionDynamically(
        question.id,
        question.questionNumber || 1,
        question.questionText,
        question.maxMarks,
        studentAnswerText,
        question.modelAnswer,
        question.keyConcepts || []
      );
      setEvaluationResult(dynamicEval);
    } catch (err) {
      console.warn("AI grading call fallback:", err);
      const dynamicEval = evaluateQuestionDynamically(
        question.id,
        question.questionNumber || 1,
        question.questionText,
        question.maxMarks,
        studentAnswerText,
        question.modelAnswer,
        question.keyConcepts || []
      );
      setEvaluationResult(dynamicEval);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setStudentAnswerText(defaultSampleAnswer);
    setEvaluationResult(null);
    setEvalError(null);
  };

  return (
    <div
      id="rubric-tester-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span>AI Rubric Live Evaluator</span>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Q{question.questionNumber}: {question.maxMarks} Marks
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Verify how the AI grading engine scores student answers against your defined criteria.
              </p>
            </div>
          </div>

          <button
            id="btn-close-rubric-tester"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Question Summary Banner */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">Question Prompt</span>
              <span className="font-mono text-indigo-400">{question.topic || "General"}</span>
            </div>
            <p className="text-xs text-zinc-100 font-medium leading-relaxed">
              {question.questionText}
            </p>

            {/* Criteria chips */}
            <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-indigo-400" /> Rubric Criteria:
              </span>
              {(question.keyConcepts || []).map((c, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-700/80 text-zinc-300 flex items-center gap-1"
                >
                  <span>{c.concept}</span>
                  <span className="text-indigo-400 font-mono font-semibold">({c.weightMarks}M)</span>
                </span>
              ))}
            </div>
          </div>

          {/* Student Answer Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulated Student Answer to Evaluate</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Sample
                </button>
                <span className="text-[11px] text-zinc-500">
                  {studentAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>

            <textarea
              id="input-rubric-test-student-answer"
              rows={5}
              value={studentAnswerText}
              onChange={(e) => setStudentAnswerText(e.target.value)}
              placeholder="Enter a student's answer to test how each rubric criterion is evaluated..."
              className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed font-sans"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              id="btn-run-ai-rubric-eval"
              type="button"
              disabled={isEvaluating || !studentAnswerText.trim()}
              onClick={handleRunAiEvaluation}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating with Tri-Sheet Rubrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Rubric Evaluation</span>
                </>
              )}
            </button>
          </div>

          {/* Evaluation Results Card */}
          {evaluationResult && (
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
              {/* Top Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>AI Tri-Sheet Scorecard</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Semantic Similarity: {evaluationResult.semanticSimilarityScore}% • Rigorous Rubric Mapping
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold">
                    {evaluationResult.awardedMarks} / {question.maxMarks} Marks
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-zinc-800 text-[11px] font-mono text-zinc-300">
                    {Math.round((evaluationResult.awardedMarks / question.maxMarks) * 100)}%
                  </div>
                </div>
              </div>

              {/* Criterion-by-Criterion Rubric Breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Granular Criteria Evaluation ({evaluationResult.conceptMatches?.length || 0})
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {(evaluationResult.conceptMatches || []).map((cm, idx) => {
                    const isFull = cm.status === "Full";
                    const isPartial = cm.status === "Partial";
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                          isFull
                            ? "bg-emerald-950/20 border-emerald-500/30"
                            : isPartial
                            ? "bg-amber-950/20 border-amber-500/30"
                            : "bg-rose-950/20 border-rose-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isFull ? "bg-emerald-400" : isPartial ? "bg-amber-400" : "bg-rose-400"
                              }`}
                            />
                            <span className="font-semibold text-white">{cm.concept}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                                isFull
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : isPartial
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {cm.status}
                            </span>
                          </div>

                          <span className="font-mono font-bold text-xs text-white">
                            {cm.awardedWeight} / {cm.requiredWeight} Marks
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          {cm.explanation}
                        </p>

                        {cm.matchedStudentPhrases && cm.matchedStudentPhrases.length > 0 && (
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                            <span className="text-zinc-500">Matched phrases:</span>
                            <span className="font-mono text-zinc-300">
                              "{cm.matchedStudentPhrases.slice(0, 2).join('", "')}"
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Constructive Feedback */}
              {evaluationResult.feedback && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    AI Pedagogical Feedback
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{evaluationResult.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 shrink-0">
          <p className="text-[11px] text-zinc-400">
            IntelliGrade Tri-Sheet AI Pipeline: Changes to rubrics are instantly applied to all student submissions.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
          >
            Close Tester
          </button>
        </div>
      </div>
    </div>
  );
};
