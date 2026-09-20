import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
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
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
  Layers,
  GraduationCap,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ExternalLink,
  Percent
} from "lucide-react";

export const TeacherAcademicAnalytics = ({
  analyticsData,
  currentExam,
  onSelectStudent = null,
  onExportReport = null
}) => {
  const [activeViewSection, setActiveViewSection] = useState("overview"); // 'overview' | 'distribution' | 'questions' | 'topics' | 'trends' | 'weak-concepts' | 'roster'
  const [selectedScoreBucket, setSelectedScoreBucket] = useState(null);
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState("all"); // 'all' | 'passed' | 'remediation'

  if (!analyticsData) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm">No analytics data available for the selected examination.</p>
      </div>
    );
  }

  const {
    classAverageMarks,
    classAveragePct,
    highestScoreMarks,
    highestScorePct,
    highestScoringStudent,
    lowestScoreMarks,
    lowestScorePct,
    lowestScoringStudent,
    passPercentage,
    passedCount,
    failedCount,
    passingMarks,
    passingMarksPct,
    medianMarks,
    medianPct,
    standardDeviation,
    totalSubmissions,
    scoreDistribution,
    questionPerformance,
    topicPerformance,
    historicalTrends,
    weakConcepts,
    evaluatedRoster
  } = analyticsData;

  // Filter roster
  const filteredRoster = evaluatedRoster.filter((student) => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      student.studentRollNumber.toLowerCase().includes(searchStudentQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (rosterFilter === "passed") return student.passed;
    if (rosterFilter === "remediation") return !student.passed;
    return true;
  });

  // Transform topic performance for Radar Chart
  const radarTopicData = topicPerformance.map((tp) => ({
    topic: tp.topic.length > 20 ? tp.topic.substring(0, 18) + "..." : tp.topic,
    fullName: tp.topic,
    classAccuracy: tp.classAccuracyPct,
    benchmark: tp.benchmarkGoal
  }));

  // Custom Dark Tooltip
  const CustomChartTooltip = ({ active, payload, label }) => {
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
                {entry.unit || (entry.dataKey && entry.dataKey.toLowerCase().includes("pct") ? "%" : "")}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="teacher-academic-analytics">
      {/* 1. Summary Metrics Strip: Class Avg, Highest, Lowest, Pass %, Median */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Class Average */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Average</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">{classAveragePct}%</span>
            <span className="text-xs font-mono text-slate-400">
              ({classAverageMarks} / {currentExam?.totalMarks || 30} pts)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +1.1%
            </span>
            <span>vs previous exam cohort</span>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">{highestScorePct}%</span>
            <span className="text-xs font-mono text-slate-400">({highestScoreMarks} pts)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 truncate" title={`${highestScoringStudent.name} (${highestScoringStudent.rollNumber})`}>
            <span className="font-semibold text-white">{highestScoringStudent.name}</span>
            <span className="text-slate-500 ml-1 font-mono text-[10px]">[{highestScoringStudent.rollNumber}]</span>
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lowest Score</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">{lowestScorePct}%</span>
            <span className="text-xs font-mono text-slate-400">({lowestScoreMarks} pts)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-300 truncate" title={`${lowestScoringStudent.name} (${lowestScoringStudent.rollNumber})`}>
            <span className="font-semibold text-slate-300">{lowestScoringStudent.name}</span>
            <span className="text-slate-500 ml-1 font-mono text-[10px]">[{lowestScoringStudent.rollNumber}]</span>
          </div>
        </div>

        {/* Pass Percentage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pass Percentage</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-teal-400">{passPercentage}%</span>
            <span className="text-xs font-mono text-slate-400">
              ({passedCount}/{totalSubmissions} passed)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Threshold: {passingMarks} pts ({passingMarksPct}%)</span>
          </div>
        </div>

        {/* Cohort Spread & Median */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cohort Metrics</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-left">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Median</span>
              <span className="text-lg font-bold font-mono text-white">{medianPct}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Std Dev</span>
              <span className="text-lg font-bold font-mono text-sky-400">±{standardDeviation}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {failedCount > 0 ? (
              <span className="text-amber-400 font-semibold">{failedCount} student(s) below threshold</span>
            ) : (
              <span className="text-emerald-400 font-semibold">100% Cohort Mastery</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Primary Analytics Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "overview", label: "Analytics Overview", icon: BarChart3 },
          { id: "distribution", label: "Score Distribution", icon: Layers },
          { id: "questions", label: "Question-Wise Performance", icon: HelpCircle },
          { id: "topics", label: "Topic Mastery", icon: BookOpen },
          { id: "trends", label: "Cohort Trends", icon: TrendingUp },
          { id: "weak-concepts", label: "Weak Concepts & Remediation", icon: AlertTriangle, badge: weakConcepts.length },
          { id: "roster", label: "Student Roster", icon: Users, badge: totalSubmissions }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewSection(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Views */}

      {/* Tab: Overview (Dual Column: Score Distribution + Question Breakdown) */}
      {(activeViewSection === "overview" || activeViewSection === "distribution") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Score Distribution Chart (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Score Distribution Across Cohort</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Categorized histogram with passing threshold and cohort benchmarks.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
                  <span>Students</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-medium">Pass Line: {passingMarksPct}%</span>
              </div>
            </div>

            {/* Distribution Bar Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <ReferenceLine
                    y={Math.round(totalSubmissions / 5)}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    label={{ value: "Mean Density", fill: "#94a3b8", fontSize: 10, position: "right" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Students Count"
                    radius={[6, 6, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => setSelectedScoreBucket(data)}
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Bucket Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {scoreDistribution.map((bucket, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedScoreBucket(bucket)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedScoreBucket?.range === bucket.range
                      ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-300">{bucket.range}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bucket.color }} />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-base font-bold font-mono text-white">{bucket.count}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{bucket.percentage}%</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider block mt-1 font-semibold" style={{ color: bucket.color }}>
                    {bucket.benchmarkStatus}
                  </span>
                </button>
              ))}
            </div>

            {/* Drilldown modal or sub-panel if bucket selected */}
            {selectedScoreBucket && (
              <div className="p-3 bg-slate-950/80 rounded-lg border border-indigo-500/30 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-white">
                    Students in {selectedScoreBucket.range} bracket ({selectedScoreBucket.count} students)
                  </span>
                  <button
                    onClick={() => setSelectedScoreBucket(null)}
                    className="text-slate-400 hover:text-white text-[11px] underline"
                  >
                    Clear Filter
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {selectedScoreBucket.students.map((st, i) => (
                    <span
                      key={i}
                      onClick={() => onSelectStudent && onSelectStudent(st.rollNumber)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md text-[11px] text-slate-300 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="font-medium text-white">{st.name}</span>
                      <span className="text-slate-500 font-mono">({st.score} pts / {st.percentage}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Question Summary (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Question Performance</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Average accuracy per question item.</p>
              </div>
              <button
                onClick={() => setActiveViewSection("questions")}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Full Drilldown</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Horizontal progress for each question */}
            <div className="space-y-4 pt-1">
              {questionPerformance.map((q) => (
                <div key={q.questionNumber} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono font-bold text-xs text-indigo-300">
                        Q{q.questionNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate max-w-[170px]" title={q.topic}>
                        {q.topic}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-emerald-400">{q.classAccuracyPct}%</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-1">
                        ({q.classAvgMarks}/{q.maxMarks} pts)
                      </span>
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        q.classAccuracyPct >= 80
                          ? "bg-emerald-500"
                          : q.classAccuracyPct >= 65
                          ? "bg-indigo-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${q.classAccuracyPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Difficulty: <strong className="text-slate-300">{q.difficulty}</strong></span>
                    <span>Discrimination: <strong className="text-indigo-300">{q.discriminationRating}</strong></span>
                    <span>High: <strong className="text-emerald-400 font-mono">{q.highestMarks}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Pedagogy Insight Card */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-amber-300">Pedagogical Observation:</span>
                <p className="text-slate-300 mt-0.5">
                  Question 2 (Chain Rule Backpropagation) shows the highest deduction rate ({100 - (questionPerformance[1]?.classAccuracyPct || 70)}% points lost) due to missing intermediate derivatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Question-Wise Performance (Deep Analysis) */}
      {activeViewSection === "questions" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Question-by-Question Diagnostic Matrix</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparative analysis of maximum marks, cohort average marks, and discrimination ratings.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500 inline-block" />
                  <span>Class Average Marks</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded-xs bg-slate-700 inline-block" />
                  <span>Max Marks</span>
                </span>
              </div>
            </div>

            {/* Question Marks Comparison Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionPerformance.map((q) => ({
                    name: `Q${q.questionNumber}: ${q.topic.length > 16 ? q.topic.substring(0, 14) + "..." : q.topic}`,
                    classAvg: q.classAvgMarks,
                    maxMarks: q.maxMarks,
                    accuracy: q.classAccuracyPct,
                    fullTopic: q.topic
                  }))}
                  margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 10]} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="classAvg" name="Class Average Marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxMarks" name="Maximum Possible Marks" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Question Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {questionPerformance.map((q) => (
                <div key={q.questionNumber} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                      Question {q.questionNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : q.difficulty === "Hard"
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{q.topic}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Max: <strong className="text-white font-mono">{q.maxMarks} pts</strong> | Class Avg:{" "}
                      <strong className="text-indigo-400 font-mono">{q.classAvgMarks} pts</strong> ({q.classAccuracyPct}%)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Discrimination</span>
                      <span className="font-semibold text-white">{q.discriminationRating}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Difficulty Index</span>
                      <span className="font-semibold text-white font-mono">{q.difficultyIndex} (p)</span>
                    </div>
                  </div>

                  {/* Common Misconceptions */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                      Common Misconceptions Identified
                    </span>
                    <ul className="space-y-1">
                      {q.commonMisconceptions.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Topic-Wise Performance (Mastery Radar & Breakdown) */}
      {activeViewSection === "topics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Topic Mastery vs Target Benchmark</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-dimensional topic capability mapping against the 75% institutional competency bar.
              </p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarTopicData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="topic" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                  <Radar
                    name="Class Cohort Accuracy (%)"
                    dataKey="classAccuracy"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Target Goal (75%)"
                    dataKey="benchmark"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeDasharray="4 4"
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Tooltip content={<CustomChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Topic Proficiency Cards (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Topic Proficiency Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cohort mastery rate and allocated assessment points.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {topicPerformance.map((tp, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{tp.topic}</h4>
                      <span className="text-[11px] text-slate-400">
                        {tp.questionCount} question(s) • Total Weight: {tp.totalMaxMarks} pts
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        tp.status === "Mastered"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : tp.status === "Developing"
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {tp.status}
                    </span>
                  </div>

                  {/* Accuracy Bar with Target Marker */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Cohort Accuracy</span>
                      <span className="font-mono font-bold text-white">{tp.classAccuracyPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tp.classAccuracyPct >= 80
                            ? "bg-emerald-500"
                            : tp.classAccuracyPct >= 65
                            ? "bg-indigo-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${tp.classAccuracyPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span>
                      Students with Mastery (≥75%): <strong className="text-white font-mono">{tp.studentMasteryCount}</strong> / {tp.totalStudents}
                    </span>
                    <span className="text-emerald-400 font-mono font-semibold">{tp.masteryPercentage}% of class</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Cohort Performance Trends (Longitudinal Line Chart) */}
      {activeViewSection === "trends" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Class Performance Trajectory Over Time</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Class Average, Highest Score, Lowest Score, and Pass Percentage progression across semester exams.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                <span>Class Average</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Highest</span>
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span>Lowest</span>
              </span>
            </div>
          </div>

          {/* Longitudinal Trend Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends} margin={{ top: 15, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="shortTitle" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[30, 100]} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Line
                  type="monotone"
                  dataKey="classAveragePct"
                  name="Class Average (%)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="highestScorePct"
                  name="Highest Score (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: "#10b981" }}
                />
                <Line
                  type="monotone"
                  dataKey="lowestScorePct"
                  name="Lowest Score (%)"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: "#f43f5e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Exam Trajectory Summary Table */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Examination Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Class Average</th>
                  <th className="p-3">Highest Score</th>
                  <th className="p-3">Lowest Score</th>
                  <th className="p-3">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {historicalTrends.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{h.examTitle}</td>
                    <td className="p-3 text-slate-400 font-mono">{h.examDate}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400">{h.classAveragePct}%</td>
                    <td className="p-3 font-mono text-emerald-400">{h.highestScorePct}%</td>
                    <td className="p-3 font-mono text-rose-400">{h.lowestScorePct}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                        {h.passPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Weak Concepts & Remediation */}
      {activeViewSection === "weak-concepts" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Class-Wide Concept Gap Analysis & Remediation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-identified conceptual misunderstandings across student handwritten answer scripts, ranked by frequency and impact on score.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {weakConcepts.map((wc) => (
                <div key={wc.id} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          wc.priority === "Critical"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : wc.priority === "Urgent"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {wc.priority} Priority
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Q{wc.questionNumber}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{wc.conceptTitle}</h4>
                    <span className="text-[11px] text-slate-400 block">{wc.topic}</span>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Students Struggling:</span>
                        <strong className="text-rose-400 font-mono">
                          {wc.studentsStrugglingCount} ({wc.studentsStrugglingPct}%)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Avg Marks Lost:</span>
                        <strong className="text-amber-400 font-mono">-{wc.avgMarksLost} pts</strong>
                      </div>
                    </div>

                    {/* Root Cause */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Root Cause / Misconception:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/30">
                        {wc.rootCause}
                      </p>
                    </div>
                  </div>

                  {/* Remediation Action */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3 h-3" />
                      <span>Recommended Remediation:</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                      {wc.pedagogicalRemediation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Evaluated Roster */}
      {activeViewSection === "roster" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Evaluated Student Cohort Roster</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any student row to view personalized individual analytics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  placeholder="Search student or roll #..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                {["all", "passed", "remediation"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setRosterFilter(f)}
                    className={`px-2.5 py-1 rounded-md capitalize text-xs ${
                      rosterFilter === f ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Awarded Marks</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Evaluation Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                {filteredRoster.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStudent && onSelectStudent(st.studentRollNumber)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-slate-400">#{st.rank}</td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                        {st.studentName.charAt(0)}
                      </div>
                      <span>{st.studentName}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{st.studentRollNumber}</td>
                    <td className="p-3 font-mono font-bold text-white">
                      {st.totalAwardedMarks} / {currentExam?.totalMarks || 30}
                    </td>
                    <td className="p-3 font-mono">
                      <span
                        className={`font-bold ${
                          st.percentageScore >= 80
                            ? "text-emerald-400"
                            : st.percentageScore >= 60
                            ? "text-indigo-400"
                            : "text-rose-400"
                        }`}
                      >
                        {st.percentageScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.passed
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectStudent) onSelectStudent(st.studentRollNumber);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 ml-auto"
                      >
                        <span>View Analytics</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
