import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Award,
  Target,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export const StudentPerformanceCharts = ({
  questionScoreData = [],
  currentExam = null,
  activeSubmission = null,
  onSelectQuestion = null
}) => {
  // Historical performance trend data across courses/assessments
  const trendData = [
    { exam: "CS-101 Quiz", score: 82, classAvg: 70, date: "Apr 2026" },
    { exam: "CS-201 Mid", score: 86, classAvg: 73, date: "May 2026" },
    { exam: "CS-204 Final", score: 88, classAvg: 75, date: "Jun 2026" },
    { exam: "BIO-202 Mid", score: 85, classAvg: 74, date: "Aug 2026" },
    { exam: "CS-301 Mid", score: activeSubmission?.percentageScore || 91.7, classAvg: 78, date: "Sep 2026" }
  ];

  const highestScore = Math.max(...trendData.map((d) => d.score));
  const latestScore = trendData[trendData.length - 1].score;
  const initialScore = trendData[0].score;
  const netProgression = Math.round((latestScore - initialScore) * 10) / 10;

  return (
    <div id="student-performance-charts" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Longitudinal Performance Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Performance Trend Over Time</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Examination trajectory vs. class cohort benchmarks across semesters.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{netProgression}% Progression</span>
              </span>
            </div>
          </div>

          {/* Quick Trend Summary Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-medium uppercase">Peak Score</span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                {highestScore}%
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-medium uppercase">Class Cohort Lead</span>
              <span className="text-base font-bold font-mono text-indigo-400 mt-0.5 block">
                +{Math.round(latestScore - trendData[trendData.length - 1].classAvg)}%
              </span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block font-medium uppercase">Consistency</span>
              <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                94% (Stable)
              </span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cohortAvgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="exam" stroke="#71717a" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#f8fafc"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="My Performance (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studentScoreGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="classAvg"
                  name="Class Average (%)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Question-Wise Marks Breakdown for Current Exam (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Question Marks Breakdown</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentExam?.courseCode || "CS-301"}: Points scored vs. maximum marks.
              </p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090d16",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#f8fafc"
                  }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }} />
                <Bar dataKey="score" fill="#10b981" name="Awarded Marks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#334155" name="Max Possible" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            {questionScoreData.map((q, idx) => (
              <button
                key={q.name}
                onClick={() => onSelectQuestion && onSelectQuestion(idx)}
                className="p-2 bg-slate-950/60 rounded-lg border border-slate-800 hover:border-emerald-500/40 text-left transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 group-hover:text-emerald-300">{q.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{q.score}/{q.max}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1 rounded-full"
                    style={{ width: `${q.percentage}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
