import { useState } from "react";
import {
  AlertTriangle,
  MessageSquareQuote,
  Check,
  X,
  Columns,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText
} from "lucide-react";
import { EmptyState } from "../EmptyState";

export const PendingReviewsSection = ({
  appeals,
  submissions,
  onHandleAppeal,
  onSelectSubmission,
  onNavigateStage
}) => {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'appeals' | 'flagged'

  // Extract flagged questions from all submissions
  const flaggedItems = submissions.flatMap((sub) => {
    return (sub.questionEvaluations || [])
      .filter((q) => q.isFlagged || q.evaluationStatus === "FLAGGED" || (q.confidenceScore && q.confidenceScore < 80))
      .map((q) => ({
        submissionId: sub.id,
        studentName: sub.studentName,
        studentRollNumber: sub.studentRollNumber,
        examId: sub.examId,
        questionNumber: q.questionNumber || 1,
        questionText: q.question || q.questionText,
        awardedMarks: q.awardedMarks || q.aiSuggestedMarks || 0,
        maxMarks: q.maxMarks || 10,
        confidenceScore: q.confidenceScore || 75,
        flagReason: q.flagReason || "Confidence score below threshold (74%) — requires teacher verification."
      }));
  });

  const pendingAppeals = appeals.filter((a) => a.status === "Pending");
  const totalPending = pendingAppeals.length + flaggedItems.length;

  return (
    <section aria-label="Pending Reviews" className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Pending Reviews & Discrepancy Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Student re-evaluation appeals and AI-flagged ambiguous handwriting items.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              activeTab === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Items ({totalPending})
          </button>

          <button
            onClick={() => setActiveTab("appeals")}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === "appeals" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Appeals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
              {pendingAppeals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("flagged")}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
              activeTab === "flagged" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Flagged Answers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300">
              {flaggedItems.length}
            </span>
          </button>
        </div>
      </div>

      {totalPending === 0 ? (
        <EmptyState
          title="No pending reviews"
          description="All student appeals and AI-flagged answer items have been resolved."
          icon={Check}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Section: Student Appeals */}
          {(activeTab === "all" || activeTab === "appeals") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                  <span>Student Re-evaluation Appeals ({pendingAppeals.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Direct instructor override</span>
              </div>

              {pendingAppeals.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                  No active student appeals pending.
                </div>
              ) : (
                pendingAppeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200">{appeal.studentName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({appeal.rollNumber})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {appeal.status} Appeal
                      </span>
                    </div>

                    <div className="p-2 rounded bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-center justify-between">
                      <span>
                        <strong>Question {appeal.questionNumber}:</strong> Current {appeal.currentMarks} / {appeal.maxMarks} marks
                      </span>
                      <span className="font-semibold text-emerald-400">
                        Request: +{appeal.suggestedBoost} pts
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 italic bg-slate-900/80 p-2 rounded border border-slate-800/80">
                      "{appeal.reason}"
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onHandleAppeal(appeal.id, "Approve")}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept (+{appeal.suggestedBoost} pts)</span>
                      </button>

                      <button
                        onClick={() => onHandleAppeal(appeal.id, "Reject")}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Maintain Mark</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Section: Flagged Answers / Low-confidence items */}
          {(activeTab === "all" || activeTab === "flagged") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Flagged Answers & Low OCR ({flaggedItems.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">Requires manual visual sign-off</span>
              </div>

              {flaggedItems.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                  No flagged answers or low OCR confidence items.
                </div>
              ) : (
                flaggedItems.map((item, idx) => (
                  <div
                    key={`${item.submissionId}-flag-${idx}`}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200">{item.studentName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({item.studentRollNumber})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        Flagged
                      </span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                      <span>
                        <strong>Question {item.questionNumber}:</strong> {item.awardedMarks} / {item.maxMarks} marks
                      </span>
                      <span className="font-mono text-amber-400">
                        OCR: {item.confidenceScore}%
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-300/90 bg-rose-950/25 p-2 rounded border border-rose-900/30">
                      {item.flagReason}
                    </p>

                    <button
                      onClick={() => {
                        onSelectSubmission(item.submissionId);
                        onNavigateStage("grading");
                      }}
                      className="w-full py-1.5 px-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/30 transition shadow-xs"
                    >
                      <Columns className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect in Review Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
