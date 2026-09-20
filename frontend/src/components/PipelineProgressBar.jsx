import {
  Sliders,
  Cpu,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ArrowRight,
  Check,
  Activity
} from "lucide-react";
const CORE_PIPELINE_STAGES = [
  {
    id: "preprocessing",
    stepNumber: 1,
    label: "Preprocessing",
    shortLabel: "Scan Prep",
    description: "Noise filter, deskew & Otsu binarization",
    icon: Sliders
  },
  {
    id: "digitization",
    stepNumber: 2,
    label: "Digitization",
    shortLabel: "OCR / Vision",
    description: "Handwriting text & diagram recognition",
    icon: Cpu
  },
  {
    id: "grading",
    stepNumber: 3,
    label: "Grading",
    shortLabel: "AI Evaluation",
    description: "Semantic NLP & rubric marks allocation",
    icon: CheckCircle2
  },
  {
    id: "insights",
    stepNumber: 4,
    label: "Insights",
    shortLabel: "Analytics",
    description: "Score distribution & student feedback",
    icon: BarChart3
  }
];
export const PipelineProgressBar = ({
  activeTab,
  onSelectTab,
  progressState,
  isProcessing = false
}) => {
  const isExecuting = isProcessing || !!progressState?.isExecuting;
  const getStageIndex = (tab) => {
    switch (tab) {
      case "preprocessing":
        return 0;
      case "digitization":
        return 1;
      case "grading":
        return 2;
      case "insights":
        return 3;
      default:
        return -1;
    }
  };
  const currentActiveIndex = isExecuting ? progressState?.stageIndex ?? 0 : getStageIndex(activeTab);
  const percentage = isExecuting ? progressState?.percentage ?? Math.max(15, (currentActiveIndex + 1) * 25) : currentActiveIndex >= 0 ? (currentActiveIndex + 1) * 25 : 0;
  return <div
    id="header-pipeline-progress-container"
    className="w-full bg-[#0d0d10] border-b border-[#222227] px-4 sm:px-6 lg:px-8 py-2 relative overflow-hidden select-none"
  >
      {
    /* Background Subtle Ambient Glow during execution */
  }
      {isExecuting && <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 animate-pulse pointer-events-none" />}

      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {
    /* Top Info Row during execution or compact info */
  }
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isExecuting ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse" : "bg-zinc-800 text-zinc-300 border border-zinc-700"}`}>
              {isExecuting ? <>
                  <Activity className="w-3 h-3 animate-spin text-amber-400" />
                  <span>Pipeline Executing</span>
                </> : <>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Grading Pipeline</span>
                </>}
            </span>

            <span className="text-zinc-400 text-[11px] truncate max-w-xs sm:max-w-md">
              {isExecuting && progressState?.stageMessage ? <span className="text-indigo-300 font-medium">{progressState.stageMessage}</span> : <span>
                  Sequential Workflow: <strong className="text-zinc-200">Preprocessing</strong> → <strong className="text-zinc-200">Digitization</strong> → <strong className="text-zinc-200">Grading</strong> → <strong className="text-zinc-200">Insights</strong>
                </span>}
            </span>
          </div>

          {
    /* Real-time Percentage Indicator */
  }
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-zinc-400 text-[11px] hidden sm:inline">Stage Progress:</span>
            <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${isExecuting ? "bg-indigo-600 text-white shadow-sm" : "bg-zinc-800 text-zinc-200 border border-zinc-700"}`}>
              {percentage}%
            </span>
          </div>
        </div>

        {
    /* The Linear Progress Bar Track */
  }
        <div className="relative w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/60 shadow-inner">
          <div
    className={`h-full transition-all duration-500 ease-out rounded-full ${isExecuting ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.7)]" : "bg-gradient-to-r from-indigo-500 to-emerald-500"}`}
    style={{ width: `${percentage}%` }}
  />
        </div>

        {
    /* 4 Stage Checkpoint Step Markers */
  }
        <div className="grid grid-cols-4 gap-2 pt-0.5">
          {CORE_PIPELINE_STAGES.map((stage, idx) => {
    const Icon = stage.icon;
    const isCompleted = isExecuting ? idx < currentActiveIndex : currentActiveIndex >= 0 && idx < currentActiveIndex;
    const isCurrent = isExecuting ? idx === currentActiveIndex : activeTab === stage.id;
    return <button
      key={stage.id}
      id={`progress-stage-${stage.id}`}
      onClick={() => !isExecuting && onSelectTab(stage.id)}
      disabled={isExecuting}
      className={`group text-left flex items-center space-x-2 p-1.5 rounded-lg transition-all ${isCurrent ? "bg-indigo-950/60 border border-indigo-500/50 shadow-sm" : isCompleted ? "hover:bg-zinc-800/60 text-zinc-300" : "hover:bg-zinc-800/30 text-zinc-500 opacity-80"}`}
      title={`Stage ${stage.stepNumber}: ${stage.label} - ${stage.description}`}
    >
                {
      /* Step Circle Indicator */
    }
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${isCompleted ? "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]" : isCurrent ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0d0d10] animate-pulse" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stage.stepNumber}
                </div>

                {
      /* Stage Title & Short Description */
    }
                <div className="min-w-0 flex-1 hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <Icon className={`w-3 h-3 shrink-0 ${isCurrent ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span className={`text-[11px] font-semibold truncate ${isCurrent ? "text-white" : isCompleted ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                      {stage.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500 truncate hidden md:block">
                    {stage.shortLabel}
                  </p>
                </div>

                {
      /* Mobile Single-word Label */
    }
                <span className="text-[10px] font-medium truncate sm:hidden block">
                  {stage.shortLabel}
                </span>

                {
      /* Trailing arrow between steps */
    }
                {idx < 3 && <ArrowRight className="w-2.5 h-2.5 text-zinc-600 hidden lg:block shrink-0 ml-auto opacity-50" />}
              </button>;
  })}
        </div>
      </div>
    </div>;
};
