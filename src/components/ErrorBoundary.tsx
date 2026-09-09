import React, { ReactNode } from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  Home, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  ServerCrash
} from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKey?: string | number;
  onResetToDashboard?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('IntelliGrade Global Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.resetError();
    }
  }

  public resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false
    });
  };

  public handleCopyDiagnostics = (): void => {
    const { error, errorInfo } = this.state;
    const diagnosticText = `IntelliGrade Runtime Diagnostic:
Error: ${error?.name}: ${error?.message}
Stack:
${error?.stack || 'No stack trace'}
Component Trace:
${errorInfo?.componentStack || 'No component stack'}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}`;

    navigator.clipboard.writeText(diagnosticText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public handleGoBackToSafety = (): void => {
    this.resetError();
    if (this.props.onResetToDashboard) {
      this.props.onResetToDashboard();
    } else {
      // Fallback: reload to reset state cleanly
      window.location.hash = '';
    }
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo, showDetails, copied } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error || new Error('Unknown Error'), this.resetError);
      }
      return fallback;
    }

    const isServerResponseError = error?.message.toLowerCase().includes('server') ||
      error?.message.toLowerCase().includes('status') ||
      error?.message.toLowerCase().includes('fetch') ||
      error?.message.toLowerCase().includes('500') ||
      error?.message.toLowerCase().includes('network') ||
      error?.message.toLowerCase().includes('json');

    return (
      <div className="min-h-[460px] w-full flex items-center justify-center p-4 sm:p-6 my-6 animate-fadeIn">
        {/* Elegant Dark Card Container */}
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Subtle Top Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-amber-400 flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                  Resilient Recovery Shield
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-100 mt-2">
                Something unexpected happened
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                The IntelliGrade recovery engine contained this exception to protect your exam session and grading rubrics.
              </p>
            </div>
          </div>

          {/* Diagnostic Error Details Box */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 mb-6 text-xs font-mono text-zinc-300">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-800/80 pb-2 mb-2">
              <span className="flex items-center gap-1.5 font-sans font-medium text-zinc-400">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                Error Description
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">auto-isolated</span>
            </div>
            <p className="text-rose-300 font-medium break-words leading-normal">
              {error?.name || 'Error'}: {error?.message || 'An unknown runtime error occurred.'}
            </p>
          </div>

          {/* Primary Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary 'Go back to safety' button */}
            <button
              id="error-boundary-safety-btn"
              onClick={this.handleGoBackToSafety}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Go back to safety</span>
            </button>

            {/* Secondary 'Retry Action' button */}
            <button
              id="error-boundary-retry-btn"
              onClick={this.resetError}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-zinc-700/80 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Retry Pipeline</span>
            </button>

            {/* Copy Diagnostics button */}
            <button
              id="error-boundary-copy-btn"
              onClick={this.handleCopyDiagnostics}
              className="px-3.5 py-2.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-zinc-800 transition"
              title="Copy error details for reporting"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Diagnostics</span>
                </>
              )}
            </button>

            {/* Toggle Stack Trace */}
            <button
              id="error-boundary-toggle-trace-btn"
              onClick={() => this.setState({ showDetails: !showDetails })}
              className="ml-auto px-3 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1 transition"
            >
              <span>{showDetails ? 'Hide Stack Trace' : 'View Stack Trace'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Technical Stack Trace */}
          {showDetails && (
            <div className="mt-5 pt-4 border-t border-zinc-800/80 animate-fadeIn">
              <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                <span>Diagnostic Stack Trace</span>
                <span className="text-[10px] font-mono text-zinc-500">Component Hierarchy</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 max-h-48 overflow-y-auto text-[11px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {error?.stack || 'No stack trace available.'}
                {errorInfo?.componentStack && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 text-zinc-500">
                    <strong className="text-zinc-400 font-sans block mb-1">React Component Trace:</strong>
                    {errorInfo.componentStack}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }
}
