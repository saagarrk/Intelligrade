import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  BookOpen, 
  Download, 
  Printer, 
  Share2, 
  Award, 
  Target,
  FileText,
  LineChart as LineChartIcon,
  ShieldCheck,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Percent,
  Activity,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell,
  ReferenceLine,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { StudentSubmission, ExamPaper } from '../types';
import { useTheme } from '../context/ThemeContext';
import { exportStudentEvaluationPDF } from '../utils/pdfExport';
import { showSweetToast } from '../utils/sweetAlert';

interface Stage4Props {
  submission: StudentSubmission;
  exam: ExamPaper;
  onNextStage: () => void;
  allSubmissions?: StudentSubmission[];
}

export const Stage4Insights: React.FC<Stage4Props> = ({
  submission,
  exam,
  onNextStage,
  allSubmissions = []
}) => {
  const { currentTheme } = useTheme();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [comparisonViewMode, setComparisonViewMode] = useState<'marks' | 'percentage' | 'delta'>('marks');
  const [showClassHighest, setShowClassHighest] = useState<boolean>(true);

  const studentScoreColor = currentTheme.colors.accentPrimary || '#6366F1';
  const classAvgColor = '#64748B';
  const classHighColor = '#3F3F46';

  const insights = submission.personalizedInsights;
  const predictive = submission.predictiveAnalytics;

  // Live total marks taking teacher overrides into account
  const liveTotalMarks = Number(
    submission.questionEvaluations.reduce((sum, e) => {
      const val = e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks;
      return sum + val;
    }, 0).toFixed(1)
  );
  const livePercentage = Number(((liveTotalMarks / (exam.totalMarks || 1)) * 100).toFixed(1));

  // Find all class submissions for this specific exam
  const examSubmissions = allSubmissions.filter(s => s.examId === exam.id);
  const hasMultipleSubmissions = examSubmissions.length > 1;

  // Question-by-question comparative metrics (Student vs Class Average)
  const defaultCohortFactors = [0.72, 0.68, 0.74, 0.70, 0.71];

  const questionComparisonData = exam.questions.map((q, idx) => {
    const evalItem = submission.questionEvaluations.find(
      e => e.questionId === q.id || e.questionNumber === q.questionNumber
    );
    const studentMarks = evalItem 
      ? (evalItem.teacherOverrideMarks !== undefined ? evalItem.teacherOverrideMarks : evalItem.awardedMarks)
      : 0;
    const maxMarks = q.maxMarks || 10;
    const studentPct = Number(((studentMarks / maxMarks) * 100).toFixed(1));

    let classAvgMarks = 0;
    let classHighMarks = maxMarks;

    if (hasMultipleSubmissions) {
      const marksSum = examSubmissions.reduce((sum, sub) => {
        const qe = sub.questionEvaluations.find(
          e => e.questionId === q.id || e.questionNumber === q.questionNumber
        );
        const m = qe ? (qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : qe.awardedMarks) : 0;
        return sum + m;
      }, 0);
      classAvgMarks = Number((marksSum / examSubmissions.length).toFixed(1));

      classHighMarks = Math.max(...examSubmissions.map(sub => {
        const qe = sub.questionEvaluations.find(
          e => e.questionId === q.id || e.questionNumber === q.questionNumber
        );
        return qe ? (qe.teacherOverrideMarks !== undefined ? qe.teacherOverrideMarks : qe.awardedMarks) : 0;
      }));
    } else {
      const factor = defaultCohortFactors[idx % defaultCohortFactors.length];
      classAvgMarks = Number((maxMarks * factor).toFixed(1));
      classHighMarks = Number((maxMarks * 0.95).toFixed(1));
    }

    const classAvgPct = Number(((classAvgMarks / maxMarks) * 100).toFixed(1));
    const diffMarks = Number((studentMarks - classAvgMarks).toFixed(1));
    const diffPct = Number((studentPct - classAvgPct).toFixed(1));

    return {
      questionNumber: q.questionNumber,
      name: `Q${q.questionNumber}`,
      topic: q.topic || `Question ${q.questionNumber}`,
      shortTopic: q.topic ? (q.topic.length > 20 ? q.topic.slice(0, 18) + '...' : q.topic) : `Q${q.questionNumber}`,
      studentMarks,
      classAvgMarks,
      classHighMarks,
      maxMarks,
      studentPct,
      classAvgPct,
      diffMarks,
      diffPct,
      similarity: evalItem?.semanticSimilarityScore || 0,
      isAboveAverage: studentMarks >= classAvgMarks
    };
  });

  // Overall Class Total Average Marks & Percentage
  let classTotalAvgMarks = 0;
  let classAvgPercentage = 0;

  if (hasMultipleSubmissions) {
    const sumTotal = examSubmissions.reduce((sum, s) => {
      const sTotal = s.questionEvaluations.reduce((subSum, e) => {
        const m = e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks;
        return subSum + m;
      }, 0);
      return sum + sTotal;
    }, 0);
    classTotalAvgMarks = Number((sumTotal / examSubmissions.length).toFixed(1));
    classAvgPercentage = Number(((classTotalAvgMarks / (exam.totalMarks || 1)) * 100).toFixed(1));
  } else {
    classAvgPercentage = 71.5;
    classTotalAvgMarks = Number(((exam.totalMarks * classAvgPercentage) / 100).toFixed(1));
  }

  const overallDeltaMarks = Number((liveTotalMarks - classTotalAvgMarks).toFixed(1));
  const overallDeltaPct = Number((livePercentage - classAvgPercentage).toFixed(1));

  // Prepare Bar chart data for secondary question score breakdown
  const questionScoreData = submission.questionEvaluations.map(e => ({
    name: `Q${e.questionNumber}`,
    awarded: e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks,
    max: e.maxMarks,
    similarity: e.semanticSimilarityScore
  }));

  const maxQuestionMark = Math.max(10, ...submission.questionEvaluations.map(e => e.maxMarks));

  // Prepare Radar chart data
  const radarData = predictive.radarSkills || [
    { skill: 'Conceptual Clarity', studentScore: 94, cohortAverage: 71 },
    { skill: 'Mathematical Rigor', studentScore: 88, cohortAverage: 62 },
    { skill: 'Terminology & Keywords', studentScore: 95, cohortAverage: 74 },
    { skill: 'Handwriting OCR Quality', studentScore: 96, cohortAverage: 78 },
    { skill: 'Step-by-Step Completeness', studentScore: 89, cohortAverage: 65 }
  ];

  // Cohort bell curve distribution data
  const cohortDistribution = [
    { range: '0-30%', students: 2, isStudentRange: false },
    { range: '31-50%', students: 8, isStudentRange: false },
    { range: '51-70%', students: 24, isStudentRange: livePercentage >= 51 && livePercentage <= 70 },
    { range: '71-85%', students: 38, isStudentRange: livePercentage > 70 && livePercentage <= 85 },
    { range: '86-100%', students: 16, isStudentRange: livePercentage > 85 }
  ];

  // Custom tooltips for performance comparison
  const CustomComparisonTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
    label?: string;
  }> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-lg shadow-2xl text-xs space-y-2 min-w-[220px]">
        <div className="border-b border-[#27272a] pb-1.5">
          <div className="flex items-center justify-between text-white font-semibold">
            <span>Q{data.questionNumber}: {data.name}</span>
            <span className="text-[10px] text-slate-400 font-normal">Max: {data.maxMarks} marks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.topic}</p>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: studentScoreColor }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: studentScoreColor }} />
              Student Score:
            </span>
            <span className="font-bold text-white font-mono">
              {data.studentMarks} / {data.maxMarks} ({data.studentPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
              Class Average:
            </span>
            <span className="font-semibold text-slate-300 font-mono">
              {data.classAvgMarks} / {data.maxMarks} ({data.classAvgPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#27272a]">
            <span className="text-slate-400">Relative Delta:</span>
            <span className={`font-bold font-mono ${data.diffMarks >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.diffMarks >= 0 ? `+${data.diffMarks}` : data.diffMarks} marks ({data.diffPct >= 0 ? `+${data.diffPct}` : data.diffPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Class Top Score:</span>
            <span className="font-mono text-slate-400">{data.classHighMarks} marks</span>
          </div>
        </div>
      </div>
    );
  };

  const CustomDeltaTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
  }> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;
    const isPositive = data.diffMarks >= 0;

    return (
      <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-lg shadow-2xl text-xs space-y-1.5 min-w-[200px]">
        <p className="font-semibold text-white">Q{data.questionNumber}: {data.topic}</p>
        <div className="text-[11px] space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Student Score:</span>
            <span className="text-white font-mono">{data.studentMarks} pts</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Class Mean:</span>
            <span className="text-slate-300 font-mono">{data.classAvgMarks} pts</span>
          </div>
          <div className="flex justify-between font-bold border-t border-[#27272a] pt-1">
            <span>Net Variance:</span>
            <span className={`font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? `+${data.diffMarks}` : data.diffMarks} pts ({isPositive ? `+${data.diffPct}` : data.diffPct}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submission, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `intelligrade_${submission.studentRollNumber}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess('JSON Report Exported');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    let csv = "Question_Number,Topic,Max_Marks,Awarded_Marks,Semantic_Similarity,Feedback\n";
    submission.questionEvaluations.forEach(e => {
      const q = exam.questions.find(x => x.id === e.questionId);
      const marks = e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks;
      csv += `${e.questionNumber},"${q?.topic || ''}",${e.maxMarks},${marks},${e.semanticSimilarityScore}%,"${e.feedback.replace(/"/g, '""')}"\n`;
    });
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `intelligrade_${submission.studentRollNumber}_marks.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess('CSV Marks Sheet Exported');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExportingPdf(true);
      await exportStudentEvaluationPDF(submission, exam, {
        institutionName: 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
        evaluatorName: 'Prof. Rajesh Kulkarni (Senior Faculty Evaluator)'
      });
      showSweetToast(`Official PDF dossier exported for ${submission.studentName} (${submission.studentRollNumber})`, 'success');
      setDownloadSuccess('Archival PDF Report Exported');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (error) {
      console.error('Error exporting student PDF:', error);
      showSweetToast('Failed to export PDF evaluation report. Please try again.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintGradeCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                4
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Stage 4: Insight Generation & Predictive Performance Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Delivers personalized student feedback, knowledge retention trends, predictive score modeling, and interactive charts for students and teachers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-pdf-report-btn"
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              title="Export formatted PDF evaluation report for offline institutional archival"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export Archival PDF'}</span>
            </button>

            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#18181b] hover:bg-[#27272a] text-slate-200 text-xs font-medium rounded-lg border border-[#27272a] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#18181b] hover:bg-[#27272a] text-slate-200 text-xs font-medium rounded-lg border border-[#27272a] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              id="print-grade-card-btn"
              onClick={handlePrintGradeCard}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Grade Card</span>
            </button>

            <button
              id="proceed-stage5-btn"
              onClick={onNextStage}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] text-xs font-medium rounded-lg border border-[#27272a] transition-all"
            >
              <span>View Spring Boot & MySQL Spec</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess} successfully!</span>
          </div>
        )}
      </div>

      {/* Predictive Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Forecasted Next Score */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Score Forecast</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {predictive.predictedNextScore}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confidence: [{predictive.scoreRangeConfidence[0]}% - {predictive.scoreRangeConfidence[1]}%]
          </p>
          <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-2 font-medium">
            Predicted Next Exam Grade
          </span>
        </div>

        {/* Knowledge Retention Index */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Retention Index</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {predictive.knowledgeRetentionIndex}/100
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pass Probability: {predictive.predictedPassProbability}%
          </p>
          <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 inline-block mt-2 font-medium">
            Long-Term Memory Retention
          </span>
        </div>

        {/* Cohort Standing */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Cohort Percentile</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">
            Top {(100 - predictive.classPercentileRank).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Percentile Rank: {predictive.classPercentileRank}th
          </p>
          <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 inline-block mt-2 font-medium">
            Class Performance Standing
          </span>
        </div>

        {/* Readiness Level */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Readiness Level</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-semibold text-emerald-300 mt-2 truncate">
            {predictive.examReadinessLevel}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Comprehensive Curriculum Mastery
          </p>
          <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-2 font-medium">
            Finals Exam Ready
          </span>
        </div>
      </div>

      {/* Visual Performance Comparison Chart: Student Score vs Class Average (Full Width) */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#27272a] pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-[#2563EB] border border-blue-500/20">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Student Performance vs. Class Average
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 border border-blue-800/40 font-semibold">
                Cohort Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparative analysis of <span className="text-white font-medium">{submission.studentName}</span>'s results against class cohort averages and curriculum benchmarks.
            </p>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
            <button
              id="tab-view-marks"
              onClick={() => setComparisonViewMode('marks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                comparisonViewMode === 'marks'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Marks Comparison</span>
            </button>

            <button
              id="tab-view-percentage"
              onClick={() => setComparisonViewMode('percentage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                comparisonViewMode === 'percentage'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Mastery %</span>
            </button>

            <button
              id="tab-view-delta"
              onClick={() => setComparisonViewMode('delta')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                comparisonViewMode === 'delta'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Variance Delta (+/-)</span>
            </button>
          </div>
        </div>

        {/* High-Level Comparison KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: studentScoreColor }} />
              Student Total Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">{liveTotalMarks}</span>
              <span className="text-xs text-slate-400">/ {exam.totalMarks}</span>
              <span className="text-xs font-semibold font-mono ml-auto" style={{ color: studentScoreColor }}>
                ({livePercentage}%)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">{submission.studentName} ({submission.studentRollNumber})</p>
          </div>

          <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64748B]" />
              Class Cohort Average
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-200 font-mono">{classTotalAvgMarks}</span>
              <span className="text-xs text-slate-400">/ {exam.totalMarks}</span>
              <span className="text-xs font-semibold text-slate-300 font-mono ml-auto">
                ({classAvgPercentage}%)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {hasMultipleSubmissions ? `Calculated across ${examSubmissions.length} submissions` : 'Class cohort mean'}
            </p>
          </div>

          <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              {overallDeltaMarks >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              )}
              Relative Delta
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold font-mono ${overallDeltaMarks >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overallDeltaMarks >= 0 ? `+${overallDeltaMarks}` : overallDeltaMarks}
              </span>
              <span className="text-xs text-slate-400">marks</span>
              <span className={`text-xs font-semibold font-mono ml-auto px-1.5 py-0.5 rounded ${
                overallDeltaPct >= 0 
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
              }`}>
                {overallDeltaPct >= 0 ? `+${overallDeltaPct}%` : `${overallDeltaPct}%`}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {overallDeltaMarks >= 0 ? 'Outperforming Class Mean' : 'Requires Topic Remediation'}
            </p>
          </div>

          <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Percentile Rank
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-amber-300 font-mono">
                Top {(100 - predictive.classPercentileRank).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-400">({predictive.classPercentileRank}th)</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Readiness: <span className="text-emerald-400 font-medium">{predictive.examReadinessLevel}</span>
            </p>
          </div>
        </div>

        {/* The Main Recharts Visual Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {comparisonViewMode === 'marks' && 'Side-by-Side Question Marks: Individual Student Score vs Class Average'}
              {comparisonViewMode === 'percentage' && 'Topic Mastery Attainment (%) with Class Cohort Benchmark Reference Lines'}
              {comparisonViewMode === 'delta' && 'Point Variance: Positive (Green = Above Class Mean) vs Negative (Red = Below Class Mean)'}
            </span>
            {comparisonViewMode === 'marks' && (
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={showClassHighest}
                  onChange={(e) => setShowClassHighest(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-[#2563EB] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Include Class Top Score</span>
              </label>
            )}
          </div>

          {/* Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {comparisonViewMode === 'marks' ? (
                <BarChart data={questionComparisonData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={11} 
                    tickFormatter={(val, i) => `${val} (${questionComparisonData[i]?.shortTopic || ''})`} 
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, Math.max(10, ...questionComparisonData.map(d => d.maxMarks))]} />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="studentMarks" name="Student Score" fill={studentScoreColor} radius={[4, 4, 0, 0]} maxBarSize={42} />
                  <Bar dataKey="classAvgMarks" name="Class Average" fill={classAvgColor} radius={[4, 4, 0, 0]} maxBarSize={42} />
                  {showClassHighest && (
                    <Bar dataKey="classHighMarks" name="Class Highest" fill={classHighColor} radius={[4, 4, 0, 0]} maxBarSize={42} />
                  )}
                </BarChart>
              ) : comparisonViewMode === 'percentage' ? (
                <BarChart data={questionComparisonData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={11}
                    tickFormatter={(val, i) => `${val}: ${questionComparisonData[i]?.shortTopic || ''}`} 
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomComparisonTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine 
                    y={classAvgPercentage} 
                    stroke="#F59E0B" 
                    strokeDasharray="4 4" 
                    label={{ 
                      value: `Class Mean: ${classAvgPercentage}%`, 
                      position: 'top', 
                      fill: '#F59E0B', 
                      fontSize: 10 
                    }} 
                  />
                  <ReferenceLine 
                    y={livePercentage} 
                    stroke={studentScoreColor} 
                    strokeDasharray="2 2" 
                    label={{ 
                      value: `Student: ${livePercentage}%`, 
                      position: 'insideTopRight', 
                      fill: studentScoreColor, 
                      fontSize: 10 
                    }} 
                  />
                  <Bar dataKey="studentPct" name="Student Score %" fill={studentScoreColor} radius={[4, 4, 0, 0]} maxBarSize={42} />
                  <Bar dataKey="classAvgPct" name="Class Average %" fill={classAvgColor} radius={[4, 4, 0, 0]} maxBarSize={42} />
                </BarChart>
              ) : (
                <BarChart data={questionComparisonData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.7} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94A3B8" 
                    fontSize={11}
                    tickFormatter={(val, i) => `${val}: ${questionComparisonData[i]?.shortTopic || ''}`} 
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} unit=" pts" />
                  <Tooltip content={<CustomDeltaTooltip />} />
                  <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1.5} />
                  <Bar dataKey="diffMarks" name="Score Variance vs Mean" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {questionComparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.diffMarks >= 0 ? '#16A34A' : '#DC2626'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Question Comparison Breakdown Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-[#27272a]">
          {questionComparisonData.map((item) => (
            <div 
              key={item.questionNumber} 
              className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] text-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-white">Q{item.questionNumber}:</span>
                  <span className="text-slate-300 ml-1 truncate font-medium block text-[11px]">
                    {item.topic}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  item.diffMarks >= 0 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}>
                  {item.diffMarks >= 0 ? `+${item.diffMarks}` : item.diffMarks} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-[#27272a]/60">
                <span>Student: <strong className="text-white font-mono">{item.studentMarks}</strong>/{item.maxMarks}</span>
                <span>Class Avg: <strong className="text-slate-300 font-mono">{item.classAvgMarks}</strong></span>
                <span className={item.diffPct >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {item.diffPct >= 0 ? `+${item.diffPct}%` : `${item.diffPct}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Question Performance Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Question Marks vs Max Possible
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Awarded vs Total</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.8} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} domain={[0, maxQuestionMark]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa' }}
                  itemStyle={{ color: '#fafafa' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="awarded" name="Awarded Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="Max Marks" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Skill Radar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Cognitive & Examination Skill Matrix
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Student vs Cohort Average</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="skill" stroke="#a1a1aa" fontSize={10} />
                <PolarRadiusAxis stroke="#52525b" angle={30} domain={[0, 100]} fontSize={9} />
                <Radar name="Student Score" dataKey="studentScore" stroke="#2563EB" fill="#2563EB" fillOpacity={0.35} />
                <Radar name="Cohort Average" dataKey="cohortAverage" stroke="#64748B" fill="#64748B" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cohort Distribution & Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personalized Feedback & Recommendations (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Personalized Qualitative Feedback
              </h3>
            </div>

            {/* Summary */}
            <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-200 leading-relaxed">
              <span className="font-semibold text-indigo-400 block mb-1">Executive Assessment:</span>
              {insights.overallSummary}
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Key Strengths:</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {insights.keyStrengths.map((s, idx) => (
                    <li key={idx} className="text-[11px] leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1.5">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Knowledge Gaps:</span>
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {insights.criticalGaps.map((g, idx) => (
                    <li key={idx} className="text-[11px] leading-relaxed">{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                Targeted Action Items for Score Improvement:
              </span>
              <div className="space-y-1.5">
                {insights.actionableRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-300 flex items-start space-x-2"
                  >
                    <span className="font-semibold text-indigo-400 font-mono shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Study Topics to Revise (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Recommended Study & Revision Topics
              </h3>
            </div>

            <div className="space-y-3">
              {insights.studyTopicsToRevise.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{item.topic}</span>
                    <span
                      className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                        item.urgency === 'High'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : item.urgency === 'Medium'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      {item.urgency} Urgency
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <span className="text-slate-500 font-medium">Resource: </span>
                    {item.resourcesRecommended}
                  </p>
                </div>
              ))}
            </div>

            {/* Class Cohort Bell Curve */}
            <div className="pt-2 border-t border-[#27272a] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Class Cohort Grade Distribution:
                </span>
                <span className="text-[10px] text-blue-300 font-mono font-medium">
                  Current Student: {livePercentage}% (Top {(100 - predictive.classPercentileRank).toFixed(0)}%)
                </span>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cohortDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                    <XAxis dataKey="range" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px', color: '#fafafa' }}
                    />
                    <Area type="monotone" dataKey="students" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
