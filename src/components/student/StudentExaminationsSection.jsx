import React, { useState } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  FileUp,
  ChevronRight,
  Eye,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { StatusBadge } from "../HandwrittenUploadWorkflow";

export const StudentExaminationsSection = ({
  exams = [],
  submissions = [],
  currentExam = null,
  activeSubmission = null,
  onSelectExam = null,
  onSelectSubmission = null,
  onViewExamDetails = null,
  onSubmitPaper = null,
  onNavigateTab = null,
  user = null
}) => {
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'available' | 'upcoming' | 'submitted'
  const [searchQuery, setSearchQuery] = useState("");

  // Determine submitted exam IDs by student
  const studentRollNumber = user?.rollNumber || "CS-2026-041";
  const mySubmissions = submissions.filter(
    (s) =>
      s.studentRollNumber === studentRollNumber ||
      (s.studentName && s.studentName.toLowerCase().includes("aarav")) ||
      (s.studentName && s.studentName.toLowerCase().includes("alex"))
  );
  const submittedExamIds = new Set(mySubmissions.map((s) => s.examId));

  // Available Exams: published exams ready for submission or viewing
  const availableExams = exams.filter((e) => e.status !== "draft");

  // Upcoming Exams: scheduled exams (either future date or status marked upcoming/published)
  const upcomingExams = [
    {
      id: "upcoming_ml_401",
      title: "Machine Learning & Statistical Optimization",
      subject: "Computer Science",
      courseCode: "CS-401",
      examDate: "2026-10-02T10:00:00.000Z",
      durationMinutes: 120,
      totalMarks: 50,
      questionsCount: 4,
      topics: ["Kernel Methods", "Convex Optimization", "Expectation Maximization"],
      status: "Scheduled"
    },
    {
      id: "upcoming_cloud_302",
      title: "Distributed Systems & Cloud Computing",
      subject: "Software Systems",
      courseCode: "CS-302",
      examDate: "2026-10-12T14:00:00.000Z",
      durationMinutes: 90,
      totalMarks: 35,
      questionsCount: 3,
      topics: ["Paxos Consensus", "Raft State Machine", "CAP Theorem Analysis"],
      status: "Scheduled"
    }
  ];

  const filteredExams = availableExams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="student-examinations-section" className="space-y-6">
      {/* Section Header with Tabs & Search */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Examinations & Answer Papers Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse available examinations, view upcoming schedules, submit answer papers, and track evaluation status.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: "all", label: "All Examinations", count: availableExams.length + upcomingExams.length },
            { id: "available", label: "Available Now", count: availableExams.length },
            { id: "upcoming", label: "Upcoming", count: upcomingExams.length },
            { id: "submitted", label: "Submitted Papers", count: mySubmissions.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterTab === tab.id ? "bg-emerald-800 text-emerald-200" : "bg-slate-800 text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 1. AVAILABLE EXAMINATIONS */}
      {(filterTab === "all" || filterTab === "available") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available Examinations (Open for Paper Submission)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {filteredExams.length} examinations ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => {
              const isSelected = exam.id === currentExam?.id;
              const hasSubmitted = submittedExamIds.has(exam.id);
              const submissionRecord = mySubmissions.find((s) => s.examId === exam.id);

              return (
                <div
                  key={exam.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "bg-emerald-950/15 border-emerald-500/50 ring-1 ring-emerald-500/30"
                      : "bg-slate-900 border-slate-800 hover:border-slate-750"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {exam.courseCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {hasSubmitted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Submitted</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            Available Now
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{exam.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{exam.subject}</p>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {exam.description || "Comprehensive assessment covering curriculum topics and step-by-step problem solving."}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Total Marks</span>
                        <strong className="text-emerald-400 font-mono">{exam.totalMarks}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Duration</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{exam.durationMinutes || 90}m</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Questions</span>
                        <span>{exam.questions?.length || 3} Items</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onViewExamDetails && onViewExamDetails(exam)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1"
                      title="View examination instructions and blueprint"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Exam</span>
                    </button>

                    {hasSubmitted ? (
                      <button
                        onClick={() => {
                          if (onSelectExam) onSelectExam(exam.id);
                          if (submissionRecord && onSelectSubmission) onSelectSubmission(submissionRecord.id);
                          if (onNavigateTab) onNavigateTab("scorecard");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>View Results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSubmitPaper && onSubmitPaper(exam)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Submit Paper</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. UPCOMING EXAMINATIONS */}
      {(filterTab === "all" || filterTab === "upcoming") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Upcoming Examinations (Scheduled on Academic Calendar)</span>
            </h3>
            <span className="text-[11px] text-slate-400">{upcomingExams.length} upcoming</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((upcoming) => (
              <div
                key={upcoming.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {upcoming.courseCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Starts in 3 days</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{upcoming.title}</h4>
                    <p className="text-xs text-slate-400">{upcoming.subject}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Syllabus Scope:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {upcoming.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(upcoming.examDate).toLocaleDateString()} at 10:00 AM</span>
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">
                      {upcoming.totalMarks} Marks • {upcoming.durationMinutes} Mins
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Online submissions will open 15 mins prior
                  </span>
                  <button
                    onClick={() => {
                      if (onViewExamDetails) {
                        onViewExamDetails({
                          ...upcoming,
                          description: `Scheduled examination on ${upcoming.title}. Prepare key derivations and algorithms.`,
                          instructions: [
                            "Arrive on time or ensure high-speed internet for electronic handwritten upload.",
                            "Keep your official student ID card visible.",
                            "Maximum duration strictly enforced by exam timer."
                          ],
                          questions: upcoming.topics.map((t, idx) => ({
                            id: `q_${idx}`,
                            questionNumber: idx + 1,
                            questionText: `Analytical derivation and problem solving on ${t}.`,
                            maxMarks: Math.round(upcoming.totalMarks / upcoming.topics.length),
                            topic: t,
                            difficulty: "Medium"
                          }))
                        });
                      }
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Guidelines →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUBMITTED EXAMINATIONS */}
      {(filterTab === "all" || filterTab === "submitted") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Submitted Examinations & Answer Sheets</span>
            </h3>
            <span className="text-[11px] text-slate-400">{mySubmissions.length} papers on record</span>
          </div>

          <div className="space-y-3">
            {mySubmissions.map((sub) => {
              const exam = exams.find((e) => e.id === sub.examId) || currentExam;
              const isSelected = sub.id === activeSubmission?.id;

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    if (onSelectExam) onSelectExam(exam.id);
                    if (onSelectSubmission) onSelectSubmission(sub.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500/50 ring-1 ring-cyan-500/30"
                      : "bg-slate-900/90 border-slate-800 hover:border-slate-750"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {exam.courseCode}
                        </span>
                        <h4 className="text-sm font-bold text-white">{exam.title}</h4>
                        {isSelected && (
                          <span className="text-[10px] text-cyan-400 font-bold">● Active</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Roll: <strong className="text-slate-300 font-mono">{sub.studentRollNumber}</strong> • Submitted on {new Date(sub.submissionDate).toLocaleString()} • {sub.pageCount || 3} pages scanned
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-emerald-400">
                          {sub.totalAwardedMarks} / {sub.totalMaxMarks} Marks
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          ({sub.percentageScore}%)
                        </span>
                      </div>
                      <StatusBadge status={sub.status || "Graded"} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Evaluation Status: <strong className="text-slate-300">{sub.status || "Graded"}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectExam) onSelectExam(exam.id);
                          if (onSelectSubmission) onSelectSubmission(sub.id);
                          if (onNavigateTab) onNavigateTab("tracking");
                        }}
                        className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1"
                      >
                        <span>Track Evaluation</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectExam) onSelectExam(exam.id);
                          if (onSelectSubmission) onSelectSubmission(sub.id);
                          if (onNavigateTab) onNavigateTab("questions");
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <span>View Marks & Feedback</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
