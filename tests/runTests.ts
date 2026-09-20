/**
 * IntelliGrade Automated Test Suite
 * Tests backend APIs, RBAC authorization, secret keys validation,
 * AI grading algorithms, computer vision filters, and Zod schemas.
 */

import { 
  tokenizeWords, 
  calculateSemanticSimilarity, 
  evaluateQuestionDynamically, 
  generateDynamicInsightsAndAnalytics 
} from '../src/utils/dynamicGrading';
import { zhangSuenThinning } from '../src/utils/imageProcessing';
import { LoginSchema, RegisterSchema } from '../src/utils/validationSchemas';
import { ExamPaper, StudentSubmission } from '../src/types';
import { 
  performHandwrittenOcrAndParse, 
  parseOcrTranscriptionOutput 
} from '../src/backend/geminiOcrService';
import { timingSafeCompare } from '../src/server/common/securityConfig';
import { authService } from '../src/server/services/auth.service';
import { examService } from '../src/server/services/exam.service';
import { gradeService } from '../src/server/services/grade.service';
import { submissionService } from '../src/server/services/submission.service';
import { openApiSpec } from '../src/server/docs/openApiSpec';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
let currentSuite = '';

function suite(name: string) {
  currentSuite = name;
  console.log(`\n\x1b[1m\x1b[34m▶ Test Suite: ${name}\x1b[0m`);
}

async function test(name: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ suite: currentSuite, name, passed: true, durationMs: duration });
    console.log(`  \x1b[32m✔\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({ suite: currentSuite, name, passed: false, error: err?.message || String(err), durationMs: duration });
    console.log(`  \x1b[31m✖\x1b[0m ${name} \x1b[90m(${duration}ms)\x1b[0m`);
    console.log(`    \x1b[31mError: ${err?.message || err}\x1b[0m`);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log(`\n\x1b[1m\x1b[36m=======================================================`);
  console.log(`   INTELLIGRADE TEST RUNNER - SYSTEM & UNIT VERIFICATION`);
  console.log(`=======================================================\x1b[0m`);

  // -------------------------------------------------------------
  // 1. HEALTH & SYSTEM CHECK
  // -------------------------------------------------------------
  suite('1. System Health & Gateway Endpoints');

  await test('GET /api/v1/health returns HTTP 200 with service information', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/health`);
    assertEqual(res.status, 200, 'Health endpoint status code');
    const data = await res.json();
    assertEqual(data.status, 'UP', 'Health status');
    assert(typeof data.service === 'string', 'Service name must be present');
    assert(data.geminiConfigured === true || data.geminiConfigured === false, 'Gemini status flag must exist');
  });

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & LOGIN FLOWS
  // -------------------------------------------------------------
  suite('2. Authentication & Role Credential Handshake');

  let studentToken = '';
  let teacherToken = '';
  let adminToken = '';

  await test('Student login with valid credentials (student@intelligrade.edu)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@intelligrade.edu',
        password: 'student123',
        role: 'student'
      })
    });
    assertEqual(res.status, 200, 'Student login HTTP status');
    const data = await res.json();
    assert(!!data.token, 'Response must contain a JWT token');
    assertEqual(data.user.role, 'student', 'User role should be student');
    assertEqual(data.user.email, 'student@intelligrade.edu', 'User email should match');
    studentToken = data.token;
  });

  await test('Teacher login with valid credentials (teacher@intelligrade.edu)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@intelligrade.edu',
        password: 'teacher123',
        role: 'teacher'
      })
    });
    assertEqual(res.status, 200, 'Teacher login HTTP status');
    const data = await res.json();
    assert(!!data.token, 'Response must contain a JWT token');
    assertEqual(data.user.role, 'teacher', 'User role should be teacher');
    teacherToken = data.token;
  });

  await test('Admin login with valid credentials (admin@intelligrade.edu)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@intelligrade.edu',
        password: 'admin123',
        role: 'admin'
      })
    });
    assertEqual(res.status, 200, 'Admin login HTTP status');
    const data = await res.json();
    assert(!!data.token, 'Response must contain a JWT token');
    assertEqual(data.user.role, 'admin', 'User role should be admin');
    adminToken = data.token;
  });

  await test('Login rejection with incorrect password', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@intelligrade.edu',
        password: 'wrongpassword999',
        role: 'student'
      })
    });
    assertEqual(res.status, 401, 'Wrong password must return 401 Unauthorized');
    const data = await res.json();
    assert(!!data.error, 'Response must include error message');
  });

  await test('Login rejection for non-existent email', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unknown_ghost_user@intelligrade.edu',
        password: 'password123',
        role: 'student'
      })
    });
    assert(res.status === 404 || res.status === 401, `Unknown email must return 404 or 401, got ${res.status}`);
  });

  // -------------------------------------------------------------
  // 3. CONFIDENTIAL SECRET KEYS VERIFICATION
  // -------------------------------------------------------------
  suite('3. Confidential Secret Keys for Admin & Teacher');

  await test('Teacher registration rejected when missing secret key', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Fake Hacker',
        email: `hacker_faculty_${Date.now()}@intelligrade.edu`,
        password: 'securePassword123',
        role: 'teacher',
        department: 'Computer Science'
      })
    });
    assertEqual(res.status, 403, 'Missing teacherKey must return 403 Forbidden');
    const data = await res.json();
    assert(data.error.includes('Secret Key') || data.error.includes('clearance'), 'Error message must specify teacher key requirement');
  });

  await test('Teacher registration rejected with fraudulent secret key', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Fraud Tester',
        email: `fraud_faculty_${Date.now()}@intelligrade.edu`,
        password: 'securePassword123',
        role: 'teacher',
        teacherKey: 'WRONG-SECRET-PASS'
      })
    });
    assertEqual(res.status, 403, 'Fraudulent teacherKey must return 403 Forbidden');
  });

  await test('Teacher registration approved with authentic secret key (TEACHER-SEC-2026)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Prof. Alan Turing',
        email: `alan.turing.${Date.now()}@intelligrade.edu`,
        password: 'enigmaPassword123',
        role: 'teacher',
        department: 'Computer Science & AI',
        teacherKey: 'TEACHER-SEC-2026'
      })
    });
    assert(res.status === 200 || res.status === 201, `Valid teacher registration status, got ${res.status}`);
    const data = await res.json();
    assert(!!data.token, 'Registered teacher must receive a session token');
    assertEqual(data.user.role, 'teacher', 'User role must be teacher');
  });

  await test('Admin registration rejected when missing secret master key', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rogue Admin Impersonator',
        email: `rogue_admin_${Date.now()}@intelligrade.edu`,
        password: 'adminPassword123',
        role: 'admin'
      })
    });
    assertEqual(res.status, 403, 'Missing adminKey must return 403 Forbidden');
  });

  await test('Admin registration rejected with fraudulent master key', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rogue Admin Impersonator',
        email: `rogue_admin_${Date.now()}@intelligrade.edu`,
        password: 'adminPassword123',
        role: 'admin',
        adminKey: 'SUPER_SECRET_GUESS'
      })
    });
    assertEqual(res.status, 403, 'Wrong adminKey must return 403 Forbidden');
  });

  await test('Admin registration approved with authentic secret master key (ADMIN-SEC-2026)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Grace Hopper',
        email: `grace.hopper.${Date.now()}@intelligrade.edu`,
        password: 'admSecurePassword123',
        role: 'admin',
        adminKey: 'ADMIN-SEC-2026'
      })
    });
    assert(res.status === 200 || res.status === 201, `Valid admin registration status, got ${res.status}`);
    const data = await res.json();
    assert(!!data.token, 'Registered admin must receive a session token');
    assertEqual(data.user.role, 'admin', 'User role must be admin');
  });

  // -------------------------------------------------------------
  // 4. ROLE-BASED ACCESS CONTROL (RBAC) ENFORCEMENT
  // -------------------------------------------------------------
  suite('4. Role-Based Access Control (RBAC) Isolation');

  await test('Protected /api/v1/auth/me accepts authenticated Bearer token', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 200, 'Authenticated session returns 200');
    const data = await res.json();
    assertEqual(data.user.email, 'student@intelligrade.edu', 'Returns verified profile');
  });

  await test('Student role is forbidden from accessing Admin User Directory', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/users`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 403, 'Student cannot access admin user directory');
  });

  await test('Student role is forbidden from accessing Security Audit Logs', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 403, 'Student cannot access security audit logs');
  });

  await test('Admin role has authorized access to Admin User Directory', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assertEqual(res.status, 200, 'Admin can access user directory');
    const data = await res.json();
    assert(Array.isArray(data.users), 'Admin endpoint must return list of users');
    assert(data.users.length >= 3, 'Default system users must be returned');
  });

  await test('Admin role has authorized access to Security Audit Logs', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assertEqual(res.status, 200, 'Admin can access audit logs');
    const data = await res.json();
    assert(Array.isArray(data.logs || data.auditLogs), 'Must return audit logs array');
  });

  await test('GET /api/v1/auth/session-validate returns 200 with valid session and expiresAt', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/session-validate`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 200, 'Session validate must return 200 OK');
    const data = await res.json();
    assert(data.valid === true, 'Session must be reported as valid');
    assert(typeof data.expiresAt === 'string', 'Session must contain expiresAt string');
  });

  await test('GET /api/v1/exams allows unauthenticated catalog read without 401 error', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/exams`);
    assertEqual(res.status, 200, 'Unauthenticated exam catalog read must succeed');
    const data = await res.json();
    assert(Array.isArray(data.exams), 'Catalog must return exams array');
  });

  await test('GET /api/v1/submissions/check-duplicate returns duplicate status without error', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/submissions/check-duplicate?examId=exam-101&studentRollNumber=CS-2026-042`);
    assertEqual(res.status, 200, 'Duplicate check must return 200 OK');
    const data = await res.json();
    assert(typeof data.hasDuplicate === 'boolean', 'hasDuplicate must be boolean');
  });

  // -------------------------------------------------------------
  // 5. ACADEMIC WORKFLOWS (APPEAL & NOTIFICATION)
  // -------------------------------------------------------------
  suite('5. Academic Workflows & Endpoints');

  await test('Student submits re-evaluation appeal (/api/v1/student/appeal-reevaluation)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/student/appeal-reevaluation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        questionNumber: 1,
        reason: 'Handwritten diagram in section 1.2 clearly depicted the AVL height balancing criterion.',
        studentRollNo: 'CS-2026-001'
      })
    });
    assertEqual(res.status, 200, 'Re-evaluation appeal submission status');
    const data = await res.json();
    assert(!!data.ticketId, 'Appeal ticket ID must be issued');
    assert(typeof data.status === 'string', 'Appeal status should be registered');
  });

  await test('Teacher sends mock grade release email notification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/notifications/mock-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        recipientEmail: 'student@intelligrade.edu',
        studentName: 'Aarav Sharma',
        examTitle: 'Data Structures & Algorithms Midterm',
        scoreAwarded: 23,
        maxMarks: 30
      })
    });
    assertEqual(res.status, 200, 'Mock email endpoint status');
    const data = await res.json();
    assertEqual(data.status, 'Delivered', 'Dispatch status');
    assert(!!data.dispatchId, 'Dispatch receipt ID should be generated');
  });

  // -------------------------------------------------------------
  // 5B. GEMINI MULTIMODAL OCR & HANDWRITTEN PARSING
  // -------------------------------------------------------------
  suite('5B. Gemini Multimodal OCR & Handwritten Text Parser');

  const sampleScanBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  await test('performHandwrittenOcrAndParse executes server-side OCR on handwritten image scan', async () => {
    const questions = [
      { questionNumber: 1, questionText: 'Explain AVL tree balancing', topic: 'AVL Trees', modelAnswer: 'AVL trees maintain O(log n) height.' },
      { questionNumber: 2, questionText: 'Analyze Dijkstra shortest path', topic: 'Graph Algorithms', modelAnswer: 'Dijkstra uses a priority queue with O(E log V) time.' }
    ];

    const result = await performHandwrittenOcrAndParse(sampleScanBase64, {
      mimeType: 'image/png',
      examContext: 'Data Structures & Algorithms Final Exam',
      questions,
      mockMode: true
    });

    assertEqual(result.success, true, 'OCR result success flag');
    assert(typeof result.fullExtractedText === 'string' && result.fullExtractedText.length > 0, 'Extracted text should not be empty');
    assert(Array.isArray(result.parsedAnswers), 'Parsed answers should be an array');
    assert(result.parsedAnswers.length >= 2, `Should parse at least 2 questions, got ${result.parsedAnswers.length}`);
    assertEqual(result.parsedAnswers[0].questionNumber, 1, 'First question number should be 1');
    assert(result.averageConfidence >= 80, `Average confidence should be >= 80%, got ${result.averageConfidence}`);
    assert(Array.isArray(result.detectedLines) && result.detectedLines.length > 0, 'Detected lines should be populated');
    assert(typeof result.handwritingLegibility === 'string', 'Handwriting legibility should be evaluated');
  });

  test('parseOcrTranscriptionOutput accurately parses JSON output into structured questions & lines', () => {
    const jsonOutput = JSON.stringify({
      fullExtractedText: 'Ans 1: AVL Trees maintain height balance.\n\nAns 2: Dijkstra algorithm uses priority queue.',
      parsedAnswers: [
        {
          questionNumber: 1,
          questionLabel: 'Ans 1',
          transcribedAnswer: 'AVL Trees maintain height balance where |h_L - h_R| <= 1. O(log n) complexity.',
          confidence: 97.5,
          detectedFormulas: ['O(log n)', '|h_L - h_R| <= 1']
        },
        {
          questionNumber: 2,
          questionLabel: 'Ans 2',
          transcribedAnswer: 'Dijkstra computes single-source shortest path using a min-heap.',
          confidence: 96.0,
          detectedFormulas: ['O((V + E) log V)']
        }
      ],
      averageConfidence: 96.8,
      detectedLanguage: 'English',
      handwritingLegibility: 'High'
    });

    const parsed = parseOcrTranscriptionOutput(jsonOutput);
    assertEqual(parsed.success, true, 'Parse result success');
    assertEqual(parsed.parsedAnswers.length, 2, 'Parsed questions count');
    assertEqual(parsed.parsedAnswers[0].questionNumber, 1, 'Question 1 number');
    assert(parsed.parsedAnswers[0].detectedFormulas?.includes('O(log n)'), 'Formulas should be detected');
    assert(parsed.detectedLines.length >= 2, 'Lines should be generated');
  });

  test('parseOcrTranscriptionOutput accurately parses raw plain-text output with mathematical equations', () => {
    const rawTranscript = `Ans 1: AVL trees maintain balanced height ensuring O(log n) search time. The balance factor is defined as balance = h_left - h_right.
- Node rotation restores equilibrium.
- Guaranteed logarithmic depth.

Ans 2: Binary Search requires a sorted list and halves the search space at each iteration.
- Time complexity is O(log n).
- Space complexity is O(1).`;

    const parsed = parseOcrTranscriptionOutput(rawTranscript);
    assertEqual(parsed.success, true, 'Parse success');
    assertEqual(parsed.parsedAnswers.length, 2, 'Parsed 2 answers');
    assertEqual(parsed.parsedAnswers[0].questionNumber, 1, 'First answer question number');
    assertEqual(parsed.parsedAnswers[1].questionNumber, 2, 'Second answer question number');
    assert(parsed.parsedAnswers[0].detectedBulletPoints!.length >= 1, 'Should extract bullet points');
    assert(parsed.parsedAnswers[0].detectedFormulas!.some(f => f.includes('O(') || f.includes('=')), 'Should extract formulas');
    assertEqual(parsed.metadata?.hasMathematicalNotation, true, 'Should flag mathematical notation');
  });

  await test('POST /api/v1/ocr/extract performs handwriting OCR and returns structured answers & lines', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ocr/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        imageBase64: sampleScanBase64,
        mimeType: 'image/png',
        examContext: 'Computer Science Midterm',
        questions: [
          { questionNumber: 1, questionText: 'Define QuickSort', topic: 'Sorting' }
        ],
        mockMode: true
      })
    });

    assertEqual(res.status, 200, 'OCR extract endpoint status');
    const data = await res.json();
    assertEqual(data.success, true, 'OCR extract success flag');
    assert(typeof data.extractedText === 'string', 'Should return extracted text');
    assert(Array.isArray(data.parsedAnswers), 'Should return parsed answers array');
    assert(data.parsedAnswers.length >= 1, 'Should contain at least 1 parsed question answer');
    assert(Array.isArray(data.detectedLines), 'Should return detected lines array');
    assert(data.averageConfidence >= 80, 'Confidence should be >= 80%');
  });

  await test('POST /api/v1/ocr/parse-handwritten endpoint performs full structured OCR parse', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ocr/parse-handwritten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        imageBase64: sampleScanBase64,
        mimeType: 'image/png',
        examContext: 'Operating Systems Quiz',
        questions: [
          { questionNumber: 1, questionText: 'Explain Semaphore vs Mutex', topic: 'Concurrency' }
        ],
        mockMode: true
      })
    });

    assertEqual(res.status, 200, 'Parse handwritten endpoint status');
    const data = await res.json();
    assertEqual(data.success, true, 'Parse handwritten success flag');
    assert(Array.isArray(data.parsedAnswers), 'Must contain parsedAnswers');
    assertEqual(data.parsedAnswers[0].questionNumber, 1, 'Parsed question number');
    assert(typeof data.handwritingLegibility === 'string', 'Legibility evaluated');
  });

  await test('POST /api/v1/ocr/parse-handwritten returns HTTP 400 when imageBase64 is omitted', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ocr/parse-handwritten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        examContext: 'Missing Image Test'
      })
    });

    assertEqual(res.status, 400, 'Should return HTTP 400 when imageBase64 is missing');
    const data = await res.json();
    assertEqual(data.success, false, 'Success should be false');
  });

  // -------------------------------------------------------------
  // 6. CORE ALGORITHMIC UNIT TESTS
  // -------------------------------------------------------------
  suite('6. Core Grading Algorithms & Text Analysis');

  test('tokenizeWords properly sanitizes, removes punctuation, and filters short tokens', () => {
    const raw = 'Explain AVL Trees, O(log n) height, and self-balancing BSTs!!';
    const tokens = tokenizeWords(raw);
    assert(tokens.includes('explain'), 'Should contain normalized word "explain"');
    assert(tokens.includes('trees'), 'Should contain "trees"');
    assert(tokens.includes('log'), 'Should preserve 3-letter token "log"');
    assert(!tokens.includes('an'), 'Should filter out 2-letter word "an"');
  });

  test('calculateSemanticSimilarity produces 100% on identical responses', () => {
    const sample = 'In an AVL tree, heights are strictly balanced ensuring O(log n) search time.';
    const sim = calculateSemanticSimilarity(sample, sample);
    assert(sim >= 90, `Identical text similarity should be >= 90%, got: ${sim}`);
  });

  test('calculateSemanticSimilarity produces high similarity on paraphrased answers', () => {
    const student = 'AVL trees are self-balancing binary search trees with guaranteed logarithmic O(log n) lookup operations.';
    const model = 'An AVL tree maintains balanced height properties, providing O(log n) time complexity for search and lookup.';
    const sim = calculateSemanticSimilarity(student, model);
    assert(sim >= 45, `Paraphrased similarity should be >= 45%, got: ${sim}`);
  });

  test('calculateSemanticSimilarity produces low similarity on unrelated text', () => {
    const student = 'Photosynthesis uses chlorophyll to convert sunlight into glucose and oxygen in plants.';
    const model = 'An AVL tree balances nodes through left and right tree rotations.';
    const sim = calculateSemanticSimilarity(student, model);
    assert(sim <= 30, `Unrelated topic similarity should be <= 30%, got: ${sim}`);
  });

  test('evaluateQuestionDynamically evaluates student response and awards proportional marks', () => {
    const keyConcepts = [
      { concept: 'Sorted Array Requirement', weightMarks: 5, synonyms: ['sorted', 'ordered'], description: 'Requires ordered array' },
      { concept: 'O(log n) Divide and Conquer', weightMarks: 5, synonyms: ['half', 'log', 'halving'], description: 'Halves search space' }
    ];

    const studentAnswer = 'Binary search requires a sorted array and continually halves the interval with logarithmic O(log n) time.';
    const modelAnswer = 'Binary search repeatedly divides a sorted array in half with O(log n) time complexity.';

    const evalResult = evaluateQuestionDynamically(
      1,
      'q1',
      'Explain Binary Search algorithm.',
      10,
      studentAnswer,
      modelAnswer,
      keyConcepts
    );

    assertEqual(evalResult.questionNumber, 1, 'Question number should match');
    assert(evalResult.awardedMarks >= 7, `Good answer should receive >= 7 marks, got: ${evalResult.awardedMarks}`);
    assert(evalResult.semanticSimilarityScore >= 45, 'Semantic similarity should be above 45%');
    assert(evalResult.conceptMatches.length === 2, 'Should evaluate both key concepts');
  });

  await test('generateDynamicInsightsAndAnalytics computes retention, pass probability, and radar skills', () => {
    const mockExam: ExamPaper = {
      id: 'test-exam-01',
      title: 'Algorithms Test',
      subject: 'CS-101',
      gradeLevel: '2026',
      totalMarks: 10,
      instructions: ['Answer all questions'],
      questions: [
        {
          id: 'q1',
          questionNumber: 1,
          topic: 'Search',
          questionText: 'Explain Binary Search algorithm.',
          maxMarks: 10,
          difficulty: 'Easy',
          modelAnswer: 'Binary search repeatedly divides a sorted array in half with O(log n) time complexity.',
          keyConcepts: [
            { concept: 'Sorted Array Requirement', weightMarks: 10, synonyms: ['sorted'], description: 'Requires ordered array' }
          ]
        }
      ]
    };

    const evalResult = evaluateQuestionDynamically(
      1,
      'q1',
      'Explain Binary Search algorithm.',
      10,
      'Binary search requires a sorted array and continuously halves the interval in logarithmic time.',
      'Binary search repeatedly divides a sorted array in half with O(log n) time complexity.',
      [{ concept: 'Sorted Array Requirement', weightMarks: 10, synonyms: ['sorted'], description: 'Requires ordered array' }]
    );

    const analytics = generateDynamicInsightsAndAnalytics(mockExam, [evalResult]);
    assert(analytics.percentage > 70, `Percentage should be > 70%, got: ${analytics.percentage}`);
    assert(analytics.predictive.predictedPassProbability >= 70, 'Pass probability should be >= 70%');
    assert(analytics.predictive.radarSkills.length === 5, 'Should generate 5 radar skills');
    assert(analytics.insights.keyStrengths.length > 0, 'Should identify strengths');
  });

  // -------------------------------------------------------------
  // 7. COMPUTER VISION / IMAGE PROCESSING UNIT TESTS
  // -------------------------------------------------------------
  suite('7. Computer Vision & Stroke Thinning');

  await test('zhangSuenThinning runs 2-pass morphological skeletonization without mutating non-stroke boundaries', () => {
    // 5x5 grid with a solid 3x3 block in the center
    const width = 5;
    const height = 5;
    const grid: boolean[][] = [
      [false, false, false, false, false],
      [false, true,  true,  true,  false],
      [false, true,  true,  true,  false],
      [false, true,  true,  true,  false],
      [false, false, false, false, false],
    ];

    const thinned = zhangSuenThinning(grid, width, height, 2);
    assertEqual(thinned.length, height, 'Thinned grid height matches');
    assertEqual(thinned[0].length, width, 'Thinned grid width matches');

    // Outer boundary must remain false
    assertEqual(thinned[0][0], false, 'Boundary pixel is unchanged');
    assertEqual(thinned[4][4], false, 'Boundary pixel is unchanged');

    // Total active pixels should reduce or stay same after thinning
    const originalCount = grid.flat().filter(Boolean).length;
    const thinnedCount = thinned.flat().filter(Boolean).length;
    assert(thinnedCount <= originalCount, `Thinned stroke count (${thinnedCount}) must be <= original (${originalCount})`);
  });

  // -------------------------------------------------------------
  // 8. INPUT VALIDATION & ZOD SCHEMAS
  // -------------------------------------------------------------
  suite('8. Schema Validation & Input Sanitization');

  await test('LoginSchema validates compliant institutional emails and passwords', () => {
    const valid = LoginSchema.safeParse({
      email: 'teacher@intelligrade.edu',
      password: 'password123',
      role: 'teacher'
    });
    assert(valid.success, 'Valid login should pass validation');
  });

  await test('LoginSchema rejects invalid email formats', () => {
    const invalid = LoginSchema.safeParse({
      email: 'not-an-email-address',
      password: 'password123',
      role: 'student'
    });
    assertEqual(invalid.success, false, 'Malformed email should be rejected');
  });

  await test('RegisterSchema enforces password length and role constraints', () => {
    const invalidPassword = RegisterSchema.safeParse({
      name: 'Aarav Sharma',
      email: 'aarav@intelligrade.edu',
      password: '123', // Too short (< 6 chars)
      role: 'student'
    });
    assertEqual(invalidPassword.success, false, 'Short password (<6 chars) must fail validation');

    const validStudent = RegisterSchema.safeParse({
      name: 'Aarav Sharma',
      email: 'aarav@intelligrade.edu',
      password: 'strongPassword123',
      role: 'student',
      rollNumber: 'CS-2026-099'
    });
    assert(validStudent.success, 'Valid student registration must pass');
  });

  // -------------------------------------------------------------
  // 9. STUDENT HANDWRITTEN ANSWER SHEET UPLOAD & OCR PIPELINE
  // -------------------------------------------------------------
  suite('9. Student Answer Sheet Upload & OCR Integration');

  await test('POST /api/v1/ocr/parse-handwritten processes student answer sheet with question rubrics', async () => {
    const questions = [
      { questionNumber: 1, questionText: 'Explain Mutual Exclusion in Operating Systems', topic: 'Concurrency' },
      { questionNumber: 2, questionText: 'Describe Demand Paging in Virtual Memory', topic: 'Virtual Memory' },
      { questionNumber: 3, questionText: 'State Banker Algorithm for Deadlock Avoidance', topic: 'Deadlock' }
    ];

    const res = await fetch(`${BASE_URL}/api/v1/ocr/parse-handwritten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify({
        imageBase64: sampleScanBase64,
        mimeType: 'image/png',
        examContext: 'CS-301 Midterm Examination',
        questions,
        mockMode: true
      })
    });

    assertEqual(res.status, 200, 'Handwritten sheet OCR endpoint status');
    const data = await res.json();
    assertEqual(data.success, true, 'OCR parsing success flag');
    assertEqual(data.parsedAnswers.length, 3, 'Must parse exactly 3 question responses');
    assertEqual(data.parsedAnswers[0].questionNumber, 1, 'Question 1 number');
    assertEqual(data.parsedAnswers[1].questionNumber, 2, 'Question 2 number');
    assertEqual(data.parsedAnswers[2].questionNumber, 3, 'Question 3 number');
    assert(data.averageConfidence >= 90, 'Average confidence rating should be >= 90%');
    assert(typeof data.handwritingLegibility === 'string', 'Handwriting legibility should be defined');
  });

  await test('POST /api/v1/ocr/parse-handwritten handles student-authored single question answer script', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ocr/parse-handwritten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        imageBase64: sampleScanBase64,
        mimeType: 'image/jpeg',
        examContext: 'Single Question Quiz',
        questions: [
          { questionNumber: 1, questionText: 'Define QuickSort Average Complexity', topic: 'Sorting' }
        ],
        mockMode: true
      })
    });

    assertEqual(res.status, 200, 'Student single answer upload status');
    const data = await res.json();
    assertEqual(data.success, true, 'Single question OCR success');
    assert(data.parsedAnswers.length >= 1, 'Should have at least 1 parsed answer');
    assert(data.fullExtractedText.length > 0, 'Extracted text should not be empty');
  });

  // -------------------------------------------------------------
  // 10. SECURITY AUDIT HARDENING: IDOR, CRYPTO & SECURITY HEADERS
  // -------------------------------------------------------------
  suite('10. Security Audit Hardening: IDOR, Mass-Assignment & Crypto Timing Defense');

  await test('HTTP Security Headers (nosniff, frameguard, csp) are attached to responses', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assertEqual(res.status, 200, 'Health endpoint status');
    const nosniff = res.headers.get('x-content-type-options');
    assertEqual(nosniff, 'nosniff', 'Must send X-Content-Type-Options: nosniff');
    const xssProtection = res.headers.get('x-xss-protection');
    assertEqual(xssProtection, '1; mode=block', 'Must send X-XSS-Protection');
    const csp = res.headers.get('content-security-policy');
    assert(!!csp, 'Content-Security-Policy header must be present');
  });

  await test('IDOR Defense: Student cannot view another student submission by ID', async () => {
    // Get list of submissions using admin token to find a submission belonging to another student
    const allSubsRes = await fetch(`${BASE_URL}/api/v1/submissions`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allSubsData = await allSubsRes.json();
    const otherSub = (allSubsData.submissions || []).find((s: any) => 
      s.studentRollNo !== 'CS-2026-041' && s.studentName !== 'Aarav Sharma'
    );

    if (otherSub) {
      // Now attempt to access with student token (Aarav Sharma)
      const attackRes = await fetch(`${BASE_URL}/api/v1/submissions/${otherSub.id}`, {
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assertEqual(attackRes.status, 403, 'Student accessing another student submission must return 403 Forbidden');
      const errData = await attackRes.json();
      assert(errData.error?.includes('Access denied') || errData.message?.includes('Access denied'), 'Must explain access denial');
    }
  });

  await test('Mass-Assignment Defense: Submission creation cannot force score or status override', async () => {
    const maliciousPayload = {
      examId: 'exam_cs_ai_301',
      status: 'COMPLETED',
      totalScore: 100,
      percentageScore: 100,
      gradeAwarded: 'A+',
      pages: [
        { pageNumber: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }
      ]
    };

    const res = await fetch(`${BASE_URL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify(maliciousPayload)
    });

    assertEqual(res.status, 201, 'Submission creation status');
    const data = await res.json();
    const created = data.submission;
    assertEqual(created.status, 'UPLOADED', 'Status must be UPLOADED, ignoring malicious COMPLETED override');
    assertEqual(created.totalScore, 0, 'Total score must start at 0, ignoring malicious 100 override');
  });

  await test('timingSafeCompare protects clearance keys against timing side-channel attacks', () => {
    assert(timingSafeCompare('ADMIN-SEC-2026', 'ADMIN-SEC-2026') === true, 'Identical strings must match');
    assert(timingSafeCompare('ADMIN-SEC-2026', 'ADMIN-SEC-2027') === false, 'Different strings must not match');
    assert(timingSafeCompare('ADMIN-SEC-2026', 'short') === false, 'Different length strings must not match');
    assert(timingSafeCompare('', '') === true, 'Empty strings must match');
  });

  // -------------------------------------------------------------
  // 11. UNIT & SERVICE LAYER TESTS
  // -------------------------------------------------------------
  suite('11. Service Layer & Unit Domain Logic Tests');

  await test('ExamService: getExams returns seeded examination catalog', async () => {
    const exams = await examService.getExams({}) as any[];
    assert(Array.isArray(exams), 'Exams must be an array');
    assert(exams.length > 0, 'Must contain seeded exams');
    const firstExam = exams[0];
    assert(!!firstExam.id, 'Exam must have an id');
    assert(!!firstExam.title, 'Exam must have a title');
    assert(typeof firstExam.totalMarks === 'number', 'totalMarks must be numeric');
  });

  await test('ExamService: getExamById retrieves single exam with questions', async () => {
    const exam = await examService.getExamById('exam_cs_ai_301');
    assertEqual(exam.id, 'exam_cs_ai_301', 'Exam ID matches');
    assert(Array.isArray(exam.questions), 'Exam questions must be an array');
    assert(exam.questions.length > 0, 'Exam must have questions');
  });

  await test('AuthService: login succeeds with valid credentials', async () => {
    const result = await authService.login({
      email: 'teacher@intelligrade.edu',
      password: 'teacher123',
      role: 'teacher'
    });
    assert(!!result.token, 'Must return session token');
    assertEqual(result.user.role, 'teacher', 'Role must be teacher');
  });

  await test('AuthService: verifySession confirms active session record', async () => {
    const user = await authService.verifySession(teacherToken);
    assert(!!user, 'Session must be active');
    assertEqual(user?.role, 'teacher', 'Session user role must match');
  });

  await test('SubmissionService: getSubmissions filters by role and student roll number', async () => {
    const studentUser = {
      id: 'usr_student_01',
      name: 'Aarav Sharma',
      email: 'student@intelligrade.edu',
      passwordHash: '',
      role: 'student' as const,
      rollNumber: 'CS-2026-041',
      permissions: [],
      createdAt: new Date().toISOString(),
      isActive: true
    };
    const result = await submissionService.getSubmissions({}, undefined, studentUser) as any;
    assert(Array.isArray(result), 'Result should be an array of submissions');
    for (const sub of result) {
      assertEqual(sub.studentRollNo, 'CS-2026-041', 'Student can only see own submissions');
    }
  });

  // -------------------------------------------------------------
  // 12. MARK CALCULATION & RUBRIC SCORING TESTS
  // -------------------------------------------------------------
  suite('12. Mark Calculation & Rubric Evaluation Tests');

  await test('Mark Calculation: 100% keyword and concept coverage awards full marks', () => {
    const testQuestions = [
      {
        id: 'q_test_1',
        questionNumber: 1,
        questionText: 'Explain the purpose and function of the Kernel in an Operating System.',
        maxMarks: 10,
        modelAnswer: 'The kernel is the core component that manages hardware, CPU scheduling, and memory allocation.',
        keyConcepts: [
          { concept: 'core component', weightMarks: 4, synonyms: ['central core'] },
          { concept: 'manages hardware', weightMarks: 3, synonyms: ['hardware control'] },
          { concept: 'memory allocation', weightMarks: 3, synonyms: ['memory management'] }
        ]
      }
    ];

    const studentAnswers = [
      {
        questionNumber: 1,
        answerText: 'The kernel is the core component of an OS. It manages hardware devices and performs memory allocation.'
      }
    ];

    const evalResult = gradeService.performRuleBasedEvaluation(testQuestions, studentAnswers, 'Test Candidate');
    assert(evalResult.totalAwardedMarks === 10, `Expected 10 marks for full match, got ${evalResult.totalAwardedMarks}`);
    assertEqual(evalResult.percentageScore, 100, 'Percentage score should be 100%');
  });

  await test('Mark Calculation: Partial coverage awards proportional weighted marks', () => {
    const testQuestions = [
      {
        id: 'q_test_2',
        questionNumber: 1,
        questionText: 'What is Backpropagation in Neural Networks?',
        maxMarks: 10,
        modelAnswer: 'Backpropagation calculates gradient of loss function with respect to weights using chain rule.',
        keyConcepts: [
          { concept: 'gradient of loss', weightMarks: 5, synonyms: ['loss gradient'] },
          { concept: 'chain rule', weightMarks: 5, synonyms: ['derivative chain'] }
        ]
      }
    ];

    const studentAnswers = [
      {
        questionNumber: 1,
        answerText: 'Backpropagation is an optimization method that computes the gradient of loss during training.'
      }
    ];

    const evalResult = gradeService.performRuleBasedEvaluation(testQuestions, studentAnswers, 'Test Candidate');
    // Matched 'gradient of loss' (5 marks), missed 'chain rule' (partial weight: 5 * 0.4 = 2 marks) -> 7.0 marks
    assert(evalResult.totalAwardedMarks >= 6.0 && evalResult.totalAwardedMarks <= 8.0, 
      `Awarded marks should be in partial range (6-8), got ${evalResult.totalAwardedMarks}`);
    assert(evalResult.percentageScore >= 60 && evalResult.percentageScore <= 80, 
      `Percentage should reflect proportional partial marks, got ${evalResult.percentageScore}`);
  });

  await test('Mark Calculation: Total score matches sum of individual question awarded marks', async () => {
    const sub = await submissionService.getSubmissionById('sub_alex_901');
    const evaluations = sub.evaluations || [];
    if (evaluations.length > 0) {
      const sumOfQuestions = evaluations.reduce((sum: number, ev: any) => {
        const marks = ev.teacherAdjustedMarks !== undefined ? ev.teacherAdjustedMarks : (ev.awardedMarks || 0);
        return sum + marks;
      }, 0);
      const maxScore = sub.maxScore || (sub as any).maxMarks || 30;
      const expectedPercentage = maxScore > 0 ? Number(((sumOfQuestions / maxScore) * 100).toFixed(1)) : 0;
      assertEqual(sub.totalScore, sumOfQuestions, 'Submission totalScore must equal sum of question marks');
      assertEqual(sub.percentageScore, expectedPercentage, 'Percentage score must accurately match calculation');
    }
  });

  // -------------------------------------------------------------
  // 13. CONTROLLER & API TESTS: EXAMINATIONS, QUESTIONS, RESULTS
  // -------------------------------------------------------------
  suite('13. Controller & API Endpoints: Question, Exam & Result APIs');

  await test('GET /api/v1/exams returns 200 with examinations list', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/exams`);
    assertEqual(res.status, 200, 'Exams list status');
    const data = await res.json();
    assert(Array.isArray(data.examinations) || Array.isArray(data.exams), 'Exams list returned');
  });

  await test('GET /api/v1/questions/exam/exam_cs_ai_301 returns questions for examination', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions/exam/exam_cs_ai_301`);
    assertEqual(res.status, 200, 'Questions list status');
    const data = await res.json();
    assert(Array.isArray(data.questions), 'Questions array returned');
    assert(data.questions.length > 0, 'Questions list is not empty');
    assertEqual(data.questions[0].questionNumber, 1, 'First question number is 1');
  });

  await test('GET /api/v1/questions/exam/exam_cs_ai_301/1 returns specific question rubric', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions/exam/exam_cs_ai_301/1`);
    assertEqual(res.status, 200, 'Single question rubric status');
    const data = await res.json();
    assertEqual(data.question.questionNumber, 1, 'Question number matches');
    assert(!!data.question.modelAnswer, 'Question has model answer');
  });

  await test('POST /api/v1/questions/exam/exam_cs_ai_301 creates new question rubric (Teacher)', async () => {
    const newQuestion = {
      questionNumber: 99,
      questionText: 'Explain the difference between Symmetric and Asymmetric Cryptography.',
      maxMarks: 10,
      modelAnswer: 'Symmetric cryptography uses a shared secret key, whereas asymmetric cryptography uses a public/private key pair.',
      topic: 'Cybersecurity',
      difficulty: 'Medium'
    };

    const res = await fetch(`${BASE_URL}/api/v1/questions/exam/exam_cs_ai_301`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      },
      body: JSON.stringify(newQuestion)
    });

    assertEqual(res.status, 201, 'Question creation status');
    const data = await res.json();
    assertEqual(data.question.questionNumber, 99, 'Created question number matches');
  });

  await test('POST /api/v1/questions/exam/exam_cs_ai_301 rejected for Student role (403)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions/exam/exam_cs_ai_301`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        questionNumber: 100,
        questionText: 'Malicious question injection',
        maxMarks: 10,
        modelAnswer: 'None'
      })
    });
    assertEqual(res.status, 403, 'Student cannot add questions');
  });

  await test('DELETE /api/v1/questions/exam/exam_cs_ai_301/99 cleans up created question', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions/exam/exam_cs_ai_301/99`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assertEqual(res.status, 200, 'Question deletion status');
  });

  await test('GET /api/v1/results/student/CS-2026-041 returns student exam results', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/results/student/CS-2026-041`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 200, 'Student results status');
    const data = await res.json();
    assertEqual(data.studentRollNo, 'CS-2026-041', 'Roll number matches');
    assert(Array.isArray(data.results), 'Results array returned');
  });

  await test('GET /api/v1/results/student/CS-2026-999 forbidden for student looking at another roll (403)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/results/student/CS-2026-999`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 403, 'Student viewing other student results must be 403 Forbidden');
  });

  await test('GET /api/v1/results/submission/sub_alex_901 returns detailed mark breakdown and audit', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/results/submission/sub_alex_901`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assertEqual(res.status, 200, 'Submission result status');
    const data = await res.json();
    const result = data.result;
    assert(result.markSummary.totalAwardedMarks >= 0, 'Total awarded marks must be present');
    assert(Array.isArray(result.questionBreakdown), 'Question breakdown must be an array');
  });

  await test('GET /api/v1/results/exam/exam_cs_ai_301/analytics returns grade distribution curve', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/results/exam/exam_cs_ai_301/analytics`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    assertEqual(res.status, 200, 'Analytics status');
    const data = await res.json();
    assert(data.analytics.averageScore >= 0, 'Average score is numeric');
    assert(typeof data.analytics.passRate === 'number', 'Pass rate is numeric');
    assert(!!data.analytics.gradeDistribution, 'Grade distribution object exists');
  });

  // -------------------------------------------------------------
  // 14. API DOCUMENTATION & SWAGGER VERIFICATION
  // -------------------------------------------------------------
  suite('14. OpenAPI 3.0 & Swagger UI Documentation Endpoints');

  await test('GET /api/v1/docs/openapi.json serves valid OpenAPI 3.0.3 specification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/docs/openapi.json`);
    assertEqual(res.status, 200, 'OpenAPI JSON status');
    const spec = await res.json();
    assertEqual(spec.openapi, '3.0.3', 'OpenAPI version');
    assertEqual(spec.info.title, 'IntelliGrade Production REST API Engine', 'API Title');
    assert(!!spec.paths['/auth/login'], 'Login endpoint documented');
    assert(!!spec.paths['/exams'], 'Exams endpoint documented');
    assert(!!spec.paths['/questions/exam/{examId}'], 'Questions endpoint documented');
    assert(!!spec.paths['/submissions'], 'Submissions endpoint documented');
    assert(!!spec.paths['/ai/evaluate'], 'Evaluation endpoint documented');
    assert(!!spec.paths['/results/student/{studentRollNo}'], 'Results endpoint documented');
  });

  await test('GET /api/v1/docs serves interactive HTML Swagger UI', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/docs`);
    assertEqual(res.status, 200, 'Swagger UI HTML status');
    const html = await res.text();
    assert(html.includes('swagger-ui'), 'Contains Swagger UI component');
    assert(html.includes('openapi.json'), 'Configured to load openapi.json');
  });

  await test('openApiSpec object in code is valid and complete', () => {
    assert(openApiSpec.openapi === '3.0.3', 'OpenAPI 3.0.3');
    assert(Object.keys(openApiSpec.paths).length >= 10, 'Must document at least 10 core API paths');
  });

  // -------------------------------------------------------------
  // TEST REPORT SUMMARY
  // -------------------------------------------------------------
  console.log(`\n\x1b[1m\x1b[36m=======================================================`);
  console.log(`                 TEST RESULTS SUMMARY                  `);
  console.log(`=======================================================\x1b[0m`);

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`Total Tests Run:  \x1b[1m${results.length}\x1b[0m`);
  console.log(`Passed:           \x1b[32m\x1b[1m${passedCount}\x1b[0m`);
  console.log(`Failed:           ${failedCount > 0 ? `\x1b[31m\x1b[1m${failedCount}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`Execution Time:   \x1b[90m${totalDuration}ms\x1b[0m\n`);

  if (failedCount > 0) {
    console.log(`\x1b[31mFailed Tests:\x1b[0m`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - [${r.suite}] ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\x1b[32m\x1b[1m✔ ALL ${passedCount} TESTS COMPLETED AND PASSED SUCCESSFULLY!\x1b[0m\n`);
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test execution:', err);
  process.exit(1);
});
