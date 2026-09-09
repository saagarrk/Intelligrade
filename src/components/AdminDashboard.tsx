import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Database, 
  Activity, 
  Users, 
  Lock, 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  RefreshCw, 
  Settings, 
  FileCode, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  Palette
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { PipelineStage, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AdminDashboardProps {
  onNavigateStage: (stage: PipelineStage) => void;
  onOpenBatchModal: () => void;
  onOpenCustomExamModal: () => void;
}

interface SystemTelemetry {
  serverStatus: 'Healthy' | 'Degraded' | 'Offline';
  uptimePercentage: string;
  avgLatencyMs: number;
  activeSessions: number;
  dailyEvaluations: number;
  geminiTokenUsage: string;
  mysqlPoolUsage: string;
}

const TELEMETRY_MOCK: SystemTelemetry = {
  serverStatus: 'Healthy',
  uptimePercentage: '99.98%',
  avgLatencyMs: 14,
  activeSessions: 38,
  dailyEvaluations: 1240,
  geminiTokenUsage: '184.2k tokens',
  mysqlPoolUsage: '14 / 50 active'
};

const DEPARTMENT_METRICS = [
  { dept: 'Computer Sci', avgScore: 78.4, papersCount: 420, facultyCount: 8 },
  { dept: 'Electrical Eng', avgScore: 73.2, papersCount: 310, facultyCount: 6 },
  { dept: 'Mechanical Eng', avgScore: 70.8, papersCount: 280, facultyCount: 5 },
  { dept: 'Physics', avgScore: 76.5, papersCount: 190, facultyCount: 4 },
  { dept: 'Mathematics', avgScore: 81.2, papersCount: 240, facultyCount: 5 }
];

const AUDIT_FEED = [
  { id: 'EVT-904', time: '10:42:18', actor: 'Prof. Sen (Teacher)', action: 'Override Question 2 Mark (+1.0)', status: 'Success' },
  { id: 'EVT-903', time: '10:38:05', actor: 'Aarav Sharma (Student)', action: 'Submitted Appeal Ticket #APP-101', status: 'Success' },
  { id: 'EVT-902', time: '10:15:22', actor: 'Dr. Kulkarni (Admin)', action: 'Updated MySQL Connection Pool Config', status: 'Success' },
  { id: 'EVT-901', time: '09:55:10', actor: 'System AI Engine', action: 'Batch Processed 24 Exam Papers (CS-301)', status: 'Success' },
  { id: 'EVT-900', time: '09:30:14', actor: 'Unknown IP (203.0.113.1)', action: 'Unauthorized /api/v1/admin Attempt', status: 'Blocked' }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateStage,
  onOpenBatchModal,
  onOpenCustomExamModal
}) => {
  const { user } = useAuth();
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const [telemetry, setTelemetry] = useState<SystemTelemetry>(TELEMETRY_MOCK);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTelemetry({
        ...TELEMETRY_MOCK,
        avgLatencyMs: Math.floor(Math.random() * 6) + 11,
        dailyEvaluations: TELEMETRY_MOCK.dailyEvaluations + Math.floor(Math.random() * 5)
      });
      setIsRefreshing(false);
      setNotice('Telemetry metrics refreshed from Spring Boot Actuator endpoint.');
      setTimeout(() => setNotice(null), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Admin Executive Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Academic Administrator & Security Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Root Admin Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Administrator: <strong className="text-zinc-200">{user?.name || 'Dr. Rajesh Kulkarni'}</strong> • Role: <strong className="text-amber-400">Institutional SuperAdmin</strong>
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  Spring Boot REST API: <strong className="text-emerald-400 font-mono">ONLINE (Port 8080)</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  MySQL 8.0 RDS: <strong className="text-indigo-300 font-mono">HEALTHY</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-admin-change-theme"
              onClick={() => setIsThemeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
              title="Change theme colors & appearance"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.colors.accentPrimary }} />
              <span>Theme: {currentTheme.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-zinc-400'}`} />
              <span>{isRefreshing ? 'Pinging Actuator...' : 'Refresh Telemetry'}</span>
            </button>

            <button
              onClick={() => onNavigateStage('user_management')}
              className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 text-xs font-semibold border border-amber-800 transition flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>RBAC User Directory</span>
            </button>

            <button
              onClick={() => onNavigateStage('architecture')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <FileCode className="w-4 h-4" />
              <span>Spring Boot Spec & DDL</span>
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-amber-950/60 border border-amber-800 text-amber-300 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notice}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">Status 200 OK</span>
        </div>
      )}

      {/* Infrastructure Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Spring Boot Server</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {telemetry.serverStatus}
          </div>
          <div className="text-xs mt-2 text-zinc-400 flex items-center justify-between">
            <span>Uptime: <strong className="text-zinc-200">{telemetry.uptimePercentage}</strong></span>
            <span>Latency: <strong className="text-emerald-400">{telemetry.avgLatencyMs}ms</strong></span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Institution Daily Throughput</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">
            {telemetry.dailyEvaluations.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">Papers</span>
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            Across 5 Academic Departments
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">MySQL Connection Pool</span>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {telemetry.mysqlPoolUsage}
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            HikariCP Pool • Zero Deadlocks
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">AI Inference Engine</span>
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {telemetry.geminiTokenUsage}
          </div>
          <div className="text-xs mt-2 text-zinc-400">
            99.2% Recognition Confidence
          </div>
        </div>
      </div>

      {/* Main Grid: Departmental Performance & Live Security Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Department Comparison & System Specs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Department Performance Bar Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Institutional Departmental Performance (Average Score %)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Comparative performance and paper evaluation counts by department.
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="dept" stroke="#71717a" fontSize={10} />
                  <YAxis domain={[50, 100]} stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa' }}
                  />
                  <Bar dataKey="avgScore" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Average Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Table */}
            <div className="overflow-x-auto pt-2 border-t border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 text-[11px]">
                    <th className="pb-2">Department</th>
                    <th className="pb-2">Faculty</th>
                    <th className="pb-2">Evaluated Papers</th>
                    <th className="pb-2 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {DEPARTMENT_METRICS.map((d, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30">
                      <td className="py-2 font-semibold text-zinc-200">{d.dept}</td>
                      <td className="py-2 text-zinc-400">{d.facultyCount} Instructors</td>
                      <td className="py-2 text-zinc-400">{d.papersCount} papers</td>
                      <td className="py-2 text-right font-mono font-bold text-amber-400">{d.avgScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick System Action Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Administrative System Actions & Shortcuts</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateStage('user_management')}
                className="p-3.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-left transition flex flex-col justify-between"
              >
                <Users className="w-5 h-5 text-amber-400 mb-2" />
                <span className="font-bold text-xs text-white">RBAC Directory</span>
                <span className="text-[10px] text-zinc-400 mt-1">Manage user roles & permissions</span>
              </button>

              <button
                onClick={onOpenBatchModal}
                className="p-3.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-left transition flex flex-col justify-between"
              >
                <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-xs text-white">Batch Evaluation</span>
                <span className="text-[10px] text-zinc-400 mt-1">Trigger institutional runs</span>
              </button>

              <button
                onClick={() => onNavigateStage('architecture')}
                className="p-3.5 bg-zinc-950/60 hover:bg-zinc-800 rounded-xl border border-zinc-800 text-left transition flex flex-col justify-between"
              >
                <FileCode className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-xs text-white">Backend Specs</span>
                <span className="text-[10px] text-zinc-400 mt-1">Spring Boot DDL & REST endpoints</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Security Audit Log Stream & RBAC Quick Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Security & Audit Feed */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Live Security & Audit Log Stream</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {AUDIT_FEED.map((event) => (
                <div key={event.id} className="p-3 bg-zinc-950/70 rounded-lg border border-zinc-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400">{event.time}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                      event.status === 'Success' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="font-semibold text-zinc-200 text-xs">{event.action}</div>
                  <div className="text-[11px] text-zinc-500">{event.actor}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateStage('user_management')}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition border border-zinc-700 flex items-center justify-center gap-1"
            >
              <span>View Complete RBAC Directory & Audit Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security & Access Policies */}
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Institutional Governance & Integrity</span>
            </h3>

            <ul className="space-y-2 text-zinc-400 text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Role-Based Access Control (RBAC):</strong> Enforced via Spring Security filter chains with Bearer JWT tokens.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Immutable Grade Ledger:</strong> Teacher mark overrides log before/after deltas and reason strings for audit compliance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Appeal Window:</strong> Automated 7-day student remarking window with instructor workflow queues.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
