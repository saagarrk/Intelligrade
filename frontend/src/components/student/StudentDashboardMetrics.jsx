import React from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  HelpCircle,
  FileCheck2,
  Sparkles,
  Target
} from "lucide-react";

export const StudentDashboardMetrics = ({
  averageScore = 89.2,
  availableCount = 2,
  upcomingCount = 1,
  submittedCount = 2,
  gradedCount = 2,
  evaluationStatus = "Graded & Published",
  performanceTrendDelta = "+4.8%",
  gpa = "3.84",
  classPercentile = 89,
  onSelectTab = null
}) => {
  return (
    <div id="student-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Average Score & Academic Standing */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Average Score
            </span>
            <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            <span className="text-emerald-400">{averageScore}%</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-2">
              GPA {gpa} / 4.0
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800/80 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{performanceTrendDelta} vs last term</span>
          </span>
          <span className="text-slate-300 font-medium">Grade A Tier</span>
        </div>
      </div>

      {/* 2. Available Examinations (Open Now) */}
      <div
        onClick={() => onSelectTab && onSelectTab("exams")}
        className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
      >
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Available Examinations
            </span>
            <span className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            <span className="text-indigo-400">{availableCount}</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-2">
              Open to Submit
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800/80 text-slate-400">
          <span>Active for submission</span>
          <span className="text-indigo-400 font-medium group-hover:underline">View Exams →</span>
        </div>
      </div>

      {/* 3. Upcoming Examinations (Scheduled) */}
      <div
        onClick={() => onSelectTab && onSelectTab("exams")}
        className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
      >
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Examinations
            </span>
            <span className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            <span className="text-amber-400">{upcomingCount}</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-2">
              On Schedule
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800/80 text-slate-400">
          <span className="text-amber-300">Next exam in 3 days</span>
          <span className="text-amber-400 font-medium group-hover:underline">Syllabus →</span>
        </div>
      </div>

      {/* 4. Submitted & Evaluation Status */}
      <div
        onClick={() => onSelectTab && onSelectTab("tracking")}
        className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
      >
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Submitted Examinations
            </span>
            <span className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            <span className="text-cyan-400">{submittedCount}</span>
            <span className="text-xs text-slate-400 font-sans font-normal ml-2">
              ({gradedCount} Evaluated)
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-800/80 text-slate-400">
          <span className="flex items-center gap-1 text-cyan-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Status: {evaluationStatus}</span>
          </span>
          <span className="text-cyan-400 font-medium group-hover:underline">Track →</span>
        </div>
      </div>
    </div>
  );
};
