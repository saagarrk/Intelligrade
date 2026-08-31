import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
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
  LineChart as LineChartIcon,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
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

interface Stage4Props {
  submission: StudentSubmission;
  exam: ExamPaper;
  onNextStage: () => void;
}

export const Stage4Insights: React.FC<Stage4Props> = ({
  submission,
  exam,
  onNextStage
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const insights = submission.personalizedInsights;
  const predictive = submission.predictiveAnalytics;

  // Prepare Bar chart data
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
    { range: '51-70%', students: 24, isStudentRange: submission.percentageScore >= 51 && submission.percentageScore <= 70 },
    { range: '71-85%', students: 38, isStudentRange: submission.percentageScore > 70 && submission.percentageScore <= 85 },
    { range: '86-100%', students: 16, isStudentRange: submission.percentageScore > 85 }
  ];

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

      {/* Interactive Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Question Performance Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
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
                <Bar dataKey="awarded" name="Awarded Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="Max Marks" fill="#27272a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Skill Radar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
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
                <Radar name="Student Score" dataKey="studentScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                <Radar name="Cohort Average" dataKey="cohortAverage" stroke="#71717a" fill="#71717a" fillOpacity={0.2} />
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
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Class Cohort Grade Distribution:
              </span>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cohortDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                    <XAxis dataKey="range" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px', color: '#fafafa' }}
                    />
                    <Area type="monotone" dataKey="students" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
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
