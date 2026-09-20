import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorState = ({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  onRetry,
  retryLabel = "Retry Operation",
  className = ""
}) => {
  return (
    <div
      className={`p-6 rounded-xl bg-rose-950/20 border border-rose-900/40 text-center max-w-lg mx-auto my-6 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-200">
        {title}
      </h3>
      <p className="text-xs text-rose-300/80 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
