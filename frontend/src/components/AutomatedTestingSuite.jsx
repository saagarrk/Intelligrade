import { useState, useEffect } from "react";
import {
  generateBenchmarkTestCases,
  runAutomatedTestSuite,
  calibrateExamRubric,
  exportTestSuiteReportAsJSON,
  exportTestSuiteReportAsText
} from "../utils/automatedTestRunner";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  Sliders,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Clock,
  BarChart3,
  FileCheck,
  RefreshCw
} from "lucide-react";
export const AutomatedTestingSuite = ({
  examPaper,
  onUpdateExamPaper,
  onApplyAsActiveExam,
  showSweetToast,
  isEmbedded = false
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testReport, setTestReport] = useState(null);
  const [expandedTestId, setExpandedTestId] = useState("tc_exemplary");
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [customTestCases, setCustomTestCases] = useState([]);
  const [customName, setCustomName] = useState("Custom Student Script");
  const [customDesc, setCustomDesc] = useState("Teacher uploaded benchmark test scenario");
  const [customMinScore, setCustomMinScore] = useState(60);
  const [customMaxScore, setCustomMaxScore] = useState(80);
  const [customAnswers, setCustomAnswers] = useState({});
  useEffect(() => {
    const initialAnswers = {};
    (examPaper.questions || []).forEach((q) => {
      initialAnswers[q.questionNumber] = q.modelAnswer || "";
    });
    setCustomAnswers(initialAnswers);
  }, [examPaper]);
  const handleRunTests = async (casesToRun) => {
    setIsRunning(true);
    setActiveStepIndex(0);
    const testCases = casesToRun || (customTestCases.length > 0 ? customTestCases : generateBenchmarkTestCases(examPaper));
    try {
      for (let i = 0; i < testCases.length; i++) {
        setActiveStepIndex(i);
        await new Promise((res) => setTimeout(res, 220));
      }
      const report = await runAutomatedTestSuite(examPaper, testCases);
      setTestReport(report);
      setActiveStepIndex(-1);
      if (report.passRate >= 80) {
        showSweetToast(`Automated Test Suite Passed! (${report.passRate}% pass rate across ${report.totalTestsRun} benchmarks)`, "success");
      } else {
        showSweetToast(`Automated Tests completed with warnings (${report.passRate}% pass rate). Review deviations below.`, "info");
      }
    } catch (err) {
      console.error("Test execution failed:", err);
      showSweetToast("Automated testing failed. Please check rubric settings.", "error");
    } finally {
      setIsRunning(false);
      setActiveStepIndex(-1);
    }
  };
  const handleApplyCalibration = () => {
    if (!testReport) return;
    const calibrated = calibrateExamRubric(examPaper, testReport);
    if (onUpdateExamPaper) {
      onUpdateExamPaper(calibrated);
    }
    showSweetToast("Exam rubric successfully calibrated and normalized!", "success");
  };
  const handleAddCustomTestCase = () => {
    const newAnswers = (examPaper.questions || []).map((q) => ({
      questionNumber: q.questionNumber,
      answerText: customAnswers[q.questionNumber] || "Standard answer attempt."
    }));
    const newCase = {
      id: `tc_custom_${Date.now()}`,
      name: customName || "Custom Evaluation Test",
      profileType: "custom",
      description: customDesc || "Custom instructor defined answer benchmark",
      expectedScoreRange: [
        Math.round(customMinScore / 100 * examPaper.totalMarks),
        Math.round(customMaxScore / 100 * examPaper.totalMarks)
      ],
      expectedPercentageRange: [customMinScore, customMaxScore],
      answers: newAnswers
    };
    const updated = [...customTestCases, newCase];
    setCustomTestCases(updated);
    setCustomModalOpen(false);
    showSweetToast(`Custom benchmark "${newCase.name}" added to test suite!`, "success");
  };
  return <div className={`space-y-6 ${isEmbedded ? "" : "p-6 bg-[#0f0f12] rounded-2xl border border-[#27272a]"}`}>
      {
    /* Header Banner */
  }
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 p-5 rounded-2xl border border-indigo-500/30">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              AUTOMATED QUESTION PAPER TEST HARNESS
            </span>
            <span className="text-xs text-zinc-400 font-mono">v3.8 Flash Engine</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <span>{examPaper.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-normal">
              {examPaper.totalMarks} Marks • {examPaper.questions.length} Questions
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Run automated stress testing, semantic validation, and synthetic student benchmarks against this Question Paper rubric before releasing it for student evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
    id="btn-add-custom-test-case"
    onClick={() => setCustomModalOpen(true)}
    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
  >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Custom Test</span>
          </button>

          <button
    id="btn-run-automated-test-suite"
    onClick={() => handleRunTests()}
    disabled={isRunning}
    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition flex items-center gap-2 ${isRunning ? "bg-indigo-700 cursor-not-allowed opacity-80" : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95"}`}
  >
            {isRunning ? <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running Test Suite ({activeStepIndex >= 0 ? `Case ${activeStepIndex + 1}` : "Executing"})...</span>
              </> : <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Run Automated Test Suite</span>
              </>}
          </button>
        </div>
      </div>

      {
    /* Test Execution Progress Indicator */
  }
      {isRunning && <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-600/40 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Executing Benchmark Synthetic Submissions...</span>
            </span>
            <span className="text-zinc-400 font-mono">
              Running Case {activeStepIndex + 1} of 5
            </span>
          </div>

          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
    style={{ width: `${Math.max(15, (activeStepIndex + 1) / 5 * 100)}%` }}
  />
          </div>
        </div>}

      {
    /* Test Report Dashboard */
  }
      {testReport && <div className="space-y-5 animate-fadeIn">
          {
    /* Key Metrics Cards */
  }
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {
    /* 1. Pass Rate */
  }
            <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Pass Rate</span>
                <CheckCircle2 className={`w-3.5 h-3.5 ${testReport.passRate >= 80 ? "text-emerald-400" : "text-amber-400"}`} />
              </span>
              <div className="mt-2">
                <span className={`text-2xl font-black ${testReport.passRate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                  {testReport.passRate}%
                </span>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {testReport.testsPassed} of {testReport.totalTestsRun} passed
                </p>
              </div>
            </div>

            {
    /* 2. Reliability Index */
  }
            <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Reliability Index</span>
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-white">
                  {testReport.overallReliabilityScore}%
                </span>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Multi-scenario robustness
                </p>
              </div>
            </div>

            {
    /* 3. Own-Words Leniency */
  }
            <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Own-Words Leniency</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-300">
                  {testReport.ownWordsSemanticTolerance}%
                </span>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Colloquial phrase tolerance
                </p>
              </div>
            </div>

            {
    /* 4. Adversarial Guard */
  }
            <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Adversarial Guard</span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-cyan-300">
                  {testReport.adversarialResistanceScore}%
                </span>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Off-topic & injection resist
                </p>
              </div>
            </div>

            {
    /* 5. Latency */
  }
            <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Avg Latency</span>
                <Clock className="w-3.5 h-3.5 text-purple-400" />
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-purple-300">
                  {testReport.averageLatencyMs}ms
                </span>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Grading engine speed
                </p>
              </div>
            </div>
          </div>

          {
    /* Rubric Integrity Warning Banner if needed */
  }
          {(!testReport.rubricIntegrityCheck.valid || testReport.rubricIntegrityCheck.warnings.length > 0) && <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Rubric Integrity Calibration Advisory</span>
              </div>
              <ul className="list-disc pl-5 text-amber-200/80 space-y-1">
                {testReport.rubricIntegrityCheck.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
              <div className="pt-2 flex items-center gap-2">
                <button
    id="btn-auto-calibrate-rubric"
    onClick={handleApplyCalibration}
    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition flex items-center gap-1.5 shadow-sm"
  >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Auto-Calibrate Rubric Weights</span>
                </button>
              </div>
            </div>}

          {
    /* Benchmark Results List */
  }
          <div className="bg-[#141418] border border-[#27272a] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Benchmark Test Executions</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-normal">
                    {testReport.results.length} Scenarios
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Examines grading fidelity across distinct student personas, verifying mark allocations stay inside statistical tolerances.
                </p>
              </div>

              {
    /* Export and Action buttons */
  }
              <div className="flex items-center gap-2">
                <button
    id="btn-export-test-report-json"
    onClick={() => exportTestSuiteReportAsJSON(testReport)}
    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5"
    title="Export full test report as JSON"
  >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Export JSON</span>
                </button>

                <button
    id="btn-export-test-report-txt"
    onClick={() => exportTestSuiteReportAsText(testReport)}
    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition flex items-center gap-1.5"
    title="Export printable audit text report"
  >
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Audit Report</span>
                </button>

                {onApplyAsActiveExam && <button
    id="btn-apply-tested-exam"
    onClick={() => onApplyAsActiveExam(examPaper)}
    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Tested Exam</span>
                  </button>}
              </div>
            </div>

            <div className="divide-y divide-[#27272a]">
              {testReport.results.map((r, idx) => {
    const isExpanded = expandedTestId === r.testCaseId;
    const statusColor = r.status === "Passed" ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/60" : r.status === "Warning" ? "text-amber-400 bg-amber-950/40 border-amber-800/60" : "text-rose-400 bg-rose-950/40 border-rose-800/60";
    return <div key={idx} className="p-4 transition hover:bg-zinc-900/40">
                    <div
      className="flex items-start justify-between gap-3 cursor-pointer"
      onClick={() => setExpandedTestId(isExpanded ? null : r.testCaseId)}
    >
                      <div className="flex items-start space-x-3">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-white">
                              {r.testCaseName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                              {r.status}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {r.profileType.replace("_", " ")}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 mt-1">
                            {r.notes}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">
                            {r.awardedMarks} / {r.totalMaxMarks} M
                          </span>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            Target: {r.expectedPercentageRange[0]}% - {r.expectedPercentageRange[1]}% ({r.percentage}%)
                          </div>
                        </div>

                        <button className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {
      /* Expandable Question Breakdown */
    }
                    {isExpanded && <div className="mt-4 pt-4 border-t border-[#27272a] space-y-3 bg-[#101014] p-4 rounded-xl">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold border-b border-zinc-800 pb-2">
                          <span>Question-by-Question Marking Audit</span>
                          <span className="font-mono text-indigo-400">Semantic Equivalence: {r.semanticEquivalenceScore}%</span>
                        </div>

                        <div className="space-y-2">
                          {r.evaluations.map((ev, qIdx) => <div key={qIdx} className="p-3 bg-[#18181b] rounded-lg border border-zinc-800/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-zinc-200">
                                  Q{ev.questionNumber}: {ev.questionText ? ev.questionText.slice(0, 70) + "..." : `Question ${ev.questionNumber}`}
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                  {ev.awardedMarks} / {ev.maxMarks} M
                                </span>
                              </div>

                              {
      /* Student response snippet */
    }
                              {ev.studentAnswerText && <div className="p-2 rounded bg-[#0f0f12] text-[11px] text-zinc-300 font-mono">
                                  <span className="text-zinc-500 font-sans mr-1">Test Input:</span>
                                  <span>{ev.studentAnswerText}</span>
                                </div>}

                              {
      /* Key concepts matched */
    }
                              <div className="flex flex-wrap gap-1.5 text-[10px]">
                                {ev.conceptMatches?.map((cm, cmIdx) => <span
      key={cmIdx}
      className={`px-2 py-0.5 rounded-full border ${cm.status === "Full" ? "bg-emerald-950/40 text-emerald-300 border-emerald-800" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}
    >
                                    {cm.concept}: {cm.awardedWeight}/{cm.requiredWeight}M
                                  </span>)}
                              </div>

                              {ev.feedback && <p className="text-[11px] text-zinc-400 italic">
                                  "{ev.feedback}"
                                </p>}
                            </div>)}
                        </div>
                      </div>}
                  </div>;
  })}
            </div>
          </div>

          {
    /* Academic Recommendations */
  }
          {testReport.recommendations && testReport.recommendations.length > 0 && <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Rubric Verification & Calibration Insights</span>
              </h4>
              <ul className="space-y-1 text-xs text-zinc-400 pl-4 list-disc">
                {testReport.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>}
        </div>}

      {
    /* When no test has run yet */
  }
      {!testReport && !isRunning && <div className="p-8 border border-dashed border-[#27272a] rounded-2xl text-center space-y-3 bg-[#121215]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Automated Test Harness Ready</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Click "Run Automated Test Suite" above to evaluate 5 synthetic student profiles (Exemplary, Colloquial Own-Words, Partial Credit, Borderline, and Adversarial Off-Topic) against this Question Paper rubric.
          </p>
          <button
    id="btn-run-tests-empty-state"
    onClick={() => handleRunTests()}
    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition inline-flex items-center gap-2 shadow-md"
  >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Test Suite</span>
          </button>
        </div>}

      {
    /* Add Custom Test Case Modal */
  }
      {customModalOpen && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create Custom Test Case</span>
              </h3>
              <button
    onClick={() => setCustomModalOpen(false)}
    className="text-zinc-400 hover:text-white p-1"
  >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Scenario Name</label>
                <input
    type="text"
    value={customName}
    onChange={(e) => setCustomName(e.target.value)}
    placeholder="e.g., Transfer Student with Partial Calculus"
    className="w-full bg-[#121215] border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
  />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Target Score Band (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500">Min Percentage:</span>
                    <input
    type="number"
    min={0}
    max={100}
    value={customMinScore}
    onChange={(e) => setCustomMinScore(Number(e.target.value))}
    className="w-full bg-[#121215] border border-zinc-700 rounded-lg p-2 text-white focus:outline-none"
  />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">Max Percentage:</span>
                    <input
    type="number"
    min={0}
    max={100}
    value={customMaxScore}
    onChange={(e) => setCustomMaxScore(Number(e.target.value))}
    className="w-full bg-[#121215] border border-zinc-700 rounded-lg p-2 text-white focus:outline-none"
  />
                  </div>
                </div>
              </div>

              {
    /* Answers per question */
  }
              <div className="space-y-2 pt-2">
                <label className="block text-zinc-300 font-semibold">Test Answers per Question</label>
                {examPaper.questions.map((q) => <div key={q.questionNumber} className="space-y-1">
                    <span className="text-[11px] text-indigo-400 font-semibold">
                      Q{q.questionNumber}: {q.questionText.slice(0, 50)}... ({q.maxMarks}M)
                    </span>
                    <textarea
    rows={2}
    value={customAnswers[q.questionNumber] || ""}
    onChange={(e) => setCustomAnswers((prev) => ({
      ...prev,
      [q.questionNumber]: e.target.value
    }))}
    className="w-full bg-[#121215] border border-zinc-700 rounded-lg p-2 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
  />
                  </div>)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#27272a] pt-3">
              <button
    onClick={() => setCustomModalOpen(false)}
    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
  >
                Cancel
              </button>
              <button
    onClick={handleAddCustomTestCase}
    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
  >
                Add Benchmark & Run
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
