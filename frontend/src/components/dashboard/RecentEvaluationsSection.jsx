import { FileCheck2, FileText, Columns, ChevronRight, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { exportStudentEvaluationPDF, exportBatchEvaluationSummaryPDF } from "../../utils/pdfExport";
import { showSweetToast } from "../../utils/sweetAlert";

export const RecentEvaluationsSection = ({
  submissions,
  exams,
  user,
  onSelectSubmission,
  onNavigateStage
}) => {
  // Filter evaluated/graded submissions
  const evaluatedSubmissions = submissions.filter(
    (s) => s.status === "Graded" || s.totalAwardedMarks !== undefined
  );

  const handleExportSinglePdf = async (sub) => {
    const exam = exams.find((e) => e.id === sub.examId) || exams[0];
    try {
      await exportStudentEvaluationPDF(sub, exam, {
        institutionName: user?.department ? `DEPARTMENT OF ${user.department.toUpperCase()}` : "DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING",
        evaluatorName: user?.name || "Faculty Evaluation Committee"
      });
      showSweetToast(`Official PDF dossier exported for ${sub.studentName}`, "success");
    } catch (error) {
      console.error("Failed to export student evaluation PDF:", error);
      showSweetToast("Failed to export student PDF evaluation report", "error");
    }
  };

  const getGradePill = (pct) => {
    if (pct >= 90) return { label: "Grade A+", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
    if (pct >= 80) return { label: "Grade A", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
    if (pct >= 70) return { label: "Grade B", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
    if (pct >= 60) return { label: "Grade C", color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" };
    return { label: "Remediation", color: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
  };

  return (
    <section aria-label="Recent Evaluations" className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
            <span>Recent Evaluations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Completed scoring dossiers verified with rubric equivalence matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {evaluatedSubmissions.length} Papers Graded
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="pb-2.5 font-semibold">Student & Roll No</th>
              <th className="pb-2.5 font-semibold">Examination</th>
              <th className="pb-2.5 font-semibold">Awarded Score</th>
              <th className="pb-2.5 font-semibold">Percentage & Grade</th>
              <th className="pb-2.5 font-semibold">Evaluation Mode</th>
              <th className="pb-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {evaluatedSubmissions.map((sub) => {
              const exam = exams.find((e) => e.id === sub.examId);
              const grade = getGradePill(sub.percentageScore || 85);
              const hasTeacherOverride = sub.questionEvaluations?.some(
                (q) => q.teacherAdjustedMarks !== null && q.teacherAdjustedMarks !== undefined
              );

              return (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{sub.studentName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{sub.studentRollNumber}</div>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {exam?.courseCode || "CS-301"}
                      </span>
                      <span className="text-slate-300 truncate max-w-[170px]">
                        {exam?.title || "Examination"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 font-mono">
                    <span className="font-bold text-emerald-400">
                      {sub.totalAwardedMarks}
                    </span>
                    <span className="text-slate-500 ml-1">
                      / {sub.totalMaxMarks} pts
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">
                        {sub.percentageScore}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${grade.color}`}>
                        {grade.label}
                      </span>
                    </div>
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {hasTeacherOverride ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Teacher Finalized</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>AI Rubric Graded</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleExportSinglePdf(sub)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700 shadow-xs"
                        title="Download official grading dossier PDF"
                      >
                        <FileText className="w-3 h-3 text-rose-400" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectSubmission(sub.id);
                          onNavigateStage("grading");
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1.5"
                        title="Open Review Workspace"
                      >
                        <Columns className="w-3 h-3 text-indigo-400" />
                        <span>Inspect</span>
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
    </section>
  );
};
