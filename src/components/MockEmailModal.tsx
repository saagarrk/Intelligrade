import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  Send, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MockEmailAlert } from '../types';
import { showSweetToast } from '../utils/sweetAlert';

interface MockEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: MockEmailAlert | null;
  onNavigateToGrading?: () => void;
  isPreviewMode?: boolean;
}

export const MockEmailModal: React.FC<MockEmailModalProps> = ({
  isOpen,
  onClose,
  alert,
  onNavigateToGrading,
  isPreviewMode = false
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !alert) return null;

  const handleCopyText = () => {
    const emailBody = `Subject: ${alert.subject}
From: IntelliGrade Automated Academic Pipeline <notifications@intelligrade.edu>
To: ${alert.studentName} <${alert.recipientEmail}>
Date: ${new Date(alert.timestamp).toLocaleString()}

Dear ${alert.studentName} (Roll Number: ${alert.studentRollNumber}),

Your submission for ${alert.courseCode}: ${alert.examTitle} has completed automated AI evaluation and instructor verification.

EVALUATION SUMMARY:
------------------------------------------
Final Score Awarded: ${alert.scoreAwarded} / ${alert.maxMarks} Marks
Percentage: ${alert.percentageScore}%
Status: ${alert.status}

QUESTION BREAKDOWN:
${(alert.questionScores || []).map(q => `• Question ${q.questionNumber}: ${q.score}/${q.maxMarks} marks`).join('\n')}

FEEDBACK HIGHLIGHTS:
${alert.feedbackSummary || 'All rubric criteria and key concepts evaluated successfully.'}

ACADEMIC APPEAL NOTICE:
If you believe there is a discrepancy with your score, the 72-hour re-evaluation appeal window is currently active via the IntelliGrade Student Portal.

Best regards,
Department of Computer Science & Engineering
Office of Academic Assessment, IntelliGrade System`;

    navigator.clipboard.writeText(emailBody);
    setCopied(true);
    showSweetToast('Simulated email text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (pct >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    if (pct >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getGradeBracket = (pct: number) => {
    if (pct >= 90) return 'Grade A+ (Distinction)';
    if (pct >= 80) return 'Grade A (Excellent)';
    if (pct >= 70) return 'Grade B (Proficient)';
    if (pct >= 60) return 'Grade C (Satisfactory)';
    return 'Review Required (Below Threshold)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner: Simulated Email Client Bar */}
        <div className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  {isPreviewMode ? 'Template Preview' : 'Simulated Dispatch'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isPreviewMode ? 'Ready for Trigger' : 'Delivered to Student'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                'Grading Complete' Email Alert
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Metadata Envelope Header */}
        <div className="p-4 bg-zinc-950/90 border-b border-zinc-800/80 text-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono w-16">Subject:</span>
              <span className="font-semibold text-zinc-100">{alert.subject}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono w-16">From:</span>
              <span className="text-indigo-300 font-medium">IntelliGrade Automated Engine &lt;notifications@intelligrade.edu&gt;</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono w-16">To:</span>
              <span className="font-semibold text-white">{alert.studentName}</span>
              <span className="text-zinc-400 font-mono text-[11px]">&lt;{alert.recipientEmail}&gt;</span>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              Roll No: {alert.studentRollNumber}
            </span>
          </div>
        </div>

        {/* Email Simulated Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-zinc-300 leading-relaxed font-sans flex-1">
          
          {/* Institutional Banner Header */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
                IG
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">DEPARTMENT OF COMPUTER SCIENCE</div>
                <div className="text-[10px] text-zinc-400">Automated Examination & Rubric Assessment Portal</div>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-900/60 font-semibold">
              {alert.courseCode}
            </span>
          </div>

          {/* Salutation & Notification Lead */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">
              Dear {alert.studentName},
            </p>
            <p className="text-zinc-300">
              This automated notification confirms that your examination submission for <strong className="text-white">{alert.courseCode}: {alert.examTitle}</strong> has undergone complete AI rubric pipeline evaluation and score verification.
            </p>
          </div>

          {/* High-Impact Result Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">Official Score Result</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(alert.percentageScore)}`}>
                {getGradeBracket(alert.percentageScore)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Awarded Score</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {alert.scoreAwarded} <span className="text-xs text-zinc-400 font-normal">/ {alert.maxMarks}</span>
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Percentage Score</span>
                <span className="text-xl font-bold font-mono text-indigo-400">
                  {alert.percentageScore}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Evaluation Mode</span>
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Rubric Engine</span>
                </span>
              </div>
            </div>
          </div>

          {/* Question Breakdown Table if available */}
          {alert.questionScores && alert.questionScores.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Question-by-Question Mark Allocation</span>
              </div>

              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Question Item</th>
                      <th className="py-2 px-3 font-semibold text-right">Awarded</th>
                      <th className="py-2 px-3 font-semibold text-right">Max</th>
                      <th className="py-2 px-3 font-semibold">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/50">
                    {alert.questionScores.map((q) => {
                      const pct = Math.round((q.score / (q.maxMarks || 1)) * 100);
                      return (
                        <tr key={q.questionNumber}>
                          <td className="py-2 px-3 font-medium text-zinc-200">
                            Question {q.questionNumber} {q.questionTopic && `(${q.questionTopic})`}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-400 text-right">
                            {q.score}
                          </td>
                          <td className="py-2 px-3 font-mono text-zinc-400 text-right">
                            {q.maxMarks}
                          </td>
                          <td className="py-2 px-3 w-32">
                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ width: `${Math.min(100, pct)}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 space-y-1.5">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Automated Instructor & Rubric Feedback
            </span>
            <p className="text-xs text-zinc-300 italic leading-relaxed">
              "{alert.feedbackSummary || 'Student answer demonstrated solid conceptual grasp of key thresholding and filtering concepts. Calculations matched model rubric criteria.'}"
            </p>
          </div>

          {/* Re-evaluation Appeal Notice */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-300 block">72-Hour Re-evaluation Appeal Window</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                If you note any discrepancies in OCR transcription or semantic rubric alignment, you may submit a formal re-evaluation appeal ticket via the <strong className="text-zinc-200">Student Portal</strong> within 72 hours of this alert.
              </p>
            </div>
          </div>

          {/* Institutional Sign-off Footer */}
          <div className="pt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 space-y-1">
            <p className="text-zinc-400 font-medium">Department of Computer Science & Engineering</p>
            <p>IntelliGrade AI Evaluation Infrastructure • Verified Academic Transmission</p>
            <p className="text-[10px] text-zinc-600">This is an automated simulation message dispatched by the teacher's active evaluation workflow.</p>
          </div>

        </div>

        {/* Modal Bottom Actions Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Email Text</span>
                </>
              )}
            </button>

            {onNavigateToGrading && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToGrading();
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 text-xs font-semibold border border-indigo-800/80 transition flex items-center gap-1.5"
              >
                <span>View in Grading Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
          >
            Close Alert
          </button>
        </div>
      </div>
    </div>
  );
};
