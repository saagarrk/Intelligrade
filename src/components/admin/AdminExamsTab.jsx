import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { showSweetToast, showConfirmAlert } from "../../utils/sweetAlert";

export const AdminExamsTab = ({ token, onOpenCustomExamModal, onNavigateStage }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const res = await fetch(`/api/v1/admin/examinations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setExams(data.examinations || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        const err = await res.json();
        showSweetToast(err.error || "Failed to fetch examinations", "error");
      }
    } catch (e) {
      console.error("Error fetching exams:", e);
      showSweetToast("Network error fetching examinations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [pagination.page, pagination.limit, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchExams();
  };

  const handleToggleStatus = async (exam) => {
    const nextStatus = exam.status === "published" ? "draft" : "published";
    const confirmed = await showConfirmAlert(
      nextStatus === "published" ? "Publish Examination?" : "Unpublish to Draft?",
      `Change '${exam.title}' status to ${nextStatus.toUpperCase()}? ${nextStatus === "published" ? "Students will be able to view and submit papers." : "Students will no longer see this exam."}`,
      nextStatus === "published" ? "Publish Live" : "Revert to Draft",
      "Cancel",
      "info"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/examinations/${exam.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Exam status updated", "success");
        setExams(prev => prev.map(e => e.id === exam.id ? { ...e, status: nextStatus } : e));
      } else {
        showSweetToast(data.error || "Failed to update exam status", "error");
      }
    } catch (err) {
      showSweetToast("Network error modifying exam status", "error");
    }
  };

  const handleDeleteExam = async (exam) => {
    const confirmed = await showConfirmAlert(
      "Delete Examination?",
      `Are you sure you want to permanently delete '${exam.title}' (${exam.courseCode})? This will also remove rubric configurations.`,
      "Delete Examination",
      "Cancel",
      "warning"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/examinations/${exam.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Examination removed", "success");
        setExams(prev => prev.filter(e => e.id !== exam.id));
      } else {
        showSweetToast(data.error || "Failed to delete exam", "error");
      }
    } catch (err) {
      showSweetToast("Network error deleting examination", "error");
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
              placeholder="Search by title, subject, or course code..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts</option>
          </select>

          <button
            onClick={fetchExams}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Examinations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {onOpenCustomExamModal && (
            <button
              onClick={onOpenCustomExamModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Examination</span>
            </button>
          )}
        </div>
      </div>

      {/* Examinations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Course & Title</th>
                <th className="py-3 px-4 font-semibold">Subject / Grade</th>
                <th className="py-3 px-4 font-semibold">Questions & Marks</th>
                <th className="py-3 px-4 font-semibold">Throughput</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {loading ? "Loading examinations..." : "No examinations found."}
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{exam.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{exam.courseCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{exam.subject}</div>
                      <div className="text-[11px] text-slate-400">{exam.gradeLevel || "Undergraduate"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-200">{exam.totalMarks} Total Marks</div>
                      <div className="text-[11px] text-slate-400">{exam.questionsCount} rubric items</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-semibold">{exam.submissionsCount} submissions</div>
                      <div className="text-[11px] text-emerald-400 font-mono">Avg: {exam.avgScore}%</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        exam.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {exam.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(exam)}
                          className={`p-1.5 rounded border transition-colors ${
                            exam.status === "published"
                              ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                              : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700"
                          }`}
                          title={exam.status === "published" ? "Revert to Draft" : "Publish Examination"}
                        >
                          {exam.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 rounded border border-slate-700 hover:border-rose-800 transition-colors"
                          title="Delete Examination"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            Showing <strong className="text-slate-200">{exams.length}</strong> of{" "}
            <strong className="text-slate-200">{pagination.total}</strong> exams
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
    </div>
  );
};
