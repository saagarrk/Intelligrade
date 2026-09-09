import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  BarChart3, 
  ChevronRight, 
  Download, 
  Target, 
  Sparkles, 
  BookMarked, 
  BrainCircuit, 
  Layers,
  Palette,
  Lightbulb,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { ExamPaper, StudentSubmission, PipelineStage } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HowItWorksGuide } from './HowItWorksGuide';
import { exportStudentEvaluationPDF } from '../utils/pdfExport';
import { showSweetToast } from '../utils/sweetAlert';

interface StudentDashboardProps {
  exams: ExamPaper[];
  submissions: StudentSubmission[];
  selectedExamId: string;
  selectedSubmissionId: string;
  onSelectExam: (examId: string) => void;
  onSelectSubmission: (submissionId: string) => void;
  onNavigateStage?: (stage: PipelineStage) => void;
  onOpenAppealModal: () => void;
  initialTab?: 'scorecard' | 'questions' | 'radar' | 'appeals';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  exams,
  submissions,
  selectedExamId,
  selectedSubmissionId,
  onSelectExam,
  onSelectSubmission,
  onOpenAppealModal,
  initialTab = 'scorecard'
}) => {
  const { user, switchRole } = useAuth();
  const { currentTheme, setIsThemeModalOpen } = useTheme();
  const [studentTab, setStudentTab] = useState<'scorecard' | 'questions' | 'radar' | 'appeals'>(initialTab);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  // Find submissions for current student
  const studentSubmissions = submissions.filter(s => 
    s.studentRollNumber === (user?.rollNumber || 'CS-2026-041') || 
    s.studentName.toLowerCase().includes('alex')
  );
  
  // Active submission for the selected exam
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const activeSubmission = submissions.find(s => s.examId === currentExam.id && s.id === selectedSubmissionId) 
    || studentSubmissions[0] 
    || submissions[0];

  const totalAwarded = activeSubmission.questionEvaluations.reduce((sum, e) => {
    return sum + (e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks);
  }, 0);
  const totalMax = currentExam.totalMarks || activeSubmission.totalMaxMarks;

  // Radar Data
  const radarData = activeSubmission.predictiveAnalytics?.radarSkills || [
    { skill: 'Conceptual Clarity', studentScore: 92, cohortAverage: 72 },
    { skill: 'Mathematical Rigor', studentScore: 86, cohortAverage: 65 },
    { skill: 'Terminology & Keywords', studentScore: 90, cohortAverage: 74 },
    { skill: 'Handwriting OCR Quality', studentScore: 95, cohortAverage: 78 },
    { skill: 'Step-by-Step Completeness', studentScore: 84, cohortAverage: 68 }
  ];

  // Question Breakdown Bar Data
  const questionScoreData = activeSubmission.questionEvaluations.map(e => ({
    name: `Q${e.questionNumber}`,
    score: e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks,
    max: e.maxMarks,
    percentage: Math.round(((e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks) / (e.maxMarks || 1)) * 100)
  }));

  const activeQuestion = activeSubmission.questionEvaluations[selectedQuestionIdx] || activeSubmission.questionEvaluations[0];
  const activeExamQuestion = currentExam.questions.find(q => q.questionNumber === activeQuestion?.questionNumber);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setIsExportingPdf(true);
      await exportStudentEvaluationPDF(activeSubmission, currentExam, {
        institutionName: user?.department ? `DEPARTMENT OF ${user.department.toUpperCase()}` : 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
        evaluatorName: 'Faculty Evaluation Board'
      });
      showSweetToast(`Official Grade Transcript PDF exported for ${activeSubmission.studentName}`, 'success');
      setDownloadSuccess(`Official grade transcript PDF exported for ${activeSubmission.studentName} (${currentExam.courseCode})`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (error) {
      console.error('Error generating transcript PDF:', error);
      showSweetToast('Could not generate PDF transcript. Please try again.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-900 border border-emerald-900/40 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner flex-shrink-0">
              <GraduationCap className="w-9 h-9" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Welcome back, {user?.name || 'Aarav Sharma'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Student Dashboard
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Roll Number: <strong className="text-emerald-400 font-mono">{user?.rollNumber || 'CS-2026-041'}</strong> • {user?.department || 'Computer Science & Engineering'} • Semester 6
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <strong>{exams.length}</strong> Enrolled Courses
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>{studentSubmissions.length || 1}</strong> Graded Paper Available
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Current GPA: <strong>3.84 / 4.00</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-student-how-it-works"
              onClick={() => setIsHowItWorksOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/40 transition shadow-sm flex items-center gap-1.5"
              title="Learn how IntelliGrade evaluates handwritten papers"
            >
              <Lightbulb className="w-4 h-4 text-amber-300" />
              <span>How It Works</span>
            </button>

            <button
              id="btn-student-change-theme"
              onClick={() => setIsThemeModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition shadow-sm flex items-center gap-1.5"
              title="Change theme colors & appearance"
            >
              <Palette className="w-4 h-4" style={{ color: currentTheme.colors.accentPrimary }} />
              <span>Theme: {currentTheme.name.split(' ')[0]}</span>
            </button>

            <button
              id="btn-student-appeal-dash"
              onClick={onOpenAppealModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-800/60 transition shadow-sm flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Request Re-Evaluation Appeal</span>
            </button>

            <button
              id="btn-student-download-transcript"
              onClick={handleDownloadReport}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5 shadow-sm"
              title="Download official evaluation report and grade transcript as formatted PDF"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download Official Transcript (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Student Section Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-zinc-800/80 overflow-x-auto pb-1">
          {[
            { id: 'scorecard', label: '1. Scorecard & Performance', icon: Award },
            { id: 'questions', label: '2. 3-Sheet Question Breakdown & "Own Words" Review', icon: Layers },
            { id: 'radar', label: '3. Cognitive Radar & Learning Insights', icon: Target },
            { id: 'appeals', label: '4. Re-Evaluation Appeals Center', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = studentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`student-tab-${tab.id}`}
                onClick={() => setStudentTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Friendly Guidance Card for Ease of Understanding */}
      <div 
        id="student-orientation-banner"
        className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-bold text-white block">
              Student Examination Portal
            </span>
            <span className="text-zinc-400 leading-relaxed">
              You are reviewing your official graded paper for <strong className="text-zinc-200">{currentExam.title}</strong>. Want to test uploading a handwritten paper and running the AI grader?
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setIsHowItWorksOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition"
          >
            How It Works
          </button>
          <button
            onClick={async () => {
              await switchRole('teacher');
              showSweetToast('Switched to Teacher Mode: Upload papers & grade them!', 'success');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch to Teacher Mode →</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{downloadSuccess}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">PDF generated & synced</span>
        </div>
      )}

      {/* TAB 1: Scorecard & Overview */}
      {studentTab === 'scorecard' && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Paper Score</span>
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                <span className="text-emerald-400">{totalAwarded}</span> / {totalMax} Marks
              </div>
              <div className="flex items-center justify-between text-xs mt-2 text-zinc-400">
                <span>Percentage: <strong className="text-emerald-400">{activeSubmission.percentageScore}%</strong></span>
                <span className="text-emerald-400 font-semibold">Grade A</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Class Percentile</span>
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-2">
                {activeSubmission.predictiveAnalytics?.classPercentileRank || 89}th
              </div>
              <div className="text-xs mt-2 text-zinc-400">
                Top <strong className="text-indigo-300">11%</strong> of evaluated cohort
              </div>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Knowledge Retention</span>
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <BrainCircuit className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {activeSubmission.predictiveAnalytics?.knowledgeRetentionIndex || 88}%
              </div>
              <div className="text-xs mt-2 text-zinc-400">
                Semantic Concept Stability: <strong className="text-amber-300">High</strong>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Next Exam Forecast</span>
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                ~{activeSubmission.predictiveAnalytics?.predictedNextScore || 91}%
              </div>
              <div className="text-xs mt-2 text-zinc-400">
                Confidence: [{activeSubmission.predictiveAnalytics?.scoreRangeConfidence?.[0] || 82}% - {activeSubmission.predictiveAnalytics?.scoreRangeConfidence?.[1] || 94}%]
              </div>
            </div>
          </div>

          {/* Main Content Grid: Left Evaluated Papers & Questions, Right Radar & Study Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 cols): Course Papers & Question Scores */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* My Evaluated Exam Papers */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>My Enrolled Examinations & Graded Answer Sheets</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select an exam to view your graded answer sheets and question feedback.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {exams.map((exam) => {
                    const isSelected = exam.id === currentExam.id;
                    const examSubmission = submissions.find(s => s.examId === exam.id && s.studentRollNumber === (user?.rollNumber || 'CS-2026-041'))
                      || submissions.find(s => s.examId === exam.id)
                      || activeSubmission;

                    return (
                      <div
                        key={exam.id}
                        onClick={() => {
                          onSelectExam(exam.id);
                          if (examSubmission) onSelectSubmission(examSubmission.id);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {exam.courseCode}
                              </span>
                              <h3 className="text-sm font-bold text-white">{exam.title}</h3>
                              {isSelected && (
                                <span className="text-[10px] text-emerald-400 font-bold">● Active View</span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                              Subject: {exam.subject} • {exam.questions.length} Questions • Max: {exam.totalMarks} Marks
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-mono font-bold text-emerald-400">
                              {examSubmission.percentageScore}%
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Graded
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                          <span className="text-zinc-500 text-[11px]">
                            Evaluated: {new Date(examSubmission.submissionDate).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectExam(exam.id);
                                setStudentTab('questions');
                              }}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                            >
                              <span>View 3-Sheet Breakdown</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question-by-Question Marks Performance Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <span>Question Score Breakdown ({currentExam.courseCode})</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Points awarded vs. maximum possible for each rubric problem.
                    </p>
                  </div>

                  <button
                    onClick={() => setStudentTab('questions')}
                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                  >
                    <span>Detailed Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#fafafa' }}
                        itemStyle={{ color: '#fafafa' }}
                      />
                      <Bar dataKey="score" fill="#10b981" name="Awarded Marks" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="max" fill="#3f3f46" name="Max Possible" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Quick Question List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800">
                  {activeSubmission.questionEvaluations.map((q, idx) => {
                    const awarded = q.teacherOverrideMarks !== undefined ? q.teacherOverrideMarks : q.awardedMarks;
                    return (
                      <div 
                        key={q.questionNumber} 
                        onClick={() => {
                          setSelectedQuestionIdx(idx);
                          setStudentTab('questions');
                        }}
                        className="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800 hover:border-emerald-500/40 cursor-pointer text-xs transition"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-zinc-200">Question {q.questionNumber}</span>
                          <span className="font-mono text-emerald-400 font-semibold">{awarded}/{q.maxMarks}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{q.questionText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Radar Chart, Weak Topics, & Study Recommendations */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Radar Skills Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Competency Radar vs. Cohort Average</span>
                </h2>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="skill" stroke="#a1a1aa" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" fontSize={9} />
                      <Radar
                        name="My Score"
                        dataKey="studentScore"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                      />
                      <Radar
                        name="Class Cohort"
                        dataKey="cohortAverage"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.2}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa', paddingTop: '8px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Personalized Study Recommendations */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-amber-400" />
                    <span>Targeted Revision Recommendations</span>
                  </h2>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Action Items
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeSubmission.personalizedInsights.studyTopicsToRevise?.map((topic, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{topic.topic}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          topic.urgency === 'High'
                            ? 'bg-rose-500/20 text-rose-300'
                            : topic.urgency === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {topic.urgency} Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{topic.resourcesRecommended}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths and Gaps */}
                <div className="pt-2 border-t border-zinc-800 space-y-2">
                  <p className="text-[11px] text-zinc-400">
                    <strong className="text-emerald-400">Key Strengths:</strong> {activeSubmission.personalizedInsights.keyStrengths?.join(', ')}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    <strong className="text-amber-400">Areas for Focus:</strong> {activeSubmission.personalizedInsights.criticalGaps?.join(', ')}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Question-by-Question 3-Sheet Review */}
      {studentTab === 'questions' && (
        <div className="space-y-6">
          {/* Question Selector Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {activeSubmission.questionEvaluations.map((q, idx) => {
              const awarded = q.teacherOverrideMarks !== undefined ? q.teacherOverrideMarks : q.awardedMarks;
              const isSelected = selectedQuestionIdx === idx;
              return (
                <button
                  key={q.questionNumber}
                  id={`btn-student-q-${q.questionNumber}`}
                  onClick={() => setSelectedQuestionIdx(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 whitespace-nowrap border ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {q.questionNumber}
                  </span>
                  <span>Question {q.questionNumber}</span>
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    ({awarded}/{q.maxMarks})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Question Full 3-Sheet Analysis Card */}
          {activeQuestion && (
            <div className="space-y-6">
              
              {/* Question Header & Score Badge */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Question {activeQuestion.questionNumber} Evaluation
                    </span>
                    <span className="text-xs text-zinc-400">
                      Topic: {activeExamQuestion?.topic || 'Curriculum Concept'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {activeQuestion.questionText}
                  </h2>
                </div>

                <div className="flex items-center gap-4 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Awarded Marks</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {activeQuestion.teacherOverrideMarks !== undefined ? activeQuestion.teacherOverrideMarks : activeQuestion.awardedMarks} / {activeQuestion.maxMarks}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-zinc-800" />
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Semantic Match</div>
                    <div className="text-lg font-bold font-mono text-indigo-400">
                      {activeQuestion.semanticSimilarityScore}%
                    </div>
                  </div>
                </div>
              </div>

              {/* The 3-Sheet Comparison Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* SHEET 1: Candidate Answer */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <span>Sheet 1: My Transcribed Answer</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      Handwritten OCR
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed min-h-[160px] whitespace-pre-wrap">
                    {activeQuestion.studentAnswerText || activeSubmission.ocrResult.fullExtractedText}
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Extracted from your submitted physical paper using OCR with noise-filtering and adaptive binarization.
                  </p>
                </div>

                {/* SHEET 2: Official Model Answer */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>Sheet 2: Instructor Model Key</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                      Curriculum Standard
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-lg border border-indigo-950/60 font-mono text-xs text-indigo-200 leading-relaxed min-h-[160px] whitespace-pre-wrap">
                    {activeExamQuestion?.modelAnswer || 'Standard textbook derivation and key equations.'}
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Official benchmark solution provided by the instructor for reference.
                  </p>
                </div>

                {/* SHEET 3: Gemini AI "Own-Words" Equivalence */}
                <div className="bg-gradient-to-b from-purple-950/20 to-zinc-900 border border-purple-800/40 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-800/40 pb-2.5">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Sheet 3: "Own-Words" Matrix</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50 font-mono">
                      Gemini 3.7 Verified
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#121019] rounded-lg border border-purple-900/30 text-xs text-purple-200 leading-relaxed min-h-[160px] space-y-2">
                    <p className="text-[11px] text-purple-300 font-semibold">
                      Recognized Semantic Equivalence:
                    </p>
                    <p className="text-[11px] text-zinc-300 leading-normal">
                      Your answer explained the concept in your own words. The Gemini AI Semantic Engine confirmed that your formulation is conceptually sound with the official rubric.
                    </p>
                    {activeExamQuestion?.geminiSemanticMatrix?.acceptedSynonyms && (
                      <div className="pt-2 border-t border-purple-900/30">
                        <span className="text-[10px] text-purple-400 font-semibold uppercase">Accepted Synonyms Used:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(activeExamQuestion.geminiSemanticMatrix.acceptedSynonyms).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 bg-purple-950/80 rounded border border-purple-800/50 text-purple-300 font-mono">
                              {k} ↔ {v[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Zero deductions were applied for phrasing variations or intuitive conceptual analogies.
                  </p>
                </div>

              </div>

              {/* Rubric Concepts Checked */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Concepts & Rubric Marking Verification</span>
                </h3>

                <div className="space-y-3">
                  {activeQuestion.conceptMatches.map((c, idx) => (
                    <div key={idx} className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-100 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            c.status === 'Full' ? 'bg-emerald-400' : c.status === 'Partial' ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          <span>{c.concept}</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{c.awardedMarks} / {c.weightMarks} Marks ({c.status})
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        {c.explanation}
                      </p>

                      {c.matchedStudentPhrases && c.matchedStudentPhrases.length > 0 && (
                        <div className="text-[11px] text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
                          <strong>Matched from your paper:</strong> "{c.matchedStudentPhrases.join(', ')}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constructive Feedback */}
                <div className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl space-y-1.5 text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Personalized Feedback & Growth Notes</span>
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {activeQuestion.feedback}
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: Radar & Learning Insights */}
      {studentTab === 'radar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Competency Radar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Cognitive Competency Radar Map</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Your performance across core computer science dimensions compared to class averages.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="skill" stroke="#a1a1aa" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#52525b" fontSize={10} />
                    <Radar
                      name={`${user?.name || 'Aarav Sharma'} (My Score)`}
                      dataKey="studentScore"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Class Cohort Average"
                      dataKey="cohortAverage"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.2}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '10px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Diagnostic Cards */}
            <div className="space-y-3">
              {radarData.map((item, idx) => (
                <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-100">{item.skill}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{item.studentScore}% (Cohort: {item.cohortAverage}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${item.studentScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: Re-Evaluation Appeals Center */}
      {studentTab === 'appeals' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span>Re-Evaluation Appeal & Remarking Center</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Track and submit re-evaluation tickets for instructor review.
              </p>
            </div>

            <button
              id="btn-open-appeal-ticket-cta"
              onClick={onOpenAppealModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-md flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>+ Submit New Appeal Request</span>
            </button>
          </div>

          {/* Active Appeal Tickets */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    APP-101
                  </span>
                  <span className="text-xs font-bold text-white">CS-301: Question 2 Sobel Matrix Calculation</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending Instructor Review</span>
                </span>
              </div>

              <p className="text-xs text-zinc-300">
                "Included both Sobel and Prewitt kernel matrix calculations in the appendix margin which were split during initial OCR block segmenting."
              </p>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-900">
                <span>Submitted: Today at 10:38 AM</span>
                <span>Assigned to: Prof. Ananya Sen</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Explanatory Guide Modal */}
      <HowItWorksGuide
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

    </div>
  );
};
