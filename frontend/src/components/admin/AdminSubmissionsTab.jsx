import React, { useState, useEffect } from "react";
import {
  Search,
  FileCheck,
  RefreshCw,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Award
} from "lucide-react";
import { showSweetToast, showConfirmAlert } from "../../utils/sweetAlert";

export const AdminSubmissionsTab = ({ token }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const res = await fetch(`/api/v1/admin/submissions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        const err = await res.json();
        showSweetToast(err.error || "Failed to fetch submissions", "error");
      }
    } catch (e) {
      console.error("Error fetching submissions:", e);
      showSweetToast("Network error fetching submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.page, pagination.limit, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchSubmissions();
  };

  const handleStatusChange = async (submission, newStatus) => {
    try {
      const res = await fetch(`/api/v1/admin/submissions/${submission.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Submission status updated", "success");
        setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: newStatus } : s));
      } else {
        showSweetToast(data.error || "Failed to update submission status", "error");
      }
    } catch (err) {
      showSweetToast("Network error updating status", "error");
    }
  };

  const handleReevaluate = async (submission) => {
    const confirmed = await showConfirmAlert(
      "Trigger Official Re-evaluation?",
      `Initiate institutional re-evaluation for ${submission.studentName}'s paper? The status will be transitioned to UNDER_REVIEW.`,
      "Re-evaluate Paper",
      "Cancel",
      "question"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/evaluations/${submission.id}/re-evaluate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Re-evaluation scheduled", "success");
        setSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: "UNDER_REVIEW" } : s));
      } else {
        showSweetToast(data.error || "Failed to trigger re-evaluation", "error");
      }
    } catch (err) {
      showSweetToast("Network error initiating re-evaluation", "error");
    }
  };

  const handleDeleteSubmission = async (submission) => {
    const confirmed = await showConfirmAlert(
      "Delete Student Submission?",
      `Permanently delete paper submission for ${submission.studentName} (${submission.studentRollNo})? This cannot be undone.`,
      "Delete Submission",
      "Cancel",
      "warning"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/submissions/${submission.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Submission deleted", "success");
        setSubmissions(prev => prev.filter(s => s.id !== submission.id));
      } else {
        showSweetToast(data.error || "Failed to delete submission", "error");
      }
    } catch (err) {
      showSweetToast("Network error deleting submission", "error");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Graded</span>;
      case "UNDER_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">Under Review</span>;
      case "FAILED":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30">Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">{status}</span>;
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
              placeholder="Search by student name, roll number, or exam title..."
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
            <option value="COMPLETED">Graded (COMPLETED)</option>
            <option value="UNDER_REVIEW">Under Review / Appeal</option>
            <option value="UPLOADED">Uploaded / Raw</option>
            <option value="GRADING">In Pipeline</option>
          </select>

          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Submissions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Student & Roll No</th>
                <th className="py-3 px-4 font-semibold">Examination</th>
                <th className="py-3 px-4 font-semibold">Score / Grade</th>
                <th className="py-3 px-4 font-semibold">Status & Workflow</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {loading ? "Loading submissions..." : "No submissions found."}
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{sub.studentName}</div>
                      <div className="text-[11px] text-indigo-400 font-mono">{sub.studentRollNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{sub.examTitle}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">
                          {sub.totalScore ?? 0} / {sub.maxScore ?? 100}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          ({sub.percentageScore ?? 0}%)
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Grade: {sub.gradeAwarded || "Pending"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(sub.status)}
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="COMPLETED">Graded</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="GRADING">Grading</option>
                          <option value="UPLOADED">Uploaded</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleReevaluate(sub)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 rounded border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Trigger official re-evaluation"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Re-evaluate</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sub)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 rounded border border-slate-700 hover:border-rose-800 transition-colors"
                          title="Delete Submission"
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
            Showing <strong className="text-slate-200">{submissions.length}</strong> of{" "}
            <strong className="text-slate-200">{pagination.total}</strong> submissions
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
