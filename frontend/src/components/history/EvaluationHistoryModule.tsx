import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Calendar,
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  HelpCircle
} from "lucide-react";
import {
  buildUnifiedEvaluationHistory,
  EvaluationRecord,
  getStatusTheme
} from "../../utils/evaluationHistoryData";
import { DetailedEvaluationModal } from "./DetailedEvaluationModal";
import { showSweetToast } from "../../utils/sweetAlert";

interface EvaluationHistoryModuleProps {
  submissions?: any[];
  exams?: any[];
  isStudent?: boolean;
  currentUser?: {
    name?: string;
    rollNumber?: string;
    email?: string;
    role?: string;
  };
  onNavigateStage?: (stage: string) => void;
  onSelectSubmission?: (submissionId: string) => void;
  onSelectExam?: (examId: string) => void;
  onOpenAppealModal?: (evaluation: EvaluationRecord) => void;
}

export const EvaluationHistoryModule: React.FC<EvaluationHistoryModuleProps> = ({
  submissions = [],
  exams = [],
  isStudent = false,
  currentUser,
  onNavigateStage,
  onSelectSubmission,
  onSelectExam,
  onOpenAppealModal
}) => {
  // 1. Build unified historical evaluations list
  const allEvaluations = useMemo(() => {
    return buildUnifiedEvaluationHistory(submissions, exams);
  }, [submissions, exams]);

  // Determine current student roll number if student view
  const studentRollNumber = currentUser?.rollNumber || "CS-2026-041";

  // 2. Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  // If student, default student filter to their roll number, but allow clearing if demoing
  const [selectedStudent, setSelectedStudent] = useState<string>(isStudent ? studentRollNumber : "all");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedScoreBracket, setSelectedScoreBracket] = useState<string>("all");
  const [minScoreInput, setMinScoreInput] = useState<string>("");
  const [maxScoreInput, setMaxScoreInput] = useState<string>("");
  
  // Quick drawer for advanced filters on mobile
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 3. Sorting State
  const [sortField, setSortField] = useState<"date" | "score" | "student" | "exam" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 4. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // 5. Detailed View Modal State
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Extract unique filter dropdown choices
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { name: string; rollNumber: string }>();
    allEvaluations.forEach((e) => {
      if (!map.has(e.studentRollNumber)) {
        map.set(e.studentRollNumber, { name: e.studentName, rollNumber: e.studentRollNumber });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allEvaluations]);

  const uniqueExams = useMemo(() => {
    const map = new Map<string, { id: string; title: string; courseCode: string }>();
    allEvaluations.forEach((e) => {
      if (!map.has(e.examId)) {
        map.set(e.examId, { id: e.examId, title: e.examTitle, courseCode: e.courseCode });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [allEvaluations]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    allEvaluations.forEach((e) => {
      if (e.subject) set.add(e.subject);
    });
    return Array.from(set).sort();
  }, [allEvaluations]);

  // Compute active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (selectedStudent !== "all") count++;
    if (selectedExam !== "all") count++;
    if (selectedSubject !== "all") count++;
    if (selectedDateRange !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedScoreBracket !== "all" || minScoreInput !== "" || maxScoreInput !== "") count++;
    return count;
  }, [
    searchTerm,
    selectedStudent,
    selectedExam,
    selectedSubject,
    selectedDateRange,
    selectedStatus,
    selectedScoreBracket,
    minScoreInput,
    maxScoreInput
  ]);

  // Handle Clear All Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedStudent(isStudent ? studentRollNumber : "all");
    setSelectedExam("all");
    setSelectedSubject("all");
    setSelectedDateRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedStatus("all");
    setSelectedScoreBracket("all");
    setMinScoreInput("");
    setMaxScoreInput("");
    setCurrentPage(1);
    showSweetToast("All filters have been reset", "info");
  };

  // 6. Filtering Logic
  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter((item) => {
      // Search term (name, roll, exam title, subject, evaluator)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          item.studentName.toLowerCase().includes(query) ||
          item.studentRollNumber.toLowerCase().includes(query) ||
          item.examTitle.toLowerCase().includes(query) ||
          item.subject.toLowerCase().includes(query) ||
          item.courseCode.toLowerCase().includes(query) ||
          item.evaluator.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Student filter
      if (selectedStudent !== "all") {
        if (item.studentRollNumber !== selectedStudent && item.studentName !== selectedStudent) {
          return false;
        }
      }

      // Examination filter
      if (selectedExam !== "all") {
        if (item.examId !== selectedExam && item.examTitle !== selectedExam) {
          return false;
        }
      }

      // Subject filter
      if (selectedSubject !== "all") {
        if (item.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "all") {
        if (selectedStatus === "Evaluated" && item.status !== "Evaluated") return false;
        if (selectedStatus === "Under Review" && item.status !== "Under Review") return false;
        if (selectedStatus === "AI Evaluated" && item.status !== "AI Evaluated") return false;
        if (selectedStatus === "Flagged / Appeal" && item.status !== "Flagged / Appeal") return false;
        if (selectedStatus === "Processing" && item.status !== "Processing") return false;
      }

      // Score range filter
      const minScore = minScoreInput !== "" ? parseFloat(minScoreInput) : null;
      const maxScore = maxScoreInput !== "" ? parseFloat(maxScoreInput) : null;

      if (minScore !== null && !isNaN(minScore) && item.percentageScore < minScore) {
        return false;
      }
      if (maxScore !== null && !isNaN(maxScore) && item.percentageScore > maxScore) {
        return false;
      }

      if (selectedScoreBracket !== "all") {
        if (selectedScoreBracket === "90-100" && (item.percentageScore < 90 || item.percentageScore > 100)) return false;
        if (selectedScoreBracket === "80-89" && (item.percentageScore < 80 || item.percentageScore >= 90)) return false;
        if (selectedScoreBracket === "70-79" && (item.percentageScore < 70 || item.percentageScore >= 80)) return false;
        if (selectedScoreBracket === "60-69" && (item.percentageScore < 60 || item.percentageScore >= 70)) return false;
        if (selectedScoreBracket === "below-60" && item.percentageScore >= 60) return false;
      }

      // Date range filter
      if (selectedDateRange !== "all") {
        const itemDate = new Date(item.evaluationDate).getTime();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (selectedDateRange === "last-7-days") {
          if (now - itemDate > 7 * oneDay) return false;
        } else if (selectedDateRange === "last-30-days") {
          if (now - itemDate > 30 * oneDay) return false;
        } else if (selectedDateRange === "last-90-days") {
          if (now - itemDate > 90 * oneDay) return false;
        } else if (selectedDateRange === "this-semester") {
          // Fall 2026: after July 1st 2026
          const semesterStart = new Date("2026-07-01").getTime();
          if (itemDate < semesterStart) return false;
        } else if (selectedDateRange === "custom") {
          if (customStartDate) {
            const start = new Date(customStartDate).getTime();
            if (itemDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate).getTime() + oneDay;
            if (itemDate > end) return false;
          }
        }
      }

      return true;
    });
  }, [
    allEvaluations,
    searchTerm,
    selectedStudent,
    selectedExam,
    selectedSubject,
    selectedDateRange,
    customStartDate,
    customEndDate,
    selectedStatus,
    selectedScoreBracket,
    minScoreInput,
    maxScoreInput
  ]);

  // 7. Sorting Logic
  const sortedEvaluations = useMemo(() => {
    const list = [...filteredEvaluations];
    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime();
      } else if (sortField === "score") {
        comparison = a.percentageScore - b.percentageScore;
      } else if (sortField === "student") {
        comparison = a.studentName.localeCompare(b.studentName);
      } else if (sortField === "exam") {
        comparison = a.examTitle.localeCompare(b.examTitle);
      } else if (sortField === "status") {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredEvaluations, sortField, sortDirection]);

  // 8. Pagination Logic
  const totalItems = sortedEvaluations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedEvaluations = sortedEvaluations.slice(startIndex, startIndex + itemsPerPage);

  // Quick summary numbers
  const summaryStats = useMemo(() => {
    const count = sortedEvaluations.length;
    if (count === 0) {
      return { count: 0, avgScore: 0, passRate: 0, inReviewCount: 0, appealsCount: 0 };
    }
    const totalScore = sortedEvaluations.reduce((sum, e) => sum + e.percentageScore, 0);
    const passedCount = sortedEvaluations.filter((e) => e.passed).length;
    const inReviewCount = sortedEvaluations.filter((e) => e.status === "Under Review" || e.status === "AI Evaluated").length;
    const appealsCount = sortedEvaluations.filter((e) => e.appeal || e.status === "Flagged / Appeal").length;

    return {
      count,
      avgScore: Number((totalScore / count).toFixed(1)),
      passRate: Number(((passedCount / count) * 100).toFixed(1)),
      inReviewCount,
      appealsCount
    };
  }, [sortedEvaluations]);

  // Toggle sort direction or change sort field
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Open detailed view modal
  const handleViewDetails = (evaluation: EvaluationRecord) => {
    setSelectedEvaluation(evaluation);
    setIsDetailModalOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "Evaluation ID",
        "Student Name",
        "Roll Number",
        "Examination Title",
        "Subject",
        "Course Code",
        "Evaluation Date",
        "Awarded Marks",
        "Max Marks",
        "Percentage",
        "Grade",
        "Status",
        "Evaluator"
      ];
      const rows = sortedEvaluations.map((e) => [
        `"${e.id}"`,
        `"${e.studentName}"`,
        `"${e.studentRollNumber}"`,
        `"${e.examTitle}"`,
        `"${e.subject}"`,
        `"${e.courseCode}"`,
        `"${e.evaluationFormattedDate}"`,
        e.totalAwardedMarks,
        e.totalMaxMarks,
        `${e.percentageScore}%`,
        `"${e.letterGrade}"`,
        `"${e.statusLabel}"`,
        `"${e.evaluator.name}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `IntelliGrade_Evaluation_History_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSweetToast(`Exported ${sortedEvaluations.length} evaluation records to CSV`, "success");
    } catch (e) {
      console.error(e);
      showSweetToast("Failed to export CSV file", "error");
    }
  };

  return (
    <div id="evaluation-history-module-root" className="space-y-6 animate-fadeIn">
      {/* 1. Module Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isStudent ? "My Evaluation History" : "Evaluation History & Paper Records"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {isStudent
                  ? "Access your past examination evaluations, rubrics, feedback, and certified scorecards."
                  : "Comprehensive archive of all student evaluations across subjects, dates, and examinations."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Filter Clear */}
          {activeFiltersCount > 0 && (
            <button
              id="btn-clear-all-filters"
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-700/60"
              title="Reset all active search and filter criteria"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Filters ({activeFiltersCount})</span>
            </button>
          )}

          <button
            id="btn-export-evaluations-csv"
            onClick={handleExportCSV}
            disabled={sortedEvaluations.length === 0}
            className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-neutral-700 disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV ({sortedEvaluations.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Statistical KPI Tiles for Current Filter Set */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Evaluations Count</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summaryStats.count}</span>
            <span className="text-xs text-neutral-500">records</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{summaryStats.avgScore}%</span>
            <span className="text-xs text-neutral-500">mean score</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Passing Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400">{summaryStats.passRate}%</span>
            <span className="text-xs text-neutral-500">threshold ≥ 40%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>In-Review / Appeals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {summaryStats.inReviewCount + summaryStats.appealsCount}
            </span>
            <span className="text-xs text-neutral-500">pending resolution</span>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md space-y-4">
        {/* Search row and mobile filter toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              id="input-search-evaluations"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, roll number, exam title, subject, course code, evaluator..."
              className="w-full pl-9 pr-8 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden px-3 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 border border-neutral-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>
        </div>

        {/* Desktop Filter Row 1: Student, Exam, Subject, Status */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showMobileFilters ? "block" : "hidden md:grid"}`}>
          {/* Filter: Student */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5 flex items-center justify-between">
              <span>Student</span>
              {isStudent && (
                <span className="text-[10px] text-indigo-400 font-semibold">(Default: My Records)</span>
              )}
            </label>
            <select
              id="filter-student-select"
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Students ({uniqueStudents.length})</option>
              {uniqueStudents.map((s) => (
                <option key={s.rollNumber} value={s.rollNumber}>
                  {s.name} ({s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Examination */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">Examination</label>
            <select
              id="filter-exam-select"
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Examinations ({uniqueExams.length})</option>
              {uniqueExams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.courseCode}: {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Subject */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">Subject</label>
            <select
              id="filter-subject-select"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Subjects ({uniqueSubjects.length})</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Status */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">Evaluation Status</label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Evaluated">Evaluated & Finalized</option>
              <option value="Under Review">Teacher In-Review</option>
              <option value="AI Evaluated">AI Evaluated (Pending)</option>
              <option value="Flagged / Appeal">Flagged / Appeal Filed</option>
              <option value="Processing">Processing OCR</option>
            </select>
          </div>
        </div>

        {/* Desktop Filter Row 2: Date & Score Range */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-neutral-800/60 ${showMobileFilters ? "block" : "hidden md:grid"}`}>
          {/* Filter: Date Range */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">Evaluation Date Range</label>
            <select
              id="filter-date-range-select"
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="this-semester">This Semester (Fall 2026)</option>
              <option value="custom">Custom Date Range...</option>
            </select>

            {selectedDateRange === "custom" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300"
                  placeholder="Start"
                />
                <span className="text-neutral-500 text-xs">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-1/2 px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300"
                  placeholder="End"
                />
              </div>
            )}
          </div>

          {/* Filter: Score Bracket */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">Score Bracket</label>
            <select
              id="filter-score-bracket-select"
              value={selectedScoreBracket}
              onChange={(e) => {
                setSelectedScoreBracket(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Score Brackets</option>
              <option value="90-100">Top Tier (90% – 100%)</option>
              <option value="80-89">High Merit (80% – 89%)</option>
              <option value="70-79">Proficient (70% – 79%)</option>
              <option value="60-69">Passing (60% – 69%)</option>
              <option value="below-60">Needs Support (&lt; 60%)</option>
            </select>
          </div>

          {/* Filter: Precision Min/Max Score Inputs */}
          <div>
            <label className="text-[11px] font-bold text-neutral-400 block mb-1.5">
              Precision Score Range (%)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minScoreInput}
                  onChange={(e) => {
                    setMinScoreInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Min %"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-neutral-500 text-xs font-bold">—</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={maxScoreInput}
                  onChange={(e) => {
                    setMaxScoreInput(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Max %"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
            <span className="text-neutral-500 font-medium">Active filters:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Search: "{searchTerm}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </span>
            )}

            {selectedStudent !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Student: {selectedStudent}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStudent("all")} />
              </span>
            )}

            {selectedExam !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Exam: {uniqueExams.find((e) => e.id === selectedExam)?.courseCode || selectedExam}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedExam("all")} />
              </span>
            )}

            {selectedSubject !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Subject: {selectedSubject}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubject("all")} />
              </span>
            )}

            {selectedStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus("all")} />
              </span>
            )}

            {selectedScoreBracket !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Bracket: {selectedScoreBracket}%
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedScoreBracket("all")} />
              </span>
            )}

            {(minScoreInput !== "" || maxScoreInput !== "") && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Range: {minScoreInput || "0"}% - {maxScoreInput || "100"}%
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setMinScoreInput("");
                    setMaxScoreInput("");
                  }}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. Table Header Sorting Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs">
        <div className="text-neutral-400">
          Showing <strong className="text-white">{Math.min(startIndex + 1, totalItems)}</strong> to{" "}
          <strong className="text-white">{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of{" "}
          <strong className="text-white">{totalItems}</strong> evaluation records
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Sort by:</span>
            <select
              id="select-sort-field"
              value={sortField}
              onChange={(e) => handleSort(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <option value="date">Evaluation Date</option>
              <option value="score">Score Percentage</option>
              <option value="student">Student Name</option>
              <option value="exam">Examination Title</option>
              <option value="status">Status</option>
            </select>

            <button
              onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
              title={`Order: ${sortDirection === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Per page:</span>
            <select
              id="select-items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Evaluations Data Table */}
      {paginatedEvaluations.length > 0 ? (
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Examination & Subject</th>
                  <th className="py-3.5 px-4">Evaluation Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Marks & Score</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {paginatedEvaluations.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      id={`eval-row-${item.id}`}
                      className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                      onClick={() => handleViewDetails(item)}
                    >
                      {/* Student Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.avatarColor} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}
                          >
                            {item.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">
                              {item.studentName}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono font-medium block">
                              {item.studentRollNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Examination & Subject Column */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-neutral-200 block line-clamp-1">{item.examTitle}</span>
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-indigo-400 font-mono font-semibold">{item.courseCode}</span>
                            <span>•</span>
                            <span>{item.subject}</span>
                          </span>
                        </div>
                      </td>

                      {/* Evaluation Date Column */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-300">
                          <span className="block font-medium">{item.evaluationFormattedDate}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {item.id}</span>
                        </div>
                      </td>

                      {/* Status Column with High-Visibility Pill */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.statusBadgeColor.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.statusBadgeColor.dot}`} />
                          <span>{item.statusLabel}</span>
                        </span>
                        {item.appeal && (
                          <span className="block text-[10px] text-rose-400 mt-1 font-semibold">
                            Appeal Filed (Q{item.appeal.questionNumber})
                          </span>
                        )}
                      </td>

                      {/* Score Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-white">
                            {item.totalAwardedMarks}{" "}
                            <span className="text-neutral-500 text-xs font-normal">/ {item.totalMaxMarks}</span>
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              item.percentageScore >= 80
                                ? "text-emerald-400"
                                : item.percentageScore >= 60
                                ? "text-amber-400"
                                : "text-rose-400"
                            }`}
                          >
                            {item.percentageScore}%
                          </span>
                        </div>
                      </td>

                      {/* Grade Column */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                            item.passed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {item.letterGrade}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-result-eval-${item.id}`}
                            onClick={() => {
                              if (onSelectSubmission) onSelectSubmission(item.submissionId);
                              if (onSelectExam) onSelectExam(item.examId);
                              if (onNavigateStage) onNavigateStage("result_generation");
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                            title="Generate and view official result scorecard & download PDF"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden lg:inline">Result</span>
                          </button>

                          <button
                            id={`btn-view-eval-${item.id}`}
                            onClick={() => handleViewDetails(item)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-neutral-700/60"
                            title="Inspect detailed evaluation breakdown, rubrics, similarity, and feedback"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-neutral-400">
              Page <strong className="text-white">{safeCurrentPage}</strong> of{" "}
              <strong className="text-white">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-pagination-prev"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Display up to 5 nearby pages
                    return Math.abs(page - safeCurrentPage) <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, pIdx, arr) => {
                    const isCurrent = page === safeCurrentPage;
                    const prevVal = arr[pIdx - 1];
                    const hasGap = prevVal && page - prevVal > 1;

                    return (
                      <React.Fragment key={page}>
                        {hasGap && <span className="px-1 text-neutral-600">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isCurrent
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                id="btn-pagination-next"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700 mx-auto flex items-center justify-center text-neutral-400">
            <Filter className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Matching Evaluations Found</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              There are no evaluation records matching your current combination of student, examination, subject, date,
              status, or score range filters.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Search & Filter Criteria</span>
          </button>
        </div>
      )}

      {/* 6. Detailed Evaluation View Modal */}
      <DetailedEvaluationModal
        evaluation={selectedEvaluation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isStudent={isStudent}
        onOpenGradingWorkspace={(submissionId, examId) => {
          if (onSelectSubmission) onSelectSubmission(submissionId);
          if (onSelectExam) onSelectExam(examId);
          if (onNavigateStage) onNavigateStage("grading");
        }}
        onOpenResultPage={(submissionId, examId) => {
          if (onSelectSubmission) onSelectSubmission(submissionId);
          if (onSelectExam) onSelectExam(examId);
          if (onNavigateStage) onNavigateStage("result_generation");
        }}
        onOpenAppealModal={(evalRecord) => {
          if (onOpenAppealModal) onOpenAppealModal(evalRecord);
        }}
      />
    </div>
  );
};
