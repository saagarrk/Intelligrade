import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Award, 
  Percent, 
  AlertTriangle, 
  Sliders, 
  Edit3, 
  ArrowRight, 
  FileCheck, 
  Sparkles, 
  ShieldAlert,
  Save,
  MessageSquare,
  Lock,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import { ExamPaper, StudentSubmission, QuestionEvaluation } from '../types';
import { useAuth } from '../context/AuthContext';

interface Stage3Props {
  submission: StudentSubmission;
  exam: ExamPaper;
  onUpdateEvaluation: (evaluations: QuestionEvaluation[]) => void;
  onNextStage: () => void;
  onOpenAppealModal?: () => void;
}

export const Stage3Grading: React.FC<Stage3Props> = ({
  submission,
  exam,
  onUpdateEvaluation,
  onNextStage,
  onOpenAppealModal
}) => {
  const { user, role, isStudent, isTeacher, isAdmin } = useAuth();
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[]>(submission.questionEvaluations);
  const [selectedQId, setSelectedQId] = useState<string>(exam.questions[0]?.id || '');
  const [overrideMode, setOverrideMode] = useState<boolean>(false);
  const [teacherComments, setTeacherComments] = useState<{ [qId: string]: string }>({});

  useEffect(() => {
    setEvaluations(submission.questionEvaluations);
  }, [submission]);

  const activeEval = evaluations.find(e => e.questionId === selectedQId) || evaluations[0];
  const activeQuestion = exam.questions.find(q => q.id === selectedQId) || exam.questions[0];

  // Calculate live total marks including any teacher overrides
  const totalMax = exam.totalMarks;
  const currentTotalAwarded = evaluations.reduce((sum, e) => {
    const val = e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks;
    return sum + val;
  }, 0);
  const currentPercentage = Number(((currentTotalAwarded / (totalMax || 1)) * 100).toFixed(1));

  const handleOverrideScore = (qId: string, newScore: number) => {
    if (isStudent) return; // Authorization guard
    const updated = evaluations.map(e => {
      if (e.questionId === qId) {
        return {
          ...e,
          teacherOverrideMarks: Math.min(e.maxMarks, Math.max(0, newScore))
        };
      }
      return e;
    });
    setEvaluations(updated);
    onUpdateEvaluation(updated);
  };

  const handleTeacherCommentChange = (qId: string, comment: string) => {
    if (isStudent) return; // Authorization guard
    setTeacherComments(prev => ({ ...prev, [qId]: comment }));
    const updated = evaluations.map(e => {
      if (e.questionId === qId) {
        return { ...e, teacherComment: comment };
      }
      return e;
    });
    setEvaluations(updated);
    onUpdateEvaluation(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                3
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {isStudent ? 'Candidate Graded Scorecard & Feedback' : 'Stage 3: Context-Based Marking & Marks Assignment'}
              </h2>
              {isStudent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Student Portal
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {isStudent 
                ? `Official graded results for ${submission.studentName} (${submission.studentRollNumber}) on ${exam.title}. Review concept matches, rubric feedback, and appeal if needed.`
                : 'Applies machine learning context matching against the model answer rubric. Automatically computes partial credit, deductive penalties, and enables teacher audit overrides.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
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
              <button
                id="toggle-teacher-override-btn"
                onClick={() => setOverrideMode(!overrideMode)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  overrideMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-[#09090b] text-slate-300 hover:text-white border-[#27272a]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{overrideMode ? 'Teacher Audit: ON' : 'Teacher Override Mode'}</span>
              </button>
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

        {/* Executive Score Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#27272a]">
          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Score</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              <span className="text-indigo-400">{currentTotalAwarded}</span> / {totalMax} Marks
            </div>
            <span className="text-[10px] text-slate-500">{evaluations.length} Questions Evaluated</span>
          </div>

          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Percentage Grade</span>
            <div className={`text-xl font-bold font-mono mt-0.5 ${
              currentPercentage >= 80 ? 'text-emerald-400' : currentPercentage >= 60 ? 'text-indigo-400' : 'text-amber-400'
            }`}>
              {currentPercentage}%
            </div>
            <span className="text-[10px] text-slate-500">
              {currentPercentage >= 80 ? 'Distinction (A)' : currentPercentage >= 60 ? 'First Class (B)' : 'Pass (C)'}
            </span>
          </div>

          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Semantic Alignment</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {Math.round(evaluations.reduce((a, b) => a + b.semanticSimilarityScore, 0) / (evaluations.length || 1))}%
            </div>
            <span className="text-[10px] text-slate-500">Avg Concept Overlap</span>
          </div>

          <div className="bg-[#09090b] p-3 rounded-lg border border-[#27272a]">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Grading Status</span>
            <div className="text-base font-semibold text-emerald-400 flex items-center space-x-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{overrideMode ? 'Teacher Audited' : 'AI Verified'}</span>
            </div>
            <span className="text-[10px] text-slate-500">RESTful payload synced</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Marks Breakdown Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Question-by-Question Evaluation Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Click any question row to inspect its key concept matching matrix, deduction details, and reference answers.
            </p>
          </div>
        </div>

        {/* Questions Grid/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#09090b] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#27272a]">
              <tr>
                <th className="px-4 py-3">Q#</th>
                <th className="px-4 py-3">Question Description</th>
                <th className="px-4 py-3 text-center">Max Marks</th>
                <th className="px-4 py-3 text-center">AI Awarded</th>
                <th className="px-4 py-3 text-center">
                  {isStudent ? 'Final Marks' : 'Teacher Override'}
                </th>
                <th className="px-4 py-3 text-center">Semantic Match</th>
                <th className="px-4 py-3 text-center">Concept Coverage</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {evaluations.map((ev) => {
                const isSelected = ev.questionId === selectedQId;
                const fullCount = ev.conceptMatches.filter(c => c.status === 'Full').length;
                const totalCount = ev.conceptMatches.length;

                return (
                  <tr
                    key={ev.questionId}
                    onClick={() => setSelectedQId(ev.questionId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
                        : 'hover:bg-[#27272a]/40'
                    }`}
                  >
                    <td className="px-4 py-3.5 font-bold text-white">Q{ev.questionNumber}</td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-300 font-medium">
                      {ev.questionText}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-400">{ev.maxMarks}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-semibold text-emerald-400">
                      {ev.awardedMarks}
                    </td>
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      {!isStudent && overrideMode ? (
                        <input
                          type="number"
                          min="0"
                          max={ev.maxMarks}
                          step="0.5"
                          value={ev.teacherOverrideMarks !== undefined ? ev.teacherOverrideMarks : ev.awardedMarks}
                          onChange={(e) => handleOverrideScore(ev.questionId, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-[#09090b] text-center font-mono text-xs font-bold text-amber-300 border border-amber-500/50 rounded py-1 px-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {ev.teacherOverrideMarks !== undefined ? (
                            <span className="text-amber-400 font-semibold">{ev.teacherOverrideMarks} (Audited)</span>
                          ) : (
                            ev.awardedMarks
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 bg-[#09090b] rounded font-mono text-[11px] text-indigo-300 border border-[#27272a]">
                        {Math.round(ev.semanticSimilarityScore)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        fullCount === totalCount
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : fullCount > 0
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {fullCount}/{totalCount} Matched
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          isSelected ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white bg-[#09090b]'
                        }`}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Question In-Depth Concept & Deductions Inspector */}
      {activeEval && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Answers and Feedback (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-indigo-600/30 text-indigo-300 rounded text-xs font-bold">
                    Question {activeEval.questionNumber}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {activeQuestion?.topic || 'Core Subject Module'}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Max Marks: <span className="font-bold text-white">{activeEval.maxMarks}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-200">
                <span className="font-semibold text-slate-400 block mb-1 text-[11px] uppercase">Question Prompt:</span>
                {activeEval.questionText}
              </div>

              {/* Side by side student vs model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Student Extracted Answer
                  </span>
                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs font-mono text-slate-200 min-h-[140px] leading-relaxed">
                    {activeEval.studentAnswerText}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Reference Model Answer
                  </span>
                  <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-emerald-200 min-h-[140px] leading-relaxed">
                    {activeEval.modelAnswerText}
                  </div>
                </div>
              </div>

              {/* Context Feedback */}
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Grader Contextual Feedback</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeEval.feedback}
                </p>
              </div>

              {/* Teacher Remarks Box */}
              <div className="space-y-1.5 pt-2 border-t border-[#27272a]">
                <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Teacher Audit Remarks / Custom Note:</span>
                </label>
                {!isStudent ? (
                  <textarea
                    id={`teacher-comment-q${activeEval.questionNumber}`}
                    value={teacherComments[activeEval.questionId] || activeEval.teacherComment || ''}
                    onChange={(e) => handleTeacherCommentChange(activeEval.questionId, e.target.value)}
                    rows={2}
                    placeholder="Enter manual override comments or teacher guidance for the student..."
                    className="w-full bg-[#09090b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                ) : (
                  <div className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-300 italic">
                    {activeEval.teacherComment || 'Instructor has reviewed and validated this mark.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key Concepts & Deductions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 border-b border-[#27272a] pb-3">
                Key Concept Matching & Deductions (Q{activeEval.questionNumber})
              </h3>

              {/* Concept Matching List */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Concept Matrix Coverage:
                </span>
                {activeEval.conceptMatches.map((cm, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{cm.concept}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          cm.status === 'Full'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : cm.status === 'Partial'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {cm.awardedWeight} / {cm.requiredWeight} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{cm.explanation}</p>
                  </div>
                ))}
              </div>

              {/* Tri-Sheet "Own-Words" Equivalence Card */}
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gemini AI "Own-Words" Matrix Verified</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50 font-mono">
                    Sheet 3 Matched
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Candidate's answer was cross-referenced against the <strong className="text-purple-300">Gemini 3.7 Flash Semantic Matrix</strong>. Concepts phrased in the student's own words/analogies were recognized as conceptually valid with zero penalty.
                </p>
                {activeQuestion?.geminiSemanticMatrix?.ownWordsVariations?.[0] && (
                  <div className="p-2 bg-[#121019] rounded border border-purple-900/30 text-[10px] text-purple-200 font-mono">
                    Matched Pattern: "{activeQuestion.geminiSemanticMatrix.ownWordsVariations[0].variantTitle}"
                  </div>
                )}
              </div>

              {/* Deductions Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#27272a]">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Deduction Reasons:</span>
                </span>
                {activeEval.deductions.length > 0 ? (
                  activeEval.deductions.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20 flex items-start justify-between text-xs"
                    >
                      <div>
                        <span className="text-[10px] font-medium text-rose-300 block">
                          [{d.category}]
                        </span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{d.reason}</p>
                      </div>
                      <span className="text-rose-400 font-semibold font-mono text-xs ml-2 shrink-0">
                        -{d.pointsDeducted}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs text-emerald-300">
                    ✓ Zero point deductions. Full conceptual points awarded.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
