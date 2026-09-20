import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Check,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Percent,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy
} from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlert";

const SUBJECT_SUGGESTIONS = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Machine Learning",
  "Operating Systems & Distributed Architecture",
  "Molecular Biology & Genetics",
  "Data Structures & Algorithms",
  "Database Management Systems",
  "Computer Networks & Security",
  "Applied Mathematics & Calculus"
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

export const ExamEditorModal = ({
  isOpen,
  onClose,
  initialExam = null,
  onSaveExam
}) => {
  // Mode: edit if initialExam is passed, else create
  const isEditing = Boolean(initialExam?.id);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("Undergraduate (Year 3)");
  const [examDate, setExamDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [totalMarks, setTotalMarks] = useState(30);
  const [passingMarks, setPassingMarks] = useState(15);
  const [status, setStatus] = useState("published");
  const [instructions, setInstructions] = useState([
    "Answer all questions in concise, legible handwriting.",
    "Highlight core technical concepts and state mathematical assumptions.",
    "Partial marks will be awarded based on specific rubric criteria."
  ]);
  const [newInstruction, setNewInstruction] = useState("");

  const [questions, setQuestions] = useState([]);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);
  const [errors, setErrors] = useState({});

  // Populate state on open or initialExam change
  useEffect(() => {
    if (isOpen) {
      if (initialExam) {
        setTitle(initialExam.title || "");
        setSubject(initialExam.subject || "");
        setCourseCode(initialExam.courseCode || "");
        setDescription(initialExam.description || "");
        setGradeLevel(initialExam.gradeLevel || "Undergraduate (Year 3)");
        
        // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
        let formattedDate = "";
        if (initialExam.examDate) {
          try {
            const d = new Date(initialExam.examDate);
            if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().slice(0, 16);
            }
          } catch (e) {
            formattedDate = "";
          }
        }
        if (!formattedDate) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 7);
          tomorrow.setHours(9, 30, 0, 0);
          formattedDate = tomorrow.toISOString().slice(0, 16);
        }
        setExamDate(formattedDate);

        setDurationMinutes(initialExam.durationMinutes || 90);
        setTotalMarks(initialExam.totalMarks || 30);
        setPassingMarks(initialExam.passingMarks !== undefined ? initialExam.passingMarks : Math.round((initialExam.totalMarks || 30) * 0.5));
        setStatus(initialExam.status || "published");
        setInstructions(
          initialExam.instructions?.length > 0
            ? [...initialExam.instructions]
            : [
                "Answer all questions in concise, legible handwriting.",
                "Highlight core technical concepts and state mathematical assumptions."
              ]
        );
        setQuestions(
          initialExam.questions?.map((q, idx) => ({
            id: q.id || `q_${idx + 1}_${Date.now()}`,
            questionNumber: idx + 1,
            topic: q.topic || "General Topic",
            difficulty: q.difficulty || "Medium",
            questionText: q.questionText || "",
            maxMarks: q.maxMarks || 10,
            modelAnswer: q.modelAnswer || "",
            keyConcepts: q.keyConcepts?.length > 0
              ? q.keyConcepts.map((kc) => ({
                  concept: kc.concept || "",
                  weightMarks: kc.weightMarks !== undefined ? kc.weightMarks : 5,
                  synonyms: Array.isArray(kc.synonyms) ? kc.synonyms.join(", ") : (kc.synonyms || ""),
                  description: kc.description || ""
                }))
              : [
                  {
                    concept: "Key Definition & Formulation",
                    weightMarks: Math.ceil((q.maxMarks || 10) / 2),
                    synonyms: "definition, primary formula",
                    description: "Accurate statement of fundamental technical principle"
                  },
                  {
                    concept: "Analysis & Implementation",
                    weightMarks: Math.floor((q.maxMarks || 10) / 2),
                    synonyms: "implementation, evaluation, edge cases",
                    description: "Demonstration of algorithmic or experimental reasoning"
                  }
                ]
          })) || []
        );
      } else {
        // Default blank template for new exam
        setTitle("Distributed Systems & Cloud Computing Midterm");
        setSubject("Computer Science & Engineering");
        setCourseCode("CS-401");
        setDescription("Comprehensive midterm evaluation testing consensus algorithms, Raft protocol leader election, and distributed atomic transactions.");
        setGradeLevel("Undergraduate (Year 4)");
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 5);
        nextWeek.setHours(10, 0, 0, 0);
        setExamDate(nextWeek.toISOString().slice(0, 16));

        setDurationMinutes(90);
        setTotalMarks(30);
        setPassingMarks(15);
        setStatus("published");
        setInstructions([
          "Answer all questions concisely in standard technical English.",
          "Mathematical proofs and algorithm steps must be clearly numbered.",
          "Full partial credit is awarded for accurate rubric criteria components."
        ]);
        setQuestions([
          {
            id: `q_1_${Date.now()}`,
            questionNumber: 1,
            topic: "Consensus Protocols",
            difficulty: "Medium",
            questionText: "Explain the Leader Election phase in the Raft Consensus Protocol. How does Raft guarantee that at most one leader can be elected in a given term?",
            maxMarks: 10,
            modelAnswer: "In Raft, servers transition from Follower to Candidate after an election timeout. The candidate increments its term, votes for itself, and sends RequestVote RPCs to all peers. To be elected leader, it must receive votes from a majority of the cluster nodes. At most one leader can be elected in a given term because each server can cast at most one vote per term on a first-come-first-served basis, and two majorities of the same set must overlap in at least one server.",
            keyConcepts: [
              {
                concept: "Candidate Transition & RequestVote RPC",
                weightMarks: 5,
                synonyms: "election timeout, randomized timer, vote request",
                description: "Must explain server transition upon timeout and broadcast of RequestVote RPC"
              },
              {
                concept: "Majority Overlap Guarantee",
                weightMarks: 5,
                synonyms: "quorum, single vote per term, pigeonhole principle",
                description: "Must specify that each node votes once per term and majority intersections prevent split votes"
              }
            ]
          },
          {
            id: `q_2_${Date.now()}`,
            questionNumber: 2,
            topic: "Distributed Transactions",
            difficulty: "Hard",
            questionText: "Differentiate between Two-Phase Commit (2PC) and Three-Phase Commit (3PC). Why is 2PC considered a blocking protocol, and how does 3PC mitigate coordinator crashes?",
            maxMarks: 10,
            modelAnswer: "Two-Phase Commit (2PC) operates in Prepare and Commit phases. It is blocking because if the coordinator crashes after participants vote 'YES' but before sending the commit/abort message, participants remain locked waiting indefinitely for the decision. Three-Phase Commit (3PC) breaks the commit phase into Pre-Commit and Commit with non-blocking timeouts, ensuring participants can safely abort if no progress occurs.",
            keyConcepts: [
              {
                concept: "2PC Blocking State Analysis",
                weightMarks: 5,
                synonyms: "locked resources, coordinator crash, uncertain state",
                description: "Must explain participant indefinite block when coordinator fails post-prepare"
              },
              {
                concept: "3PC Pre-Commit Stage & Non-blocking Timeout",
                weightMarks: 5,
                synonyms: "precommit phase, timeout abort, split recovery",
                description: "Must explain introduction of pre-commit state with timeout transitions"
              }
            ]
          },
          {
            id: `q_3_${Date.now()}`,
            questionNumber: 3,
            topic: "CAP Theorem",
            difficulty: "Easy",
            questionText: "State the CAP Theorem for distributed data stores. Explain why a distributed network must choose between Consistency and Availability in the presence of a Network Partition (P).",
            maxMarks: 10,
            modelAnswer: "The CAP Theorem states that a distributed data system can simultaneously provide at most two out of three guarantees: Consistency (all nodes see the same data at the same time), Availability (every non-failing request receives a response), and Partition Tolerance (system continues functioning despite arbitrary network packet drops). Since physical networks cannot guarantee zero partitions, when a partition occurs, the system must either refuse requests to maintain consistency (CP) or accept writes on isolated nodes sacrificing consistency (AP).",
            keyConcepts: [
              {
                concept: "CAP Guarantees Definition",
                weightMarks: 5,
                synonyms: "consistency, availability, partition tolerance",
                description: "Clear definition of C, A, and P properties"
              },
              {
                concept: "Trade-off under Network Partition",
                weightMarks: 5,
                synonyms: "CP vs AP, unavoidable partition, network split",
                description: "Rigorous explanation of why partition necessitates choosing between C and A"
              }
            ]
          }
        ]);
      }
      setExpandedQuestionIdx(0);
      setErrors({});
    }
  }, [isOpen, initialExam]);

  // Real-time calculation of question marks sum
  const questionsMarksSum = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);
  }, [questions]);

  // Validation comparison between totalMarks and questionsMarksSum
  const marksDifference = useMemo(() => {
    return questionsMarksSum - Number(totalMarks);
  }, [questionsMarksSum, totalMarks]);

  const isMarksBalanced = marksDifference === 0;

  // Passing marks percentage calculation
  const passingPercentage = useMemo(() => {
    const total = Number(totalMarks) || 1;
    const pass = Number(passingMarks) || 0;
    return Math.round((pass / total) * 100);
  }, [totalMarks, passingMarks]);

  if (!isOpen) return null;

  // Quick Action: Auto-balance total marks to match sum of questions
  const handleAutoBalanceTotalMarks = () => {
    setTotalMarks(questionsMarksSum);
    // Also adjust passing marks if it exceeded new total
    if (Number(passingMarks) > questionsMarksSum) {
      setPassingMarks(Math.round(questionsMarksSum * 0.5));
    }
  };

  // Add Instruction
  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;
    setInstructions((prev) => [...prev, newInstruction.trim()]);
    setNewInstruction("");
  };

  const handleRemoveInstruction = (idx) => {
    setInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Questions Management
  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    const newQ = {
      id: `q_${nextNum}_${Date.now()}`,
      questionNumber: nextNum,
      topic: "Core Concept",
      difficulty: "Medium",
      questionText: "",
      maxMarks: 10,
      modelAnswer: "",
      keyConcepts: [
        {
          concept: "Primary Definition",
          weightMarks: 5,
          synonyms: "core rule, definition",
          description: "Accurate statement of definition"
        },
        {
          concept: "Application & Synthesis",
          weightMarks: 5,
          synonyms: "application, working",
          description: "Applied solution or derivation"
        }
      ]
    };
    setQuestions((prev) => [...prev, newQ]);
    setExpandedQuestionIdx(questions.length);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      showErrorAlert("Cannot Delete", "An examination must contain at least one question.");
      return;
    }
    const updated = questions
      .filter((_, i) => i !== idx)
      .map((q, i) => ({ ...q, questionNumber: i + 1 }));
    setQuestions(updated);
    if (expandedQuestionIdx >= updated.length) {
      setExpandedQuestionIdx(Math.max(0, updated.length - 1));
    }
  };

  const handleDuplicateQuestion = (idx) => {
    const source = questions[idx];
    const duplicated = {
      ...JSON.parse(JSON.stringify(source)),
      id: `q_${questions.length + 1}_${Date.now()}`,
      questionNumber: questions.length + 1
    };
    setQuestions((prev) => [...prev, duplicated]);
    setExpandedQuestionIdx(questions.length);
  };

  const handleUpdateQuestion = (idx, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  // Rubric Criteria inside a Question
  const handleAddCriterion = (qIdx) => {
    const question = questions[qIdx];
    const currentCritSum = question.keyConcepts.reduce(
      (sum, c) => sum + (Number(c.weightMarks) || 0),
      0
    );
    const remainingMarks = Math.max(1, (question.maxMarks || 10) - currentCritSum);

    const newCrit = {
      concept: "Additional Criterion",
      weightMarks: remainingMarks > 0 ? remainingMarks : 2,
      synonyms: "synonym1, synonym2",
      description: "Evaluation standard for this criterion"
    };

    const updatedKeyConcepts = [...question.keyConcepts, newCrit];
    handleUpdateQuestion(qIdx, "keyConcepts", updatedKeyConcepts);
  };

  const handleRemoveCriterion = (qIdx, critIdx) => {
    const question = questions[qIdx];
    if (question.keyConcepts.length <= 1) {
      showErrorAlert("Rubric Required", "Each question should have at least one evaluation criterion.");
      return;
    }
    const updated = question.keyConcepts.filter((_, i) => i !== critIdx);
    handleUpdateQuestion(qIdx, "keyConcepts", updated);
  };

  const handleUpdateCriterion = (qIdx, critIdx, field, value) => {
    const question = questions[qIdx];
    const updated = question.keyConcepts.map((c, i) =>
      i === critIdx ? { ...c, [field]: value } : c
    );
    handleUpdateQuestion(qIdx, "keyConcepts", updated);
  };

  // Form Submission with Strict Validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Exam title is required";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (Number(totalMarks) <= 0) {
      newErrors.totalMarks = "Total marks must be greater than 0";
    }
    if (Number(passingMarks) < 0 || Number(passingMarks) > Number(totalMarks)) {
      newErrors.passingMarks = `Passing marks must be between 0 and total marks (${totalMarks})`;
    }
    if (questions.length === 0) {
      newErrors.questions = "At least one question is required";
    }

    // Question marks matching examination total marks validation
    if (questionsMarksSum !== Number(totalMarks)) {
      newErrors.marksMismatch = `Question marks sum (${questionsMarksSum}) does not match examination total marks (${totalMarks}).`;
    }

    // Validate individual questions
    questions.forEach((q, idx) => {
      if (!q.questionText.trim()) {
        newErrors[`q_${idx}_text`] = `Question ${idx + 1} text is required`;
      }
      if (Number(q.maxMarks) <= 0) {
        newErrors[`q_${idx}_marks`] = `Question ${idx + 1} marks must be > 0`;
      }
      if (!q.modelAnswer.trim()) {
        newErrors[`q_${idx}_answer`] = `Question ${idx + 1} model answer is recommended`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // If the only error is marks mismatch, show helpful prompt
      if (newErrors.marksMismatch) {
        showErrorAlert(
          "Marks Validation Error",
          `<div class="text-left text-xs space-y-2 text-slate-300">
            <p><strong>The question marks do not equal the examination total marks.</strong></p>
            <p>• Examination Total: <span class="text-indigo-400 font-bold">${totalMarks} Marks</span></p>
            <p>• Sum of Questions: <span class="text-amber-400 font-bold">${questionsMarksSum} Marks</span></p>
            <p>• Difference: <span class="text-rose-400 font-bold">${Math.abs(marksDifference)} Marks ${marksDifference > 0 ? "Surplus" : "Deficit"}</span></p>
            <p class="text-slate-400 text-[11px] pt-1">Click <em>"Auto-Sync Total Marks"</em> at the top to instantly align them, or adjust the individual question marks.</p>
          </div>`
        );
      } else {
        showErrorAlert("Incomplete Form", "Please fill in all required examination fields.");
      }
      return;
    }

    // Prepare clean exam object
    const finalExamData = {
      id: initialExam?.id || `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subject: subject.trim(),
      courseCode: courseCode.trim() || `CS-${Math.floor(100 + Math.random() * 900)}`,
      description: description.trim(),
      gradeLevel: gradeLevel.trim(),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      examDate: examDate ? new Date(examDate).toISOString() : new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 90,
      status,
      instructions: instructions.filter((i) => i.trim().length > 0),
      questions: questions.map((q, idx) => ({
        id: q.id || `q_${idx + 1}_${Date.now()}`,
        questionNumber: idx + 1,
        questionText: q.questionText.trim(),
        maxMarks: Number(q.maxMarks) || 10,
        topic: q.topic.trim() || "General",
        difficulty: q.difficulty || "Medium",
        modelAnswer: q.modelAnswer.trim(),
        keyConcepts: q.keyConcepts.map((kc) => ({
          concept: kc.concept.trim(),
          weightMarks: Number(kc.weightMarks) || 5,
          synonyms: typeof kc.synonyms === "string" 
            ? kc.synonyms.split(",").map((s) => s.trim()).filter(Boolean)
            : Array.isArray(kc.synonyms) ? kc.synonyms : [],
          description: kc.description.trim()
        }))
      })),
      updatedAt: new Date().toISOString()
    };

    if (!isEditing) {
      finalExamData.createdAt = new Date().toISOString();
    }

    onSaveExam(finalExamData);
    showSuccessAlert(
      isEditing ? "Examination Updated!" : "Examination Created!",
      `<p class="text-xs text-slate-300">
        <strong>${finalExamData.title}</strong> (${finalExamData.totalMarks} Marks, ${finalExamData.questions.length} Questions)
        has been saved and is set to <strong>${status.toUpperCase()}</strong>.
      </p>`,
      2500
    );
    onClose();
  };

  return (
    <div
      id="exam-editor-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div
        id="exam-editor-container"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isEditing ? "Edit Examination Paper & Rubrics" : "Create New Examination Paper"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    status === "published"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure curriculum metadata, question banks, model answers, and automated grading criteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Toggle in Header */}
            <button
              type="button"
              onClick={() => setStatus((s) => (s === "published" ? "draft" : "published"))}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
              title="Toggle published / draft state"
            >
              <span className={`w-2 h-2 rounded-full ${status === "published" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span>{status === "published" ? "Published (Visible)" : "Draft (Hidden)"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Mathematical Validation Bar (Sticky) */}
        <div
          id="marks-validation-bar"
          className={`px-5 py-3 border-b text-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isMarksBalanced
              ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
              : marksDifference > 0
              ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
              : "bg-amber-950/40 border-amber-800/60 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isMarksBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            )}
            <div>
              <span className="font-semibold">
                {isMarksBalanced
                  ? "Marks Correctly Balanced: "
                  : marksDifference > 0
                  ? "Marks Mismatch (Surplus): "
                  : "Marks Mismatch (Deficit): "}
              </span>
              <span>
                Sum of {questions.length} questions is{" "}
                <strong className="underline">{questionsMarksSum} Marks</strong>, Exam Total is{" "}
                <strong className="underline">{totalMarks} Marks</strong>.
              </span>
              {!isMarksBalanced && (
                <span className="ml-1 font-bold">
                  ({Math.abs(marksDifference)} marks {marksDifference > 0 ? "surplus" : "short"})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Pass Standard: <strong className="text-white">{passingMarks} Marks</strong> ({passingPercentage}%)
            </span>
            {!isMarksBalanced && (
              <button
                type="button"
                onClick={handleAutoBalanceTotalMarks}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Auto-Sync Total to {questionsMarksSum}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Section 1: General Details */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                1. Examination Metadata & Scheduling
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Title */}
              <div className="sm:col-span-8">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Examination Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Advanced Operating Systems & AI Midterm"
                  className={`w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border focus:outline-none transition ${
                    errors.title
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                  required
                />
                {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
              </div>

              {/* Course Code */}
              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Course Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g., CS-301"
                  className="w-full bg-slate-900 text-xs font-mono text-indigo-300 p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                  required
                />
              </div>

              {/* Subject */}
              <div className="sm:col-span-6">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Subject / Discipline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science & Engineering"
                  list="subject-suggestions-list"
                  className={`w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border focus:outline-none transition ${
                    errors.subject
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500"
                  }`}
                  required
                />
                <datalist id="subject-suggestions-list">
                  {SUBJECT_SUGGESTIONS.map((s, idx) => (
                    <option key={idx} value={s} />
                  ))}
                </datalist>
                {errors.subject && <p className="text-[11px] text-rose-400 mt-1">{errors.subject}</p>}
              </div>

              {/* Academic Grade / Year */}
              <div className="sm:col-span-6">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Academic Level / Year
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder="e.g., Undergraduate (Year 3) or College Senior"
                  className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-12">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Examination Description & Syllabus Overview
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Provide brief context for evaluators and students regarding the covered modules and theoretical scope..."
                  className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              {/* Examination Date & Time */}
              <div className="sm:col-span-6">
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Examination Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              {/* Duration Minutes */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duration (Minutes)</span>
                </label>
                <input
                  type="number"
                  min="15"
                  max="360"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-900 text-xs font-mono text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              {/* Status */}
              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                >
                  <option value="published">Published (Live for Cohort)</option>
                  <option value="draft">Draft (Private to Teachers)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Scoring Standards & Marks Benchmark */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Percent className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                2. Marks Allocation & Passing Standards
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Marks */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-bold text-slate-200 block mb-1">
                  Total Examination Marks <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Target total marks across the entire test paper.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-sm font-bold font-mono text-white p-2.5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none transition"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                    Marks
                  </span>
                </div>
              </div>

              {/* Passing Marks */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-200">
                    Passing Marks Threshold <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {passingPercentage}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Minimum mark required to qualify/pass.
                </p>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={totalMarks || 100}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-sm font-bold font-mono text-white p-2.5 rounded-lg border border-slate-700 focus:border-indigo-500 focus:outline-none transition"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                    Marks
                  </span>
                </div>
              </div>

              {/* Current Question Marks Sum */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isMarksBalanced
                    ? "bg-emerald-950/20 border-emerald-800/60"
                    : "bg-amber-950/20 border-amber-800/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-200">
                      Question Marks Sum
                    </label>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isMarksBalanced
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {isMarksBalanced ? "Balanced" : "Mismatch"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Sum of individual question max marks:
                  </p>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-bold font-mono text-white">
                    {questionsMarksSum}{" "}
                    <span className="text-xs font-normal text-slate-400">/ {totalMarks}</span>
                  </div>
                  {!isMarksBalanced && (
                    <button
                      type="button"
                      onClick={handleAutoBalanceTotalMarks}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold"
                    >
                      Set Total = {questionsMarksSum}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: General Candidate Instructions */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  3. Examination Instructions ({instructions.length})
                </h3>
              </div>
            </div>

            <div className="space-y-2">
              {instructions.map((inst, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="text-indigo-400 font-mono font-bold w-5 text-center flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="flex-1 leading-relaxed">{inst}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(idx)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add instruction input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInstruction();
                    }
                  }}
                  placeholder="Type an instruction and click Add (or press Enter)..."
                  className="flex-1 bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Instruction</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Questions & Evaluation Rubrics Builder */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    4. Questions & Automated Evaluation Criteria ({questions.length} Questions)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define question prompts, mark weights, model answers, and concept rubrics for AI semantic scoring.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {questions.map((q, qIdx) => {
                const isExpanded = expandedQuestionIdx === qIdx;
                const criteriaSum = q.keyConcepts.reduce(
                  (sum, c) => sum + (Number(c.weightMarks) || 0),
                  0
                );
                const isCriteriaBalanced = criteriaSum === Number(q.maxMarks);

                return (
                  <div
                    key={q.id || qIdx}
                    className={`rounded-xl border transition-all ${
                      isExpanded
                        ? "bg-slate-900/90 border-slate-700 shadow-md"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-750"
                    }`}
                  >
                    {/* Question Summary Bar */}
                    <div
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedQuestionIdx(isExpanded ? -1 : qIdx)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-300 font-bold font-mono text-xs flex-shrink-0">
                          Q{q.questionNumber}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white line-clamp-1">
                              {q.questionText || "(Empty question text...)"}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono flex-shrink-0">
                              {q.topic || "General"}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold flex-shrink-0 ${
                                q.difficulty === "Easy"
                                  ? "text-emerald-300 bg-emerald-500/10"
                                  : q.difficulty === "Hard"
                                  ? "text-rose-300 bg-rose-500/10"
                                  : "text-amber-300 bg-amber-500/10"
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {q.keyConcepts.length} Rubric Criteria • Criteria Sum:{" "}
                            <strong
                              className={isCriteriaBalanced ? "text-emerald-400" : "text-amber-400"}
                            >
                              {criteriaSum}/{q.maxMarks} Marks
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 font-mono">Max:</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={q.maxMarks || 10}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              handleUpdateQuestion(qIdx, "maxMarks", val);
                            }}
                            className="w-12 bg-transparent text-xs font-bold font-mono text-indigo-300 text-center focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500">M</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestion(qIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Duplicate question"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedQuestionIdx(isExpanded ? -1 : qIdx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Question Expanded Editor */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/40">
                        {/* Meta: Topic, Difficulty, Marks */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              Topic / Module Area
                            </label>
                            <input
                              type="text"
                              value={q.topic}
                              onChange={(e) => handleUpdateQuestion(qIdx, "topic", e.target.value)}
                              placeholder="e.g., Concurrency, Tree Algorithms"
                              className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              Difficulty Level
                            </label>
                            <select
                              value={q.difficulty}
                              onChange={(e) => handleUpdateQuestion(qIdx, "difficulty", e.target.value)}
                              className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                            >
                              {DIFFICULTY_OPTIONS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                              Assigned Question Marks
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={q.maxMarks}
                              onChange={(e) =>
                                handleUpdateQuestion(qIdx, "maxMarks", parseInt(e.target.value) || 1)
                              }
                              className="w-full bg-slate-900 text-xs font-mono font-bold text-indigo-300 p-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            Question Prompt / Problem Statement <span className="text-rose-400">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestion(qIdx, "questionText", e.target.value)}
                            placeholder="Enter the complete question prompt that students must answer..."
                            className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition leading-relaxed"
                            required
                          />
                        </div>

                        {/* Model Answer */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-300">
                              Official Model Answer / Solution Benchmark <span className="text-rose-400">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400">
                              Used by AI Tri-Sheet grading to verify mathematical and conceptual correctness
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={q.modelAnswer}
                            onChange={(e) => handleUpdateQuestion(qIdx, "modelAnswer", e.target.value)}
                            placeholder="Enter the authoritative, comprehensive solution benchmark that full-credit answers must align with..."
                            className="w-full bg-slate-900 text-xs text-white p-2.5 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition leading-relaxed"
                            required
                          />
                        </div>

                        {/* Rubric Criteria Builder */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-200">
                                Evaluation Criteria & Key Concepts ({q.keyConcepts.length})
                              </span>
                              <p className="text-[11px] text-slate-400">
                                Detailed rubric elements with weight marks and accepted terminology.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddCriterion(qIdx)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Rubric Criterion</span>
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {q.keyConcepts.map((crit, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-[11px]">{cIdx + 1}.</span>
                                    <input
                                      type="text"
                                      value={crit.concept}
                                      onChange={(e) =>
                                        handleUpdateCriterion(qIdx, cIdx, "concept", e.target.value)
                                      }
                                      placeholder="Concept / Criterion Title (e.g., Mutual Exclusion Definition)"
                                      className="flex-1 bg-slate-900 text-xs font-semibold text-white p-1.5 rounded border border-slate-800 focus:border-indigo-500 focus:outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                      <span className="text-[10px] text-slate-400">Weight:</span>
                                      <input
                                        type="number"
                                        min="0.5"
                                        max={q.maxMarks}
                                        step="0.5"
                                        value={crit.weightMarks}
                                        onChange={(e) =>
                                          handleUpdateCriterion(
                                            qIdx,
                                            cIdx,
                                            "weightMarks",
                                            parseFloat(e.target.value) || 1
                                          )
                                        }
                                        className="w-12 bg-transparent text-xs font-bold font-mono text-emerald-400 text-center focus:outline-none"
                                      />
                                      <span className="text-[10px] text-slate-500">Marks</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCriterion(qIdx, cIdx)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                                      title="Remove criterion"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <input
                                      type="text"
                                      value={crit.synonyms}
                                      onChange={(e) =>
                                        handleUpdateCriterion(qIdx, cIdx, "synonyms", e.target.value)
                                      }
                                      placeholder="Accepted synonyms / keywords (comma-separated)..."
                                      className="w-full bg-slate-900 text-[11px] text-slate-300 p-1.5 rounded border border-slate-800 focus:border-indigo-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      value={crit.description}
                                      onChange={(e) =>
                                        handleUpdateCriterion(qIdx, cIdx, "description", e.target.value)
                                      }
                                      placeholder="Specific evaluation guideline / partial credit condition..."
                                      className="w-full bg-slate-900 text-[11px] text-slate-300 p-1.5 rounded border border-slate-800 focus:border-indigo-500 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky/Fixed Modal Footer */}
          <div className="sticky bottom-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl z-20">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">
                Summary: <strong className="text-white">{questions.length} Questions</strong>,{" "}
                <strong className="text-indigo-300">{questionsMarksSum} Marks Assigned</strong> /{" "}
                <strong className="text-white">{totalMarks} Exam Total</strong>
              </span>
              {!isMarksBalanced && (
                <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Must match before publishing</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!isMarksBalanced}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition flex items-center gap-1.5"
                title={!isMarksBalanced ? "Align question marks to match exam total marks before saving" : "Save examination"}
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? "Save Changes" : "Create Examination"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
