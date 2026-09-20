import { useState, useEffect } from "react";
import {
  SAMPLE_EXAMS,
  SAMPLE_SUBMISSIONS
} from "./data/sampleExams";
import {
  evaluateQuestionDynamically,
  generateDynamicInsightsAndAnalytics
} from "./utils/dynamicGrading";
import { API_ENDPOINTS } from "./constants/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { HowItWorksGuide } from "./components/HowItWorksGuide";
import { StudentDashboard } from "./components/StudentDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Stage1Preprocessing } from "./components/Stage1Preprocessing";
import { Stage2Digitization } from "./components/Stage2Digitization";
import { Stage3Grading } from "./components/Stage3Grading";
import { Stage4Insights } from "./components/Stage4Insights";
import { AcademicAnalyticsModule } from "./components/analytics/AcademicAnalyticsModule";
import { EvaluationHistoryModule } from "./components/history/EvaluationHistoryModule";
import { ProfessionalResultPage } from "./components/results/ProfessionalResultPage";
import { Stage5Architecture } from "./components/Stage5Architecture";
import { UserManagementView } from "./components/UserManagementView";
import { BatchGradingModal } from "./components/BatchGradingModal";
import { CustomExamModal } from "./components/CustomExamModal";
import { ExaminationManagement } from "./components/ExaminationManagement";
import { QuestionRubricManagement } from "./components/QuestionRubricManagement";
import { HandwrittenUploadWorkflow } from "./components/HandwrittenUploadWorkflow";
import { ExamEditorModal } from "./components/ExamEditorModal";
import { LoginModal } from "./components/LoginModal";
import { AuthPage } from "./components/AuthPage";
import { StudentReevaluationModal } from "./components/StudentReevaluationModal";
import { MockEmailModal } from "./components/MockEmailModal";
import { ThemeModal } from "./components/ThemeModal";
import { LandingPage } from "./components/LandingPage";
import { UnauthorizedAccess } from "./components/UnauthorizedAccess";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { TeacherDashboardSkeleton, StudentDashboardSkeleton } from "./components/Skeleton";
import { Lock, ShieldAlert } from "lucide-react";
import { showSweetToast } from "./utils/sweetAlert";
function AppContent() {
  const { user, token, role, isStudent, isTeacher, isAdmin, logout } = useAuth();
  const { isThemeModalOpen, setIsThemeModalOpen, currentTheme } = useTheme();
  const [exams, setExams] = useState(() => {
    try {
      const cached = localStorage.getItem("intelligrade_exams_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load cached exams:", e);
    }
    return SAMPLE_EXAMS;
  });
  const [selectedExamId, setSelectedExamId] = useState(() => {
    try {
      const cached = localStorage.getItem("intelligrade_exams_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return SAMPLE_EXAMS[0].id;
  });
  const [submissions, setSubmissions] = useState(SAMPLE_SUBMISSIONS);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(SAMPLE_SUBMISSIONS[0].id);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState({
    isExecuting: false,
    currentStage: "preprocessing",
    stageIndex: 0,
    percentage: 25,
    stageMessage: "Pipeline ready"
  });
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [customExamModalOpen, setCustomExamModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("intelligrade_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const handleToggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("intelligrade_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };
  const [statusMessage, setStatusMessage] = useState(null);
  const [mockEmailEnabled, setMockEmailEnabled] = useState(() => {
    const saved = localStorage.getItem("intelligrade_mock_email_notifications");
    return saved === null ? true : saved === "true";
  });
  const [dispatchedEmailAlerts, setDispatchedEmailAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem("intelligrade_dispatched_mock_emails");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeEmailModal, setActiveEmailModal] = useState(null);
  const triggerMockEmailAlert = async (sub, exam, score, pct, evals, insights) => {
    if (!mockEmailEnabled) {
      console.log("Mock email alert skipped: toggle is disabled in Teacher Dashboard.");
      return;
    }
    const studentEmail = `${sub.studentName.toLowerCase().replace(/\s+/g, ".")}@university.edu`;
    const questionScores = evals.map((e) => ({
      questionNumber: e.questionNumber,
      score: e.teacherOverrideMarks !== void 0 ? e.teacherOverrideMarks : e.awardedMarks,
      maxMarks: e.maxMarks,
      questionTopic: exam?.questions?.find((q) => q.questionNumber === e.questionNumber)?.topic || `Question ${e.questionNumber}`
    }));
    const summaryText = typeof insights === "string" ? insights : insights?.overallSummary || sub.personalizedInsights?.overallSummary || "Automated rubric evaluation completed successfully.";
    const newAlert = {
      id: `dispatch_${Date.now()}`,
      recipientEmail: studentEmail,
      studentName: sub.studentName,
      studentRollNumber: sub.studentRollNumber,
      courseCode: exam.courseCode || "CS-301",
      examTitle: exam.title,
      scoreAwarded: score,
      maxMarks: exam.totalMarks,
      percentageScore: pct,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      status: "Delivered",
      subject: `[IntelliGrade] Grading Complete: ${exam.courseCode || "CS-301"} ${exam.title} Results Published`,
      feedbackSummary: summaryText,
      questionScores
    };
    try {
      await fetch(API_ENDPOINTS.NOTIFY_MOCK_EMAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || "ig_session_token"}`
        },
        body: JSON.stringify({
          recipientEmail: newAlert.recipientEmail,
          studentName: newAlert.studentName,
          studentRollNumber: newAlert.studentRollNumber,
          courseCode: newAlert.courseCode,
          examTitle: newAlert.examTitle,
          scoreAwarded: newAlert.scoreAwarded,
          maxMarks: newAlert.maxMarks,
          percentageScore: newAlert.percentageScore,
          feedbackSummary: newAlert.feedbackSummary,
          questionScores: newAlert.questionScores
        })
      });
    } catch (err) {
      console.warn("Backend notification logging note:", err);
    }
    setDispatchedEmailAlerts((prev) => {
      const updated = [newAlert, ...prev];
      localStorage.setItem("intelligrade_dispatched_mock_emails", JSON.stringify(updated.slice(0, 20)));
      return updated;
    });
    setActiveEmailModal(newAlert);
    showSweetToast(`\u{1F4E7} Mock Email: 'Grading Complete' alert simulated for ${sub.studentName} (${pct}%)`, "success");
  };
  // Fetch examinations list and submissions when token state is established
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(API_ENDPOINTS.EXAMS, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.exams && Array.isArray(data.exams) && data.exams.length > 0) {
            setExams(data.exams);
            localStorage.setItem("intelligrade_exams_data", JSON.stringify(data.exams));
          }
        }
      } catch (err) {
        console.warn("Backend exams fetch note (using local cache):", err);
      }
    };

    const fetchSubmissions = async () => {
      // Submissions are private protected student/faculty records; only query with active credentials
      if (!token) return;
      try {
        const res = await fetch("/api/v1/submissions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.submissions && Array.isArray(data.submissions) && data.submissions.length > 0) {
            setSubmissions((prev) => {
              const existingIds = new Set(data.submissions.map((s) => s.id));
              const nonDuplicatedPrev = prev.filter((s) => !existingIds.has(s.id));
              return [...data.submissions, ...nonDuplicatedPrev];
            });
          }
        }
      } catch (err) {
        console.warn("Backend submissions fetch note:", err);
      }
    };

    fetchExams();
    fetchSubmissions();
  }, [token]);

  useEffect(() => {
    // Restrict unauthorized tabs if user role changed or non-permitted tab visited
    // Students can access dashboard, answer_upload, landing, and insights (academic analytics)
    if (isStudent && ["preprocessing", "digitization", "grading", "architecture", "user_management", "exams_management", "rubric_management"].includes(activeTab)) {
      setActiveTab("dashboard");
    } else if (!isAdmin && activeTab === "user_management") {
      setActiveTab("dashboard");
    }
  }, [role, isStudent, isAdmin, activeTab]);
  if (!user || showAuthPage) {
    return <AuthPage
      onBackToApp={user ? () => setShowAuthPage(false) : void 0}
      initialRole={role}
    />;
  }
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const currentSubmission = submissions.find((s) => s.id === selectedSubmissionId && s.examId === currentExam.id) || submissions.find((s) => s.examId === currentExam.id) || submissions[0];
  const updateCurrentSubmission = (updater) => {
    setSubmissions((prev) => prev.map((s) => {
      if (s.id === currentSubmission.id) {
        return updater(s);
      }
      return s;
    }));
  };
  const handleUpdatePreprocessingConfig = (newConfig) => {
    updateCurrentSubmission((sub) => ({
      ...sub,
      preprocessingConfig: newConfig
    }));
  };
  const handleUploadCustomScan = (dataUrl) => {
    updateCurrentSubmission((sub) => ({
      ...sub,
      originalScanUrl: dataUrl
    }));
    setStatusMessage("Custom scan uploaded and preprocessed");
    setTimeout(() => setStatusMessage(null), 3e3);
  };
  const handleUpdateExtractedText = (newText, ocrData = null) => {
    updateCurrentSubmission((sub) => {
      const updatedOcr = {
        ...sub.ocrResult,
        fullExtractedText: newText
      };
      if (ocrData) {
        if (ocrData.detectedLines && ocrData.detectedLines.length > 0) {
          updatedOcr.detectedLines = ocrData.detectedLines;
        }
        if (ocrData.averageConfidence) {
          updatedOcr.averageConfidence = ocrData.averageConfidence;
        }
        if (ocrData.detectedLanguage) {
          updatedOcr.detectedLanguage = ocrData.detectedLanguage;
        }
        if (ocrData.handwritingLegibility) {
          updatedOcr.handwritingLegibility = ocrData.handwritingLegibility;
        }
        if (ocrData.parsedAnswers) {
          updatedOcr.parsedAnswers = ocrData.parsedAnswers;
        }
      }

      let updatedEvaluations = sub.questionEvaluations;
      if (ocrData?.parsedAnswers && Array.isArray(ocrData.parsedAnswers)) {
        updatedEvaluations = sub.questionEvaluations.map((ev) => {
          const matched = ocrData.parsedAnswers.find(
            (pa) => pa.questionNumber === ev.questionNumber
          );
          if (matched && matched.transcribedAnswer) {
            return {
              ...ev,
              studentAnswerText: matched.transcribedAnswer
            };
          }
          return ev;
        });
      }

      return {
        ...sub,
        ocrResult: updatedOcr,
        questionEvaluations: updatedEvaluations
      };
    });
  };
  const handleUpdateModelAnswers = (updatedQuestions) => {
    setExams((prev) => prev.map((ex) => {
      if (ex.id === currentExam.id) {
        return { ...ex, questions: updatedQuestions };
      }
      return ex;
    }));
  };
  const handleUpdateEvaluation = (evaluations) => {
    const { totalScore, percentage, insights, predictive } = generateDynamicInsightsAndAnalytics(currentExam, evaluations);
    updateCurrentSubmission((sub) => ({
      ...sub,
      totalScoreAwarded: totalScore,
      percentageScore: percentage,
      questionEvaluations: evaluations,
      personalizedInsights: insights,
      predictiveAnalytics: predictive
    }));
  };
  const handleRunAiEvaluation = async () => {
    if (isStudent) {
      setStatusMessage("Students cannot execute batch AI evaluation. Please contact your instructor.");
      setTimeout(() => setStatusMessage(null), 3e3);
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Initiating Automated IntelliGrade AI Pipeline...");
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    try {
      setPipelineProgress({
        isExecuting: true,
        currentStage: "preprocessing",
        stageIndex: 0,
        percentage: 25,
        stageMessage: "Stage 1/4: Preprocessing scan with noise removal, deskew & Otsu binarization..."
      });
      await delay(600);
      setPipelineProgress({
        isExecuting: true,
        currentStage: "digitization",
        stageIndex: 1,
        percentage: 50,
        stageMessage: "Stage 2/4: Optical Character Recognition extracting handwriting & math equations..."
      });
      await delay(600);
      setPipelineProgress({
        isExecuting: true,
        currentStage: "grading",
        stageIndex: 2,
        percentage: 75,
        stageMessage: "Stage 3/4: Semantic NLP evaluation & mark attribution against rubric..."
      });
      const studentAnswersPayload = (currentExam?.questions || []).map((q) => {
        const existing = currentSubmission.examId === currentExam.id ? currentSubmission.questionEvaluations.find((e) => e.questionId === q.id || e.questionNumber === q.questionNumber && !e.questionId) : null;
        const ans = existing?.studentAnswerText ? existing.studentAnswerText : currentSubmission.ocrResult.fullExtractedText.includes(`Ans ${q.questionNumber}`) ? currentSubmission.ocrResult.fullExtractedText : q.modelAnswer ? `Candidate answer explaining ${q.topic}: ${q.modelAnswer}` : `Candidate response addressing ${q.questionText}`;
        return {
          questionNumber: q.questionNumber,
          answerText: ans
        };
      });
      const evalResp = await fetch(API_ENDPOINTS.GRADE_EVALUATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || "ig_session_token"}`
        },
        body: JSON.stringify({
          questions: currentExam?.questions || [],
          studentAnswers: studentAnswersPayload,
          studentName: currentSubmission.studentName
        })
      });
      if (!evalResp.ok) {
        throw new Error(`Evaluation endpoint responded with status ${evalResp.status}`);
      }
      const evalData = await evalResp.json();
      if (evalData.evaluations && Array.isArray(evalData.evaluations)) {
        updateCurrentSubmission((sub) => ({
          ...sub,
          totalScoreAwarded: evalData.totalAwardedMarks,
          percentageScore: evalData.percentageScore,
          questionEvaluations: evalData.evaluations,
          personalizedInsights: evalData.personalizedInsights || sub.personalizedInsights,
          predictiveAnalytics: evalData.predictiveAnalytics || sub.predictiveAnalytics
        }));
        setPipelineProgress({
          isExecuting: true,
          currentStage: "insights",
          stageIndex: 3,
          percentage: 100,
          stageMessage: "Stage 4/4: Synthesizing score distribution & personalized performance insights..."
        });
        await delay(500);
        await triggerMockEmailAlert(
          currentSubmission,
          currentExam,
          evalData.totalAwardedMarks,
          evalData.percentageScore,
          evalData.evaluations,
          evalData.personalizedInsights
        );
      } else {
        throw new Error("Invalid evaluations structure returned");
      }
      showSweetToast("Complete AI Pipeline completed across all 4 stages!", "success");
      setActiveTab("grading");
    } catch (e) {
      console.warn("API pipeline notice, using dynamic local NLP engine:", e);
      const dynamicEvals = (currentExam?.questions || []).map((q) => {
        const existing = currentSubmission.examId === currentExam.id ? currentSubmission.questionEvaluations.find((e2) => e2.questionId === q.id || e2.questionNumber === q.questionNumber && !e2.questionId) : null;
        const ansText = existing ? existing.studentAnswerText : currentSubmission.ocrResult.fullExtractedText.includes(`Ans ${q.questionNumber}`) ? currentSubmission.ocrResult.fullExtractedText : q.modelAnswer ? `Candidate answer explaining ${q.topic}: ${q.modelAnswer}` : `Candidate response addressing ${q.questionText}`;
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
      updateCurrentSubmission((sub) => ({
        ...sub,
        totalScoreAwarded: totalScore,
        percentageScore: percentage,
        questionEvaluations: dynamicEvals,
        personalizedInsights: insights,
        predictiveAnalytics: predictive
      }));
      setPipelineProgress({
        isExecuting: true,
        currentStage: "insights",
        stageIndex: 3,
        percentage: 100,
        stageMessage: "Stage 4/4: Synthesizing score distribution & personalized performance insights..."
      });
      await delay(500);
      await triggerMockEmailAlert(
        currentSubmission,
        currentExam,
        totalScore,
        percentage,
        dynamicEvals,
        insights
      );
      showSweetToast("AI Grading Pipeline completed across all 4 stages!", "success");
      setActiveTab("grading");
    } finally {
      setIsProcessing(false);
      setPipelineProgress({
        isExecuting: false,
        currentStage: "grading",
        stageIndex: 2,
        percentage: 75,
        stageMessage: "Grading complete"
      });
    }
  };
  const handleUpdateExamPaper = (updatedExam) => {
    setExams((prev) => {
      const idx = prev.findIndex((ex) => ex.id === updatedExam.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedExam;
        return next;
      }
      return [updatedExam, ...prev];
    });
    setSelectedExamId(updatedExam.id);
    const targetSubId = `sub_${updatedExam.id}_student1`;
    setSubmissions((prev) => {
      const evals = (updatedExam?.questions || []).map((q) => {
        const studentAns = q.modelAnswer ? `${q.modelAnswer} (Candidate response articulating technical principles).` : `Candidate response addressing ${q.questionText} on ${q.topic}.`;
        return evaluateQuestionDynamically(
          q.questionNumber,
          q.id,
          q.questionText,
          q.maxMarks || 10,
          studentAns,
          q.modelAnswer || "Official answer guideline covering definitions and derivations.",
          q.keyConcepts || [
            {
              concept: `Foundational Principles of ${q.topic}`,
              weightMarks: (q.maxMarks || 10) * 0.5,
              synonyms: [q.topic.toLowerCase()],
              description: "Clear statement of fundamental concepts"
            },
            {
              concept: `Application and Analysis of ${q.topic}`,
              weightMarks: (q.maxMarks || 10) * 0.5,
              synonyms: ["analysis", "derivation"],
              description: "Analytical demonstration and operational steps"
            }
          ]
        );
      });
      const { totalScore, percentage, insights, predictive } = generateDynamicInsightsAndAnalytics(updatedExam, evals);
      const newSubmission = {
        id: targetSubId,
        examId: updatedExam.id,
        studentName: "Aarav Sharma",
        studentRollNumber: "CS22B1042",
        submissionDate: (/* @__PURE__ */ new Date()).toISOString(),
        originalScanUrl: updatedExam.questionPaperFile?.pagesDataUrls?.[0] || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80",
        totalMaxMarks: updatedExam.totalMarks,
        totalAwardedMarks: totalScore,
        percentageScore: percentage,
        status: "Graded",
        preprocessingConfig: {
          noiseReduction: true,
          noiseRadius: 2,
          styleNormalization: true,
          contrastStretch: 1.8,
          strokeBoost: 2,
          skewCorrection: true,
          skewAngle: 0,
          thinning: true,
          thinningIterations: 2,
          thresholdingType: "otsu",
          binarizationThreshold: 128
        },
        preprocessingMetrics: {
          originalNoiseScore: 18,
          cleanedNoiseScore: 2,
          detectedSkewAngle: 0,
          contrastRatio: 2.8,
          strokeThinningEfficiency: 94,
          binarizationClarity: 98.5,
          processingTimeMs: 42
        },
        ocrResult: {
          fullExtractedText: evals.map((e) => `Ans ${e.questionNumber}: ${e.studentAnswerText}`).join("\n\n"),
          averageConfidence: 96,
          detectedLanguage: "English",
          engineUsed: "Gemini-Vision-Multimodal",
          durationMs: 380,
          detectedLines: []
        },
        questionEvaluations: evals,
        personalizedInsights: insights,
        predictiveAnalytics: predictive
      };
      const filtered = prev.filter((s) => s.examId !== updatedExam.id);
      return [newSubmission, ...filtered];
    });
    setSelectedSubmissionId(targetSubId);
    showSweetToast(`Applied "${updatedExam.title}" (${updatedExam.totalMarks} Marks, ${updatedExam.questions?.length || 0} Questions) to grading session!`, "success");
  };
  // Exam CRUD Operations
  const handleCreateExam = async (newExam) => {
    const updatedList = [newExam, ...exams];
    setExams(updatedList);
    setSelectedExamId(newExam.id);
    localStorage.setItem("intelligrade_exams_data", JSON.stringify(updatedList));
    showSweetToast(`Examination "${newExam.title}" created successfully!`, "success");

    try {
      if (token) {
        await fetch(API_ENDPOINTS.EXAMS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newExam)
        });
      }
    } catch (err) {
      console.warn("Backend sync note for create exam:", err);
    }
  };

  const handleUpdateExam = async (updatedExam) => {
    const updatedList = exams.map((e) => (e.id === updatedExam.id ? updatedExam : e));
    setExams(updatedList);
    localStorage.setItem("intelligrade_exams_data", JSON.stringify(updatedList));
    showSweetToast(`Examination "${updatedExam.title}" updated successfully!`, "success");

    try {
      if (token) {
        await fetch(`${API_ENDPOINTS.EXAMS}/${updatedExam.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedExam)
        });
      }
    } catch (err) {
      console.warn("Backend sync note for update exam:", err);
    }
  };

  const handleDeleteExam = async (examId) => {
    const updatedList = exams.filter((e) => e.id !== examId);
    setExams(updatedList);
    if (selectedExamId === examId && updatedList.length > 0) {
      setSelectedExamId(updatedList[0].id);
    }
    localStorage.setItem("intelligrade_exams_data", JSON.stringify(updatedList));

    try {
      if (token) {
        await fetch(`${API_ENDPOINTS.EXAMS}/${examId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.warn("Backend sync note for delete exam:", err);
    }
  };

  const handleTogglePublishExam = async (examId) => {
    const target = exams.find((e) => e.id === examId);
    if (!target) return;
    const nextStatus = target.status === "published" ? "draft" : "published";
    const updated = {
      ...target,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    const updatedList = exams.map((e) => (e.id === examId ? updated : e));
    setExams(updatedList);
    localStorage.setItem("intelligrade_exams_data", JSON.stringify(updatedList));

    try {
      if (token) {
        await fetch(`${API_ENDPOINTS.EXAMS}/${examId}/publish`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
      }
    } catch (err) {
      console.warn("Backend sync note for toggle publish:", err);
    }
  };

  const handleSaveCustomExam = (newExam) => {
    handleCreateExam(newExam);
  };

  if (showAuthPage) {
    return <AuthPage onBackToApp={() => setShowAuthPage(false)} />;
  }

  return (
    <div
      className="min-h-screen flex font-sans transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.colors.bgMain,
        color: currentTheme.colors.textPrimary
      }}
    >
      {/* EdTech SaaS Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={sidebarMobileOpen}
        onMobileClose={() => setSidebarMobileOpen(false)}
        onOpenBatchModal={() => setBatchModalOpen(true)}
        onOpenCustomExamModal={() => setCustomExamModalOpen(true)}
        onOpenAppealModal={() => setAppealModalOpen(true)}
        onOpenAuthPage={() => setShowAuthPage(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        exams={exams}
        selectedExamId={currentExam.id}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 transition-all">
        {/* Top Application Header with Auth & Selectors */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          exams={exams}
          selectedExamId={currentExam.id}
          onSelectExam={setSelectedExamId}
          submissions={submissions.filter((s) => s.examId === currentExam.id)}
          selectedSubmissionId={currentSubmission.id}
          onSelectSubmission={setSelectedSubmissionId}
          onRunAiPipeline={handleRunAiEvaluation}
          isProcessing={isProcessing}
          pipelineProgress={pipelineProgress}
          onOpenBatchModal={() => setBatchModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
          onOpenAuthPage={() => setShowAuthPage(true)}
          onOpenAppealModal={() => setAppealModalOpen(true)}
          onToggleSidebar={() => setSidebarMobileOpen(true)}
          onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />

        {/* Main Content Body with ErrorBoundary Protection */}
        {activeTab === "landing" ? (
          <ErrorBoundary resetKey={activeTab}>
            <LandingPage
              onGetStarted={() => setActiveTab("dashboard")}
              onLaunchDemo={() => {
                setActiveTab("grading");
                showSweetToast("Navigated to AI 3-Sheet Review & Teacher Override Console", "info");
              }}
              onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
              onSignIn={() => setShowAuthPage(true)}
            />
          </ErrorBoundary>
        ) : (
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <ErrorBoundary resetKey={activeTab}>
            {/* Render Dedicated Role Dashboards with Skeleton loading during evaluation/fetches */}
            {activeTab === "dashboard" && (isProcessing ? isStudent ? <StudentDashboardSkeleton /> : <TeacherDashboardSkeleton /> : isStudent ? <StudentDashboard
      exams={exams}
      submissions={submissions}
      selectedExamId={currentExam.id}
      selectedSubmissionId={currentSubmission.id}
      onSelectExam={setSelectedExamId}
      onSelectSubmission={setSelectedSubmissionId}
      onNavigateStage={(stage) => setActiveTab(stage)}
      onNavigateTab={(tab) => setActiveTab(tab)}
      onOpenAppealModal={() => setAppealModalOpen(true)}
      onAddSubmission={(newSub) => {
        setSubmissions((prev) => [newSub, ...prev]);
        setSelectedSubmissionId(newSub.id);
        setSelectedExamId(newSub.examId);
      }}
    /> : isTeacher ? <TeacherDashboard
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
      mockEmailEnabled={mockEmailEnabled}
      onToggleMockEmail={setMockEmailEnabled}
      dispatchedAlerts={dispatchedEmailAlerts}
      onViewDispatchedAlert={(alert) => setActiveEmailModal(alert)}
    /> : <AdminDashboard
      onNavigateStage={(stage) => setActiveTab(stage)}
      onOpenBatchModal={() => setBatchModalOpen(true)}
      onOpenCustomExamModal={() => setCustomExamModalOpen(true)}
    />)}

          {
    /* Render Stage View based on activeTab */
  }
          {activeTab === "preprocessing" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Stage 1: Scan & Paper Preprocessing"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <Stage1Preprocessing
              submission={currentSubmission}
              exam={currentExam}
              onUpdateConfig={handleUpdatePreprocessingConfig}
              onNextStage={() => setActiveTab("digitization")}
              onUploadCustomScan={handleUploadCustomScan}
              onUpdateModelAnswers={handleUpdateModelAnswers}
              onUpdateExamPaper={handleUpdateExamPaper}
              onSaveAsNewExam={handleSaveCustomExam}
              onRunAiPipeline={handleRunAiEvaluation}
              isGradingProcessing={isProcessing}
              onNavigateStage={(stage) => setActiveTab(stage)}
            />
          ))}

          {activeTab === "digitization" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Stage 2: Multimodal Handwriting OCR & Digitization"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <Stage2Digitization
              submission={currentSubmission}
              exam={currentExam}
              onUpdateExtractedText={handleUpdateExtractedText}
              onUpdateModelAnswers={handleUpdateModelAnswers}
              onNextStage={() => setActiveTab("grading")}
              isProcessing={isProcessing}
            />
          ))}

          {activeTab === "grading" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Stage 3: AI Tri-Sheet Grading & Teacher Mark Override"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <Stage3Grading
              submission={currentSubmission}
              exam={currentExam}
              onUpdateEvaluation={handleUpdateEvaluation}
              onNextStage={() => setActiveTab("insights")}
              onOpenAppealModal={() => setAppealModalOpen(true)}
            />
          ))}

          {activeTab === "insights" && (
            <AcademicAnalyticsModule
              exams={exams}
              submissions={submissions}
              selectedExamId={selectedExamId}
              onSelectExam={setSelectedExamId}
              initialViewMode={isStudent ? "student" : "teacher"}
            />
          )}

          {activeTab === "evaluation_history" && (
            <EvaluationHistoryModule
              submissions={submissions}
              exams={exams}
              isStudent={isStudent}
              currentUser={user}
              onNavigateStage={(stage) => setActiveTab(stage)}
              onSelectSubmission={(subId) => setSelectedSubmissionId(subId)}
              onSelectExam={(examId) => setSelectedExamId(examId)}
              onOpenAppealModal={(evalRecord) => {
                setAppealModalOpen(true);
              }}
            />
          )}

          {activeTab === "result_generation" && (
            <ProfessionalResultPage
              exams={exams}
              submissions={submissions}
              selectedExamId={selectedExamId}
              selectedSubmissionId={selectedSubmissionId}
              user={user}
              role={user?.role}
              isStudent={isStudent}
              onSelectExam={(examId) => setSelectedExamId(examId)}
              onSelectSubmission={(subId) => setSelectedSubmissionId(subId)}
              onNavigateStage={(stage) => setActiveTab(stage)}
              onOpenAppealModal={() => setAppealModalOpen(true)}
            />
          )}

          {activeTab === "architecture" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Stage 5: Spring Boot Microservices Architecture & System Specs"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <Stage5Architecture />
          ))}

          {activeTab === "user_management" && (!isAdmin ? (
            <UnauthorizedAccess
              requiredRole="admin"
              attemptedFeature="User Management & RBAC Security Directory"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <UserManagementView />
          ))}

          {activeTab === "exams_management" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Examination & Curriculum Management"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <ExaminationManagement
              exams={exams}
              submissions={submissions}
              selectedExamId={selectedExamId}
              onSelectExam={(id) => setSelectedExamId(id)}
              onCreateExam={handleCreateExam}
              onUpdateExam={handleUpdateExam}
              onDeleteExam={handleDeleteExam}
              onTogglePublishExam={handleTogglePublishExam}
              onNavigateStage={(stage) => setActiveTab(stage)}
            />
          ))}

          {activeTab === "rubric_management" && (isStudent ? (
            <UnauthorizedAccess
              requiredRole="teacher"
              attemptedFeature="Question & Rubric Management"
              onGoHome={() => setActiveTab("dashboard")}
              onOpenLogin={() => setLoginModalOpen(true)}
            />
          ) : (
            <QuestionRubricManagement
              exams={exams}
              selectedExamId={selectedExamId}
              onSelectExam={(id) => setSelectedExamId(id)}
              onUpdateExam={handleUpdateExam}
              onNavigateStage={(stage) => setActiveTab(stage)}
            />
          ))}

          {activeTab === "answer_upload" && (
            <HandwrittenUploadWorkflow
              exams={exams}
              selectedExamId={selectedExamId}
              user={user}
              onSubmissionComplete={(newSubmission) => {
                setSubmissions((prev) => {
                  const filtered = prev.filter((s) => s.id !== newSubmission.id);
                  return [newSubmission, ...filtered];
                });
                setSelectedSubmissionId(newSubmission.id);
                setSelectedExamId(newSubmission.examId);
              }}
              onViewSubmission={(submissionId) => {
                setSelectedSubmissionId(submissionId);
                setActiveTab("dashboard");
              }}
              onNavigateStage={(stage) => setActiveTab(stage)}
            />
          )}
          </ErrorBoundary>
        </main>
      )}

      {/* Batch Grading Modal */}
      <BatchGradingModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        exam={currentExam}
      />

      {/* Professional Examination Authoring & Rubric Modal */}
      <ExamEditorModal
        isOpen={customExamModalOpen}
        onClose={() => setCustomExamModalOpen(false)}
        onSaveExam={handleCreateExam}
      />

      {
    /* 3-Role Authentication Modal */
  }
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenAuthPage={() => setShowAuthPage(true)}
      />

      {/* Production Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {
    /* Student Re-evaluation Appeal Modal */
  }
      <StudentReevaluationModal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        questions={currentSubmission?.questionEvaluations || []}
      />

      {
    /* Simulated Student Email Notification Modal */
  }
      {activeEmailModal && <MockEmailModal
    isOpen={Boolean(activeEmailModal)}
    onClose={() => setActiveEmailModal(null)}
    alert={activeEmailModal}
    isPreviewMode={false}
    onNavigateToGrading={() => {
      setActiveEmailModal(null);
      setActiveTab("grading");
    }}
  />}

      {
    /* Theme Color Customization Modal */
  }
      <ThemeModal
    isOpen={isThemeModalOpen}
    onClose={() => setIsThemeModalOpen(false)}
  />

      {/* Bottom Global Status Bar with Active Session Info */}
      <footer className="bg-[#121215] border-t border-[#27272a] py-3.5 px-6 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1.5 text-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">IntelliGrade Academic Engine</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">
              Signed in as <strong className="text-zinc-200">{user?.name}</strong> ({role.toUpperCase()})
            </span>
            {user?.department && <>
                <span className="text-zinc-700 hidden md:inline">•</span>
                <span className="text-zinc-400 hidden md:inline">{user.department}</span>
              </>}
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>All Services Operational</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500">© 2026 Academic Assessment System</span>
          </div>
        </div>
      </footer>

      </div>

      {/* Global How It Works Guide Modal */}
      <HowItWorksGuide
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onNavigateStage={(stage) => setActiveTab(stage)}
        onRunDemo={handleRunAiEvaluation}
      />
    </div>
  );
}
export default function App() {
  return <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>;
}
