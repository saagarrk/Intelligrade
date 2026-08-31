export interface GeminiSemanticVariant {
  variantId: string;
  variantTitle: string; // e.g. "Colloquial / Everyday Explanation", "Alternative Mathematical Proof", "Analogy-Driven Phrasing"
  ownWordsExplanation: string;
  tone: string;
  keyPhrases: string[];
}

export interface GeminiQuestionSemanticMatrix {
  questionNumber: number;
  questionId: string;
  officialModelAnswer: string;
  aiGeneratedAt: string;
  aiModelName: string;
  ownWordsVariations: GeminiSemanticVariant[];
  acceptedSynonyms: {
    technicalTerm: string;
    allowedSynonyms: string[];
    description: string;
  }[];
  alternativeValidDerivations: string[];
  misconceptionGuards: {
    validOwnWordsExample: string;
    fatalMisconception: string;
    explanation: string;
  }[];
  leniencyThresholdPct: number;
}

export interface UploadedAnswerSheet {
  id: string;
  title: string;
  sheetType: 'student_answer' | 'model_answer' | 'gemini_synthetic';
  fileName: string;
  fileSize?: string;
  fileFormat: 'image' | 'pdf' | 'synthetic';
  pageCount: number;
  currentPage: number;
  pagesDataUrls: string[];
  extractedText?: string;
  uploadedAt: string;
}

export interface QuestionItem {
  id: string;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  modelAnswer: string;
  keyConcepts: {
    concept: string;
    weightMarks: number;
    synonyms: string[];
    description: string;
  }[];
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  geminiSemanticMatrix?: GeminiQuestionSemanticMatrix;
}

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  totalMarks: number;
  instructions: string[];
  questions: QuestionItem[];
}

export interface PreprocessingConfig {
  noiseReduction: boolean;
  noiseRadius: number; // 1 to 5
  styleNormalization: boolean;
  contrastStretch: number; // 1.0 to 2.5
  strokeBoost: number; // 0 to 5
  skewCorrection: boolean;
  skewAngle: number; // -15 to 15 deg
  thinning: boolean; // Zhang-Suen morphological thinning
  thinningIterations: number; // 1 to 5
  thresholdingType: 'otsu' | 'sauvola' | 'adaptive_mean';
  binarizationThreshold: number; // 0 to 255
}

export interface PreprocessingMetrics {
  originalNoiseScore: number;
  cleanedNoiseScore: number;
  detectedSkewAngle: number;
  contrastRatio: number;
  strokeThinningEfficiency: number;
  binarizationClarity: number;
  processingTimeMs: number;
}

export interface OcrWord {
  text: string;
  confidence: number;
  box: [number, number, number, number]; // x, y, width, height
}

export interface OcrLine {
  lineNumber: number;
  questionNumberDetected?: number;
  rawText: string;
  cleanedText: string;
  confidence: number;
  boundingBox: [number, number, number, number];
  words: OcrWord[];
}

export interface OcrResult {
  fullExtractedText: string;
  averageConfidence: number;
  detectedLines: OcrLine[];
  detectedLanguage: string;
  engineUsed: 'Gemini-Vision-Multimodal' | 'PaddleOCR-Engine' | 'Tesseract-Engine';
  durationMs: number;
}

export interface ConceptMatchEvaluation {
  concept: string;
  requiredWeight: number;
  awardedWeight: number;
  status: 'Full' | 'Partial' | 'Missing';
  matchedStudentPhrases: string[];
  synonymUsed?: string;
  explanation: string;
}

export interface DeductionItem {
  reason: string;
  pointsDeducted: number;
  category: 'Conceptual Error' | 'Missing Key Term' | 'Incomplete Steps' | 'Factual Inaccuracy' | 'Formatting';
}

export interface QuestionEvaluation {
  questionId: string;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  awardedMarks: number;
  teacherOverrideMarks?: number;
  teacherComment?: string;
  studentAnswerText: string;
  modelAnswerText: string;
  semanticSimilarityScore: number; // 0 to 100%
  conceptMatches: ConceptMatchEvaluation[];
  deductions: DeductionItem[];
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  multilingualMapping?: {
    originalPhrase: string;
    translatedStandard: string;
    confidence: number;
  }[];
  // 3-Way Tri-Sheet AI Evaluation Fields
  ownWordsAnalysis?: {
    matchedVariantTitle: string;
    ownWordsClarityScore: number; // 0-100%
    paraphraseCategory: 'Everyday Analogies' | 'Alternative Proof/Derivation' | 'Colloquial Terminology' | 'Direct Synonymy';
    equivalenceJustification: string;
    detectedSynonymsUsed: string[];
  };
}

export interface PersonalizedInsight {
  overallSummary: string;
  keyStrengths: string[];
  criticalGaps: string[];
  actionableRecommendations: string[];
  studyTopicsToRevise: {
    topic: string;
    urgency: 'High' | 'Medium' | 'Low';
    resourcesRecommended: string;
  }[];
}

export interface PredictiveAnalytics {
  predictedNextScore: number; // e.g. 84%
  scoreRangeConfidence: [number, number]; // [78, 88]
  predictedPassProbability: number; // 94%
  knowledgeRetentionIndex: number; // 0 to 100
  classPercentileRank: number; // top 18%
  examReadinessLevel: 'High Mastery' | 'Moderate Competence' | 'Foundational Needs Improvement';
  radarSkills: {
    skill: string;
    studentScore: number;
    cohortAverage: number;
  }[];
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentRollNumber: string;
  submissionDate: string;
  originalScanUrl: string;
  preprocessingConfig: PreprocessingConfig;
  preprocessingMetrics: PreprocessingMetrics;
  ocrResult: OcrResult;
  questionEvaluations: QuestionEvaluation[];
  totalMaxMarks: number;
  totalAwardedMarks: number;
  percentageScore: number;
  status: 'Graded' | 'Under Review' | 'Flagged';
  personalizedInsights: PersonalizedInsight;
  predictiveAnalytics: PredictiveAnalytics;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  rollNumber?: string; // for students
  title?: string; // for teachers/admin
  permissions: string[];
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resource: string;
  status: 'Success' | 'Denied' | 'Warning';
}

export type PipelineStage = 
  | 'dashboard'
  | 'preprocessing'
  | 'digitization'
  | 'grading'
  | 'insights'
  | 'architecture'
  | 'user_management';
