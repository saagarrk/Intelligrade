import React from "react";
import {
  X,
  BookOpen,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  AlertCircle,
  FileUp,
  HelpCircle,
  ChevronRight
} from "lucide-react";

export const ExamDetailsModal = ({
  exam,
  isOpen,
  onClose,
  onSubmitPaper,
  isSubmitted = false,
  submission = null
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div
      id="exam-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="exam-details-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {exam.courseCode || "EXAM"}
              </span>
              <span className="text-xs text-slate-400">
                {exam.subject || "Course Assessment"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {exam.gradeLevel || "Undergraduate"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {exam.title}
            </h2>
          </div>

          <button
            id="btn-close-exam-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Total Marks</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                {exam.totalMarks} Marks
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Passing Marks</span>
              <span className="text-base font-bold font-mono text-slate-200 mt-0.5 block">
                {exam.passingMarks || Math.round(exam.totalMarks * 0.4)} Marks (40%)
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Duration</span>
              <span className="text-base font-bold text-indigo-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{exam.durationMinutes || 90} Mins</span>
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Questions</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">
                {exam.questions?.length || 0} Questions
              </span>
            </div>
          </div>

          {/* Description */}
          {exam.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Examination Overview & Scope</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                {exam.description}
              </p>
            </div>
          )}

          {/* Instructions for Students */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>General Examination Instructions</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
              {(exam.instructions && exam.instructions.length > 0 ? exam.instructions : [
                "Write clearly and legibly in dark blue or black ink.",
                "Draw neat architectural diagrams or equations where applicable.",
                "Ensure candidate roll number and question numbers are accurately labeled on all submitted pages."
              ]).map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question Blueprint */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Question Paper Syllabus & Rubric Blueprint</span>
            </h3>
            <div className="space-y-2">
              {exam.questions?.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">
                      Question {q.questionNumber}: {q.topic || "Core Topic"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        q.difficulty === "Hard"
                          ? "bg-rose-500/15 text-rose-300"
                          : q.difficulty === "Medium"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}>
                        {q.difficulty || "Medium"}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {q.maxMarks} Marks
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    {q.questionText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Status Note */}
          {isSubmitted && submission && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-200">
                  You submitted this examination on {new Date(submission.submissionDate || Date.now()).toLocaleDateString()}.
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                Score: {submission.percentageScore}%
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Close
          </button>

          {!isSubmitted && onSubmitPaper && (
            <button
              id="btn-modal-submit-paper"
              onClick={() => {
                onClose();
                onSubmitPaper(exam);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FileUp className="w-4 h-4" />
              <span>Submit Answer Paper</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
