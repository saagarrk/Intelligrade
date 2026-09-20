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
  courseCode?: string;
  description?: string;
  gradeLevel: string;
  totalMarks: number;
  passingMarks?: number;
  examDate?: string;
  durationMinutes?: number;
  status?: 'published' | 'draft';
  instructions: string[];
  questions: QuestionItem[];
  questionPaperFile?: {
    name: string;
    size: number;
    type: 'image' | 'pdf';
    pageCount: number;
    pagesDataUrls: string[];
    uploadedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
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
  thresholdingType: 'otsu' | 'sauvola' | 'adaptive_mean' | 'adaptive';
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

export interface ParsedOcrAnswer {
  questionNumber: number;
  questionLabel?: string;
  transcribedAnswer: string;
  confidence: number;
  detectedFormulas?: string[];
  detectedBulletPoints?: string[];
  detectedKeywords?: string[];
}

export interface HandwrittenOcrParseResult {
  success: boolean;
  fullExtractedText: string;
  parsedAnswers: ParsedOcrAnswer[];
  detectedLines: OcrLine[];
  averageConfidence: number;
  detectedLanguage: string;
  handwritingLegibility: 'High' | 'Medium' | 'Low' | 'Cursive' | 'Faint';
  engineUsed: string;
  durationMs: number;
  metadata?: {
    totalWordsDetected: number;
    hasMathematicalNotation: boolean;
    hasDiagrams: boolean;
    notes?: string;
  };
}

export interface PerformOcrOptions {
  mimeType?: string;
  examContext?: string;
  questions?: Array<{
    questionNumber: number;
    questionText?: string;
    topic?: string;
    modelAnswer?: string;
  }>;
  targetQuestions?: number[];
  language?: string;
  mockMode?: boolean;
}

export interface OcrResult {
  fullExtractedText: string;
  averageConfidence: number;
  detectedLines: OcrLine[];
  detectedLanguage: string;
  engineUsed: 'Gemini-Vision-Multimodal' | 'PaddleOCR-Engine' | 'Tesseract-Engine' | string;
  durationMs: number;
  parsedAnswers?: ParsedOcrAnswer[];
  handwritingLegibility?: 'High' | 'Medium' | 'Low' | 'Cursive' | 'Faint';
  metadata?: {
    totalWordsDetected: number;
    hasMathematicalNotation: boolean;
    hasDiagrams: boolean;
    notes?: string;
  };
}

export interface ConceptMatchEvaluation {
  concept: string;
  requiredWeight: number;
  awardedWeight: number;
  awardedMarks?: number;
  weightMarks?: number;
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

export type EvaluationStatus = 
  | 'AI_SUGGESTED'       // AI evaluated, suggested marks present, awaiting teacher review
  | 'TEACHER_REVIEWED'   // Teacher reviewed or adjusted, pending finalization
  | 'TEACHER_FINALIZED'; // Teacher approved/finalized into final marks

export interface QuestionEvaluation {
  // Canonical fields for professional AI-assisted evaluation engine:
  question: string;                        // Question prompt
  studentAnswer: string;                   // Extracted student answer
  modelAnswer: string;                     // Reference model answer
  maxMarks: number;                        // Maximum possible marks
  aiSuggestedMarks: number;                // AI suggested marks
  confidenceScore: number;                 // AI evaluation confidence score (0-100%)
  evaluationFeedback: string;              // Qualitative evaluation feedback
  teacherAdjustedMarks: number | null;     // Teacher adjusted marks (null until edited by teacher)
  finalMarks: number | null;               // Final marks (strictly null until reviewed and finalized by teacher)
  evaluationStatus: EvaluationStatus;      // 'AI_SUGGESTED' | 'TEACHER_REVIEWED' | 'TEACHER_FINALIZED'

  // Compatibility & extended fields:
  questionId: string;
  questionNumber: number;
  questionText: string;                    // Alias for question
  awardedMarks: number;                    // Backward-compat: finalMarks ?? aiSuggestedMarks
  teacherOverrideMarks?: number;           // Backward-compat alias for teacherAdjustedMarks
  teacherComment?: string;                 // Official instructor audit notes
  teacherReviewedAt?: string;              // Timestamp of teacher review
  teacherReviewedBy?: string;              // Name/email of reviewing instructor
  studentAnswerText: string;               // Alias for studentAnswer
  modelAnswerText: string;                 // Alias for modelAnswer
  semanticSimilarityScore: number;         // 0 to 100%
  conceptMatches: ConceptMatchEvaluation[];
  deductions: DeductionItem[];
  feedback: string;                        // Alias for evaluationFeedback
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
  // Teacher Review Workspace Flagging
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: string;
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

export type SubmissionStatus =
  | 'UPLOADED'
  | 'WAITING'
  | 'PROCESSING'
  | 'EVALUATED'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'FAILED'
  | 'Graded'
  | 'Under Review'
  | 'Flagged';

export type PipelineProcessingState = 'WAITING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type PipelineStageKey =
  | 'uploaded_paper'
  | 'pdf_image_processing'
  | 'ocr_handwriting_recognition'
  | 'extracted_text'
  | 'question_detection'
  | 'answer_segmentation'
  | 'question_mapping';

export interface OriginalFileInfo {
  fileId: string;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  mimeType: string;
  virtualUrl: string;
  uploadedAt: string;
}

export interface ProcessedPageRecord {
  pageNumber: number;
  pageId: string;
  imageUrl: string;
  rotation: number;
  width?: number;
  height?: number;
  extractedText: string;
  ocrConfidence?: number;
  status: PipelineProcessingState;
  error?: string;
  processingTimestamp?: string;
  detectedLinesCount?: number;
}

export interface DetectedQuestionItem {
  detectedQuestionNumber: number;
  questionLabel: string;
  pageNumber: number;
  boundingLineRange: [number, number];
  detectionMethod: 'explicit_header' | 'numeric_bullet' | 'semantic_topic';
  confidence: number;
}

export interface SegmentedAnswerItem {
  id: string;
  questionNumber: number;
  questionLabel: string;
  pageNumber: number;
  extractedText: string;
  startLine: number;
  endLine: number;
  ocrConfidence: number;
  detectedFormulas?: string[];
  detectedBulletPoints?: string[];
  detectedKeywords?: string[];
  status: PipelineProcessingState;
  error?: string;
}

export interface QuestionMappingItem {
  questionNumber: number;
  examQuestionId: string;
  questionText: string;
  maxMarks: number;
  pageNumber: number;
  extractedAnswerText: string;
  ocrConfidence: number;
  mappingStatus: 'MAPPED' | 'AMBIGUOUS' | 'UNMAPPED_MISSING';
  mappingConfidence: number;
  mappingReason: string;
  segmentedAnswerId?: string;
  status: PipelineProcessingState;
  processingTimestamp: string;
}

export interface PipelineStageResult {
  stage: PipelineStageKey;
  label: string;
  status: PipelineProcessingState;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  message?: string;
  details?: any;
  error?: {
    code: string;
    message: string;
    details?: string;
    remediation?: string;
  };
}

export interface StructuredPipelineExecution {
  pipelineId: string;
  submissionId: string;
  examId: string;
  overallStatus: PipelineProcessingState;
  currentStage: PipelineStageKey;
  stages: Record<PipelineStageKey, PipelineStageResult>;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  originalFile: OriginalFileInfo;
  pages: ProcessedPageRecord[];
  extractedText: string;
  detectedQuestions: DetectedQuestionItem[];
  segmentedAnswers: SegmentedAnswerItem[];
  questionMappings: QuestionMappingItem[];
  averageOcrConfidence: number;
  error?: {
    stage: PipelineStageKey;
    code: string;
    message: string;
    technicalDetails?: string;
    remediation: string;
    failedPageNumber?: number;
    failedAt: string;
  };
}

export interface SubmissionPageItem {
  id: string;
  pageNumber: number;
  dataUrl: string;
  rotation?: number; // 0, 90, 180, 270 degrees
  fileName?: string;
  fileSize?: number;
  extractedText?: string;
  ocrConfidence?: number;
  processingStatus?: PipelineProcessingState;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentRollNumber: string;
  submissionDate: string;
  originalScanUrl: string;
  secureFileId?: string;
  originalFileName?: string;
  fileFormat?: 'pdf' | 'jpg' | 'jpeg' | 'png' | 'image' | string;
  fileSizeBytes?: number;
  pageCount?: number;
  pages?: SubmissionPageItem[];
  status: SubmissionStatus;
  processingStatus?: PipelineProcessingState;
  pipelineExecution?: StructuredPipelineExecution;
  statusHistory?: Array<{
    status: SubmissionStatus;
    timestamp: string;
    note?: string;
  }>;
  preprocessingConfig: PreprocessingConfig;
  preprocessingMetrics: PreprocessingMetrics;
  ocrResult: OcrResult;
  questionEvaluations: QuestionEvaluation[];
  totalMaxMarks: number;
  totalAwardedMarks: number;
  percentageScore: number;
  personalizedInsights: PersonalizedInsight;
  predictiveAnalytics: PredictiveAnalytics;
  submittedBy?: {
    email: string;
    role: string;
  };
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  rollNumber?: string;
  title?: string;
  adminKey?: string;
  teacherKey?: string;
}

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

export interface PipelineProgressState {
  isExecuting: boolean;
  currentStage: 'preprocessing' | 'digitization' | 'grading' | 'insights';
  stageIndex: number;
  percentage: number;
  stageMessage: string;
}

export type PipelineStage = 
  | 'dashboard'
  | 'preprocessing'
  | 'digitization'
  | 'grading'
  | 'insights'
  | 'architecture'
  | 'user_management';

export interface QuestionScoreItem {
  questionNumber: number;
  score: number;
  maxMarks: number;
  questionTopic?: string;
}

export interface MockEmailAlert {
  id: string;
  recipientEmail: string;
  studentName: string;
  studentRollNumber: string;
  courseCode: string;
  examTitle: string;
  scoreAwarded: number;
  maxMarks: number;
  percentageScore: number;
  timestamp: string;
  status: 'Delivered' | 'Dispatched';
  subject: string;
  feedbackSummary?: string;
  questionScores?: QuestionScoreItem[];
}

export type BenchmarkProfileType = 
  | 'exemplary' 
  | 'own_words' 
  | 'partial_credit' 
  | 'borderline' 
  | 'adversarial' 
  | 'custom';

export interface AutomatedTestCase {
  id: string;
  name: string;
  profileType: BenchmarkProfileType;
  description: string;
  expectedScoreRange: [number, number]; // e.g. [27, 30]
  expectedPercentageRange: [number, number]; // e.g. [85, 100]
  answers: {
    questionNumber: number;
    answerText: string;
  }[];
}

export interface AutomatedTestExecutionResult {
  testCaseId: string;
  testCaseName: string;
  profileType: BenchmarkProfileType;
  awardedMarks: number;
  totalMaxMarks: number;
  percentage: number;
  expectedPercentageRange: [number, number];
  status: 'Passed' | 'Warning' | 'Failed';
  deviation: number;
  evaluations: QuestionEvaluation[];
  semanticEquivalenceScore: number;
  notes: string;
  executionTimeMs: number;
}

export interface AutomatedTestSuiteReport {
  examId: string;
  examTitle: string;
  testedAt: string;
  totalTestsRun: number;
  testsPassed: number;
  passRate: number;
  averageLatencyMs: number;
  overallReliabilityScore: number;
  ownWordsSemanticTolerance: number;
  adversarialResistanceScore: number;
  rubricIntegrityCheck: {
    valid: boolean;
    totalMarksMatch: boolean;
    allQuestionsHaveRubrics: boolean;
    warnings: string[];
  };
  results: AutomatedTestExecutionResult[];
  recommendations: string[];
}
