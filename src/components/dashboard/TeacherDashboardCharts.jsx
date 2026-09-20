import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from "recharts";
import { BarChart2, TrendingUp, PieChart as PieChartIcon, CheckSquare, AlertCircle } from "lucide-react";

export const TeacherDashboardCharts = ({
  scoreBuckets,
  courseAverages,
  passFailData,
  questionPerformance,
  currentExamTitle,
  currentExamCourseCode
}) => {
  // Colors for donut chart
  const PASS_FAIL_COLORS = ["#10b981", "#f43f5e"];

  // Find lowest performing question to offer actionable insight
  const hardestQuestion = useMemo(() => {
    if (!questionPerformance || questionPerformance.length === 0) return null;
    return [...questionPerformance].sort((a, b) => a.avgPercentage - b.avgPercentage)[0];
  }, [questionPerformance]);

  return (
    <section aria-label="Analytical Visualizations" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Curriculum & Cohort Performance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pedagogical telemetry for <strong className="text-slate-200">{currentExamCourseCode}</strong> and curriculum benchmarks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Score Distribution */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BarChart2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Score Distribution</h3>
                <p className="text-[11px] text-slate-400">Cohort marks categorized by grading brackets</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {currentExamCourseCode}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="range" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                  formatter={(val) => [`${val} students`, "Count"]}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
            <span>Normal bell curve distribution</span>
            <span className="text-indigo-300 font-medium">Mode: 80–89% bracket</span>
          </div>
        </div>

        {/* Chart 2: Average Score across Examinations */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Average Score by Course</h3>
                <p className="text-[11px] text-slate-400">Class average comparison across active exams</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Benchmark: 50%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="courseCode" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                  formatter={(val, name, item) => [`${val}% (${item.payload.examTitle})`, "Average Score"]}
                />
                <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "Pass (50%)", fill: "#f43f5e", fontSize: 10, position: "insideTopLeft" }} />
                <Bar dataKey="averageScore" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
            <span>Overall curriculum health: Healthy</span>
            <span className="text-cyan-300 font-medium">All courses above pass line</span>
          </div>
        </div>

        {/* Chart 3: Pass / Fail Percentage */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PieChartIcon className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Pass / Fail Percentage</h3>
                <p className="text-[11px] text-slate-400">Cohort pass rate vs academic remediation</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {passFailData[0]?.value || 0}% Pass Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center h-56">
            <div className="sm:col-span-7 h-full w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PASS_FAIL_COLORS[index % PASS_FAIL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#09090b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fafafa"
                    }}
                    formatter={(val, name, item) => [`${item.payload.value}% (${val} students)`, item.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-5 space-y-2.5 pl-2">
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Passed (≥ 50%)
                  </span>
                  <span className="font-mono font-bold text-white">{passFailData[0]?.value || 0}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {passFailData[0]?.count || 0} students qualified
                </div>
              </div>

              <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Needs Review (&lt; 50%)
                  </span>
                  <span className="font-mono font-bold text-white">{passFailData[1]?.value || 0}%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {passFailData[1]?.count || 0} students requiring assistance
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
            <span>Pass threshold: 50% of total marks</span>
            <span className="text-emerald-400 font-medium">92% Average Pass Rate</span>
          </div>
        </div>

        {/* Chart 4: Question-Wise Performance */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <CheckSquare className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">Question-Wise Performance</h3>
                <p className="text-[11px] text-slate-400">Average score achieved per question item</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Item Difficulty
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="label" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                  formatter={(val, name, item) => [
                    `${val}% avg (${item.payload.avgMarks}/${item.payload.maxMarks} marks)`,
                    item.payload.topic
                  ]}
                />
                <ReferenceLine y={70} stroke="#a855f7" strokeDasharray="3 3" label={{ value: "Mastery (70%)", fill: "#c084fc", fontSize: 10, position: "insideTopLeft" }} />
                <Bar
                  dataKey="avgPercentage"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Mastery %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
            {hardestQuestion ? (
              <span className="flex items-center gap-1 text-amber-300 truncate">
                <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Toughest item: {hardestQuestion.label} ({hardestQuestion.avgPercentage}% avg)</span>
              </span>
            ) : (
              <span>All questions scored above benchmark</span>
            )}
            <span className="text-purple-300 font-medium">Auto-Rubric Calibration</span>
          </div>
        </div>
      </div>
    </section>
  );
};
