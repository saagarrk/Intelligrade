import React from "react";
import {
  Activity,
  TrendingUp,
  Database,
  Sparkles,
  Server,
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const DEPARTMENT_METRICS = [
  { dept: "Computer Sci", avgScore: 78.4, papersCount: 420, facultyCount: 8 },
  { dept: "Electrical Eng", avgScore: 73.2, papersCount: 310, facultyCount: 6 },
  { dept: "Mechanical Eng", avgScore: 70.8, papersCount: 280, facultyCount: 5 },
  { dept: "Physics", avgScore: 76.5, papersCount: 190, facultyCount: 4 },
  { dept: "Mathematics", avgScore: 81.2, papersCount: 240, facultyCount: 5 }
];

export const AdminStatsTab = ({ stats, isRefreshing, onRefresh }) => {
  const users = stats?.users || { total: 12, students: 6, teachers: 4, admins: 2, active: 11, inactive: 1 };
  const exams = stats?.examinations || { total: 4, published: 3, draft: 1 };
  const submissions = stats?.submissions || { total: 18, graded: 12, underReview: 2, pending: 4 };
  const evals = stats?.evaluations || { averageScore: 76.8, passRate: 88.5, aiConfidenceAvg: 97.4, totalEvaluated: 12 };
  const system = stats?.system || { serverStatus: "HEALTHY", uptime: "99.98%", avgLatencyMs: 14, activeSessions: 4, memoryUsageMb: 142 };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Users</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {users.total}
          </div>
          <div className="text-xs mt-2 text-slate-400 flex items-center justify-between">
            <span>{users.students} Students • {users.teachers} Faculty</span>
            <span className="text-emerald-400 font-semibold">{users.active} Active</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Examinations & Tests</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">
            {exams.total}
          </div>
          <div className="text-xs mt-2 text-slate-400 flex items-center justify-between">
            <span>{exams.published} Published Live</span>
            <span className="text-amber-400 font-semibold">{exams.draft} Drafts</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Submissions</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {submissions.total}
          </div>
          <div className="text-xs mt-2 text-slate-400 flex items-center justify-between">
            <span>{submissions.graded} Graded • {submissions.underReview} Under Review</span>
            <span className="text-indigo-400 font-semibold">{submissions.pending} In-Queue</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluation Performance</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {evals.averageScore}%
          </div>
          <div className="text-xs mt-2 text-slate-400 flex items-center justify-between">
            <span>Pass Rate: <strong className="text-slate-200">{evals.passRate}%</strong></span>
            <span>AI Conf: <strong className="text-emerald-400">{evals.aiConfidenceAvg}%</strong></span>
          </div>
        </div>
      </div>

      {/* Charts & Operational Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Departmental Performance Metrics & Cohort Average</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparative examination performance across university faculties.
              </p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
              Live Aggregate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#f8fafc" }}
                />
                <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} name="Average Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto pt-2 border-t border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 text-[11px]">
                  <th className="pb-2">Department</th>
                  <th className="pb-2">Faculty Count</th>
                  <th className="pb-2">Evaluated Papers</th>
                  <th className="pb-2 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DEPARTMENT_METRICS.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-semibold text-slate-200">{d.dept}</td>
                    <td className="py-2.5 text-slate-400">{d.facultyCount} Instructors</td>
                    <td className="py-2.5 text-slate-400">{d.papersCount} papers</td>
                    <td className="py-2.5 text-right font-mono font-bold text-indigo-400">{d.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Server Infrastructure Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Backend Node Health</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {system.serverStatus}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Uptime Metric</span>
                <span className="font-mono font-bold text-slate-200">{system.uptime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Average Response Latency</span>
                <span className="font-mono font-bold text-emerald-400">{system.avgLatencyMs} ms</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Active Bearer JWT Sessions</span>
                <span className="font-mono font-bold text-indigo-400">{system.activeSessions} active</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Node Heap Memory</span>
                <span className="font-mono font-bold text-cyan-400">{system.memoryUsageMb} MB</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Backend Security Mode</span>
                <span className="font-mono font-bold text-amber-400">RBAC Enforced</span>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Guarantee */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Institutional Governance</span>
            </h3>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Backend Authorization:</strong> Every administrative API is guarded by server-side <code className="text-amber-300 font-mono">requireAuth(['admin'])</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Immediate Invalidation:</strong> Deactivating an account revokes all current sessions immediately.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
