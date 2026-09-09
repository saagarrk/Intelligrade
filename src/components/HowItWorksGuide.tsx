import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Upload, 
  Cpu, 
  Sparkles, 
  BarChart3, 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Play,
  FileText,
  FileCheck2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PipelineStage } from '../types';

interface HowItWorksGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateStage?: (stage: PipelineStage) => void;
  onRunDemo?: () => void;
}

export const HowItWorksGuide: React.FC<HowItWorksGuideProps> = ({
  isOpen,
  onClose,
  onNavigateStage,
  onRunDemo
}) => {
  const { role, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'workflow' | 'roles' | 'faq'>('workflow');

  if (!isOpen) return null;

  return (
    <div 
      id="how-it-works-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="how-it-works-modal-card"
        className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>How IntelliGrade Works</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Easy Guide
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Understand automated handwritten exam grading in 60 seconds
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close guide"
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-5 sm:px-6 pt-2">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'workflow'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>The 4 Simple Steps</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Student vs Teacher Modes</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: WORKFLOW (4 SIMPLE STEPS) */}
          {activeTab === 'workflow' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
                <strong>What is IntelliGrade?</strong> It is an intelligent grading assistant that checks student handwritten answer sheets just like an experienced professor. It reads cursive or print handwriting, checks conceptual understanding (even if explained in the student's own everyday words), awards partial credit, and provides constructive feedback.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step 1
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload & Clean Scan</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload a scanned image (PNG/JPG) or multi-page PDF of the handwritten paper. The system automatically cleans shadows, deskews tilted pages, and sharpens pencil/pen strokes.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step 2
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>AI Reads Handwriting</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Multimodal AI (Gemini Vision) converts handwritten handwriting into editable digital text line-by-line, grouping answers by question numbers.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step 3
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Semantic AI Grading</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    The AI compares the student's answer against the answer key. It detects <em>meaning</em> rather than exact word matching — giving full credit for analogies, synonyms, and valid steps.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Step 4
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span>Report Card & Analytics</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    View marks breakdown, strength & weakness radar, study suggestions, and export a ready-to-print official PDF evaluation report.
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Ready to see it in action?
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Switch to Teacher mode to upload custom papers or click below to run the AI grader.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onRunDemo && (
                    <button
                      onClick={() => {
                        onClose();
                        onRunDemo();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>⚡ Run AI Grader Now</span>
                    </button>
                  )}
                  {onNavigateStage && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateStage('preprocessing');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition flex items-center gap-1.5"
                    >
                      <span>Go to Step 1: Upload</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES EXPLAINED */}
          {activeTab === 'roles' && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-zinc-400">
                IntelliGrade supports distinct portals tailored to each university role:
              </p>

              {/* Student Role */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white">Student Portal</h3>
                  </div>
                  {role === 'student' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Current Role
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        await switchRole('student');
                        onClose();
                      }}
                      className="text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      Switch to Student →
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Students see their own graded exam papers, question-by-question marks, strengths, topics to revise, and can download their official Grade Transcript PDF. If they believe a point was missed, they can submit an appeal.
                </p>
              </div>

              {/* Teacher Role */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Users className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white">Teacher Portal (Instructor Mode)</h3>
                  </div>
                  {role === 'teacher' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Current Role
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        await switchRole('teacher');
                        onClose();
                      }}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      Switch to Teacher →
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Teachers have full control. You can upload handwritten answer sheets (single or batch for the entire class), trigger AI grading, override scores manually with comments, review student appeals, and export cohort grade ledgers.
                </p>
              </div>

              {/* Admin Role */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-bold text-white">Admin Portal (Dean & Administrator)</h3>
                  </div>
                  {role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Current Role
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        await switchRole('admin');
                        onClose();
                      }}
                      className="text-xs text-amber-400 hover:underline font-semibold"
                    >
                      Switch to Admin →
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Admins manage user accounts, roles, security audit logs, course offerings, and enterprise microservice connections.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-bold text-white block">
                  Does the student have to copy the textbook word-for-word?
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  No! That is the core breakthrough of IntelliGrade. Our Tri-Answer Semantic Matrix evaluates conceptual understanding. If a student writes an intuitive explanation, real-world analogy, or valid mathematical derivation, they receive full marks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-bold text-white block">
                  Can a human teacher override or adjust the marks?
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Yes, absolutely. Teachers have final authority. In Stage 3 (Grading Studio), you can click "Teacher Override" on any question to adjust marks up or down, add remarks, or accept student appeals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-bold text-white block">
                  What file formats are supported for answer sheets?
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  You can upload photos taken from smartphones (JPG, PNG, WebP) or multi-page scanned PDFs. The built-in image processor automatically cleans background noise and shadows.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="font-bold text-white block">
                  How can I try grading right now?
                </span>
                <p className="text-zinc-400 leading-relaxed">
                  Make sure you are in Teacher mode (or click the button below to switch). Then click "Run Automated AI Pipeline" on the dashboard, or upload your own paper in Step 1!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            IntelliGrade Automated Grading Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
          >
            Got It, Let's Start!
          </button>
        </div>

      </div>
    </div>
  );
};
