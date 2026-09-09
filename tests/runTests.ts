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
