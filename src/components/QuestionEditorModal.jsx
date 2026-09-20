import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
  FileText,
  Percent,
  ListOrdered,
  ChevronDown,
  RotateCcw,
  Sliders,
  Award
} from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlert";

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

const RUBRIC_PRESETS = [
  {
    id: "osi_model",
    name: "OSI Model 5-Tier Rubric (Requested Example)",
    description: "Definition, Seven layers, Explanation, Example, Clarity",
    targetMarks: 10,
    criteria: [
      {
        concept: "Definition",
        weightMarks: 2,
        description: "Accurate definition of OSI reference model as ISO conceptual 7-layer framework.",
        synonyms: ["ISO OSI", "Open Systems Interconnection", "7-layer reference model", "conceptual architecture"]
      },
      {
        concept: "Seven layers",
        weightMarks: 3,
        description: "Complete and orderly enumeration of all 7 layers (Physical to Application).",
        synonyms: ["Physical Data Link Network Transport Session Presentation Application", "all 7 layers in hierarchy", "layer order"]
      },
      {
        concept: "Explanation",
        weightMarks: 2.5,
        description: "Clear explanation of layer functions, encapsulation, packet flow, and addressing.",
        synonyms: ["layer functions", "encapsulation", "routing", "framing", "end-to-end transport"]
      },
      {
        concept: "Example",
        weightMarks: 1.5,
        description: "Practical real-world protocol mapping (e.g. HTTP, TCP, IP, Ethernet).",
        synonyms: ["HTTP TCP IP example", "real-world protocol stack", "web browsing packet flow"]
      },
      {
        concept: "Clarity",
        weightMarks: 1,
        description: "Technical clarity, coherent logic, academic terminology, and legible organization.",
        synonyms: ["technical articulation", "coherence", "networking terminology", "concise presentation"]
      }
    ]
  },
  {
    id: "standard_analytical",
    name: "Analytical / Descriptive Question Rubric",
    description: "Core Definition, Technical Mechanisms, Practical Application, Technical Rigor",
    targetMarks: 10,
    criteria: [
      {
        concept: "Core Concept & Definition",
        weightMarks: 3,
        description: "Fundamental principle definition and foundational theory.",
        synonyms: ["definition", "core concept", "fundamental principle"]
      },
      {
        concept: "Mechanism & Working Steps",
        weightMarks: 4,
        description: "Step-by-step technical explanation and operational workflow.",
        synonyms: ["mechanism", "working principle", "operational steps", "algorithm"]
      },
      {
        concept: "Real-World Application / Example",
        weightMarks: 2,
        description: "Practical deployment case or relevant industrial scenario.",
        synonyms: ["application", "real-world use", "practical example"]
      },
      {
        concept: "Terminology & Presentation Clarity",
        weightMarks: 1,
        description: "Correct academic terminology and organized structure.",
        synonyms: ["clarity", "formal notation", "terminology"]
      }
    ]
  },
  {
    id: "mathematical_derivation",
    name: "Mathematical / Algorithmic Derivation Rubric",
    description: "Formula Formulation, Intermediate Steps, Edge Cases, Final Result",
    targetMarks: 10,
    criteria: [
      {
        concept: "Formula & Mathematical Foundation",
        weightMarks: 3,
        description: "Correct statement of equations, variables, and starting theorems.",
        synonyms: ["formula", "governing equation", "initial formulation"]
      },
      {
        concept: "Step-by-Step Derivation / Logic",
        weightMarks: 4,
        description: "Rigorous algebraic transformations and chain of proofs.",
        synonyms: ["derivation", "algebraic steps", "intermediate calculation"]
      },
      {
        concept: "Final Result & Boundary Checks",
        weightMarks: 2,
        description: "Accurate final expression with units/dimension checks.",
        synonyms: ["final result", "solution", "boundary conditions"]
      },
      {
        concept: "Mathematical Rigor & Notation",
        weightMarks: 1,
        description: "Correct notation and clean presentation.",
        synonyms: ["notation", "rigor", "precision"]
      }
    ]
  }
];

export const QuestionEditorModal = ({
  isOpen,
  onClose,
  initialQuestion = null,
  examId,
  examTitle,
  onSaveQuestion
}) => {
  const isEditing = Boolean(initialQuestion?.id);

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [maxMarks, setMaxMarks] = useState(10);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [modelAnswer, setModelAnswer] = useState("");
  const [keyConcepts, setKeyConcepts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (initialQuestion) {
      setQuestionText(initialQuestion.questionText || "");
      setMaxMarks(Number(initialQuestion.maxMarks) || 10);
      setTopic(initialQuestion.topic || "");
      setDifficulty(initialQuestion.difficulty || "Medium");
      setModelAnswer(initialQuestion.modelAnswer || "");
      setKeyConcepts(
        Array.isArray(initialQuestion.keyConcepts) && initialQuestion.keyConcepts.length > 0
          ? initialQuestion.keyConcepts.map((c) => ({
              concept: c.concept || "",
              weightMarks: Number(c.weightMarks) || 1,
              description: c.description || "",
              synonymsStr: Array.isArray(c.synonyms) ? c.synonyms.join(", ") : (c.synonyms || "")
            }))
          : [
              {
                concept: "Core Concept",
                weightMarks: Number(initialQuestion.maxMarks) || 10,
                description: "Fundamental definition and technical details.",
                synonymsStr: "definition, principles"
              }
            ]
      );
    } else {
      // Default new question
      setQuestionText("");
      setMaxMarks(10);
      setTopic("General Curriculum");
      setDifficulty("Medium");
      setModelAnswer("");
      // Default to OSI Model preset criteria structure if blank
      setKeyConcepts([
        {
          concept: "Definition",
          weightMarks: 2,
          description: "Clear technical definition and foundational concepts.",
          synonymsStr: "definition, conceptual model, standard"
        },
        {
          concept: "Seven layers",
          weightMarks: 3,
          description: "Enumeration and structural explanation of components.",
          synonymsStr: "layers, hierarchy, architecture"
        },
        {
          concept: "Explanation",
          weightMarks: 2.5,
          description: "Detailed operational explanation and mechanisms.",
          synonymsStr: "functions, operations, mechanisms"
        },
        {
          concept: "Example",
          weightMarks: 1.5,
          description: "Concrete real-world example or protocol application.",
          synonymsStr: "example, practical case, protocol"
        },
        {
          concept: "Clarity",
          weightMarks: 1,
          description: "Organization, technical precision, and clarity.",
          synonymsStr: "clarity, terminology, structure"
        }
      ]);
    }
    setFormErrors({});
  }, [isOpen, initialQuestion]);

  // Criteria Sum Calculation
  const criteriaSum = useMemo(() => {
    const sum = keyConcepts.reduce((acc, c) => acc + (Number(c.weightMarks) || 0), 0);
    return Number(sum.toFixed(2));
  }, [keyConcepts]);

  const marksDiff = useMemo(() => {
    return Number((criteriaSum - Number(maxMarks || 0)).toFixed(2));
  }, [criteriaSum, maxMarks]);

  const isBalanced = Math.abs(marksDiff) < 0.05;

  // Handler: Add Criterion
  const handleAddCriterion = () => {
    const remaining = Math.max(1, Number((Number(maxMarks) - criteriaSum).toFixed(2)));
    setKeyConcepts([
      ...keyConcepts,
      {
        concept: "",
        weightMarks: remaining > 0 ? remaining : 1,
        description: "",
        synonymsStr: ""
      }
    ]);
  };

  // Handler: Update Criterion
  const handleUpdateCriterion = (index, field, value) => {
    setKeyConcepts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handler: Remove Criterion
  const handleRemoveCriterion = (index) => {
    if (keyConcepts.length <= 1) {
      showErrorAlert("Cannot Delete", "At least one evaluation criterion is required for AI evaluation.");
      return;
    }
    setKeyConcepts((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Auto-Distribute Marks Evenly
  const handleAutoDistributeMarks = () => {
    if (keyConcepts.length === 0) return;
    const total = Number(maxMarks) || 10;
    const baseWeight = Math.floor((total / keyConcepts.length) * 10) / 10;
    let remainder = Number((total - (baseWeight * keyConcepts.length)).toFixed(2));

    const distributed = keyConcepts.map((c, idx) => {
      let allocated = baseWeight;
      if (idx === 0 && remainder > 0) {
        allocated = Number((allocated + remainder).toFixed(2));
      }
      return {
        ...c,
        weightMarks: allocated
      };
    });

    setKeyConcepts(distributed);
  };

  // Load Preset Rubric
  const handleApplyPreset = (presetId) => {
    const preset = RUBRIC_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.id === "osi_model" && (!questionText || questionText.trim() === "")) {
      setQuestionText("Explain the OSI model.");
      setTopic("Computer Networks - OSI Architecture");
      setModelAnswer(
        "The Open Systems Interconnection (OSI) model is a conceptual 7-layer framework developed by ISO. The layers from Layer 1 to Layer 7 are Physical, Data Link, Network, Transport, Session, Presentation, and Application. Physical transmits raw bitstreams, Data Link handles framing and MAC addressing, Network routes IP packets, Transport ensures reliable end-to-end delivery (TCP/UDP), Session manages connections, Presentation encrypts and formats data, and Application interfaces with network software (HTTP/DNS). For example, a web browser request traverses Application (HTTP) down through Transport (TCP) and Network (IP) onto the Physical Ethernet cable."
      );
    }

    setMaxMarks(preset.targetMarks);
    setKeyConcepts(
      preset.criteria.map((c) => ({
        concept: c.concept,
        weightMarks: c.weightMarks,
        description: c.description,
        synonymsStr: c.synonyms.join(", ")
      }))
    );
  };

  // Form Validation & Save
  const handleSave = async () => {
    const errors = {};

    if (!questionText || !questionText.trim()) {
      errors.questionText = "Question prompt is required.";
    }

    const parsedMaxMarks = Number(maxMarks);
    if (isNaN(parsedMaxMarks) || parsedMaxMarks <= 0) {
      errors.maxMarks = "Maximum marks must be a positive number.";
    }

    if (!modelAnswer || !modelAnswer.trim()) {
      errors.modelAnswer = "Model answer is required for AI-assisted evaluation.";
    }

    if (!keyConcepts || keyConcepts.length === 0) {
      errors.criteria = "At least one evaluation criterion is required.";
    } else {
      const invalidCriterion = keyConcepts.find(
        (c) => !c.concept || !c.concept.trim() || isNaN(Number(c.weightMarks)) || Number(c.weightMarks) <= 0
      );
      if (invalidCriterion) {
        errors.criteria = "Each criterion must have a non-empty title and assigned marks > 0.";
      } else if (!isBalanced) {
        errors.criteria = `Total criteria marks (${criteriaSum} M) must equal question maximum marks (${parsedMaxMarks} M). Difference: ${marksDiff > 0 ? "+" : ""}${marksDiff} M.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showErrorAlert(
        "Validation Errors",
        Object.values(errors).map((e) => `• ${e}`).join("<br/>")
      );
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        questionText: questionText.trim(),
        maxMarks: parsedMaxMarks,
        topic: topic.trim() || "General Subject",
        difficulty,
        modelAnswer: modelAnswer.trim(),
        keyConcepts: keyConcepts.map((c) => ({
          concept: c.concept.trim(),
          weightMarks: Number(c.weightMarks) || 1,
          description: c.description ? c.description.trim() : "",
          synonyms: c.synonymsStr
            ? c.synonymsStr.split(",").map((s) => s.trim()).filter(Boolean)
            : []
        }))
      };

      if (initialQuestion?.id) {
        payload.id = initialQuestion.id;
        payload.questionNumber = initialQuestion.questionNumber;
      }

      await onSaveQuestion(payload);
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err);
      showErrorAlert("Save Error", err.message || "Could not save question and rubric.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="question-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                {isEditing ? `Edit Question & Rubrics` : `Create Question & Rubric`}
                {initialQuestion?.questionNumber && (
                  <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Q{initialQuestion.questionNumber}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Curriculum target: <span className="text-zinc-200 font-medium">{examTitle || "General Curriculum"}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-question-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-indigo-200">
                  Quick Rubric Presets Available
                </p>
                <p className="text-[11px] text-zinc-400">
                  Instantly load balanced grading criteria, including the 5-tier OSI model specification.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-load-osi-preset"
                type="button"
                onClick={() => handleApplyPreset("osi_model")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Award className="w-3.5 h-3.5 text-indigo-300" />
                Load OSI Model (5 Criteria)
              </button>
            </div>
          </div>

          {/* Section 1: Question Basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Question Prompt *</span>
                <span className="text-[11px] text-zinc-500">{questionText.length} chars</span>
              </label>
              <textarea
                id="input-question-text"
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. Explain the OSI model."
                className={`w-full px-3.5 py-2.5 bg-zinc-950/60 border rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  formErrors.questionText ? "border-rose-500/80" : "border-zinc-800"
                }`}
              />
              {formErrors.questionText && (
                <p className="text-[11px] text-rose-400">{formErrors.questionText}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Maximum Marks *</span>
                  <span className="text-[11px] text-zinc-400 font-mono">{maxMarks} M</span>
                </label>
                <input
                  id="input-max-marks"
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Difficulty</label>
                  <select
                    id="select-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {DIFFICULTY_OPTIONS.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Topic Area</label>
                  <input
                    id="input-topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Networks"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Official Model Answer (Sheet 2) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Official Model Answer (Ground Truth Reference) *</span>
              </label>
              <span className="text-[11px] text-zinc-500">
                {modelAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              The AI Tri-Sheet grading engine compares student handwriting against this model answer along with the criteria below.
            </p>
            <textarea
              id="input-model-answer"
              rows={4}
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Provide a comprehensive standard model answer containing key formulas, definitions, and technical steps..."
              className={`w-full px-3.5 py-2.5 bg-zinc-950/60 border rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed font-sans ${
                formErrors.modelAnswer ? "border-rose-500/80" : "border-zinc-800"
              }`}
            />
            {formErrors.modelAnswer && (
              <p className="text-[11px] text-rose-400">{formErrors.modelAnswer}</p>
            )}
          </div>

          {/* Section 3: Multi-Criteria Rubric Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Evaluation Criteria & Rubric Weights ({keyConcepts.length})</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Assign marks to each criterion. The AI grades each criterion individually for maximum precision.
                </p>
              </div>

              {/* Balance Indicator & Auto-Distribute */}
              <div className="flex items-center gap-2">
                <div
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 ${
                    isBalanced
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {isBalanced ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{criteriaSum} / {maxMarks} M</span>
                  {!isBalanced && (
                    <span className="text-[10px] text-amber-300">
                      ({marksDiff > 0 ? `+${marksDiff}` : marksDiff}M)
                    </span>
                  )}
                </div>

                <button
                  id="btn-auto-distribute-marks"
                  type="button"
                  onClick={handleAutoDistributeMarks}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Evenly distribute question max marks across all criteria"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                  Auto-Distribute
                </button>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {keyConcepts.map((criterion, idx) => {
                const pct = maxMarks > 0 ? Math.round((criterion.weightMarks / maxMarks) * 100) : 0;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={criterion.concept}
                          onChange={(e) => handleUpdateCriterion(idx, "concept", e.target.value)}
                          placeholder="Criterion name (e.g. Definition, Seven layers, Explanation, Example, Clarity)"
                          className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                          <input
                            type="number"
                            min={0.1}
                            max={100}
                            step={0.5}
                            value={criterion.weightMarks}
                            onChange={(e) => handleUpdateCriterion(idx, "weightMarks", Number(e.target.value))}
                            className="w-14 bg-transparent text-xs text-right font-mono text-indigo-300 focus:outline-none"
                          />
                          <span className="text-[11px] text-zinc-500 font-mono">M</span>
                          <span className="text-[10px] text-zinc-500 ml-1">({pct}%)</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCriterion(idx)}
                          disabled={keyConcepts.length <= 1}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete criterion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) => handleUpdateCriterion(idx, "description", e.target.value)}
                          placeholder="Grading guidance / key facts required for full credit..."
                          className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={criterion.synonymsStr}
                          onChange={(e) => handleUpdateCriterion(idx, "synonymsStr", e.target.value)}
                          placeholder="Accepted synonyms / keywords (comma separated, e.g. ISO, 7-layer, reference)"
                          className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-400 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Criterion Button */}
            <button
              id="btn-add-criterion"
              type="button"
              onClick={handleAddCriterion}
              className="w-full py-2 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-950/30 hover:bg-indigo-500/5 text-xs text-zinc-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Evaluation Criterion</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-zinc-300">{keyConcepts.length} Criteria</span>
            <span>•</span>
            <span className={isBalanced ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
              Total: {criteriaSum} / {maxMarks} Marks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              id="btn-save-question"
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEditing ? "Update Question & Rubric" : "Save Question & Rubric"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
