import { useState, useEffect } from "react";
import { useAuth, DEMO_USERS } from "../context/AuthContext";
import {
  Users,
  ShieldCheck,
  Key,
  Activity,
  Clock,
  CheckCircle2,
  Lock,
  GraduationCap,
  BookOpen,
  RefreshCw,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { showSweetToast } from "../utils/sweetAlert";
export const UserManagementView = () => {
  const { user: currentUser, token, switchRole } = useAuth();
  const [usersList, setUsersList] = useState(Object.values(DEMO_USERS));
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "log_001",
      timestamp: new Date(Date.now() - 36e5).toISOString(),
      userEmail: "admin@intelligrade.edu",
      userRole: "admin",
      action: "SYSTEM_BOOTSTRAP",
      resource: "Spring Boot REST Engine",
      status: "Success"
    },
    {
      id: "log_002",
      timestamp: new Date(Date.now() - 18e5).toISOString(),
      userEmail: "teacher@intelligrade.edu",
      userRole: "teacher",
      action: "EVALUATE_PAPER",
      resource: "CS301-Midterm-Aarav-Sharma",
      status: "Success"
    },
    {
      id: "log_003",
      timestamp: new Date(Date.now() - 9e5).toISOString(),
      userEmail: "student@intelligrade.edu",
      userRole: "student",
      action: "VIEW_INSIGHTS",
      resource: "Predictive Knowledge Radar",
      status: "Success"
    }
  ]);
  const [activeTab, setActiveTab] = useState("users");
  const [showAdminVaultKey, setShowAdminVaultKey] = useState(false);
  const [showTeacherVaultKey, setShowTeacherVaultKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [usersResp, logsResp] = await Promise.all([
        fetch("/api/v1/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/v1/admin/audit-logs", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (usersResp.ok) {
        const uData = await usersResp.json();
        if (uData.users) setUsersList(uData.users);
      }
      if (logsResp.ok) {
        const lData = await logsResp.json();
        if (lData.logs) setAuditLogs(lData.logs);
      }
    } catch (e) {
      console.warn("Admin API using cached state:", e);
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    fetchAdminData();
  }, []);
  const roleMatrices = [
    {
      feature: "Preprocessing & Denoising Controls",
      student: false,
      teacher: true,
      admin: true,
      description: "Upload scans, adjust Otsu/Sauvola threshold, Zhang-Suen thinning"
    },
    {
      feature: "OCR Digitization & Text Editing",
      student: false,
      teacher: true,
      admin: true,
      description: "Modify raw OCR transcription, edit bounding boxes, transliteration"
    },
    {
      feature: "Automated AI Semantic Grading Execution",
      student: false,
      teacher: true,
      admin: true,
      description: "Run Gemini Multimodal / Dynamic NLP evaluation on rubric items"
    },
    {
      feature: "Manual Teacher Mark Overrides & Comments",
      student: false,
      teacher: true,
      admin: true,
      description: "Adjust awarded question scores and add qualitative remarks"
    },
    {
      feature: "Batch Classroom Evaluation Mode",
      student: false,
      teacher: true,
      admin: true,
      description: "Batch process entire roster of student papers simultaneously"
    },
    {
      feature: "View Graded Papers & Scorecard Insights",
      student: true,
      teacher: true,
      admin: true,
      description: "Inspect radar skill graph, predictive next scores, weakness areas"
    },
    {
      feature: "Submit Re-evaluation Appeal Ticket",
      student: true,
      teacher: false,
      admin: true,
      description: "Lodge formal remarking requests with justification"
    },
    {
      feature: "Spring Boot REST Architecture & Microservices",
      student: false,
      teacher: true,
      admin: true,
      description: "Explore live API schemas, health diagnostics, Swagger docs"
    },
    {
      feature: "System User Management & Audit Security Logs",
      student: false,
      teacher: false,
      admin: true,
      description: "Manage users, assign roles, inspect token sessions and audit trail"
    }
  ];
  return <div className="space-y-6">
      {
    /* Header Banner */
  }
      <div className="p-6 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Admin Console: Authentication & Role-Based Access Control (RBAC)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Root Security
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Logged in as <strong className="text-zinc-200">{currentUser?.name}</strong> ({currentUser?.email}). Managing permissions, logins, and audit trails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
    id="btn-refresh-admin-data"
    onClick={fetchAdminData}
    disabled={isRefreshing}
    className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
  >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {
    /* Tabs */
  }
      <div className="flex border-b border-zinc-800">
        <button
    id="tab-admin-users"
    onClick={() => setActiveTab("users")}
    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === "users" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
  >
          <Users className="w-4 h-4" />
          <span>Registered Logins ({usersList.length})</span>
        </button>

        <button
    id="tab-admin-matrix"
    onClick={() => setActiveTab("matrix")}
    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === "matrix" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
  >
          <Lock className="w-4 h-4" />
          <span>Role Authorization Matrix (RBAC)</span>
        </button>

        <button
    id="tab-admin-logs"
    onClick={() => setActiveTab("logs")}
    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === "logs" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
  >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>

        <button
    id="tab-admin-vault"
    onClick={() => setActiveTab("vault")}
    className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${activeTab === "vault" ? "border-amber-500 text-amber-400 bg-amber-500/5" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
  >
          <Key className="w-4 h-4 text-amber-400" />
          <span>Secret Keys Vault (Confidential)</span>
        </button>
      </div>

      {
    /* Tab Content */
  }
      {activeTab === "users" && <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {usersList.map((u) => {
    const isSelected = currentUser?.id === u.id;
    const roleBadgeColor = u.role === "admin" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : u.role === "teacher" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    const RoleIcon = u.role === "admin" ? ShieldCheck : u.role === "teacher" ? BookOpen : GraduationCap;
    return <div
      key={u.id}
      className={`p-5 rounded-xl border transition ${isSelected ? "bg-zinc-900 border-amber-500/60 ring-1 ring-amber-500/30" : "bg-zinc-900/70 border-zinc-800 hover:border-zinc-700"}`}
    >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{u.name}</h3>
                      <p className="text-xs text-zinc-400">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleBadgeColor}`}>
                    {u.role}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs space-y-1.5 mb-4">
                  {u.department && <div className="flex justify-between">
                      <span className="text-zinc-500">Department:</span>
                      <span className="text-zinc-300 font-medium">{u.department}</span>
                    </div>}
                  {u.rollNumber && <div className="flex justify-between">
                      <span className="text-zinc-500">Roll Number:</span>
                      <span className="text-emerald-400 font-mono font-medium">{u.rollNumber}</span>
                    </div>}
                  {u.title && <div className="flex justify-between">
                      <span className="text-zinc-500">Academic Title:</span>
                      <span className="text-indigo-300 font-medium">{u.title}</span>
                    </div>}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Permissions:</span>
                    <span className="text-zinc-300 font-mono text-[11px]">{u.permissions.join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-[11px] text-zinc-500">
                    Status: <span className="text-emerald-400">● Active</span>
                  </span>
                  {!isSelected ? <button
      id={`btn-impersonate-${u.role}`}
      onClick={() => switchRole(u.role)}
      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
    >
                      Switch to Role
                    </button> : <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Current Active
                    </span>}
                </div>
              </div>;
  })}
        </div>}

      {activeTab === "matrix" && <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">System Authorization Matrix (RBAC)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Permissions configured across Student, Teacher, and Administrator roles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3">Feature Capability</th>
                  <th className="px-4 py-3 text-center">Student</th>
                  <th className="px-4 py-3 text-center">Teacher</th>
                  <th className="px-4 py-3 text-center">Admin</th>
                  <th className="px-5 py-3">Scope Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {roleMatrices.map((item, idx) => <tr key={idx} className="hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-3.5 font-semibold text-zinc-200">
                      {item.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.student ? <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          ✓ Granted
                        </span> : <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px]">
                          ✕ Denied
                        </span>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.teacher ? <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px]">
                          ✓ Granted
                        </span> : <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px]">
                          ✕ Denied
                        </span>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {item.admin ? <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                          ✓ Full (Root)
                        </span> : <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px]">
                          ✕ Denied
                        </span>}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 text-[11px]">
                      {item.description}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {activeTab === "logs" && <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live Security & Operational Audit Trail</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time tracking of authenticated user actions, API calls, and grading events.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-800/80">
            {auditLogs.map((log) => {
    const badgeColor = log.userRole === "admin" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : log.userRole === "teacher" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    return <div key={log.id} className="p-4 hover:bg-zinc-850/50 transition flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-200">{log.action}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                          {log.userRole}
                        </span>
                        <span className="text-[11px] text-zinc-500">• {new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        User: <span className="text-zinc-300">{log.userEmail}</span> • Resource: <span className="font-mono text-zinc-300">{log.resource}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {log.status}
                  </span>
                </div>;
  })}
          </div>
        </div>}

      {
    /* Tab: Secret Keys Vault */
  }
      {activeTab === "vault" && <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Confidential Institutional Authorization Vault</p>
              <p className="mt-1 text-zinc-300">
                These secret security clearance keys are strictly restricted to authorized faculty members and system administrators. Students attempting to register under faculty or admin roles are rejected unless they provide their designated secret authorization key.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {
    /* 1. Teacher Secret Key Card */
  }
            <div className="bg-zinc-900 border border-indigo-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Teacher / Faculty Secret Key</h3>
                    <p className="text-[11px] text-zinc-400">Required for faculty registration and grade overrides</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                  FACULTY ONLY
                </span>
              </div>

              <div className="my-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Authorization Passphrase</span>
                  <span className="font-mono text-sm font-bold text-indigo-300 tracking-wider">
                    {showTeacherVaultKey ? "TEACHER-SEC-2026" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
    type="button"
    onClick={() => setShowTeacherVaultKey(!showTeacherVaultKey)}
    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
    title={showTeacherVaultKey ? "Hide key" : "Reveal key"}
  >
                    {showTeacherVaultKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText("TEACHER-SEC-2026");
      showSweetToast("Teacher Secret Key copied to clipboard", "success");
    }}
    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 text-xs"
    title="Copy Teacher Secret Key"
  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Copy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span>Authorized Role:</span>
                  <span className="text-zinc-200 font-semibold">Faculty / Teacher</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Permitted Privileges:</span>
                  <span className="text-indigo-300">Multimodal OCR, Rubrics, Overrides, Batch</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clearance Level:</span>
                  <span className="text-emerald-400 font-semibold">Academic Tier 2</span>
                </div>
              </div>
            </div>

            {
    /* 2. Admin Secret Key Card */
  }
            <div className="bg-zinc-900 border border-amber-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Administrator Master Key</h3>
                    <p className="text-[11px] text-zinc-400">Required for root administrator provisioning</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  ROOT ADMIN
                </span>
              </div>

              <div className="my-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Master Security Key</span>
                  <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                    {showAdminVaultKey ? "ADMIN-SEC-2026" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
    type="button"
    onClick={() => setShowAdminVaultKey(!showAdminVaultKey)}
    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
    title={showAdminVaultKey ? "Hide key" : "Reveal key"}
  >
                    {showAdminVaultKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText("ADMIN-SEC-2026");
      showSweetToast("Admin Master Key copied to clipboard", "success");
    }}
    className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition flex items-center gap-1 text-xs"
    title="Copy Admin Master Key"
  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Copy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span>Authorized Role:</span>
                  <span className="text-zinc-200 font-semibold">System Administrator / Dean</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Permitted Privileges:</span>
                  <span className="text-amber-300">Full Root (*), RBAC Directory, Audit Logs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clearance Level:</span>
                  <span className="text-amber-400 font-semibold">Institutional Root Tier 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
