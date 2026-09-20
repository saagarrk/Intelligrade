import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  ChevronRight,
  ListOrdered,
  HelpCircle,
  Share2
} from "lucide-react";
import { showSuccessAlert, showErrorAlert, showSweetToast } from "../utils/sweetAlert";
import { ExamEditorModal } from "./ExamEditorModal";

export const ExaminationManagement = ({
  exams = [],
  submissions = [],
  selectedExamId,
  onSelectExam,
  onCreateExam,
  onUpdateExam,
  onDeleteExam,
  onTogglePublishExam,
  onNavigateStage
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  // Quick Preview Modal state (read-only inspection of questions & rubrics)
  const [previewExam, setPreviewExam] = useState(null);

  // Available subjects for filter
  const availableSubjects = useMemo(() => {
    const subjectsSet = new Set();
    exams.forEach((e) => {
      if (e.subject) subjectsSet.add(e.subject);
    });
    return Array.from(subjectsSet);
  }, [exams]);

  // Statistics
  const totalExamsCount = exams.length;
  const publishedCount = exams.filter((e) => e.status === "published").length;
  const draftCount = exams.filter((e) => e.status === "draft").length;
  const totalQuestionsCount = exams.reduce((sum, e) => sum + (e.questions?.length || 0), 0);
  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        exam.title.toLowerCase().includes(term) ||
        (exam.subject && exam.subject.toLowerCase().includes(term)) ||
        (exam.courseCode && exam.courseCode.toLowerCase().includes(term)) ||
        (exam.description && exam.description.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && exam.status === "published") ||
        (statusFilter === "draft" && exam.status === "draft");

      const matchesSubject = subjectFilter === "all" || exam.subject === subjectFilter;

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [exams, searchTerm, statusFilter, subjectFilter]);

  // Handle open create
  const handleOpenCreate = () => {
    setEditingExam(null);
    setIsEditorOpen(true);
  };

  // Handle open edit
  const handleOpenEdit = (exam) => {
    setEditingExam(exam);
    setIsEditorOpen(true);
  };

  // Handle save from editor
  const handleSaveExam = (examData) => {
    if (editingExam) {
      onUpdateExam(examData);
    } else {
      onCreateExam(examData);
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (exam) => {
    if (exams.length <= 1) {
      showErrorAlert(
        "Cannot Delete Only Examination",
        "The system must retain at least one examination paper for grading."
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the examination "${exam.title}" (${exam.courseCode})? This action cannot be undone.`
      )
    ) {
      onDeleteExam(exam.id);
      showSweetToast(`Deleted examination "${exam.title}"`, "success");
    }
  };

  // Handle toggle publish
  const handleTogglePublish = (exam) => {
    onTogglePublishExam(exam.id);
    const nextStatus = exam.status === "published" ? "Draft" : "Published";
    showSweetToast(`Examination "${exam.title}" is now marked as ${nextStatus}`, "success");
  };

  return (
    <div id="examination-management-view" className="space-y-6 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Examination & Curriculum Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Faculty Console
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Author, calibrate, publish, and manage multi-question examination papers, model answers, and grading rubrics
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Active in Pipeline:{" "}
                  <strong className="text-white">
                    {activeExam?.courseCode} - {activeExam?.title}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Published: <strong>{publishedCount} of {totalExamsCount}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-create-new-exam"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Examination</span>
            </button>

            <button
              id="btn-nav-question-rubrics"
              onClick={() => onNavigateStage("rubric_management")}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              title="Manage questions, maximum marks, and evaluation rubrics"
            >
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              <span>Questions & Rubrics</span>
            </button>

            <button
              onClick={() => onNavigateStage("preprocessing")}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
              title="Upload question paper scan to automatically test rubrics"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Upload Question Paper</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Exams */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Examinations
            </span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {totalExamsCount}
            </div>
          </div>
        </div>

        {/* Published Exams */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Published (Live)
            </span>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
              {publishedCount}
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Edit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Drafts / In Review
            </span>
            <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
              {draftCount}
            </div>
          </div>
        </div>

        {/* Total Questions in Bank */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Questions in Bank
            </span>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
              {totalQuestionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exams, subjects, course codes..."
            className="w-full bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none transition placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status and Subject Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({exams.length})
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                statusFilter === "published"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                statusFilter === "draft"
                  ? "bg-amber-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>

          {/* Subject Filter Dropdown */}
          {availableSubjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-950 text-xs text-slate-300 px-3 py-2 rounded-lg border border-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Subjects ({availableSubjects.length})</option>
              {availableSubjects.map((sub, idx) => (
                <option key={idx} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Examinations Grid */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Examinations Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== "all" || subjectFilter !== "all"
              ? "No examinations match your current filter or search criteria. Try clearing filters."
              : "No examinations have been created yet. Click '+ Create Examination' to configure your first paper."}
          </p>
          {(searchTerm || statusFilter !== "all" || subjectFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSubjectFilter("all");
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const isActive = exam.id === activeExam?.id;
            const examSubmissions = submissions.filter((s) => s.examId === exam.id);
            const questionsSum = exam.questions?.reduce(
              (sum, q) => sum + (Number(q.maxMarks) || 0),
              0
            );
            const isBalanced = questionsSum === exam.totalMarks;
            const passPct = exam.passingMarks
              ? Math.round((exam.passingMarks / exam.totalMarks) * 100)
              : 50;

            // Formatted date
            let displayDate = "Scheduled";
            if (exam.examDate) {
              try {
                const d = new Date(exam.examDate);
                if (!isNaN(d.getTime())) {
                  displayDate = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  });
                }
              } catch (e) {
                displayDate = "Scheduled";
              }
            }

            return (
              <div
                key={exam.id}
                className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                  isActive
                    ? "bg-slate-900 border-indigo-500/70 shadow-lg ring-1 ring-indigo-500/30"
                    : "bg-slate-900/85 border-slate-800 hover:border-slate-700 shadow-sm"
                }`}
              >
                {/* Card Top / Header */}
                <div className="p-5 space-y-3 flex-1">
                  {/* Course Code, Status, and Active Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {exam.courseCode || "EX-001"}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-2xs">
                          Active In Pipeline
                        </span>
                      )}
                    </div>

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => handleTogglePublish(exam)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                        exam.status === "published"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                      }`}
                      title="Click to toggle between Published and Draft"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.status === "published" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <span>{exam.status === "published" ? "Published" : "Draft"}</span>
                    </button>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">
                      {exam.subject}
                    </p>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  {/* Metadata Chips: Date, Duration, Level */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{displayDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{exam.durationMinutes || 90} mins</span>
                    </span>
                    {exam.gradeLevel && (
                      <span className="text-slate-500">• {exam.gradeLevel}</span>
                    )}
                  </div>

                  {/* Marks & Validation Bar */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total Marks:</span>
                      <span className="font-mono font-bold text-white text-sm">
                        {exam.totalMarks} Marks
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Passing Threshold:</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {exam.passingMarks || Math.round(exam.totalMarks * 0.5)} Marks ({passPct}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-850">
                      <span className="text-slate-400">
                        {exam.questions?.length || 0} Questions
                      </span>
                      <span
                        className={`font-semibold flex items-center gap-1 ${
                          isBalanced ? "text-emerald-400" : "text-amber-400"
                        }`}
                      >
                        {isBalanced ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Marks Balanced ({questionsSum}M)</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Mismatch ({questionsSum} vs {exam.totalMarks}M)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* View Details / Rubrics */}
                    <button
                      onClick={() => setPreviewExam(exam)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Quick preview questions & rubrics"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit Exam */}
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
                      title="Edit examination paper & settings"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Question & Rubric Management */}
                    <button
                      onClick={() => {
                        onSelectExam(exam.id);
                        onNavigateStage("rubric_management");
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition"
                      title="Manage questions and evaluation rubrics"
                    >
                      <ListOrdered className="w-4 h-4 text-indigo-400" />
                    </button>

                    {/* Delete Exam */}
                    <button
                      onClick={() => handleDeleteClick(exam)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete examination"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Set Active / Select Exam */}
                  <button
                    onClick={() => {
                      onSelectExam(exam.id);
                      showSweetToast(`"${exam.title}" is now the active exam for evaluation`, "info");
                    }}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      isActive
                        ? "bg-indigo-950 text-indigo-300 border border-indigo-700/50 cursor-default"
                        : "bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <span>Select for Grading</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exam Editor Modal (Create / Edit) */}
      <ExamEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialExam={editingExam}
        onSaveExam={handleSaveExam}
      />

      {/* Read-Only Quick Preview Modal */}
      {previewExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                    {previewExam.courseCode}
                  </span>
                  <h3 className="text-base font-bold text-white">{previewExam.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {previewExam.subject} • {previewExam.totalMarks} Total Marks • Passing: {previewExam.passingMarks} Marks
                </p>
              </div>
              <button
                onClick={() => setPreviewExam(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {previewExam.description && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <strong className="text-white block mb-0.5">Description:</strong>
                  {previewExam.description}
                </div>
              )}

              {previewExam.instructions?.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                  <strong className="text-white block mb-1">Candidate Instructions:</strong>
                  {previewExam.instructions.map((ins, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-400">
                      <span>•</span>
                      <span>{ins}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <strong className="text-white text-sm block">
                  Questions & Evaluation Rubrics ({previewExam.questions?.length || 0}):
                </strong>

                {previewExam.questions?.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">Question {q.questionNumber || idx + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {q.topic}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {q.difficulty}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-indigo-300">
                        {q.maxMarks} Marks
                      </span>
                    </div>

                    <p className="text-slate-200 leading-relaxed font-medium">
                      {q.questionText}
                    </p>

                    {q.modelAnswer && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        <strong className="text-indigo-400 block mb-1">Official Model Answer:</strong>
                        <p className="leading-relaxed text-slate-300">{q.modelAnswer}</p>
                      </div>
                    )}

                    {q.keyConcepts?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Evaluation Criteria ({q.keyConcepts.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.keyConcepts.map((kc, kIdx) => (
                            <div
                              key={kIdx}
                              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-850 text-[11px]"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-200 mb-0.5">
                                <span>{kc.concept}</span>
                                <span className="font-mono text-emerald-400 font-bold">{kc.weightMarks} M</span>
                              </div>
                              {kc.description && (
                                <p className="text-slate-400 text-[10px] mt-0.5">{kc.description}</p>
                              )}
                              {kc.synonyms && (
                                <span className="text-[10px] text-slate-500 italic block mt-1">
                                  Synonyms: {Array.isArray(kc.synonyms) ? kc.synonyms.join(", ") : kc.synonyms}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => {
                  setPreviewExam(null);
                  handleOpenEdit(previewExam);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit This Examination</span>
              </button>

              <button
                onClick={() => setPreviewExam(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
