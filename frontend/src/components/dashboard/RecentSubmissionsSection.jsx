import { useState } from "react";
import { Users, Search, FileUp, Columns, ChevronRight, Eye, Clock, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "../HandwrittenUploadWorkflow";
import { EmptyState } from "../EmptyState";

export const RecentSubmissionsSection = ({
  submissions,
  exams,
  selectedSubmissionId,
  onSelectSubmission,
  onNavigateStage
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredSubmissions = submissions.filter((sub) => {
    const exam = exams.find((e) => e.id === sub.examId);
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentRollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam?.courseCode && exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <section aria-label="Recent Submissions" className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Recent Submissions</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Student handwritten answer scripts uploaded for evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, roll no..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Graded">Graded</option>
            <option value="Pending">Pending / In-Flight</option>
          </select>

          <button
            onClick={() => onNavigateStage("answer_upload")}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Sheet</span>
          </button>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title="No recent submissions found"
          description={
            searchTerm
              ? `No submissions match "${searchTerm}".`
              : "No student answer scripts registered yet."
          }
          actionLabel={searchTerm ? "Clear Filters" : "Upload Student Sheet"}
          onAction={searchTerm ? () => setSearchTerm("") : () => onNavigateStage("answer_upload")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2.5 font-semibold">Student Name & Roll No</th>
                <th className="pb-2.5 font-semibold">Examination</th>
                <th className="pb-2.5 font-semibold">Submission Date</th>
                <th className="pb-2.5 font-semibold">OCR Confidence</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubmissions.map((sub) => {
                const exam = exams.find((e) => e.id === sub.examId);
                const isSelected = sub.id === selectedSubmissionId;
                const ocrConf = sub.ocrResult?.averageConfidence || 96.5;

                return (
                  <tr
                    key={sub.id}
                    onClick={() => onSelectSubmission(sub.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-950/25" : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-3">
                      <div className="font-semibold text-slate-200">{sub.studentName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{sub.studentRollNumber}</div>
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {exam?.courseCode || "CS-301"}
                        </span>
                        <span className="text-slate-300 truncate max-w-[180px]">
                          {exam?.title || "Examination"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {sub.submissionDate || "2026-08-30 14:20"}
                    </td>

                    <td className="py-3 font-mono">
                      <span
                        className={`text-[11px] font-semibold ${
                          ocrConf >= 95
                            ? "text-emerald-400"
                            : ocrConf >= 85
                            ? "text-indigo-400"
                            : "text-amber-400"
                        }`}
                      >
                        {ocrConf}%
                      </span>
                    </td>

                    <td className="py-3">
                      <StatusBadge status={sub.status || "COMPLETED"} size="sm" />
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubmission(sub.id);
                            onNavigateStage("preprocessing");
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700 shadow-xs"
                          title="View Original Handwritten Scan"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span className="hidden sm:inline">Scan</span>
                        </button>

                        <button
                          id={`review-workspace-sub-${sub.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubmission(sub.id);
                            onNavigateStage("grading");
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1.5"
                          title="Open Two-Panel Review Workspace"
                        >
                          <Columns className="w-3 h-3 text-indigo-400" />
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
