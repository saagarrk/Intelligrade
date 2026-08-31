import React, { useState, useEffect } from 'react';
import { 
  SAMPLE_EXAMS, 
  SAMPLE_SUBMISSIONS 
} from './data/sampleExams';
import { 
  ExamPaper, 
  StudentSubmission, 
  PreprocessingConfig, 
  QuestionEvaluation, 
  QuestionItem,
  PipelineStage
} from './types';
import { 
  evaluateQuestionDynamically, 
  generateDynamicInsightsAndAnalytics 
} from './utils/dynamicGrading';
import { API_ENDPOINTS } from './constants/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Stage1Preprocessing } from './components/Stage1Preprocessing';
import { Stage2Digitization } from './components/Stage2Digitization';
import { Stage3Grading } from './components/Stage3Grading';
import { Stage4Insights } from './components/Stage4Insights';
import { Stage5Architecture } from './components/Stage5Architecture';
import { UserManagementView } from './components/UserManagementView';
import { BatchGradingModal } from './components/BatchGradingModal';
import { CustomExamModal } from './components/CustomExamModal';
import { LoginModal } from './components/LoginModal';
import { StudentReevaluationModal } from './components/StudentReevaluationModal';
import { Lock, ShieldAlert, GraduationCap, ArrowRight } from 'lucide-react';

function AppContent() {
  const { user, role, isStudent, isTeacher, isAdmin } = useAuth();
  const [exams, setExams] = useState<ExamPaper[]>(SAMPLE_EXAMS);
  const [selectedExamId, setSelectedExamId] = useState<string>(SAMPLE_EXAMS[0].id);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(SAMPLE_SUBMISSIONS);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(SAMPLE_SUBMISSIONS[0].id);
  
  const [activeTab, setActiveTab] = useState<PipelineStage>('dashboard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchModalOpen, setBatchModalOpen] = useState<boolean>(false);
  const [customExamModalOpen, setCustomExamModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [appealModalOpen, setAppealModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Automatically sync activeTab to 'dashboard' when switching roles to show the dedicated dashboard
  useEffect(() => {
    setActiveTab('dashboard');
  }, [role]);

  // If a student somehow attempts to access an unauthorized teacher/admin stage, redirect to dashboard
  useEffect(() => {
    if (isStudent && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [isStudent, activeTab]);

  // Active exam & submission
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const currentSubmission = submissions.find(s => s.id === selectedSubmissionId && s.examId === currentExam.id) 
    || submissions.find(s => s.examId === currentExam.id) 
    || submissions[0];

  // Helper to update current submission state
  const updateCurrentSubmission = (updater: (prev: StudentSubmission) => StudentSubmission) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === currentSubmission.id) {
        return updater(s);
      }
      return s;
    }));
  };

  const handleUpdatePreprocessingConfig = (newConfig: PreprocessingConfig) => {
    updateCurrentSubmission(sub => ({
      ...sub,
      preprocessingConfig: newConfig
    }));
  };

  const handleUploadCustomScan = (dataUrl: string) => {
    updateCurrentSubmission(sub => ({
      ...sub,
      originalScanUrl: dataUrl
    }));
    setStatusMessage('Custom scan uploaded and preprocessed');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdateExtractedText = (newText: string) => {
    updateCurrentSubmission(sub => ({
      ...sub,
      ocrResult: {
        ...sub.ocrResult,
        fullExtractedText: newText
      }
    }));
  };

  const handleUpdateModelAnswers = (updatedQuestions: QuestionItem[]) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === currentExam.id) {
        return { ...ex, questions: updatedQuestions };
      }
      return ex;
    }));
  };

  const handleUpdateEvaluation = (evaluations: QuestionEvaluation[]) => {
    const { totalScore, percentage, insights, predictive } = generateDynamicInsightsAndAnalytics(currentExam, evaluations);

    updateCurrentSubmission(sub => ({
      ...sub,
      totalScoreAwarded: totalScore,
      percentageScore: percentage,
      questionEvaluations: evaluations,
      personalizedInsights: insights,
      predictiveAnalytics: predictive
    }));
  };

  // Full AI Automated Grading Execution (invoking backend REST API with dynamic fallback)
  const handleRunAiEvaluation = async () => {
    if (isStudent) {
      setStatusMessage('Students cannot execute batch AI evaluation. Please contact your instructor.');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Initiating Automated IntelliGrade AI Pipeline...');

    try {
      // 1. Prepare student answers payload per question
      const studentAnswersPayload = currentExam.questions.map((q) => {
        const existing = currentSubmission.questionEvaluations.find(e => e.questionNumber === q.questionNumber);
        return {
          questionNumber: q.questionNumber,
          answerText: existing ? existing.studentAnswerText : currentSubmission.ocrResult.fullExtractedText
        };
      });

      // 2. Call semantic evaluation endpoint
      const evalResp = await fetch(API_ENDPOINTS.GRADE_EVALUATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: currentExam.questions,
          studentAnswers: studentAnswersPayload,
          studentName: currentSubmission.studentName
        })
      });

      if (!evalResp.ok) {
        throw new Error(`Evaluation endpoint responded with status ${evalResp.status}`);
      }

      const evalData = await evalResp.json();

      if (evalData.evaluations && Array.isArray(evalData.evaluations)) {
        updateCurrentSubmission(sub => ({
          ...sub,
          totalScoreAwarded: evalData.totalAwardedMarks,
          percentageScore: evalData.percentageScore,
          questionEvaluations: evalData.evaluations,
          personalizedInsights: evalData.personalizedInsights || sub.personalizedInsights,
          predictiveAnalytics: evalData.predictiveAnalytics || sub.predictiveAnalytics
        }));
        setStatusMessage('AI Pipeline Execution Complete. Results synchronized.');
      } else {
        throw new Error('Invalid evaluations structure returned');
      }

      setTimeout(() => setStatusMessage(null), 3500);
      setActiveTab('grading');
    } catch (e) {
      console.warn('API pipeline notice, using dynamic local NLP engine:', e);
      
      // Dynamic local NLP evaluation fallback
      const dynamicEvals = currentExam.questions.map((q) => {
        const existing = currentSubmission.questionEvaluations.find(e => e.questionNumber === q.questionNumber);
        const ansText = existing ? existing.studentAnswerText : currentSubmission.ocrResult.fullExtractedText;
        return evaluateQuestionDynamically(
          q.questionNumber,
          q.id,
          q.questionText,
          q.maxMarks,
          ansText,
          q.modelAnswer,
          q.keyConcepts
        );
      });

      const { totalScore, percentage, insights, predictive } = generateDynamicInsightsAndAnalytics(currentExam, dynamicEvals);

      updateCurrentSubmission(sub => ({
        ...sub,
        totalScoreAwarded: totalScore,
        percentageScore: percentage,
        questionEvaluations: dynamicEvals,
        personalizedInsights: insights,
        predictiveAnalytics: predictive
      }));

      setStatusMessage('Dynamic NLP Pipeline evaluation complete.');
      setTimeout(() => setStatusMessage(null), 3500);
      setActiveTab('grading');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCustomExam = (newExam: ExamPaper) => {
    setExams(prev => [newExam, ...prev]);
    setSelectedExamId(newExam.id);
    setStatusMessage(`Created new exam rubric: "${newExam.title}"`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Application Navigation with Auth & Role Switcher */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        exams={exams}
        selectedExamId={currentExam.id}
        onSelectExam={setSelectedExamId}
        submissions={submissions.filter(s => s.examId === currentExam.id)}
        selectedSubmissionId={currentSubmission.id}
        onSelectSubmission={setSelectedSubmissionId}
        onRunAiPipeline={handleRunAiEvaluation}
        isProcessing={isProcessing}
        onOpenBatchModal={() => setBatchModalOpen(true)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        onOpenAppealModal={() => setAppealModalOpen(true)}
      />

      {/* Global Status Toast Notification */}
      {statusMessage && (
        <div className="bg-indigo-600/90 text-white text-xs font-semibold px-4 py-2 text-center shadow-lg border-b border-indigo-400/30 flex items-center justify-center space-x-2 animate-fadeIn">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Render Dedicated Role Dashboards */}
        {activeTab === 'dashboard' && (
          isStudent ? (
            <StudentDashboard
              exams={exams}
              submissions={submissions}
              selectedExamId={currentExam.id}
              selectedSubmissionId={currentSubmission.id}
              onSelectExam={setSelectedExamId}
              onSelectSubmission={setSelectedSubmissionId}
              onNavigateStage={(stage) => setActiveTab(stage)}
              onOpenAppealModal={() => setAppealModalOpen(true)}
            />
          ) : isTeacher ? (
            <TeacherDashboard
              exams={exams}
              submissions={submissions}
              selectedExamId={currentExam.id}
              selectedSubmissionId={currentSubmission.id}
              onSelectExam={setSelectedExamId}
              onSelectSubmission={setSelectedSubmissionId}
              onNavigateStage={(stage) => setActiveTab(stage)}
              onOpenBatchModal={() => setBatchModalOpen(true)}
              onOpenCustomExamModal={() => setCustomExamModalOpen(true)}
              onRunAiPipeline={handleRunAiEvaluation}
              isProcessing={isProcessing}
            />
          ) : (
            <AdminDashboard
              onNavigateStage={(stage) => setActiveTab(stage)}
              onOpenBatchModal={() => setBatchModalOpen(true)}
              onOpenCustomExamModal={() => setCustomExamModalOpen(true)}
            />
          )
        )}

        {/* Render Stage View based on activeTab */}
        {activeTab === 'preprocessing' && (
          <Stage1Preprocessing
            submission={currentSubmission}
            exam={currentExam}
            onUpdateConfig={handleUpdatePreprocessingConfig}
            onNextStage={() => setActiveTab('digitization')}
            onUploadCustomScan={handleUploadCustomScan}
            onUpdateModelAnswers={handleUpdateModelAnswers}
          />
        )}

        {activeTab === 'digitization' && (
          <Stage2Digitization
            submission={currentSubmission}
            exam={currentExam}
            onUpdateExtractedText={handleUpdateExtractedText}
            onUpdateModelAnswers={handleUpdateModelAnswers}
            onNextStage={() => setActiveTab('grading')}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'grading' && (
          <Stage3Grading
            submission={currentSubmission}
            exam={currentExam}
            onUpdateEvaluation={handleUpdateEvaluation}
            onNextStage={() => setActiveTab('insights')}
            onOpenAppealModal={() => setAppealModalOpen(true)}
          />
        )}

        {activeTab === 'insights' && (
          <Stage4Insights
            submission={currentSubmission}
            exam={currentExam}
            onNextStage={() => setActiveTab(isAdmin ? 'architecture' : 'grading')}
          />
        )}

        {activeTab === 'architecture' && (
          isStudent ? (
            <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-4 max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Access Restricted: Instructor/Admin Only</h3>
              <p className="text-xs text-zinc-400">
                The Spring Boot architecture and microservices specification requires Teacher or Admin authorization.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Switch to Teacher or Admin Account
              </button>
            </div>
          ) : (
            <Stage5Architecture />
          )
        )}

        {activeTab === 'user_management' && (
          !isAdmin ? (
            <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-4 max-w-xl mx-auto my-12">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Administrator Authorization Required</h3>
              <p className="text-xs text-zinc-400">
                User management, RBAC directory, and security audit logs are restricted to Administrator credentials.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Log In as Administrator
              </button>
            </div>
          ) : (
            <UserManagementView />
          )
        )}

      </main>

      {/* Batch Grading Modal */}
      <BatchGradingModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        exam={currentExam}
      />

      {/* Custom Exam Creation Modal */}
      <CustomExamModal
        isOpen={customExamModalOpen}
        onClose={() => setCustomExamModalOpen(false)}
        onSaveExam={handleSaveCustomExam}
      />

      {/* 3-Role Authentication Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Student Re-evaluation Appeal Modal */}
      <StudentReevaluationModal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        questions={currentSubmission.questionEvaluations}
      />

      {/* Bottom Global Status Bar with Active Session Info */}
      <footer className="bg-[#18181b] border-t border-[#27272a] py-3 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1.5 text-[#fafafa]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold">IntelliGrade Automated Engine</span>
            </span>
            <span className="text-[#27272a]">•</span>
            <span className="text-slate-400">Authenticated as: <strong className="text-zinc-200">{user?.name} ({role.toUpperCase()})</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('user_management')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <span>RBAC Console</span>
                </button>
                <span className="text-[#27272a]">•</span>
              </>
            )}
            <button
              onClick={() => setCustomExamModalOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              + Create Custom Exam Rubric
            </button>
            <span className="text-[#27272a]">•</span>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Switch Account ({role})
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
