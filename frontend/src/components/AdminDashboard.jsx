import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Server,
  Database,
  Activity,
  Users,
  Lock,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Settings,
  FileCode,
  Layers,
  Sparkles,
  BarChart3,
  GraduationCap,
  BookOpen,
  FileCheck,
  Award,
  Shield,
  Clock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { showSweetToast } from "../utils/sweetAlert";

// Modular Admin sub-components
import { AdminStatsTab } from "./admin/AdminStatsTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminExamsTab } from "./admin/AdminExamsTab";
import { AdminSubmissionsTab } from "./admin/AdminSubmissionsTab";
import { AdminEvaluationsTab } from "./admin/AdminEvaluationsTab";
import { AdminAuditTab } from "./admin/AdminAuditTab";

export const AdminDashboard = ({
  onNavigateStage,
  onOpenBatchModal,
  onOpenCustomExamModal
}) => {
  const { user, token } = useAuth();
  const { currentTheme } = useTheme();

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState("statistics");
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        const err = await res.json();
        console.warn("Stats error:", err);
      }
    } catch (e) {
      console.error("Failed to fetch admin stats:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const navTabs = [
    { id: "statistics", label: "System Statistics", icon: BarChart3, badge: "Metrics" },
    { id: "students", label: "Students", icon: GraduationCap, badge: stats?.users?.students ?? "" },
    { id: "teachers", label: "Teachers", icon: BookOpen, badge: stats?.users?.teachers ?? "" },
    { id: "users", label: "All Users", icon: Users, badge: stats?.users?.total ?? "" },
    { id: "examinations", label: "Examinations", icon: FileCheck, badge: stats?.examinations?.total ?? "" },
    { id: "submissions", label: "Submissions", icon: Layers, badge: stats?.submissions?.total ?? "" },
    { id: "evaluations", label: "Evaluations", icon: Award, badge: stats?.evaluations?.totalEvaluated ?? "" },
    { id: "audit", label: "Audit Ledger", icon: Shield, badge: "Security" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Admin Executive Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Academic Administrator & Security Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  SuperAdmin Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Administrator: <strong className="text-slate-200">{user?.name || "Dr. Rajesh Kulkarni"}</strong> • Scope: <strong className="text-amber-400">Institutional Governance (RBAC Enforced)</strong>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  Backend API: <strong className="text-emerald-400 font-mono">ONLINE (RBAC Guarded)</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Session Vault: <strong className="text-indigo-300 font-mono">ACTIVE SESSIONS SYNCED</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : "text-slate-400"}`} />
              <span>{isRefreshing ? "Syncing Stats..." : "Refresh Statistics"}</span>
            </button>

            {onOpenBatchModal && (
              <button
                onClick={onOpenBatchModal}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-semibold border border-slate-700/80 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Batch Evaluation</span>
              </button>
            )}

            {onNavigateStage && (
              <button
                onClick={() => onNavigateStage("architecture")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileCode className="w-4 h-4" />
                <span>Backend DDL & Specs</span>
              </button>
            )}
          </div>
        </div>

        {/* Modular Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 mt-6 border-t border-slate-800/80 scrollbar-thin">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== "" && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Tab View */}
      {adminTab === "statistics" && (
        <AdminStatsTab
          stats={stats}
          isRefreshing={isRefreshing}
          onRefresh={fetchStats}
        />
      )}

      {adminTab === "students" && (
        <AdminUsersTab
          token={token}
          targetRoleFilter="student"
        />
      )}

      {adminTab === "teachers" && (
        <AdminUsersTab
          token={token}
          targetRoleFilter="teacher"
        />
      )}

      {adminTab === "users" && (
        <AdminUsersTab
          token={token}
          targetRoleFilter="all"
        />
      )}

      {adminTab === "examinations" && (
        <AdminExamsTab
          token={token}
          onOpenCustomExamModal={onOpenCustomExamModal}
          onNavigateStage={onNavigateStage}
        />
      )}

      {adminTab === "submissions" && (
        <AdminSubmissionsTab
          token={token}
        />
      )}

      {adminTab === "evaluations" && (
        <AdminEvaluationsTab
          token={token}
        />
      )}

      {adminTab === "audit" && (
        <AdminAuditTab
          token={token}
        />
      )}
    </div>
  );
};
