import { 
  ExamPaper, 
  QuestionEvaluation, 
  ConceptMatchEvaluation, 
  DeductionItem, 
  PersonalizedInsight, 
  PredictiveAnalytics 
} from '../types';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'with', 'from', 'that', 'this', 'have',
  'has', 'was', 'were', 'which', 'their', 'there', 'they', 'what', 'when',
  'can', 'could', 'should', 'would', 'into', 'over', 'than', 'then'
]);

/**
 * Normalizes and stems common English word endings for morphological matching
 */
export function stemWord(w: string): string {
  let s = w.toLowerCase().trim();
  if (s.endsWith('ing') && s.length > 5) s = s.slice(0, -3);
  else if (s.endsWith('ed') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('es') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('s') && s.length > 3 && !s.endsWith('ss')) s = s.slice(0, -1);
  else if (s.endsWith('ic') && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith('tion') && s.length > 6) s = s.slice(0, -4);
  return s;
}

/**
 * Tokenizes text into normalized word set
 */
export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Computes Jaccard & Cosine n-gram similarity between student answer and model answer
 */
export function calculateSemanticSimilarity(studentText: string, modelText: string): number {
  const studentTokens = tokenizeWords(studentText);
  const modelTokens = tokenizeWords(modelText);

  if (studentTokens.length === 0 || modelTokens.length === 0) return 15;

  const studentStems = studentTokens.map(stemWord);
  const modelStems = modelTokens.map(stemWord);

  const studentSet = new Set(studentStems);
  const modelSet = new Set(modelStems);

  let intersectionCount = 0;
  modelSet.forEach(token => {
    // Exact stem match or fuzzy root containment (e.g. 'log' in 'logarithm')
    const hasMatch = studentSet.has(token) || Array.from(studentSet).some(st => 
      (st.length >= 3 && token.length >= 3 && (st.includes(token) || token.includes(st)))
    );
    if (hasMatch) intersectionCount++;
  });

  const effectiveUnion = Math.max(1, studentSet.size + modelSet.size - intersectionCount);
  const jaccard = Math.min(1, intersectionCount / effectiveUnion);

  // Cosine-like token frequency overlap
  const tfStudent: Record<string, number> = {};
  const tfModel: Record<string, number> = {};
  studentStems.forEach(t => { tfStudent[t] = (tfStudent[t] || 0) + 1; });
  modelStems.forEach(t => { tfModel[t] = (tfModel[t] || 0) + 1; });

  let dotProduct = 0;
  let magStudent = 0;
  let magModel = 0;

  Object.values(tfStudent).forEach(v => { magStudent += v * v; });
  Object.values(tfModel).forEach(v => { magModel += v * v; });

  Object.keys(tfModel).forEach(t => {
    // Check direct or stem overlap
    if (tfStudent[t]) {
      dotProduct += tfModel[t] * tfStudent[t];
    } else {
      const fuzzyKey = Object.keys(tfStudent).find(st => 
        st.length >= 3 && t.length >= 3 && (st.includes(t) || t.includes(st))
      );
      if (fuzzyKey) {
        dotProduct += tfModel[t] * tfStudent[fuzzyKey] * 0.85;
      }
    }
  });

  const cosine = (magStudent > 0 && magModel > 0)
    ? dotProduct / (Math.sqrt(magStudent) * Math.sqrt(magModel))
    : 0;

  // Overlap ratio measures how many of the model's required concepts/words the student recalled
  const recallRatio = modelSet.size > 0 ? intersectionCount / modelSet.size : 0;

  // Blended similarity score between 0 and 100
  const score = Math.round((cosine * 0.45 + jaccard * 0.25 + recallRatio * 0.30) * 100);
  return Math.min(99, Math.max(20, score));
}

/**
 * Dynamically evaluates student text against question key concepts and rubric
 */
export function evaluateQuestionDynamically(
  questionNumber: number,
  questionId: string,
  questionText: string,
  maxMarks: number,
  studentText: string,
  modelText: string,
  keyConcepts: { concept: string; weightMarks: number; synonyms: string[]; description: string }[]
): QuestionEvaluation {
  const similarity = calculateSemanticSimilarity(studentText, modelText);
  const lowerStudentText = studentText.toLowerCase();

  const conceptMatches: ConceptMatchEvaluation[] = [];
  let totalConceptAwarded = 0;

  keyConcepts.forEach(kc => {
    const conceptTerms = [kc.concept.toLowerCase(), ...kc.synonyms.map(s => s.toLowerCase())];
    const words = kc.concept.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    // Check direct phrase or synonym match
    const matchedPhrase = conceptTerms.find(term => lowerStudentText.includes(term));
    // Check partial keyword overlap
    const partialMatches = words.filter(w => lowerStudentText.includes(w));

    let status: 'Full' | 'Partial' | 'Missing' = 'Missing';
    let awardedWeight = 0;
    const matchedPhrases: string[] = [];

    if (matchedPhrase) {
      status = 'Full';
      awardedWeight = kc.weightMarks;
      matchedPhrases.push(matchedPhrase);
    } else if (partialMatches.length > 0) {
      status = 'Partial';
      const ratio = partialMatches.length / words.length;
      awardedWeight = Number((kc.weightMarks * ratio).toFixed(1));
      matchedPhrases.push(...partialMatches);
    } else {
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
        ? `Mentioned components of '${kc.concept}' but lacked complete elaboration.`
        : `Omitted key foundational discussion on '${kc.concept}'.`
    });
  });

  // Calculate deductions dynamically
  const deductions: DeductionItem[] = [];
  const missingCount = conceptMatches.filter(c => c.status === 'Missing').length;

  if (missingCount > 0) {
    deductions.push({
      category: 'Incomplete Steps',
      reason: `Missed ${missingCount} required conceptual components from rubric.`,
      pointsDeducted: Number((maxMarks * 0.15 * missingCount).toFixed(1))
    });
  }

  if (similarity < 60) {
    deductions.push({
      category: 'Missing Key Term',
      reason: 'Low alignment with expected theoretical definitions.',
      pointsDeducted: 1.0
    });
  }

  const calculatedMarks = Math.min(maxMarks, Math.max(0, Number(totalConceptAwarded.toFixed(1))));

  const feedback = calculatedMarks >= maxMarks * 0.85
    ? `Excellent demonstration of topic mastery. Rigorous terminology and step-by-step logic demonstrated throughout answer.`
    : calculatedMarks >= maxMarks * 0.6
    ? `Solid foundational understanding shown. Review specific edge cases and formal definitions to maximize credit.`
    : `Answer contains partial insights but needs significant structural clarity and coverage of core rubric items.`;

  const fullCount = conceptMatches.filter(c => c.status !== 'Missing').length;
  const coverageRatio = conceptMatches.length > 0 ? fullCount / conceptMatches.length : 0.8;
  const confidenceScore = Math.min(99, Math.max(60, Math.round(similarity * 0.5 + coverageRatio * 50)));

  return {
    // Canonical workflow fields
    question: questionText,
    studentAnswer: studentText,
    modelAnswer: modelText,
    maxMarks,
    aiSuggestedMarks: calculatedMarks,
    confidenceScore,
    evaluationFeedback: feedback,
    teacherAdjustedMarks: null,
    finalMarks: null, // AI suggestions NEVER automatically become final marks without teacher review
    evaluationStatus: 'AI_SUGGESTED',

    // Compatibility fields
    questionId,
    questionNumber,
    questionText,
    awardedMarks: calculatedMarks,
    studentAnswerText: studentText,
    modelAnswerText: modelText,
    semanticSimilarityScore: similarity,
    conceptMatches,
    deductions,
    feedback,
    strengths: conceptMatches.filter(c => c.status === 'Full').map(c => c.concept),
    weaknesses: conceptMatches.filter(c => c.status !== 'Full').map(c => c.concept)
  };
}

/**
 * Dynamically recomputes entire student submission analytics, score forecasting, and radar skills
 */
export function generateDynamicInsightsAndAnalytics(
  exam: ExamPaper,
  evaluations: QuestionEvaluation[]
): {
  totalScore: number;
  percentage: number;
  insights: PersonalizedInsight;
  predictive: PredictiveAnalytics;
} {
  const totalMax = exam.totalMarks || evaluations.reduce((s, e) => s + e.maxMarks, 0);
  const totalAwarded = evaluations.reduce((sum, e) => {
    const val = e.teacherOverrideMarks !== undefined ? e.teacherOverrideMarks : e.awardedMarks;
    return sum + val;
  }, 0);

  const percentage = Number(((totalAwarded / (totalMax || 1)) * 100).toFixed(1));

  // Analyze all strengths and weaknesses across evaluations
  const allStrengths = evaluations.flatMap(e => e.strengths);
  const allWeaknesses = evaluations.flatMap(e => e.weaknesses);

  const distinctStrengths = Array.from(new Set(allStrengths)).slice(0, 4);
  const distinctWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 3);

  const insights: PersonalizedInsight = {
    overallSummary: percentage >= 80
      ? `Candidate demonstrates high mastery of ${exam.subject} with ${percentage}% aggregate score across all questions.`
      : percentage >= 60
      ? `Candidate shows solid conceptual grasp of core principles (${percentage}%), with opportunities in formal proofs and definitions.`
      : `Candidate requires targeted revision in core foundational topics (${percentage}%). Focus on rubric keyword terminology.`,
    keyStrengths: distinctStrengths.length > 0 ? distinctStrengths : ['Accurate handwriting OCR clarity', 'Logical flow in core definitions'],
    criticalGaps: distinctWeaknesses.length > 0 ? distinctWeaknesses : ['Comprehensive edge-case proofs', 'Mathematical formula steps'],
    actionableRecommendations: [
      `Review rubric definitions for ${distinctWeaknesses[0] || 'core topics'} before next examination.`,
      `Practice step-by-step mathematical derivations to prevent partial credit deductions.`,
      `Ensure handwriting margins and technical keywords are clearly emphasized.`
    ],
    studyTopicsToRevise: exam.questions.map(q => ({
      topic: q.topic,
      urgency: (percentage < 65 ? 'High' : percentage < 80 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      resourcesRecommended: `Core Reference Textbook Chapter on ${q.topic} & Practice Problem Sets`
    }))
  };

  const avgSimilarity = evaluations.length > 0
    ? Math.round(evaluations.reduce((s, e) => s + e.semanticSimilarityScore, 0) / evaluations.length)
    : 80;

  const predictedNextScore = Math.min(99, Math.max(30, Math.round(percentage * 1.05)));
  const confidenceMin = Math.max(20, Math.round(percentage - 6));
  const confidenceMax = Math.min(100, Math.round(percentage + 8));

  const readiness: 'High Mastery' | 'Moderate Competence' | 'Foundational Needs Improvement' = percentage >= 80
    ? 'High Mastery'
    : percentage >= 60
    ? 'Moderate Competence'
    : 'Foundational Needs Improvement';

  const predictive: PredictiveAnalytics = {
    predictedNextScore,
    scoreRangeConfidence: [confidenceMin, confidenceMax],
    predictedPassProbability: Math.min(99, Math.max(35, Math.round(percentage * 1.1))),
    knowledgeRetentionIndex: Math.min(100, Math.max(40, Math.round(avgSimilarity * 0.95))),
    classPercentileRank: Math.min(99, Math.max(20, Math.round(percentage * 0.98))),
    examReadinessLevel: readiness,
    radarSkills: [
      { skill: 'Conceptual Clarity', studentScore: Math.min(100, Math.round(percentage * 1.02)), cohortAverage: 72 },
      { skill: 'Mathematical Rigor', studentScore: Math.min(100, Math.round(percentage * 0.94)), cohortAverage: 65 },
      { skill: 'Terminology & Keywords', studentScore: Math.min(100, Math.round(avgSimilarity)), cohortAverage: 74 },
      { skill: 'Handwriting OCR Quality', studentScore: 95, cohortAverage: 78 },
      { skill: 'Step-by-Step Completeness', studentScore: Math.min(100, Math.round(percentage * 0.96)), cohortAverage: 68 }
    ]
  };

  return {
    totalScore: Number(totalAwarded.toFixed(1)),
    percentage,
    insights,
    predictive
  };
}
