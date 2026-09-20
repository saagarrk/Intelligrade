import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  BookOpen,
  X,
  FileCheck
} from "lucide-react";
import { showSweetToast, showConfirmAlert } from "../../utils/sweetAlert";

export const AdminEvaluationsTab = ({ token }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreTier, setScoreTier] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedEval, setSelectedEval] = useState(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        scoreTier: scoreTier,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const res = await fetch(`/api/v1/admin/evaluations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluations(data.evaluations || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        const err = await res.json();
        showSweetToast(err.error || "Failed to fetch evaluations", "error");
      }
    } catch (e) {
      console.error("Error fetching evaluations:", e);
      showSweetToast("Network error fetching evaluations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [pagination.page, pagination.limit, scoreTier]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchEvaluations();
  };

  const handleReevaluate = async (item) => {
    const confirmed = await showConfirmAlert(
      "Re-evaluate Examination Paper?",
      `Trigger re-evaluation for ${item.studentName}'s submission (${item.examTitle})? Status will be updated to UNDER_REVIEW.`,
      "Re-evaluate",
      "Cancel",
      "question"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/evaluations/${item.submissionId}/re-evaluate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Re-evaluation initiated", "success");
        fetchEvaluations();
        if (selectedEval) setSelectedEval(null);
      } else {
        showSweetToast(data.error || "Failed to initiate re-evaluation", "error");
      }
    } catch (err) {
      showSweetToast("Network error triggering re-evaluation", "error");
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student, roll number, or exam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={scoreTier}
            onChange={(e) => {
              setScoreTier(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Score Tiers</option>
            <option value="high">High Tier (&gt;= 80%)</option>
            <option value="medium">Medium Tier (60 - 79%)</option>
            <option value="low">Low Tier (&lt; 60%)</option>
          </select>

          <button
            onClick={fetchEvaluations}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Evaluations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Student & Roll No</th>
                <th className="py-3 px-4 font-semibold">Exam Title</th>
                <th className="py-3 px-4 font-semibold">Awarded Score</th>
                <th className="py-3 px-4 font-semibold">AI Confidence & Evaluator</th>
                <th className="py-3 px-4 font-semibold">Graded Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {loading ? "Loading evaluations..." : "No evaluations found."}
                  </td>
                </tr>
              ) : (
                evaluations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{item.studentName}</div>
                      <div className="text-[11px] text-indigo-400 font-mono">{item.studentRollNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{item.examTitle}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {item.totalScore} / {item.maxScore}
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${
                          item.percentageScore >= 80 ? "text-emerald-400" : item.percentageScore >= 60 ? "text-amber-400" : "text-rose-400"
                        }`}>
                          ({item.percentageScore}%)
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.percentageScore >= 80 ? "bg-emerald-500" : item.percentageScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, item.percentageScore)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{item.aiConfidence}% AI Confidence</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{item.evaluator}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">
                        {new Date(item.evaluatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEval(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Rubrics</span>
                        </button>
                        <button
                          onClick={() => handleReevaluate(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Trigger re-evaluation"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Re-grade</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{evaluations.length}</strong> of{" "}
            <strong className="text-slate-200">{pagination.total}</strong> evaluations
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Rubric Details Modal */}
      {selectedEval && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <span>Evaluation Rubric Details: {selectedEval.studentName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Roll: <strong className="text-slate-200">{selectedEval.studentRollNo}</strong> • Exam: <strong className="text-slate-200">{selectedEval.examTitle}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedEval(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Total Awarded Marks:</span>
                <div className="text-lg font-bold font-mono text-emerald-400">{selectedEval.totalScore} / {selectedEval.maxScore}</div>
              </div>
              <div>
                <span className="text-slate-400">Percentage Score:</span>
                <div className="text-lg font-bold font-mono text-indigo-400">{selectedEval.percentageScore}%</div>
              </div>
              <div>
                <span className="text-slate-400">AI Confidence:</span>
                <div className="text-lg font-bold font-mono text-cyan-400">{selectedEval.aiConfidence}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Question Item Scoring</h4>
              {selectedEval.questionScores?.map((qs, i) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Question {qs.questionId || (i + 1)}</span>
                    <span className="font-mono font-bold text-amber-400">
                      Awarded: {qs.awardedMarks} / {qs.maxMarks}
                    </span>
                  </div>
                  {qs.feedback && (
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <strong>AI Evaluation Feedback:</strong> {qs.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEval(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleReevaluate(selectedEval)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Trigger Official Re-evaluation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
