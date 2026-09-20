import {
  BookOpen,
  CheckCircle2,
  FileText,
  Clock,
  FileCheck2,
  AlertTriangle,
  TrendingUp,
  Award
} from "lucide-react";

export const TeacherDashboardMetrics = ({
  totalExams,
  activeExams,
  totalSubmissions,
  awaitingEvaluation,
  evaluatedCount,
  requiringReview,
  averageScore,
  passPercentage,
  activeCourseCode
}) => {
  const metrics = [
    {
      id: "metric-total-exams",
      title: "Total Examinations",
      value: totalExams,
      subtitle: `${activeExams} active in curriculum`,
      icon: BookOpen,
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      badge: "Curriculum"
    },
    {
      id: "metric-active-exams",
      title: "Active Examinations",
      value: activeExams,
      subtitle: `${totalExams - activeExams} in draft / archived`,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      badge: "Published"
    },
    {
      id: "metric-total-submissions",
      title: "Total Submissions",
      value: totalSubmissions,
      subtitle: `Course: ${activeCourseCode || "All Courses"}`,
      icon: FileText,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      badge: "Student Scripts"
    },
    {
      id: "metric-awaiting-eval",
      title: "Awaiting Evaluation",
      value: awaitingEvaluation,
      subtitle: awaitingEvaluation > 0 ? "Ready for AI grading run" : "All current papers processed",
      icon: Clock,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      badge: awaitingEvaluation > 0 ? "Queue" : "Clear"
    },
    {
      id: "metric-papers-evaluated",
      title: "Papers Evaluated",
      value: evaluatedCount,
      subtitle: `${Math.round((evaluatedCount / (totalSubmissions || 1)) * 100)}% completion rate`,
      icon: FileCheck2,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      badge: "Graded"
    },
    {
      id: "metric-requiring-review",
      title: "Papers Requiring Review",
      value: requiringReview,
      subtitle: requiringReview > 0 ? "Appeals or flagged answers" : "No pending instructor reviews",
      icon: AlertTriangle,
      iconColor: requiringReview > 0 ? "text-rose-400" : "text-slate-400",
      bgColor: requiringReview > 0 ? "bg-rose-500/10" : "bg-slate-800/40",
      borderColor: requiringReview > 0 ? "border-rose-500/30" : "border-slate-700/60",
      badge: requiringReview > 0 ? "Attention" : "Verified"
    },
    {
      id: "metric-average-score",
      title: "Average Class Score",
      value: `${averageScore}%`,
      subtitle: "Benchmark target: 75%",
      icon: TrendingUp,
      iconColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      badge: averageScore >= 75 ? "Target Met" : "Monitoring"
    },
    {
      id: "metric-pass-percentage",
      title: "Pass Percentage",
      value: `${passPercentage}%`,
      subtitle: "Pass criterion: ≥ 50% score",
      icon: Award,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      badge: passPercentage >= 80 ? "High Mastery" : "Standard"
    }
  ];

  return (
    <section aria-label="Key Performance Indicators" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Executive Performance Metrics
        </h2>
        <span className="text-[11px] text-slate-400">
          Active Scope: <strong className="text-slate-200">{activeCourseCode || "Curriculum"}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {item.title}
                </span>
                <span className={`p-1.5 rounded-lg ${item.bgColor} ${item.borderColor} border`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </span>
              </div>

              <div className="my-2.5">
                <div className="text-2xl font-bold font-mono tracking-tight text-white">
                  {item.value}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 truncate mr-2">
                  {item.subtitle}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {item.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
