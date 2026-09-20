import React, { useState, useMemo } from "react";
import {
  ListOrdered,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Filter,
  Check,
  Zap,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { QuestionEditorModal } from "./QuestionEditorModal";
import { RubricTesterModal } from "./RubricTesterModal";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../utils/sweetAlert";
import { API_ENDPOINTS } from "../constants/theme";

export const QuestionRubricManagement = ({
  exams = [],
  selectedExamId,
  onSelectExam,
  onUpdateExam,
  onNavigateStage
}) => {
  // State: Current active exam
  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || exams[0] || null;
  }, [exams, selectedExamId]);

  // Modals state
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [testerModalOpen, setTesterModalOpen] = useState(false);
  const [testingQuestion, setTestingQuestion] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [expandedModelAnswers, setExpandedModelAnswers] = useState({});
  const [isReordering, setIsReordering] = useState(false);

  // Derived questions from active exam
  const questions = useMemo(() => {
    return currentExam?.questions || [];
  }, [currentExam]);

  // Questions filtered
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.keyConcepts?.some((c) => c.concept?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDiff =
        difficultyFilter === "all" ||
        q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesDiff;
    });
  }, [questions, searchQuery, difficultyFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalQ = questions.length;
    const totalMax = questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
    const totalCriteria = questions.reduce((sum, q) => sum + (q.keyConcepts?.length || 0), 0);
    const balancedCount = questions.filter((q) => {
      const cSum = (q.keyConcepts || []).reduce((acc, c) => acc + (Number(c.weightMarks) || 0), 0);
      return Math.abs(cSum - Number(q.maxMarks)) < 0.05;
    }).length;

    return {
      totalQ,
      totalMax,
      totalCriteria,
      balancedCount,
      allBalanced: totalQ > 0 && balancedCount === totalQ
    };
  }, [questions]);

  // Toggle model answer preview
  const toggleModelAnswer = (qId) => {
    setExpandedModelAnswers((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Helper: Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // 1. Create Question
  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setEditorModalOpen(true);
  };

  // 2. Edit Question
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setEditorModalOpen(true);
  };

  // 3. Save Question (Create or Update)
  const handleSaveQuestion = async (questionData) => {
    if (!currentExam) return;

    const isEdit = Boolean(questionData.id);
    const url = isEdit
      ? `${API_ENDPOINTS.EXAMS}/${currentExam.id}/questions/${questionData.id}`
      : `${API_ENDPOINTS.EXAMS}/${currentExam.id}/questions`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(questionData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          onUpdateExam(data.exam);
        }
        showSuccessAlert(
          isEdit ? "Question Updated" : "Question Created",
          `Question #${questionData.questionNumber || data.question?.questionNumber || ""} and rubrics saved to database.`
        );
        return;
      }

      // Fallback local update if server error
      let updatedQuestions = [...questions];
      if (isEdit) {
        updatedQuestions = updatedQuestions.map((q) =>
          q.id === questionData.id ? { ...q, ...questionData } : q
        );
      } else {
        const newQ = {
          ...questionData,
          id: `q_${Date.now()}`,
          questionNumber: updatedQuestions.length + 1
        };
        updatedQuestions.push(newQ);
      }

      const updatedExam = {
        ...currentExam,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
      };

      onUpdateExam(updatedExam);
      showSuccessAlert(
        isEdit ? "Question Updated" : "Question Created",
        "Question and criteria updated in local and active session storage."
      );
    } catch (err) {
      console.warn("Server question save error, applying local state:", err);
      let updatedQuestions = [...questions];
      if (isEdit) {
        updatedQuestions = updatedQuestions.map((q) =>
          q.id === questionData.id ? { ...q, ...questionData } : q
        );
      } else {
        const newQ = {
          ...questionData,
          id: `q_${Date.now()}`,
          questionNumber: updatedQuestions.length + 1
        };
        updatedQuestions.push(newQ);
      }

      const updatedExam = {
        ...currentExam,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
      };

      onUpdateExam(updatedExam);
      showSuccessAlert("Saved", "Question saved to session state.");
    }
  };

  // 4. Delete Question
  const handleDeleteQuestion = async (question) => {
    if (!currentExam) return;

    if (questions.length <= 1) {
      showErrorAlert("Cannot Delete", "An examination must contain at least one question.");
      return;
    }

    const confirm = await showConfirmAlert(
      "Delete Question?",
      `Are you sure you want to delete Question #${question.questionNumber}: "<strong>${question.questionText?.substring(0, 40)}...</strong>"? This will renumber the remaining questions.`,
      "Yes, Delete Question",
      "Cancel",
      "warning"
    );

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `${API_ENDPOINTS.EXAMS}/${currentExam.id}/questions/${question.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders()
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          onUpdateExam(data.exam);
        }
        showSuccessAlert("Question Deleted", "Question removed and remaining questions renumbered.");
        return;
      }

      // Fallback local update
      const filtered = questions.filter((q) => q.id !== question.id);
      const renumbered = filtered.map((q, idx) => ({
        ...q,
        questionNumber: idx + 1
      }));

      const updatedExam = {
        ...currentExam,
        questions: renumbered,
        totalMarks: renumbered.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
      };

      onUpdateExam(updatedExam);
      showSuccessAlert("Question Deleted", "Question removed successfully.");
    } catch (err) {
      console.warn("Delete call failed, using local update:", err);
      const filtered = questions.filter((q) => q.id !== question.id);
      const renumbered = filtered.map((q, idx) => ({
        ...q,
        questionNumber: idx + 1
      }));

      const updatedExam = {
        ...currentExam,
        questions: renumbered,
        totalMarks: renumbered.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
      };

      onUpdateExam(updatedExam);
      showSuccessAlert("Question Deleted", "Question removed from active state.");
    }
  };

  // 5. Duplicate Question
  const handleDuplicateQuestion = async (question) => {
    if (!currentExam) return;

    const duplicateData = {
      ...question,
      id: undefined,
      questionNumber: questions.length + 1,
      questionText: `${question.questionText} (Copy)`,
      keyConcepts: (question.keyConcepts || []).map((c) => ({ ...c }))
    };

    await handleSaveQuestion(duplicateData);
  };

  // 6. Reorder Questions (Move Up / Move Down)
  const handleMoveQuestion = async (index, direction) => {
    if (isReordering || !currentExam) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setIsReordering(true);
    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(targetIndex, 0, moved);

    // Renumber sequentially 1, 2, 3...
    const renumbered = newQuestions.map((q, idx) => ({
      ...q,
      questionNumber: idx + 1
    }));

    const orderedIds = renumbered.map((q) => q.id);

    try {
      const res = await fetch(`${API_ENDPOINTS.EXAMS}/${currentExam.id}/questions/reorder`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderedQuestionIds: orderedIds })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          onUpdateExam(data.exam);
          setIsReordering(false);
          return;
        }
      }

      // Fallback local update
      const updatedExam = {
        ...currentExam,
        questions: renumbered
      };
      onUpdateExam(updatedExam);
    } catch (err) {
      console.warn("Reorder call failed, using local update:", err);
      const updatedExam = {
        ...currentExam,
        questions: renumbered
      };
      onUpdateExam(updatedExam);
    } finally {
      setIsReordering(false);
    }
  };

  // 7. Load OSI Model Example
  const handleLoadOsiTemplate = async () => {
    if (!currentExam) return;

    try {
      const res = await fetch(`${API_ENDPOINTS.EXAMS}/${currentExam.id}/questions/load-osi-template`, {
        method: "POST",
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        if (data.exam) {
          onUpdateExam(data.exam);
        }
        showSuccessAlert(
          "OSI Model Question Loaded",
          "Added 'Explain the OSI model' with all 5 rubric criteria (Definition, Seven layers, Explanation, Example, Clarity)."
        );
        return;
      }

      // Fallback local addition
      const nextNum = questions.length + 1;
      const osiQuestion = {
        id: `q_osi_${Date.now()}`,
        questionNumber: nextNum,
        questionText: "Explain the OSI model.",
        maxMarks: 10,
        topic: "Computer Networks - OSI Architecture",
        difficulty: "Medium",
        modelAnswer:
          "The Open Systems Interconnection (OSI) model is a conceptual framework developed by ISO that standardizes telecommunication and computing systems communication functions into seven distinct logical layers: 1. Physical (raw bitstreams over physical media), 2. Data Link (node-to-node framing, MAC addressing, error detection), 3. Network (packet routing and IP addressing), 4. Transport (end-to-end reliability, TCP/UDP segmentation), 5. Session (dialogue control and synchronization), 6. Presentation (data syntax translation, encryption), and 7. Application (network services to applications like HTTP/DNS). For example, when browsing the web, HTTP operates at Application, TCP at Transport, IP at Network, and Ethernet at Data Link/Physical.",
        keyConcepts: [
          {
            concept: "Definition",
            weightMarks: 2,
            description: "Definition of OSI reference model as ISO standardized 7-layer framework.",
            synonyms: ["ISO OSI", "Open Systems Interconnection", "7-layer reference framework"]
          },
          {
            concept: "Seven layers",
            weightMarks: 3,
            description: "Enumeration of all 7 layers (Physical to Application) in order.",
            synonyms: ["Physical Data Link Network Transport Session Presentation Application", "all 7 layers in order"]
          },
          {
            concept: "Explanation",
            weightMarks: 2.5,
            description: "Explanation of layer responsibilities, framing, routing, and transport.",
            synonyms: ["layer functions", "encapsulation", "routing", "framing", "transport"]
          },
          {
            concept: "Example",
            weightMarks: 1.5,
            description: "Concrete protocol mapping (HTTP, TCP, IP, Ethernet).",
            synonyms: ["web browsing HTTP", "TCP IP Ethernet", "protocol stack"]
          },
          {
            concept: "Clarity",
            weightMarks: 1,
            description: "Technical precision, coherence, and accurate networking terminology.",
            synonyms: ["clarity", "terminology", "logical structure"]
          }
        ]
      };

      const updatedQuestions = [...questions, osiQuestion];
      const updatedExam = {
        ...currentExam,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0)
      };

      onUpdateExam(updatedExam);
      showSuccessAlert(
        "OSI Model Question Loaded",
        "Added 'Explain the OSI model' with Definition, Seven layers, Explanation, Example, and Clarity criteria."
      );
    } catch (err) {
      console.error("Failed to load OSI template:", err);
      showErrorAlert("Error", "Could not load OSI model template.");
    }
  };

  // 8. Open AI Tester Modal
  const handleOpenAiTester = (question) => {
    setTestingQuestion(question);
    setTesterModalOpen(true);
  };

  return (
    <div id="question-rubric-management-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Question & Rubric Management</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    Curricular Rubric Engine
                  </span>
                </h1>
                <p className="text-xs text-zinc-400">
                  Author questions, define granular weighted criteria, assign marks, and reorder. Rubrics directly power the AI Tri-Sheet evaluation.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-load-osi-example"
              type="button"
              onClick={handleLoadOsiTemplate}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 shadow transition-all flex items-center gap-2 cursor-pointer"
              title="Add the requested 'Explain the OSI model' question with 5 criteria"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Load OSI Model Example</span>
            </button>

            <button
              id="btn-create-question-primary"
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Question</span>
            </button>

            {onNavigateStage && (
              <button
                id="btn-nav-grading-stage"
                type="button"
                onClick={() => onNavigateStage("grading")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Stage 3 AI Grading</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {/* Examination Context Switcher */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400">Target Curriculum:</span>
            <select
              id="select-active-exam"
              value={currentExam?.id || ""}
              onChange={(e) => onSelectExam && onSelectExam(e.target.value)}
              className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.courseCode ? `[${exam.courseCode}] ` : ""}{exam.title} ({exam.totalMarks}M)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              Subject: <strong className="text-white">{currentExam?.subject}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
              Exam Marks: <strong className="text-white font-mono">{currentExam?.totalMarks} M</strong>
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-mono font-medium flex items-center gap-1 ${
                stats.allBalanced
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {stats.allBalanced ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{stats.balancedCount} / {stats.totalQ} Rubrics Balanced</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI & Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total Questions</span>
          <div className="text-xl font-bold text-white font-mono">{stats.totalQ}</div>
          <p className="text-[11px] text-zinc-500">Ordered in paper sequence</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Question Marks Total</span>
          <div className="text-xl font-bold text-indigo-400 font-mono">{stats.totalMax} M</div>
          <p className="text-[11px] text-zinc-500">
            {stats.totalMax === currentExam?.totalMarks ? "Exact match with exam paper" : "Differs from exam total"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Evaluation Criteria</span>
          <div className="text-xl font-bold text-purple-400 font-mono">{stats.totalCriteria}</div>
          <p className="text-[11px] text-zinc-500">
            Avg ~{stats.totalQ > 0 ? (stats.totalCriteria / stats.totalQ).toFixed(1) : 0} criteria/question
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Rubric Health</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            {stats.totalQ > 0 ? Math.round((stats.balancedCount / stats.totalQ) * 100) : 0}%
          </div>
          <p className="text-[11px] text-zinc-500">Criteria sum = max marks</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-questions"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics, criteria..."
            className="w-full pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Difficulty:</span>
            <select
              id="select-filter-difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List with Reordering */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <ListOrdered className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Questions Found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {searchQuery
                ? "No questions match your search filter. Try clearing the search query."
                : "This examination doesn't have any questions yet. Create your first question or load the OSI model example."}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleLoadOsiTemplate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
              >
                Load OSI Model Example
              </button>
            </div>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const actualIndex = questions.findIndex((item) => item.id === q.id);
            const isFirst = actualIndex === 0;
            const isLast = actualIndex === questions.length - 1;
            const isExpanded = Boolean(expandedModelAnswers[q.id]);

            // Calculate criteria sum
            const cSum = (q.keyConcepts || []).reduce((acc, c) => acc + (Number(c.weightMarks) || 0), 0);
            const isQBalanced = Math.abs(cSum - Number(q.maxMarks)) < 0.05;

            return (
              <div
                key={q.id || idx}
                id={`question-card-${q.questionNumber}`}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700/80 shadow-lg transition-all space-y-4"
              >
                {/* Header: Reorder Controls, Q# Badge, Topic, Difficulty, Max Marks, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(actualIndex, "up")}
                        disabled={isFirst || isReordering}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move question up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(actualIndex, "down")}
                        disabled={isLast || isReordering}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        title="Move question down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Question Number Badge */}
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs flex items-center gap-1.5">
                      <span>Q{q.questionNumber}</span>
                    </div>

                    {/* Topic & Difficulty */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium">
                        {q.topic || "General"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          q.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : q.difficulty === "Hard"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {q.difficulty || "Medium"}
                      </span>
                    </div>
                  </div>

                  {/* Marks Pill & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs font-bold">
                      {q.maxMarks} Marks
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1 ${
                        isQBalanced
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                      title={isQBalanced ? "Criteria sum perfectly matches max marks" : "Criteria sum differs from max marks"}
                    >
                      {isQBalanced ? <Check className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
                      <span>{(q.keyConcepts || []).length} Criteria</span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAiTester(q)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="Test with AI Tri-Sheet evaluation"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">AI Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Edit question and rubrics"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(q)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Duplicate question"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white leading-relaxed">
                    {q.questionText}
                  </h3>
                </div>

                {/* Model Answer Drawer */}
                <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleModelAnswer(q.id)}
                    className="w-full px-4 py-2 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Official Model Answer (Ground Truth Reference)
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      {isExpanded ? "Collapse" : "Expand Answer"}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-zinc-800/60 text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-950">
                      {q.modelAnswer}
                    </div>
                  )}
                </div>

                {/* Evaluation Criteria Rubric Table / Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Defined Evaluation Criteria & Marks Allocation</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Total Allocated: {cSum} / {q.maxMarks} M
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {(q.keyConcepts || []).map((criterion, cIdx) => {
                      const pct = q.maxMarks > 0 ? Math.round((criterion.weightMarks / q.maxMarks) * 100) : 0;
                      return (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center justify-center">
                                {cIdx + 1}
                              </span>
                              <span>{criterion.concept}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold">
                              {criterion.weightMarks} M ({pct}%)
                            </span>
                          </div>

                          {criterion.description && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              {criterion.description}
                            </p>
                          )}

                          {criterion.synonyms && criterion.synonyms.length > 0 && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {criterion.synonyms.slice(0, 3).map((syn, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400"
                                >
                                  {syn}
                                </span>
                              ))}
                              {criterion.synonyms.length > 3 && (
                                <span className="text-[10px] text-zinc-500">
                                  +{criterion.synonyms.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Question & Rubric Authoring Modal */}
      <QuestionEditorModal
        isOpen={editorModalOpen}
        onClose={() => {
          setEditorModalOpen(false);
          setEditingQuestion(null);
        }}
        initialQuestion={editingQuestion}
        examId={currentExam?.id}
        examTitle={currentExam?.title}
        onSaveQuestion={handleSaveQuestion}
      />

      {/* Interactive Rubric AI Evaluator Modal */}
      <RubricTesterModal
        isOpen={testerModalOpen}
        onClose={() => {
          setTesterModalOpen(false);
          setTestingQuestion(null);
        }}
        question={testingQuestion}
        examTitle={currentExam?.title}
      />
    </div>
  );
};
