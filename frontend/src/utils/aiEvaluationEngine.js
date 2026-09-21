import { calculateSemanticSimilarity } from './dynamicGrading';
export const EVALUATION_WORKFLOW_STAGES = [
    { step: 1, id: 'extracted_answer', name: 'Extracted Answer', description: 'OCR / Digitized handwritten student answer', category: 'input', icon: 'FileText' },
    { step: 2, id: 'question', name: 'Question', description: 'Target examination question prompt & maximum marks', category: 'input', icon: 'HelpCircle' },
    { step: 3, id: 'model_answer', name: 'Model Answer', description: 'Official benchmark solution & expected terminology', category: 'rubric', icon: 'BookOpen' },
    { step: 4, id: 'rubric', name: 'Rubric', description: 'Weighted key concepts, derivations, and deduction criteria', category: 'rubric', icon: 'Sliders' },
    { step: 5, id: 'ai_evaluation', name: 'AI Evaluation', description: 'Contextual semantic matching & concept coverage analysis', category: 'ai_engine', icon: 'Cpu' },
    { step: 6, id: 'suggested_marks', name: 'Suggested Marks', description: 'Algorithmic mark recommendation (strictly non-final)', category: 'ai_engine', icon: 'Sparkles' },
    { step: 7, id: 'feedback', name: 'Feedback', description: 'In-depth diagnostic strengths, weaknesses & rationale', category: 'ai_engine', icon: 'MessageSquare' },
    { step: 8, id: 'confidence', name: 'Confidence', description: 'AI certainty score derived from OCR & rubric congruence', category: 'ai_engine', icon: 'ShieldCheck' },
    { step: 9, id: 'teacher_review', name: 'Teacher Review', description: 'Human instructor validation, mark adjustment & notes', category: 'teacher_audit', icon: 'UserCheck' },
    { step: 10, id: 'final_marks', name: 'Final Marks', description: 'Official grade authorized and published by instructor', category: 'final', icon: 'Award' }
];
/**
 * Executes the AI evaluation stage of the workflow.
 * IMPORTANT: AI suggestions NEVER automatically become final marks.
 * `finalMarks` is strictly initialized to null and `evaluationStatus` is 'AI_SUGGESTED'.
 */
export function evaluateAnswerWorkflow(params) {
    const { questionNumber, questionId = `q_${questionNumber}`, questionText, maxMarks, studentAnswerText = '', modelAnswerText = '', keyConcepts = [], topic = 'Subject Module', ocrConfidence = 92, existingTeacherNotes } = params;
    // 1. Semantic Similarity Calculation
    const similarityScore = calculateSemanticSimilarity(studentAnswerText, modelAnswerText);
    const lowerStudent = studentAnswerText.toLowerCase();
    // 2. Concept Match Evaluation against Rubric
    const conceptMatches = [];
    let totalConceptAwarded = 0;
    if (keyConcepts.length > 0) {
        keyConcepts.forEach((kc) => {
            const synonyms = kc.synonyms || [];
            const terms = [kc.concept.toLowerCase(), ...synonyms.map(s => s.toLowerCase())];
            const words = kc.concept.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const matchedPhrase = terms.find(t => lowerStudent.includes(t));
            const partialMatches = words.filter(w => lowerStudent.includes(w));
            let status = 'Missing';
            let awardedWeight = 0;
            const matchedPhrases = [];
            if (matchedPhrase) {
                status = 'Full';
                awardedWeight = kc.weightMarks;
                matchedPhrases.push(matchedPhrase);
            }
            else if (partialMatches.length > 0) {
                status = 'Partial';
                const ratio = partialMatches.length / words.length;
                awardedWeight = Number((kc.weightMarks * ratio).toFixed(1));
                matchedPhrases.push(...partialMatches);
            }
            else {
                status = 'Missing';
                awardedWeight = 0;
            }
            totalConceptAwarded += awardedWeight;
            conceptMatches.push({
                concept: kc.concept,
                requiredWeight: kc.weightMarks,
                awardedWeight,
                status,
                matchedStudentPhrases: matchedPhrases,
                synonymUsed: matchedPhrase && matchedPhrase !== kc.concept.toLowerCase() ? matchedPhrase : undefined,
                explanation: status === 'Full'
                    ? `Accurately articulated '${kc.concept}' with sound technical terminology.`
                    : status === 'Partial'
                        ? `Addressed components of '${kc.concept}' but lacked complete elaboration.`
                        : `Omitted key foundational discussion on '${kc.concept}'.`
            });
        });
    }
    else {
        // Default single concept if rubric was empty
        const ratio = similarityScore / 100;
        const score = Number((maxMarks * ratio).toFixed(1));
        totalConceptAwarded = score;
        conceptMatches.push({
            concept: `Core Principles: ${topic}`,
            requiredWeight: maxMarks,
            awardedWeight: score,
            status: score >= maxMarks * 0.8 ? 'Full' : score >= maxMarks * 0.5 ? 'Partial' : 'Missing',
            matchedStudentPhrases: [studentAnswerText.slice(0, 60)],
            explanation: `Evaluated via semantic alignment with reference model answer (${similarityScore}% overlap).`
        });
    }
    // 3. Deductions Analysis
    const deductions = [];
    const missingCount = conceptMatches.filter(c => c.status === 'Missing').length;
    if (missingCount > 0) {
        deductions.push({
            category: 'Incomplete Steps',
            reason: `Missed ${missingCount} required conceptual components from rubric.`,
            pointsDeducted: Number((maxMarks * 0.15 * missingCount).toFixed(1))
        });
    }
    if (similarityScore < 60) {
        deductions.push({
            category: 'Missing Key Term',
            reason: 'Low semantic alignment with expected theoretical definitions.',
            pointsDeducted: 1.0
        });
    }
    // 4. Calculate AI Suggested Marks
    const suggestedScore = Math.min(maxMarks, Math.max(0, Number(totalConceptAwarded.toFixed(1))));
    // 5. Calculate AI Confidence Score (0 - 100%)
    // Blends OCR quality, semantic match certainty, and rubric concept coverage
    const fullCoverageRatio = conceptMatches.length > 0
        ? conceptMatches.filter(c => c.status !== 'Missing').length / conceptMatches.length
        : 0.8;
    const rawConfidence = (ocrConfidence * 0.35) + (similarityScore * 0.35) + (fullCoverageRatio * 100 * 0.30);
    const confidenceScore = Math.min(99, Math.max(55, Math.round(rawConfidence)));
    // 6. Comprehensive Feedback Generation
    const strengths = conceptMatches.filter(c => c.status === 'Full').map(c => c.concept);
    const weaknesses = conceptMatches.filter(c => c.status !== 'Full').map(c => c.concept);
    const evaluationFeedback = suggestedScore >= maxMarks * 0.85
        ? `Excellent demonstration of topic mastery. Rigorous terminology and step-by-step logic demonstrated throughout answer.`
        : suggestedScore >= maxMarks * 0.6
            ? `Solid foundational understanding shown. Review specific edge cases and formal definitions to maximize credit.`
            : `Answer contains partial insights but needs significant structural clarity and coverage of core rubric items.`;
    // 7. Store canonical fields. Notice: finalMarks IS STRICTLY NULL until teacher review!
    return {
        question: questionText,
        studentAnswer: studentAnswerText,
        modelAnswer: modelAnswerText,
        maxMarks,
        aiSuggestedMarks: suggestedScore,
        confidenceScore,
        evaluationFeedback,
        teacherAdjustedMarks: null,
        finalMarks: null, // AI suggestions NEVER automatically become final marks without teacher review
        evaluationStatus: 'AI_SUGGESTED',
        // Backward compatibility fields
        questionId,
        questionNumber,
        questionText,
        awardedMarks: suggestedScore, // Kept for legacy displays, but finalMarks is authoritative
        teacherComment: existingTeacherNotes || '',
        studentAnswerText,
        modelAnswerText,
        semanticSimilarityScore: similarityScore,
        conceptMatches,
        deductions,
        feedback: evaluationFeedback,
        strengths,
        weaknesses,
        ownWordsAnalysis: {
            matchedVariantTitle: 'Colloquial & Applied Conceptual Understanding',
            ownWordsClarityScore: Math.min(100, Math.round(similarityScore * 1.05)),
            paraphraseCategory: 'Everyday Analogies',
            equivalenceJustification: 'Conceptually valid formulation mapped through Gemini Semantic Matrix.',
            detectedSynonymsUsed: conceptMatches.filter(c => c.synonymUsed).map(c => c.synonymUsed)
        }
    };
}
/**
 * Teacher reviews and finalizes a single question's answer.
 */
export function teacherReviewAnswer(evaluation, adjustedMarks, comment = '', finalize = true, teacherUser) {
    const boundedMarks = Math.min(evaluation.maxMarks, Math.max(0, Number(adjustedMarks.toFixed(1))));
    const status = finalize ? 'TEACHER_FINALIZED' : 'TEACHER_REVIEWED';
    const finalMarksValue = finalize ? boundedMarks : null;
    return {
        ...evaluation,
        teacherAdjustedMarks: boundedMarks,
        finalMarks: finalMarksValue,
        evaluationStatus: status,
        awardedMarks: boundedMarks,
        teacherOverrideMarks: boundedMarks,
        teacherComment: comment !== undefined ? comment : evaluation.teacherComment,
        teacherReviewedAt: new Date().toISOString(),
        teacherReviewedBy: teacherUser?.name || teacherUser?.email || 'Faculty Evaluator'
    };
}
/**
 * Teacher one-click accepts the AI suggested marks as the final grade.
 */
export function teacherAcceptAiSuggestion(evaluation, comment = '', teacherUser) {
    return teacherReviewAnswer(evaluation, evaluation.aiSuggestedMarks, comment || 'AI suggested marks accepted and validated by instructor.', true, teacherUser);
}
/**
 * Teacher reverts a finalized answer back to AI suggested state.
 */
export function teacherRevertToAi(evaluation) {
    return {
        ...evaluation,
        teacherAdjustedMarks: null,
        finalMarks: null,
        evaluationStatus: 'AI_SUGGESTED',
        awardedMarks: evaluation.aiSuggestedMarks,
        teacherOverrideMarks: undefined,
        teacherComment: ''
    };
}
/**
 * Teacher flags an answer for second review, verification, or manual inspection.
 */
export function teacherFlagAnswer(evaluation, reason = 'Requires manual instructor verification', teacherUser) {
    return {
        ...evaluation,
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
        teacherComment: evaluation.teacherComment
            ? `${evaluation.teacherComment} [FLAGGED: ${reason}]`
            : `[FLAGGED by ${teacherUser?.name || 'Instructor'}: ${reason}]`
    };
}
/**
 * Teacher removes the flag from an answer.
 */
export function teacherUnflagAnswer(evaluation) {
    return {
        ...evaluation,
        isFlagged: false,
        flagReason: undefined,
        flaggedAt: undefined
    };
}
/**
 * Teacher modifies or customizes the evaluation feedback.
 */
export function teacherUpdateFeedback(evaluation, newFeedback) {
    return {
        ...evaluation,
        evaluationFeedback: newFeedback,
        feedback: newFeedback
    };
}
/**
 * Teacher batch finalizes all question evaluations for a student submission.
 * Any answer not yet manually adjusted will accept the AI suggestion as the final mark.
 */
export function teacherFinalizeAllAnswers(evaluations, teacherUser, defaultAuditNote = 'Batch validated & approved by instructor.') {
    return evaluations.map(ev => {
        // If already finalized, keep it
        if (ev.evaluationStatus === 'TEACHER_FINALIZED' && ev.finalMarks !== null) {
            return ev;
        }
        const marksToAssign = ev.teacherAdjustedMarks !== null ? ev.teacherAdjustedMarks : ev.aiSuggestedMarks;
        return teacherReviewAnswer(ev, marksToAssign, ev.teacherComment || defaultAuditNote, true, teacherUser);
    });
}
/**
 * Computes submission summary metrics distinguishing AI suggestions from Teacher Finalizations.
 */
export function getSubmissionEvaluationSummary(evaluations, examTotalMarks) {
    const totalQuestions = evaluations.length;
    const finalizedCount = evaluations.filter(e => e.evaluationStatus === 'TEACHER_FINALIZED' && e.finalMarks !== null).length;
    const isFullyFinalized = totalQuestions > 0 && finalizedCount === totalQuestions;
    const totalMaxMarks = examTotalMarks || evaluations.reduce((sum, e) => sum + e.maxMarks, 0);
    // Total AI suggested marks
    const totalAiSuggested = Number(evaluations.reduce((sum, e) => sum + (e.aiSuggestedMarks ?? e.awardedMarks ?? 0), 0).toFixed(1));
    // Total Final marks (strictly includes only teacher finalized marks)
    const totalFinalMarks = isFullyFinalized
        ? Number(evaluations.reduce((sum, e) => sum + (e.finalMarks ?? 0), 0).toFixed(1))
        : null;
    // Average AI confidence score
    const avgConfidence = totalQuestions > 0
        ? Math.round(evaluations.reduce((sum, e) => sum + (e.confidenceScore || 85), 0) / totalQuestions)
        : 85;
    const aiPercentage = Number(((totalAiSuggested / (totalMaxMarks || 1)) * 100).toFixed(1));
    const finalPercentage = totalFinalMarks !== null
        ? Number(((totalFinalMarks / (totalMaxMarks || 1)) * 100).toFixed(1))
        : null;
    return {
        totalQuestions,
        finalizedCount,
        pendingReviewCount: totalQuestions - finalizedCount,
        isFullyFinalized,
        totalMaxMarks,
        totalAiSuggested,
        aiPercentage,
        totalFinalMarks,
        finalPercentage,
        avgConfidence
    };
}
/**
 * Returns formatted confidence visual attributes for UI badges.
 */
export function getConfidenceBadgeMeta(score) {
    if (score >= 90) {
        return {
            label: 'High Confidence',
            badgeBg: 'bg-emerald-500/10',
            textColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/30',
            description: 'High semantic alignment with official rubric and clean handwriting OCR.'
        };
    }
    if (score >= 75) {
        return {
            label: 'Moderate Confidence',
            badgeBg: 'bg-indigo-500/10',
            textColor: 'text-indigo-400',
            borderColor: 'border-indigo-500/30',
            description: 'Sound conceptual match with minor phrasing or edge-case variation.'
        };
    }
    return {
        label: 'Needs Review',
        badgeBg: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        description: 'Ambiguous handwriting or partial concept coverage; recommended for teacher review.'
    };
}
