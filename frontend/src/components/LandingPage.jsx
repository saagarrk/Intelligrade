import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Upload,
  Cpu,
  CheckCircle2,
  Edit3,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Check,
  HelpCircle,
  FileText,
  Users,
  Clock,
  Layers,
  Award,
  BookOpen,
  Lock,
  Eye,
  Server,
  Zap,
  Sliders,
  Play
} from "lucide-react";

export const LandingPage = ({
  onGetStarted,
  onLaunchDemo,
  onOpenHowItWorks,
  onSignIn
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  const workflowSteps = [
    {
      step: "01",
      title: "Upload Answer Scripts",
      icon: Upload,
      tag: "Batch Ingestion",
      desc: "Instructors upload scanned PDF or high-res image sets of student handwritten exam sheets with zero manual pre-sorting."
    },
    {
      step: "02",
      title: "Intelligent OCR Digitization",
      icon: Cpu,
      tag: "Vision OCR",
      desc: "Specialized handwriting models segment question blocks, recognize cursive scripts, and transcribe text alongside confidence markers."
    },
    {
      step: "03",
      title: "AI-Assisted Evaluation",
      icon: Sparkles,
      tag: "Rubric Engine",
      desc: "NLP semantic engine compares student responses against teacher-defined rubrics and model answers, drafting provisional scores and explanatory rationales."
    },
    {
      step: "04",
      title: "Teacher Review & Override",
      icon: Edit3,
      tag: "Human-in-the-Loop",
      desc: "Faculty inspect the AI-suggested marks on an intuitive 3-sheet view, adjusting or overriding any score with one click before committing."
    },
    {
      step: "05",
      title: "Verified Results & Analytics",
      icon: BarChart3,
      tag: "Student Portal",
      desc: "Final grades, step-by-step commentary, and cognitive radar analytics are published to students with a transparent re-evaluation appeal channel."
    }
  ];

  const teacherBenefits = [
    {
      icon: Clock,
      title: "Save 60–75% of Grading Hours",
      desc: "Eliminate repetitive rubric tallying. Spend your energy on pedagogical mentoring and fine-tuning marginal boundary cases."
    },
    {
      icon: Edit3,
      title: "Full Faculty Editorial Control",
      desc: "The AI acts strictly as an assistant. You maintain 100% authority to override scores, modify comments, and adjust rubric strictness at any time."
    },
    {
      icon: Layers,
      title: "Configurable Marking Schemes",
      desc: "Set partial-credit weighting, keyword mandatory tags, conceptual match thresholds, and step-wise mark deduction limits per question."
    },
    {
      icon: FileText,
      title: "Archival PDF Generation",
      desc: "Generate standardized accreditation transcripts and batch ledger sheets with embedded audit trails in seconds."
    }
  ];

  const studentBenefits = [
    {
      icon: Eye,
      title: "Total Evaluation Transparency",
      desc: "Students see the exact rubric breakdown, model answers, and step-wise mark allotments rather than an unexplained red-ink number."
    },
    {
      icon: Award,
      title: "Actionable Strengths & Gaps",
      desc: "Receive cognitive insights highlighting conceptual mastery, missing critical terms, and targeted recommendations for exam improvement."
    },
    {
      icon: HelpCircle,
      title: "Structured Re-Evaluation Appeals",
      desc: "Submit question-specific appeals directly inside the portal, allowing instructors to re-examine contested answers impartially."
    },
    {
      icon: Sparkles,
      title: "Fast Feedback Turnaround",
      desc: "Receive comprehensive exam review sheets days earlier, accelerating remediation before subsequent tests and finals."
    }
  ];

  const faqs = [
    {
      q: "Does IntelliGrade grade papers automatically without human oversight?",
      a: "No. IntelliGrade is designed strictly as an AI-assisted co-pilot for educators. The system transcribes handwritten text and proposes provisional marks based on the instructor's rubric, but final grades are always reviewed, validated, or modified by the instructor before publication."
    },
    {
      q: "Can teachers edit or override the AI's marks and remarks?",
      a: "Yes, completely. Faculty have full editorial control. In the 3-Sheet grading console, instructors can override awarded marks on any question with a single click, append custom pedagogical notes, or re-calculate totals instantly."
    },
    {
      q: "Does IntelliGrade claim 100% handwriting recognition accuracy?",
      a: "No. Cursive and varied handwriting styles vary across students. IntelliGrade computes and displays real-time OCR confidence scores for every question block. Whenever confidence is low, the platform flags the script for mandatory teacher manual inspection."
    },
    {
      q: "How does IntelliGrade evaluate conceptual answers vs exact wording?",
      a: "The semantic evaluation engine measures conceptual relevance and key domain terminology rather than requiring verbatim phrase matching. If a student explains an algorithm or law accurately in their own words, the rubric awards appropriate partial or full marks."
    },
    {
      q: "Is student examination data secure and compliant?",
      a: "Yes. IntelliGrade incorporates institutional role-based access control (RBAC), end-to-end encryption for stored scans and scores, isolated student accounts, and an immutable audit trail for every grade change."
    },
    {
      q: "How do students appeal a grade if they believe an answer was marked incorrectly?",
      a: "Students can open an in-platform re-evaluation request on any question, noting their rationale. The instructor receives the appeal with previous comments and can approve a score adjustment or maintain the mark with additional clarification."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header / Public Nav */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">IntelliGrade</span>
              <span className="ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI-Assisted Grading
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#human-in-the-loop" className="hover:text-white transition-colors">AI Co-Pilot</a>
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              id="landing-btn-signin"
              onClick={onSignIn}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 transition-colors shadow-2xs"
            >
              Institutional Login
            </button>
            <button
              id="landing-btn-launch-demo"
              onClick={onLaunchDemo}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Launch Live Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-medium text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assisted Evaluation Engine for Descriptive Answer Papers</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Evaluate Handwritten Exams with Speed, Consistency & Complete Teacher Control
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              IntelliGrade digitizes handwritten paper scripts and drafts rubric-aligned marks to assist instructors. Teachers maintain full authority to review, adjust, and override every score before results reach students.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                id="hero-btn-get-started"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Evaluation Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="hero-btn-how-it-works"
                onClick={onOpenHowItWorks}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 text-indigo-400" />
                <span>See Workflow Walkthrough</span>
              </button>
            </div>

            {/* Core Trust & Reality Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Human-in-the-Loop</span>
                </div>
                <p className="text-[11px] text-slate-400">100% teacher approval required before publishing</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Descriptive Answers</span>
                </div>
                <p className="text-[11px] text-slate-400">Evaluates long-form theories, steps & conceptual logic</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Confidence Flagging</span>
                </div>
                <p className="text-[11px] text-slate-400">Low-confidence handwriting flagged for manual check</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Appeals Built-In</span>
                </div>
                <p className="text-[11px] text-slate-400">Transparent student re-evaluation dispute workflows</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How IntelliGrade Works Workflow Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">End-to-End Pipeline</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              From Handwritten Paper to Verified Transcript
            </h2>
            <p className="text-sm text-slate-400">
              A transparent five-step journey designed to accelerate grading while keeping the educator firmly in command.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {workflowSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative flex flex-col justify-between hover:border-slate-700 transition-colors shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-slate-500">STAGE {item.step}</span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.tag}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-600 z-10">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-center max-w-2xl mx-auto flex items-center justify-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <p className="text-xs text-indigo-200">
              <strong>Guaranteed Human Oversight:</strong> No grade is permanently recorded without instructor sign-off.
            </p>
          </div>
        </div>
      </section>

      {/* AI-Assisted Evaluation Deep Dive: Explain the Co-Pilot Role */}
      <section id="human-in-the-loop" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Core Evaluation Philosophy</span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                AI Assists, Teachers Decide. Always.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Evaluating descriptive academic answers requires contextual comprehension, fairness, and empathy that automated algorithms cannot independently replace. IntelliGrade is engineered as an <strong>intelligent assistant</strong>, not an autonomous arbiter.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</div>
                  <div>
                    <strong className="text-white">Provisional Scoring:</strong> The AI proposes initial marks against the instructor's rubric criteria, highlighting matched points and missing concepts.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</div>
                  <div>
                    <strong className="text-white">Immediate One-Click Override:</strong> Instructors can increase, decrease, or completely overwrite marks and reasoning for any question with real-time tally updates.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</div>
                  <div>
                    <strong className="text-white">Low-Confidence Routing:</strong> Illegible handwriting or ambiguous diagram scripts are surfaced with visual alerts for mandatory manual evaluation.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-2"
                >
                  <span>Experience the 3-Sheet Review Interface</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Mock Review Box */}
            <div className="lg:col-span-6">
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-white">Live Evaluator Mockup • Question 2</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">OCR Confidence: 96.2%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Student Extracted Answer</span>
                    <p className="mt-1 text-slate-200 italic font-mono text-[11px] leading-relaxed">
                      "Deadlock conditions are Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait..."
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase">Rubric Model Criteria</span>
                    <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                      Award 2 marks per condition explained. Full marks requires addressing preemption resolution.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300">AI Suggested Score</span>
                    <div className="text-lg font-bold font-mono text-white">7.5 / 10 Marks</div>
                    <p className="text-[11px] text-slate-400">Missing concrete code or mutex example for circular wait.</p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] text-slate-400">Teacher Override</span>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-1 rounded bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-700">8.0</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">(Approved +0.5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty & Student Dual Value Proposition Section */}
      <section id="benefits" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Dual Value Proposition</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for Teachers. Empowering for Students.
            </h2>
            <p className="text-sm text-slate-400">
              IntelliGrade resolves the twin challenges of faculty assessment exhaustion and opaque student feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teacher Benefits Card */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">For Teachers & University Faculty</h3>
                  <p className="text-xs text-slate-400">Streamline grading load without sacrificing academic rigor</p>
                </div>
              </div>

              <div className="space-y-4">
                {teacherBenefits.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                      <Icon className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{b.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student Benefits Card */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">For Students & Examinees</h3>
                  <p className="text-xs text-slate-400">Transparent mark rationales and formative learning insights</p>
                </div>
              </div>

              <div className="space-y-4">
                {studentBenefits.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="flex items-start gap-3.5 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                      <Icon className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{b.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Cognitive Diagnostics Section */}
      <section id="analytics" className="py-20 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Cohort & Individual Telemetry</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Actionable Performance Analytics Beyond Just Marks
            </h2>
            <p className="text-sm text-slate-400">
              Move past simple numeric scores. Spot cohort-wide knowledge deficits and deliver tailored recommendations automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Class-Wide Question Difficulty</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly identify which rubric questions students struggled on most, indicating areas where curriculum re-teaching is needed.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-900/40">
                  Topic Discrimination Index: High
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Cognitive Radar Breakdown</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Five-axis diagnostic evaluating conceptual clarity, terminology accuracy, logical coherence, procedural accuracy, and depth of synthesis.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-900/40">
                  Multi-Dimensional Diagnostics
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Predictive Grade Trajectory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate early-warning indicators for students at risk of underperformance before cumulative semester finals.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-900/40">
                  Targeted Study Remediation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Academic Compliance Section */}
      <section id="security" className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Institutional Governance</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Enterprise Security & Academic Integrity
            </h2>
            <p className="text-sm text-slate-400">
              Constructed to meet rigorous higher education compliance, data privacy, and accreditation standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xs font-bold text-white">Granular Role-Based Access</h3>
              <p className="text-xs text-slate-400">
                Strict separation between Student, Instructor, and SuperAdmin roles prevents unauthorized grade alterations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <Lock className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Audit Trail Logging</h3>
              <p className="text-xs text-slate-400">
                Every score adjustment, override timestamp, and faculty identity is immutably logged for academic auditing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <Server className="w-6 h-6 text-amber-400" />
              <h3 className="text-xs font-bold text-white">Isolated Data Encapsulation</h3>
              <p className="text-xs text-slate-400">
                Course cohorts and student submissions are siloed per university domain, preventing cross-institutional leakage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <FileText className="w-6 h-6 text-teal-400" />
              <h3 className="text-xs font-bold text-white">Official PDF Transcripts</h3>
              <p className="text-xs text-slate-400">
                Exports formatted examination certificates complete with institutional headers, score matrices, and signatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" className="py-20 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Clarity & Confidence</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-400">
              Clear answers on how AI-assisted evaluation works in real educational settings.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    id={`faq-toggle-${idx}`}
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-indigo-400" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Accelerate Your Descriptive Answer Evaluation?
          </h2>

          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Experience how IntelliGrade saves faculty hours while maintaining complete academic authority and fairness for students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="cta-btn-launch-demo"
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch Live Evaluation Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="cta-btn-signin"
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Sign In with Institutional Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">IntelliGrade</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI-assisted evaluation platform for descriptive handwritten answer papers in university and secondary examinations.
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Platform Build v1.4.2 • Academic Edition
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Workflow Stages</h4>
              <ul className="space-y-2 text-[11px]">
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onLaunchDemo}>1. Paper Scan Prep</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onLaunchDemo}>2. Handwriting OCR</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onLaunchDemo}>3. AI Assisted Grading</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onLaunchDemo}>4. Performance Analytics</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Institutional Roles</h4>
              <ul className="space-y-2 text-[11px]">
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onSignIn}>Faculty Assessment Console</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onSignIn}>Student Feedback & Appeals Portal</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onSignIn}>Academic Dean Administration</span></li>
                <li><span className="text-slate-400 hover:text-white cursor-pointer" onClick={onSignIn}>Role-Based Access Control</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Governance & Accuracy</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                IntelliGrade does not make 100% accuracy claims. All results are advisory drafts subject to human instructor verification.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Human-in-the-Loop Protocol</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} IntelliGrade AI Assessment Systems. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={onOpenHowItWorks}>Workflow Guide</span>
              <span>•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={onSignIn}>Security & RBAC</span>
              <span>•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer" onClick={onLaunchDemo}>Evaluation Console</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
