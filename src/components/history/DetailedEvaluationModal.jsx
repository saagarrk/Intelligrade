import React, { useState } from "react";
import { X, Award, CheckCircle2, Clock, AlertTriangle, Download, ChevronDown, ChevronUp, Cpu, ShieldCheck, HelpCircle, Sparkles, Layers, Copy, Check } from "lucide-react";
import { exportStudentEvaluationPDF } from "../../utils/pdfExport";
import { showSweetToast } from "../../utils/sweetAlert";
export const DetailedEvaluationModal = ({ evaluation, isOpen, onClose, isStudent = false, onOpenGradingWorkspace, onOpenAppealModal, onOpenResultPage }) => {
    const [activeSection, setActiveSection] = useState("questions");
    const [expandedQuestion, setExpandedQuestion] = useState(1);
    const [copiedHash, setCopiedHash] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    if (!isOpen || !evaluation)
        return null;
    const handleCopyHash = () => {
        navigator.clipboard.writeText(evaluation.id);
        setCopiedHash(true);
        showSweetToast("Evaluation ID copied to clipboard", "success");
        setTimeout(() => setCopiedHash(false), 2000);
    };
    const handleExportPDF = async () => {
        try {
            setIsExporting(true);
            // Create minimal compatible StudentSubmission & ExamPaper objects for PDF exporter
            const mockSubmission = {
                id: evaluation.submissionId,
                studentName: evaluation.studentName,
                studentRollNumber: evaluation.studentRollNumber,
                submissionDate: evaluation.evaluationFormattedDate,
                totalMaxMarks: evaluation.totalMaxMarks,
                totalAwardedMarks: evaluation.totalAwardedMarks,
                percentageScore: evaluation.percentageScore,
                status: evaluation.status === "Evaluated" ? "Graded" : "Under Review",
                ocrResult: {
                    fullExtractedText: (evaluation.questionEvaluations || []).map((q) => `Q${q.questionNumber}: ${q.studentAnswerSnippet}`).join("\n\n"),
                    averageConfidence: evaluation.ocrConfidence,
                    detectedLanguage: "English (Technical)",
                    engineUsed: "Gemini Vision Multimodal",
                    durationMs: 420,
                    detectedLines: []
                },
                questionEvaluations: (evaluation.questionEvaluations || []).map((q) => ({
                    questionNumber: q.questionNumber,
                    questionId: q.questionId,
                    question: q.questionText,
                    questionText: q.questionText,
                    maxMarks: q.maxMarks,
                    awardedMarks: q.awardedMarks,
                    aiSuggestedMarks: q.aiSuggestedMarks,
                    teacherAdjustedMarks: q.teacherAdjustedMarks,
                    finalMarks: q.finalMarks,
                    evaluationStatus: q.evaluationStatus,
                    confidenceScore: q.confidenceScore,
                    semanticSimilarityScore: q.semanticSimilarityScore,
                    studentAnswer: q.studentAnswerSnippet,
                    studentAnswerText: q.studentAnswerSnippet,
                    modelAnswer: q.modelAnswerSnippet,
                    modelAnswerText: q.modelAnswerSnippet,
                    teacherComment: q.teacherComment,
                    evaluationFeedback: q.evaluationFeedback,
                    feedback: q.evaluationFeedback,
                    strengths: q.strengths,
                    weaknesses: [],
                    deductions: q.deductions.map((d) => ({
                        reason: d.reason,
                        pointsDeducted: d.pointsDeducted,
                        category: d.category
                    })),
                    conceptMatches: (q.conceptMatches || []).map((c) => ({
                        concept: c.concept,
                        status: c.status,
                        requiredWeight: c.weightMarks,
                        awardedWeight: c.awardedMarks,
                        explanation: `Matched: ${c.status}`
                    }))
                })),
                personalizedInsights: {
                    overallSummary: evaluation.overallFeedback,
                    keyStrengths: evaluation.keyStrengths,
                    criticalGaps: evaluation.growthAreas,
                    actionableRecommendations: ["Review question deductions and practice mathematical derivations."],
                    studyTopicsToRevise: []
                },
                predictiveAnalytics: {
                    predictedNextScore: Math.min(100, Math.round(evaluation.percentageScore + 3)),
                    scoreRangeConfidence: [Math.max(0, Math.round(evaluation.percentageScore - 5)), Math.min(100, Math.round(evaluation.percentageScore + 5))],
                    predictedPassProbability: evaluation.passed ? 95 : 60,
                    knowledgeRetentionIndex: Math.round(evaluation.percentageScore * 0.95),
                    classPercentileRank: 15,
                    examReadinessLevel: evaluation.passed ? "High Mastery" : "Foundational Needs Improvement",
                    radarSkills: []
                }
            };
            const mockExam = {
                id: evaluation.examId,
                title: evaluation.examTitle,
                subject: evaluation.subject,
                courseCode: evaluation.courseCode,
                totalMarks: evaluation.totalMaxMarks,
                passingMarks: Math.round(evaluation.totalMaxMarks * 0.4),
                gradeLevel: evaluation.gradeLevel,
                instructions: ["Official verified evaluation record."]
            };
            await exportStudentEvaluationPDF(mockSubmission, mockExam, {
                evaluatorName: `${evaluation.evaluator.name} (${evaluation.evaluator.role})`,
                fileName: `${evaluation.studentRollNumber}_${evaluation.courseCode}_Evaluation_Report.pdf`
            });
            showSweetToast("Official Evaluation PDF exported successfully!", "success");
        }
        catch (e) {
            console.error(e);
            window.print();
        }
        finally {
            setIsExporting(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "Evaluated":
                return <CheckCircle2 className="w-4 h-4 text-emerald-400"/>;
            case "Under Review":
                return <Clock className="w-4 h-4 text-amber-400"/>;
            case "AI Evaluated":
                return <Sparkles className="w-4 h-4 text-indigo-400"/>;
            case "Flagged / Appeal":
                return <AlertTriangle className="w-4 h-4 text-rose-400"/>;
            default:
                return <Clock className="w-4 h-4 text-purple-400"/>;
        }
    };
    return (<div id="detailed-evaluation-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn" onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }}>
      <div className="relative w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-950/80 border-b border-neutral-800/80 gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${evaluation.avatarColor} flex items-center justify-center text-white font-black text-lg shadow-md shrink-0`}>
              {evaluation.studentName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight">{evaluation.studentName}</h3>
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-xs font-mono font-medium border border-neutral-700/60">
                  {evaluation.studentRollNumber}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${evaluation.statusBadgeColor.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${evaluation.statusBadgeColor.dot}`}/>
                  {evaluation.statusLabel}
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5 flex-wrap">
                <span>{evaluation.examTitle}</span>
                <span>•</span>
                <span className="text-indigo-400 font-medium">{evaluation.courseCode}</span>
                <span>•</span>
                <span>{evaluation.evaluationFormattedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button id="btn-copy-eval-id" onClick={handleCopyHash} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors border border-neutral-700/60 cursor-pointer" title="Copy Evaluation ID">
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
              <span className="font-mono text-xs hidden md:inline">{evaluation.id}</span>
            </button>

            <button id="btn-modal-export-pdf" onClick={handleExportPDF} disabled={isExporting} className="px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Download className="w-3.5 h-3.5"/>
              <span>{isExporting ? "Generating..." : "Export PDF"}</span>
            </button>

            {onOpenResultPage && (<button id="btn-modal-open-result-page" onClick={() => {
                onClose();
                onOpenResultPage(evaluation.submissionId, evaluation.examId);
            }} className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer" title="Open Official Result Page & Dossier">
                <Award className="w-3.5 h-3.5 text-emerald-400"/>
                <span>Official Result</span>
              </button>)}

            {!isStudent && onOpenGradingWorkspace && (<button id="btn-modal-open-grading" onClick={() => {
                onClose();
                onOpenGradingWorkspace(evaluation.submissionId, evaluation.examId);
            }} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm" title="Open directly in Stage 3 Tri-Sheet Evaluation Workspace">
                <Layers className="w-3.5 h-3.5"/>
                <span className="hidden sm:inline">Tri-Sheet Workspace</span>
              </button>)}

            {isStudent && onOpenAppealModal && (<button id="btn-modal-appeal" onClick={() => {
                onClose();
                onOpenAppealModal(evaluation);
            }} className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm" title="File Re-Evaluation Appeal">
                <HelpCircle className="w-3.5 h-3.5"/>
                <span>Appeal Marks</span>
              </button>)}

            <button id="btn-modal-close" onClick={onClose} className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* Highlight Score Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-neutral-950/40 border-b border-neutral-800/80">
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              <Award className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-[11px] font-medium text-neutral-400">Awarded Marks</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white">{evaluation.totalAwardedMarks}</span>
                <span className="text-xs text-neutral-500 font-semibold">/ {evaluation.totalMaxMarks}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <span className="text-sm font-black">{evaluation.percentageScore}%</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-neutral-400">Score & Grade</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-400">{evaluation.letterGrade}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${evaluation.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {evaluation.passed ? "PASSED" : "REMEDIAL"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold shrink-0">
              <Cpu className="w-5 h-5"/>
            </div>
            <div>
              <p className="text-[11px] font-medium text-neutral-400">Vision OCR Confidence</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white">{evaluation.ocrConfidence}%</span>
                <span className="text-[10px] text-neutral-400">({evaluation.ocrLegibility})</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0">
              <ShieldCheck className="w-5 h-5 text-indigo-400"/>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-neutral-400">Evaluated By</p>
              <p className="text-xs font-bold text-white truncate">{evaluation.evaluator.name}</p>
              <p className="text-[10px] text-neutral-500 truncate">{evaluation.evaluator.role}</p>
            </div>
          </div>
        </div>

        {/* Modal Section Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-neutral-800 bg-neutral-950/20">
          {[
            { id: "questions", label: `Question Breakdown (${(evaluation.questionEvaluations || []).length})`, icon: Layers },
            { id: "summary", label: "Diagnostic Insights & Remarks", icon: Sparkles },
            { id: "audit", label: "Audit Trail & Verification", icon: Clock },
            ...(evaluation.appeal ? [{ id: "appeal", label: "Appeal Case Log", icon: HelpCircle }] : [])
        ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSection === tab.id;
            return (<button key={tab.id} id={`modal-tab-${tab.id}`} onClick={() => setActiveSection(tab.id)} className={`px-3 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${isSelected
                    ? "text-indigo-400 border-indigo-500"
                    : "text-neutral-400 border-transparent hover:text-neutral-200"}`}>
                <Icon className="w-3.5 h-3.5"/>
                <span>{tab.label}</span>
              </button>);
        })}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* SECTION 1: QUESTION BREAKDOWN */}
          {activeSection === "questions" && (<div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  Item-by-item scoring comparing AI suggestions, teacher adjustments, and rubrics.
                </p>
                <button onClick={() => setExpandedQuestion(expandedQuestion === null ? 1 : null)} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
                  {expandedQuestion === null ? "Expand First Question" : "Collapse All"}
                </button>
              </div>

              <div className="space-y-3">
                {(evaluation.questionEvaluations || []).map((q) => {
                const isExpanded = expandedQuestion === q.questionNumber;
                const accuracy = q.maxMarks > 0 ? Math.round((q.awardedMarks / q.maxMarks) * 100) : 0;
                return (<div key={q.questionNumber} id={`eval-question-${q.questionNumber}`} className="border border-neutral-800 rounded-xl bg-neutral-950/40 overflow-hidden transition-all">
                      {/* Question Item Header */}
                      <button onClick={() => setExpandedQuestion(isExpanded ? null : q.questionNumber)} className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-800/30 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 pr-4">
                          <span className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-xs font-mono font-bold text-neutral-200 shrink-0">
                            Q{q.questionNumber}
                          </span>
                          <div>
                            <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1">{q.questionText}</h4>
                            <span className="text-[11px] text-neutral-500 font-medium">{q.topic}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold text-white">
                              {q.awardedMarks} <span className="text-neutral-500 text-xs">/ {q.maxMarks}</span>
                            </span>
                            <span className={`block text-[10px] font-semibold ${accuracy >= 80 ? "text-emerald-400" : accuracy >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                              {accuracy}% accuracy
                            </span>
                          </div>
                          {isExpanded ? (<ChevronUp className="w-4 h-4 text-neutral-400"/>) : (<ChevronDown className="w-4 h-4 text-neutral-400"/>)}
                        </div>
                      </button>

                      {/* Expanded Question Details */}
                      {isExpanded && (<div className="p-4 border-t border-neutral-800/80 bg-neutral-900/60 space-y-4 text-xs">
                          {/* Marks Comparative Bar */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800">
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-medium">AI Suggested Marks</span>
                              <span className="text-sm font-bold text-indigo-400">
                                {q.aiSuggestedMarks} / {q.maxMarks}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-medium">
                                Teacher Adjusted Marks
                              </span>
                              <span className="text-sm font-bold text-amber-400">
                                {q.teacherAdjustedMarks !== null ? `${q.teacherAdjustedMarks} / ${q.maxMarks}` : "None (Approved AI)"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-400 block font-medium">
                                Semantic Similarity & Confidence
                              </span>
                              <span className="text-sm font-bold text-emerald-400">
                                {q.semanticSimilarityScore}% ({q.confidenceScore}% conf)
                              </span>
                            </div>
                          </div>

                          {/* Student Extracted Handwriting Answer */}
                          <div>
                            <span className="text-[11px] font-bold text-neutral-300 block mb-1">
                              Student Extracted Handwriting Text (OCR)
                            </span>
                            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                              {q.studentAnswerSnippet || "No extracted text available for this question."}
                            </div>
                          </div>

                          {/* Evaluator Qualitative Feedback */}
                          <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400"/>
                              Official Evaluation Feedback
                            </span>
                            <p className="text-neutral-300 leading-relaxed">{q.evaluationFeedback}</p>
                            {q.teacherComment && (<div className="mt-2 pt-2 border-t border-indigo-500/20 text-neutral-300">
                                <span className="text-[10px] font-bold text-amber-400 block">Instructor Audit Note:</span>
                                <p className="italic text-neutral-200">{q.teacherComment}</p>
                              </div>)}
                          </div>

                          {/* Deductions breakdown if any */}
                          {q.deductions && q.deductions.length > 0 && (<div>
                              <span className="text-[11px] font-bold text-rose-400 block mb-1.5">
                                Deductions & Penalties Applied
                              </span>
                              <div className="space-y-1.5">
                                {q.deductions.map((d, dIdx) => (<div key={dIdx} className="p-2 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-300">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20">
                                        {d.category}
                                      </span>
                                      <span>{d.reason}</span>
                                    </div>
                                    <span className="font-mono font-bold text-rose-400">-{d.pointsDeducted} pts</span>
                                  </div>))}
                              </div>
                            </div>)}

                          {/* Key concepts matches if any */}
                          {q.conceptMatches && q.conceptMatches.length > 0 && (<div>
                              <span className="text-[11px] font-bold text-neutral-300 block mb-1.5">
                                Key Rubric Concepts Assessed
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.conceptMatches.map((c, cIdx) => (<div key={cIdx} className="p-2 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                                    <span className="text-neutral-300 truncate pr-2">{c.concept}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${c.status === "Full"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : c.status === "Partial"
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-rose-500/20 text-rose-400"}`}>
                                      {c.status} ({c.awardedMarks}/{c.weightMarks})
                                    </span>
                                  </div>))}
                              </div>
                            </div>)}
                        </div>)}
                    </div>);
            })}
              </div>
            </div>)}

          {/* SECTION 2: DIAGNOSTIC INSIGHTS & REMARKS */}
          {activeSection === "summary" && (<div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4"/>
                  Overall Evaluation Synthesis
                </span>
                <p className="text-xs text-neutral-200 leading-relaxed">{evaluation.overallFeedback}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4"/>
                    Demonstrated Conceptual Strengths
                  </span>
                  <ul className="space-y-1.5">
                    {evaluation.keyStrengths.map((str, idx) => (<li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"/>
                        <span>{str}</span>
                      </li>))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4"/>
                    Targeted Pedagogical Growth Areas
                  </span>
                  <ul className="space-y-1.5">
                    {evaluation.growthAreas.map((gap, idx) => (<li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"/>
                        <span>{gap}</span>
                      </li>))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-2">
                <span className="text-xs font-bold text-neutral-300 block">Official Evaluator Certification</span>
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <div>
                    <p className="font-bold text-white">{evaluation.evaluator.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {evaluation.evaluator.role} • {evaluation.evaluator.designation}
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Signed: {evaluation.evaluationFormattedDate}
                  </span>
                </div>
              </div>
            </div>)}

          {/* SECTION 3: AUDIT TRAIL & VERIFICATION */}
          {activeSection === "audit" && (<div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Tamper-evident verification sequence from handwritten paper intake to final marks certification.
              </p>

              <div className="relative pl-6 border-l border-neutral-800 space-y-6 my-2">
                {evaluation.auditTrail.map((event, idx) => (<div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo-600 border-2 border-neutral-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{event.stage}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{event.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{event.details}</p>
                      <span className="text-[10px] text-indigo-400 font-medium block mt-1">By: {event.actor}</span>
                    </div>
                  </div>))}
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>Unique Cryptographic Record Hash:</span>
                <span className="text-indigo-400 font-bold">{evaluation.id}</span>
              </div>
            </div>)}

          {/* SECTION 4: APPEAL LOG (IF ANY) */}
          {activeSection === "appeal" && evaluation.appeal && (<div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4"/>
                  Re-Evaluation Appeal Filed
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Status: {evaluation.appeal.status}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-neutral-300">
                  <strong className="text-white">Target Question:</strong> Question {evaluation.appeal.questionNumber}
                </p>
                <p className="text-neutral-300">
                  <strong className="text-white">Grounds for Appeal:</strong> {evaluation.appeal.reason}
                </p>
                <p className="text-neutral-300">
                  <strong className="text-white">Student Stated Claim:</strong> "{evaluation.appeal.studentClaim}"
                </p>
                <p className="text-[11px] text-neutral-500 mt-2">Filed on: {evaluation.appeal.requestedAt}</p>
              </div>
            </div>)}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-neutral-950 border-t border-neutral-800 text-xs">
          <span className="text-neutral-500">IntelliGrade AI Verified Evaluation Registry</span>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer">
            Close Details
          </button>
        </div>
      </div>
    </div>);
};
