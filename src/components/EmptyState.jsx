import React from "react";
import { FolderOpen, Search, FileQuestion, ArrowRight } from "lucide-react";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There are currently no items matching your criteria.",
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ""
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center justify-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-center mb-3.5 shadow-inner">
        <Icon className="w-6 h-6 text-slate-300" />
      </div>
      <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2.5 mt-5">
          {secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && (
            <button
              onClick={onAction}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
