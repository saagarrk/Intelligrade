import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import {
  TrendingUp,
  Award,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Clock,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Lightbulb,
  GraduationCap
} from "lucide-react";

export const StudentAcademicAnalytics = ({
  studentAnalytics,
  currentExam,
  onViewClassAnalytics = null
}) => {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'comparison' | 'topics' | 'questions'

  if (!studentAnalytics) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm">No student analytics record available.</p>
      </div>
    );
  }

  const {
    studentName,
    studentRollNumber,
    personalAveragePct,
    currentScoreMarks,
    currentMaxMarks,
    currentScorePct,
    classAveragePct,
    deltaVsClassAvg,
    classRank,
    totalClassStudents,
    classPercentile,
    improvementPercentage,
    scoreTrends,
    strongTopics,
    weakTopics,
    previousExamComparison,
    questionBreakdown
  } = studentAnalytics;

  // Custom Dark Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-semibold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry, idx) => (
            <div key={`item-${idx}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value}
                {entry.unit || "%"}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="student-academic-analytics">
      {/* 1. Header Banner & Profile Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-lg font-mono">
              {studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{studentName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {studentRollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Academic Performance Profile • {currentExam?.subject || "Computer Science"}
              </p>
            </div>
          </div>

          {onViewClassAnalytics && (
            <button
              onClick={onViewClassAnalytics}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>View Class Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 mt-5">
          {/* Personal Average */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Personal Average</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">{personalAveragePct}%</span>
              <span className="text-[10px] text-slate-400">across 4 exams</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Consistent Grade: A</span>
          </div>

          {/* Current Exam Score */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Current Exam Score</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{currentScorePct}%</span>
              <span className="text-xs font-mono text-slate-400">
                ({currentScoreMarks}/{currentMaxMarks} pts)
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{deltaVsClassAvg}% vs Class Avg ({classAveragePct}%)</span>
            </div>
          </div>

          {/* Improvement Percentage */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Improvement Growth</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  improvementPercentage >= 0 ? "text-indigo-400" : "text-rose-400"
                }`}
              >
                {improvementPercentage > 0 ? `+${improvementPercentage}%` : `${improvementPercentage}%`}
              </span>
              <span className="text-[10px] text-slate-400">vs Midterm 1</span>
            </div>
            <span className="text-[11px] text-indigo-300 font-semibold mt-1 block">
              {previousExamComparison.overallVerdict}
            </span>
          </div>

          {/* Class Rank & Percentile */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Class Standings</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-teal-400">#{classRank}</span>
              <span className="text-xs font-mono text-slate-400">of {totalClassStudents} students</span>
            </div>
            <span className="text-[11px] text-teal-300 font-semibold mt-1 block">
              Top {100 - classPercentile + 1}% Cohort Percentile
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "overview", label: "Score Trend & Performance", icon: TrendingUp },
          { id: "comparison", label: "Previous Examination Comparison", icon: Layers },
          { id: "topics", label: "Strong & Weak Topics", icon: Target },
          { id: "questions", label: "Question-by-Question Breakdown", icon: HelpCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab: Overview (Score Trend vs Class Average) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Longitudinal Score Trend vs Class Average</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trajectory across semester assessments comparing your personal grade against cohort benchmarks.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Your Score (%)</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  <span>Class Average (%)</span>
                </span>
              </div>
            </div>

            {/* Responsive Trend Area Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrends} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studentScoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis dataKey="shortTitle" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={classAveragePct} stroke="#6366f1" strokeDasharray="3 3" label={{ value: `Class Avg: ${classAveragePct}%`, fill: '#818cf8', fontSize: 10, position: 'insideTopLeft' }} />
                  <Area
                    type="monotone"
                    dataKey="studentScorePct"
                    name="Your Score"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#studentScoreColor)"
                    dot={{ r: 5, fill: "#10b981" }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="classAveragePct"
                    name="Class Average"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#94a3b8" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Trend Summary Callout */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Consistent upward trend: <strong>+7.7% absolute gain</strong> from Quiz 1 (84.0%) to Current Examination ({currentScorePct}%).
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-bold hidden sm:inline-block">High Trajectory</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab: Previous Examination Comparison */}
      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Previous Examination Comparative Analysis</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Head-to-head score and topic accuracy delta comparing {previousExamComparison.previousExamTitle} against current exam.
              </p>
            </div>

            {/* Comparison Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Previous Exam Card */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previous Examination</span>
                  <span className="text-[10px] font-mono text-slate-500">{previousExamComparison.previousExamDate}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{previousExamComparison.previousExamTitle}</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-300">{previousExamComparison.previousPercentage}%</span>
                  <span className="text-xs font-mono text-slate-500">
                    ({previousExamComparison.previousMarks} / {previousExamComparison.previousMaxMarks} pts)
                  </span>
                </div>
              </div>

              {/* Current Exam Card */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-indigo-500/30 bg-indigo-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Current Examination</span>
                  <span className="text-[10px] font-mono text-indigo-300">20 Sep 2026</span>
                </div>
                <h4 className="text-xs font-bold text-white">{currentExam?.title || "Advanced Operating Systems & AI"}</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{previousExamComparison.currentPercentage}%</span>
                  <span className="text-xs font-mono text-slate-400">
                    ({previousExamComparison.currentMarks} / {previousExamComparison.currentMaxMarks} pts)
                  </span>
                </div>
              </div>

              {/* Delta & Improvement Summary Card */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Comparative Delta</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {previousExamComparison.overallVerdict}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Relative Growth</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      +{previousExamComparison.improvementPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Point Delta</span>
                    <span className="text-lg font-bold font-mono text-white">
                      +{previousExamComparison.percentagePointDelta}% pts
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">
                  {previousExamComparison.progressSummary}
                </p>
              </div>
            </div>

            {/* Topic Comparison Bar Chart */}
            <div className="pt-3 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>Topic Mastery Gain/Loss Comparison</span>
              </h4>

              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={previousExamComparison.topicComparisons}
                    margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                    <XAxis dataKey="topic" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                    <Bar dataKey="previousPct" name="Previous Exam Accuracy (%)" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentPct" name="Current Exam Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab: Strong & Weak Topics */}
      {activeTab === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Topics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strong Topics (Mastered ≥80%)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {strongTopics.length} Topics
              </span>
            </div>

            <div className="space-y-4">
              {strongTopics.map((topic, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{topic.topic}</h4>
                    <span className="text-sm font-bold font-mono text-emerald-400">{topic.accuracyPct}%</span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${topic.accuracyPct}%` }} />
                  </div>

                  {/* Key Strengths */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Demonstrated Strengths
                    </span>
                    <ul className="space-y-1">
                      {topic.keyStrengths.map((str, sIdx) => (
                        <li key={sIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Verified Answer Evidence */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 italic">
                    "{topic.evidenceQuote}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Weak Topics (Needs Focus &lt;80%)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {weakTopics.length} Topic
              </span>
            </div>

            <div className="space-y-4">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{topic.topic}</h4>
                    <span className="text-sm font-bold font-mono text-amber-400">{topic.accuracyPct}%</span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${topic.accuracyPct}%` }} />
                  </div>

                  {/* Concepts Missed */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Gaps Identified in Handwritten Answer
                    </span>
                    <ul className="space-y-1">
                      {topic.conceptsMissed.map((missed, mIdx) => (
                        <li key={mIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <span>{missed}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actionable Advice */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Targeted Revision Strategy:</span>
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{topic.actionableAdvice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Question-by-Question Breakdown */}
      {activeTab === "questions" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Question-Wise Marks & Teacher Feedback</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact breakdown of your marks scored vs maximum marks and cohort average.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {questionBreakdown.map((q) => (
              <div key={q.questionNumber} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                      Q{q.questionNumber}
                    </span>
                    <span className="text-xs font-bold text-white">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Class Avg: <strong className="text-slate-300 font-mono">{q.classAvgMarks} pts</strong>
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {q.studentMarks} / {q.maxMarks} pts ({q.accuracyPct}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      q.accuracyPct >= 80 ? "bg-emerald-500" : q.accuracyPct >= 65 ? "bg-indigo-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${q.accuracyPct}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 font-medium">Evaluation Feedback: </strong>
                  {q.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
