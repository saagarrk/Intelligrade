import React, { useState } from "react";
import {
  BarChart3,
  GraduationCap,
  Users,
  BookOpen,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TeacherAcademicAnalytics } from "./TeacherAcademicAnalytics";
import { StudentAcademicAnalytics } from "./StudentAcademicAnalytics";
import {
  calculateClassAnalytics,
  calculateStudentAnalytics,
  COHORT_STUDENT_BASE
} from "../../utils/academicAnalyticsData";
import { showSweetToast } from "../../utils/sweetAlert";

export const AcademicAnalyticsModule = ({
  exams = [],
  submissions = [],
  selectedExamId = null,
  onSelectExam = null,
  initialViewMode = null // 'teacher' | 'student'
}) => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  // Selected Exam
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // View Mode: Teachers can toggle between Class View and Student Drilldown; Students default to Student View
  const [viewMode, setViewMode] = useState(
    initialViewMode || (isStudent ? "student" : "teacher")
  );

  // Selected Student for Individual Drilldown
  const [selectedStudentRoll, setSelectedStudentRoll] = useState(
    user?.rollNumber || "CS-2026-041"
  );

  // Computed Analytics Data
  const classAnalytics = calculateClassAnalytics(currentExam, submissions);
  const studentAnalytics = calculateStudentAnalytics(
    selectedStudentRoll,
    currentExam,
    submissions,
    exams
  );

  // Export Summary Handler
  const handleExportAnalytics = () => {
    showSweetToast({
      title: "Analytics Report Exported",
      text: `Academic insights for ${currentExam?.title || "Examination"} prepared successfully.`,
      icon: "success"
    });
  };

  // Handler when teacher clicks a student in roster or bucket
  const handleSelectStudentFromTeacher = (rollNumber) => {
    setSelectedStudentRoll(rollNumber);
    setViewMode("student");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" id="academic-analytics-module">
      {/* 1. Module Header with Context Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Academic Analytics Module
                </h1>
                <p className="text-xs text-slate-400">
                  {viewMode === "teacher"
                    ? "Class cohort performance, score distributions, topic mastery, and weak concepts."
                    : "Personal academic performance, score trends, topic mastery, and examination growth."}
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Exam Selector, Mode Switcher, Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Exam Selector Dropdown */}
            {exams.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={currentExam?.id || ""}
                  onChange={(e) => onSelectExam && onSelectExam(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id} className="bg-slate-900 text-white">
                      {exam.subject} ({exam.courseCode || "EXAM"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mode Switcher (For Teachers & Admins) */}
            {!isStudent && (
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewMode("teacher")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                    viewMode === "teacher"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Teacher Analytics</span>
                </button>
                <button
                  onClick={() => setViewMode("student")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                    viewMode === "student"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Analytics</span>
                </button>
              </div>
            )}

            {/* Student Dropdown when in Student View (Allows instructor to inspect any student) */}
            {!isStudent && viewMode === "student" && (
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500">Student:</span>
                <select
                  value={selectedStudentRoll}
                  onChange={(e) => setSelectedStudentRoll(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  {COHORT_STUDENT_BASE.map((st) => (
                    <option key={st.rollNumber} value={st.rollNumber} className="bg-slate-900 text-white">
                      {st.name} ({st.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Export Report */}
            <button
              onClick={handleExportAnalytics}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Exam Metadata Pill Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>{currentExam?.title}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>Subject: <strong className="text-slate-300">{currentExam?.subject}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Max Marks: <strong className="text-slate-300 font-mono">{currentExam?.totalMarks || 30} pts</strong></span>
          <span className="text-slate-600">•</span>
          <span>Passing Threshold: <strong className="text-slate-300 font-mono">{currentExam?.passingMarks || 15} pts</strong></span>
          <span className="text-slate-600">•</span>
          <span>Submissions Evaluated: <strong className="text-indigo-400 font-mono">{classAnalytics.totalSubmissions}</strong></span>
        </div>
      </div>

      {/* 2. Active Mode View */}
      {viewMode === "teacher" ? (
        <TeacherAcademicAnalytics
          analyticsData={classAnalytics}
          currentExam={currentExam}
          onSelectStudent={handleSelectStudentFromTeacher}
          onExportReport={handleExportAnalytics}
        />
      ) : (
        <StudentAcademicAnalytics
          studentAnalytics={studentAnalytics}
          currentExam={currentExam}
          onViewClassAnalytics={!isStudent ? () => setViewMode("teacher") : null}
        />
      )}
    </div>
  );
};
