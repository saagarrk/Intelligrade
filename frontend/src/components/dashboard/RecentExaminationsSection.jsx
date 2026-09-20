import { BookOpen, PlusCircle, FileText, CheckCircle2, ChevronRight, Layers, FileUp } from "lucide-react";

export const RecentExaminationsSection = ({
  exams,
  submissions,
  selectedExamId,
  onSelectExam,
  onNavigateStage,
  onOpenCustomExamModal
}) => {
  return (
    <section aria-label="Recent Examinations" className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Recent Examinations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curriculum test papers with configured model answers and Rubric matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-recent-exams-manage-all"
            onClick={() => onNavigateStage("exams_management")}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            title="Open comprehensive Examination Management"
          >
            <span>Manage All Exams</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            id="btn-recent-exams-create-new"
            onClick={onOpenCustomExamModal}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Exam</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="pb-2.5 font-semibold">Course & Examination Title</th>
              <th className="pb-2.5 font-semibold">Subject / Stream</th>
              <th className="pb-2.5 font-semibold">Total & Passing Marks</th>
              <th className="pb-2.5 font-semibold">Questions</th>
              <th className="pb-2.5 font-semibold">Submissions</th>
              <th className="pb-2.5 font-semibold">Status</th>
              <th className="pb-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {exams.map((exam) => {
              const isSelected = exam.id === selectedExamId;
              const examSubmissions = submissions.filter((s) => s.examId === exam.id);
              const subCount = examSubmissions.length;
              const gradedCount = examSubmissions.filter((s) => s.status === "Graded").length;

              return (
                <tr
                  key={exam.id}
                  onClick={() => onSelectExam(exam.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-950/25" : "hover:bg-slate-800/40"
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {exam.courseCode}
                      </span>
                      <span className="font-semibold text-slate-200 hover:text-white transition">
                        {exam.title}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Currently active in dashboard</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 text-slate-400">
                    {exam.subject || "Computer Science"}
                  </td>

                  <td className="py-3 font-mono">
                    <span className="font-bold text-slate-200">{exam.totalMarks} Marks</span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      (Pass: {exam.passingMarks || Math.round(exam.totalMarks * 0.5)})
                    </span>
                  </td>

                  <td className="py-3 text-slate-300 font-mono">
                    {exam.questions?.length || 0} items
                  </td>

                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="font-bold text-emerald-400">{gradedCount}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-300">{subCount} total</span>
                    </div>
                  </td>

                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        exam.status === "published" || !exam.status
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {exam.status || "Active"}
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExam(exam.id);
                          onNavigateStage("answer_upload");
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700 shadow-xs"
                        title="Upload student answer sheets for this exam"
                      >
                        <FileUp className="w-3 h-3 text-indigo-400" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExam(exam.id);
                          onNavigateStage("preprocessing");
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700 shadow-xs"
                        title="Test and calibrate question paper"
                      >
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span className="hidden sm:inline">Test Paper</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExam(exam.id);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
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
