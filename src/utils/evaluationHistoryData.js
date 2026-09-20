export function computeGrade(pct) {
    if (pct >= 90)
        return { grade: 'A+', passed: true };
    if (pct >= 80)
        return { grade: 'A', passed: true };
    if (pct >= 70)
        return { grade: 'B+', passed: true };
    if (pct >= 60)
        return { grade: 'B', passed: true };
    if (pct >= 50)
        return { grade: 'C', passed: true };
    if (pct >= 40)
        return { grade: 'D', passed: true };
    return { grade: 'F', passed: false };
}
export function getStatusTheme(status) {
    switch (status) {
        case 'Evaluated':
            return {
                bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                text: 'text-emerald-400',
                border: 'border-emerald-500/30',
                dot: 'bg-emerald-400'
            };
        case 'Under Review':
            return {
                bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                text: 'text-amber-400',
                border: 'border-amber-500/30',
                dot: 'bg-amber-400'
            };
        case 'AI Evaluated':
            return {
                bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                text: 'text-indigo-400',
                border: 'border-indigo-500/30',
                dot: 'bg-indigo-400'
            };
        case 'Flagged / Appeal':
            return {
                bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                text: 'text-rose-400',
                border: 'border-rose-500/30',
                dot: 'bg-rose-400'
            };
        case 'Processing':
        default:
            return {
                bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                text: 'text-purple-400',
                border: 'border-purple-500/30',
                dot: 'bg-purple-400'
            };
    }
}
// --------------------------------------------------------------------------
// Baseline Historical Evaluations Dataset (High-fidelity realistic academic data)
// --------------------------------------------------------------------------
export const BASELINE_HISTORICAL_EVALUATIONS = [
    // 1. Aarav Sharma - Current Exam (Advanced OS & AI)
    {
        id: 'EVAL-2026-CS-041-01',
        submissionId: 'sub_alex_901',
        studentName: 'Aarav Sharma',
        studentRollNumber: 'CS-2026-041',
        studentEmail: 'aarav.sharma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-blue-600 to-indigo-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-16T14:20:00Z',
        evaluationFormattedDate: '16 Sep 2026, 02:20 PM',
        totalMaxMarks: 30,
        totalAwardedMarks: 27.5,
        percentageScore: 91.7,
        letterGrade: 'A+',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Chief Course Instructor',
            designation: 'Department of Computer Science',
            verifiedAt: '2026-09-16 14:45'
        },
        ocrConfidence: 96.8,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 9.5,
                aiSuggestedMarks: 9.5,
                teacherAdjustedMarks: 9.5,
                finalMarks: 9.5,
                semanticSimilarityScore: 94.2,
                confidenceScore: 96.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Mutual exclusion is a property where only one thread/process can be inside the critical section at any single time, preventing simultaneous race conditions. A Semaphore S is a synchronization integer variable. wait(S) decrements and blocks if <=0...',
                modelAnswerSnippet: 'Mutual exclusion ensures that when one process executes in its critical section, no other process executes concurrently. Semaphores provide atomic wait() and signal() primitives...',
                teacherComment: 'Flawless explanation of atomic primitives and semaphore counter mechanics.',
                evaluationFeedback: 'Demonstrates thorough mastery of synchronization primitives and race-condition prevention.',
                strengths: ['Accurate definition of critical section boundary', 'Correct algorithmic decrement & increment behavior'],
                deductions: [{ reason: 'Minor omission of strict priority inversion caveat', pointsDeducted: 0.5, category: 'Formatting' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 9.0,
                aiSuggestedMarks: 9.0,
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                semanticSimilarityScore: 91.8,
                confidenceScore: 94.5,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Backpropagation is a supervised neural network training algorithm. It uses the differential calculus Chain Rule backwards from output layer loss to input layer...',
                modelAnswerSnippet: 'Backpropagation computes the gradient of the loss function with respect to each weight by applying the chain rule of partial derivatives backwards through network layers...',
                teacherComment: 'Mathematical derivations cleanly laid out with appropriate notation.',
                evaluationFeedback: 'Solid mathematical chain rule formulation with accurate gradient descent update rule.',
                strengths: ['Correct partial derivative equations', 'Explicit learning rate notation'],
                deductions: [{ reason: 'Brief derivation on activation function derivative step', pointsDeducted: 1.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 9.0,
                aiSuggestedMarks: 9.0,
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                semanticSimilarityScore: 90.4,
                confidenceScore: 93.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V. Query and Key compute similarity matrix, scaled by 1/sqrt(d_k) to prevent dot product values from growing too large which causes softmax gradient saturation...',
                modelAnswerSnippet: 'Attention computes alignment scores between Query and Key matrices, scaled by sqrt(d_k) to prevent softmax saturation and vanishing gradients, before taking weighted sum of Value matrix...',
                teacherComment: 'Exceptional insight into softmax saturation avoiding vanishing gradient hazards.',
                evaluationFeedback: 'Clear explanation of dimensions, variance normalization, and softmax gradient behavior.',
                strengths: ['Addressed variance scaling properly', 'Captured matrix dimension interplay accurately'],
                deductions: [{ reason: 'Did not provide toy numerical matrix dimension trace', pointsDeducted: 1.0, category: 'Missing Key Term' }]
            }
        ],
        overallFeedback: 'Exemplary performance across concurrency, calculus-based deep learning, and transformer architectures.',
        keyStrengths: ['Deep conceptual grounding', 'Accurate mathematical formulation', 'Crisp handwritten definitions'],
        growthAreas: ['Include full boundary case matrices in open-ended derivations'],
        appeal: null,
        auditTrail: [
            { stage: 'Scan Submission', timestamp: '16 Sep 2026 14:02', actor: 'Aarav Sharma (Student)', details: 'Uploaded 3-page handwritten paper' },
            { stage: 'Vision OCR Digitization', timestamp: '16 Sep 2026 14:05', actor: 'Gemini Vision Multi-Modal', details: 'Extracted 3 answers with 96.8% confidence' },
            { stage: 'AI Tri-Sheet Grading', timestamp: '16 Sep 2026 14:08', actor: 'AI Semantic Grading Engine', details: 'Assigned initial 27.5 / 30 marks' },
            { stage: 'Teacher Verification', timestamp: '16 Sep 2026 14:20', actor: 'Prof. Alok Mukherjee', details: 'Reviewed and finalized marks with zero downward override' }
        ]
    },
    // 2. Aarav Sharma - Historical Midterm 1: Concurrency & Semaphores
    {
        id: 'EVAL-2026-CS-041-02',
        submissionId: 'sub_alex_quiz1',
        studentName: 'Aarav Sharma',
        studentRollNumber: 'CS-2026-041',
        studentEmail: 'aarav.sharma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-blue-600 to-indigo-600',
        examId: 'exam_cs_quiz_01',
        examTitle: 'Quiz 1: Concurrency & IPC Primitives',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-08-12',
        evaluationDate: '2026-08-14T11:30:00Z',
        evaluationFormattedDate: '14 Aug 2026, 11:30 AM',
        totalMaxMarks: 25,
        totalAwardedMarks: 21.0,
        percentageScore: 84.0,
        letterGrade: 'A',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Dr. Sarah Jenkins',
            role: 'Associate Professor',
            designation: 'Department of Computer Science',
            verifiedAt: '2026-08-14 12:10'
        },
        ocrConfidence: 94.5,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_deadlock',
                questionText: 'State the 4 Coffman conditions for Deadlock.',
                topic: 'Deadlock Mechanics',
                maxMarks: 10,
                awardedMarks: 8.5,
                aiSuggestedMarks: 8.5,
                teacherAdjustedMarks: 8.5,
                finalMarks: 8.5,
                semanticSimilarityScore: 89.0,
                confidenceScore: 92.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: '1. Mutual Exclusion: resources cannot be shared. 2. Hold and Wait: process holds a resource while waiting for another. 3. No Preemption: resources cannot be forcibly seized. 4. Circular Wait: set of processes waiting on each other circularly.',
                modelAnswerSnippet: 'Four Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
                teacherComment: 'Good concise definitions.',
                evaluationFeedback: 'Solid recall of all 4 conditions with clear real-world definitions.',
                strengths: ['Listed all 4 conditions accurately'],
                deductions: [{ reason: 'Missed resource allocation graph example', pointsDeducted: 1.5, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_producers_consumers',
                questionText: 'Implement bounded-buffer Producer-Consumer problem using counting and mutex semaphores.',
                topic: 'Inter-Process Communication',
                maxMarks: 15,
                awardedMarks: 12.5,
                aiSuggestedMarks: 12.0,
                teacherAdjustedMarks: 12.5,
                finalMarks: 12.5,
                semanticSimilarityScore: 86.4,
                confidenceScore: 90.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Semaphores: mutex=1, empty=N, full=0. Producer does wait(empty), wait(mutex), insert, signal(mutex), signal(full). Consumer does wait(full), wait(mutex), remove, signal(mutex), signal(empty).',
                modelAnswerSnippet: 'Standard bounded buffer implementation with mutex=1, empty=BUFFER_SIZE, full=0 and careful order of wait operations to avoid deadlock...',
                teacherComment: 'Teacher granted +0.5 mark for correct nested semaphore order preventing deadlock.',
                evaluationFeedback: 'Correct semaphore ordering and loop guard conditions.',
                strengths: ['Avoided deadlock in wait order', 'Proper buffer boundary handling'],
                deductions: [{ reason: 'Minor pseudocode syntax typo in buffer indexing', pointsDeducted: 2.5, category: 'Conceptual Error' }]
            }
        ],
        overallFeedback: 'Strong foundational grasp of synchronization, concurrency, and deadlock theory.',
        keyStrengths: ['Coffman condition accuracy', 'Semaphore protocol understanding'],
        growthAreas: ['Be more thorough with circular array buffer index arithmetic'],
        appeal: null,
        auditTrail: [
            { stage: 'Submission', timestamp: '12 Aug 2026 15:00', actor: 'Aarav Sharma', details: 'Submitted Quiz 1 answer sheet' },
            { stage: 'Graded', timestamp: '14 Aug 2026 11:30', actor: 'Dr. Sarah Jenkins', details: 'Completed evaluation and published score' }
        ]
    },
    // 3. Aarav Sharma - Historical Midterm 2: Database Systems & Normalization
    {
        id: 'EVAL-2026-CS-041-03',
        submissionId: 'sub_alex_dbms',
        studentName: 'Aarav Sharma',
        studentRollNumber: 'CS-2026-041',
        studentEmail: 'aarav.sharma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-blue-600 to-indigo-600',
        examId: 'exam_dbms_midterm',
        examTitle: 'Midterm Exam: Database Systems & Normalization',
        subject: 'Database Management',
        courseCode: 'CS-204',
        gradeLevel: 'Undergraduate (Year 2)',
        examDate: '2026-07-28',
        evaluationDate: '2026-07-30T16:00:00Z',
        evaluationFormattedDate: '30 Jul 2026, 04:00 PM',
        totalMaxMarks: 40,
        totalAwardedMarks: 35.5,
        percentageScore: 88.8,
        letterGrade: 'A',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Prof. Rajesh Kulkarni',
            role: 'Database Systems Head',
            designation: 'Department of Computer Science'
        },
        ocrConfidence: 95.2,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_bcnf',
                questionText: 'Define Boyce-Codd Normal Form (BCNF) and compare it with 3NF with an anomaly example.',
                topic: 'Relational Normalization',
                maxMarks: 20,
                awardedMarks: 18.0,
                aiSuggestedMarks: 18.0,
                teacherAdjustedMarks: 18.0,
                finalMarks: 18.0,
                semanticSimilarityScore: 92.5,
                confidenceScore: 94.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'A relation R is in BCNF if for every functional dependency X -> Y, X is a superkey. In 3NF, Y can also be a prime attribute, which allows subtle anomalies that BCNF completely resolves...',
                modelAnswerSnippet: 'BCNF requires every determinant to be a superkey without exception. 3NF allows prime attribute exemptions...',
                teacherComment: 'Excellent distinction between prime attribute allowance and superkey constraints.',
                evaluationFeedback: 'Masterful breakdown of dependency preservation versus redundancy elimination.',
                strengths: ['Clear relational schema example', 'Correct functional dependency mapping'],
                deductions: [{ reason: 'Proof of lossless join decomposition was brief', pointsDeducted: 2.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_acid_tx',
                questionText: 'Explain ACID properties and strict 2-Phase Locking (2PL) protocol for serializability.',
                topic: 'Transaction Concurrency Control',
                maxMarks: 20,
                awardedMarks: 17.5,
                aiSuggestedMarks: 17.5,
                teacherAdjustedMarks: 17.5,
                finalMarks: 17.5,
                semanticSimilarityScore: 88.7,
                confidenceScore: 91.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Atomicity, Consistency, Isolation, Durability. Strict 2PL requires transactions to hold all exclusive locks until commit or abort, guaranteeing cascadeless recoverable schedules...',
                modelAnswerSnippet: 'ACID transactional guarantees enforced via Strict 2PL which prevents cascading aborts by holding write locks to the end of transaction...',
                teacherComment: 'High quality explanation of cascading abort prevention.',
                evaluationFeedback: 'Solid understanding of lock growth vs shrink phase and recovery protocols.',
                strengths: ['Clear lock compatibility matrix', 'Differentiated standard 2PL from strict 2PL'],
                deductions: [{ reason: 'Did not sketch conflict serializability precedence graph', pointsDeducted: 2.5, category: 'Formatting' }]
            }
        ],
        overallFeedback: 'Distinguished comprehension of relational schema design and transactional lock theory.',
        keyStrengths: ['Rigorous definitions', 'Clear anomaly illustrations'],
        growthAreas: ['Include precedence graphs for concurrency schedules'],
        appeal: null,
        auditTrail: [
            { stage: 'Completed', timestamp: '30 Jul 2026 16:00', actor: 'Prof. Rajesh Kulkarni', details: 'Graded and approved' }
        ]
    },
    // 4. Priya Sharma - Current Exam (Advanced OS & AI)
    {
        id: 'EVAL-2026-CS-088-01',
        submissionId: 'sub_priya_802',
        studentName: 'Priya Sharma',
        studentRollNumber: 'CS-2026-088',
        studentEmail: 'priya.sharma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-pink-600 to-rose-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-16T15:10:00Z',
        evaluationFormattedDate: '16 Sep 2026, 03:10 PM',
        totalMaxMarks: 30,
        totalAwardedMarks: 19.5,
        percentageScore: 65.0,
        letterGrade: 'B',
        passed: true,
        status: 'Under Review',
        statusCode: 'TEACHER_REVIEWED',
        statusLabel: 'Teacher In-Review',
        statusBadgeColor: getStatusTheme('Under Review'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Course Coordinator',
            designation: 'Department of Computer Science',
            verifiedAt: '2026-09-16 15:30'
        },
        ocrConfidence: 91.4,
        ocrLegibility: 'Medium',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 6.5,
                aiSuggestedMarks: 6.0,
                teacherAdjustedMarks: 6.5,
                finalMarks: null,
                semanticSimilarityScore: 68.5,
                confidenceScore: 88.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Mutual exclusion prevents two processes from running together. Semaphore is a lock that you increment and decrement. Wait takes away 1 and signal adds 1...',
                modelAnswerSnippet: 'Mutual exclusion guarantees isolated execution in critical sections. Semaphores are integer counters supporting atomic wait and signal operations...',
                teacherComment: 'Teacher granted +0.5 mark recognizing informal lock metaphor.',
                evaluationFeedback: 'Understands basic lock concept but omitted blocking queue mechanics.',
                strengths: ['Identified that wait decrements and signal increments'],
                deductions: [
                    { reason: 'Did not explain atomic sleep/wake queue mechanism', pointsDeducted: 2.0, category: 'Missing Key Term' },
                    { reason: 'Vague definition of critical section boundary', pointsDeducted: 1.5, category: 'Conceptual Error' }
                ]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 7.0,
                aiSuggestedMarks: 7.0,
                teacherAdjustedMarks: 7.0,
                finalMarks: null,
                semanticSimilarityScore: 72.0,
                confidenceScore: 89.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Backpropagation takes error at end and updates weights backward. We calculate partial derivatives using calculus chain rule. w = w - learning_rate * dE/dw...',
                modelAnswerSnippet: 'Gradient computation across hidden layers using chain rule of partial derivatives and gradient descent weight update equation...',
                teacherComment: 'Decent gradient update equation, missing intermediate hidden layer chain derivation.',
                evaluationFeedback: 'Solid recall of gradient descent weight update equation.',
                strengths: ['Correct weight update formula', 'Identified backward flow of errors'],
                deductions: [{ reason: 'Missing activation function derivative expansion', pointsDeducted: 3.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 6.0,
                aiSuggestedMarks: 6.0,
                teacherAdjustedMarks: 6.0,
                finalMarks: null,
                semanticSimilarityScore: 64.0,
                confidenceScore: 87.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Attention matches Query with Key and multiplies Value. Softmax is used. We divide by square root of d_k so that numbers do not get too big in the computer...',
                modelAnswerSnippet: 'Attention computes alignment between Q and K scaled by sqrt(d_k) to prevent softmax gradient saturation...',
                teacherComment: 'Stated "numbers do not get too big" which is intuitive, but missed softmax gradient saturation explanation.',
                evaluationFeedback: 'Understands scaling prevents overflow but needs formal mathematical justification.',
                strengths: ['Correct formula components identified'],
                deductions: [{ reason: 'Failed to mention vanishing gradient or flattened softmax derivatives', pointsDeducted: 4.0, category: 'Conceptual Error' }]
            }
        ],
        overallFeedback: 'Satisfactory conceptual grasp, but requires more rigorous mathematical derivations.',
        keyStrengths: ['Intuitive understanding of mechanisms', 'Neat diagrammatic presentation'],
        growthAreas: ['Include exact mathematical formulas for chain rule expansions', 'Revise softmax gradient behavior'],
        appeal: {
            id: 'APP-2026-088-01',
            requestedAt: '16 Sep 2026 16:30',
            questionNumber: 1,
            reason: 'Described counting semaphore waiting queue in detail on sheet margin',
            studentClaim: 'I wrote the waiting queue logic in the left margin next to question 1 which might have had lower OCR confidence.',
            status: 'Pending'
        },
        auditTrail: [
            { stage: 'Scan Submission', timestamp: '16 Sep 2026 14:15', actor: 'Priya Sharma', details: 'Uploaded 2-page handwritten paper' },
            { stage: 'AI Tri-Sheet Grading', timestamp: '16 Sep 2026 14:22', actor: 'AI Semantic Grading Engine', details: 'Assigned 19.0 / 30 marks' },
            { stage: 'Teacher Review', timestamp: '16 Sep 2026 15:10', actor: 'Prof. Alok Mukherjee', details: 'Adjusted to 19.5; Flagged for manual margin inspection' }
        ]
    },
    // 5. Priya Sharma - Historical Cellular Respiration & Bioenergetics
    {
        id: 'EVAL-2026-BIO-088-01',
        submissionId: 'sub_priya_bio',
        studentName: 'Priya Sharma',
        studentRollNumber: 'CS-2026-088',
        studentEmail: 'priya.sharma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-pink-600 to-rose-600',
        examId: 'exam_bio_202',
        examTitle: 'Cellular Respiration & Bioenergetics',
        subject: 'Molecular Biology',
        courseCode: 'BIO-202',
        gradeLevel: 'College Sophomore',
        examDate: '2026-08-20',
        evaluationDate: '2026-08-22T10:15:00Z',
        evaluationFormattedDate: '22 Aug 2026, 10:15 AM',
        totalMaxMarks: 20,
        totalAwardedMarks: 16.0,
        percentageScore: 80.0,
        letterGrade: 'A',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Dr. Evelyn Reed',
            role: 'Biochemistry Faculty',
            designation: 'School of Biological Sciences'
        },
        ocrConfidence: 93.8,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_glycolysis',
                questionText: 'Outline key phases of Glycolysis in cytoplasm and state net yield of ATP, NADH, Pyruvate.',
                topic: 'Metabolism - Glycolysis',
                maxMarks: 10,
                awardedMarks: 8.5,
                aiSuggestedMarks: 8.5,
                teacherAdjustedMarks: 8.5,
                finalMarks: 8.5,
                semanticSimilarityScore: 88.5,
                confidenceScore: 92.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Glycolysis happens in cytoplasm. Phase 1 is energy investment spending 2 ATP. Phase 2 is payoff producing 4 ATP. Net yield is 2 Pyruvate, 2 net ATP, and 2 NADH...',
                modelAnswerSnippet: 'Location in cytosol, energy investment phase, energy payoff phase, net stoichiometric yield: 2 pyruvate, 2 ATP, 2 NADH...',
                teacherComment: 'Very clear stoichiometric breakdown.',
                evaluationFeedback: 'Exact stoichiometric counts provided correctly.',
                strengths: ['Identified cytoplasm location', 'Accurate net ATP yield'],
                deductions: [{ reason: 'Omitted substrate-level phosphorylation enzyme name', pointsDeducted: 1.5, category: 'Missing Key Term' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_chemiosmosis',
                questionText: 'Explain Chemiosmosis and role of ATP Synthase in mitochondrial inner membrane.',
                topic: 'Oxidative Phosphorylation',
                maxMarks: 10,
                awardedMarks: 7.5,
                aiSuggestedMarks: 7.5,
                teacherAdjustedMarks: 7.5,
                finalMarks: 7.5,
                semanticSimilarityScore: 82.0,
                confidenceScore: 90.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Chemiosmosis is movement of protons down their concentration gradient. Protons are pumped by electron transport chain into intermembrane space. When they flow back through ATP synthase motor, ADP turns into ATP...',
                modelAnswerSnippet: 'Electrochemical proton gradient across inner mitochondrial membrane driving rotary catalytic synthesis of ATP via ATP synthase...',
                teacherComment: 'Good mechanical description of proton motive force.',
                evaluationFeedback: 'Clear explanation of proton gradient coupling to ATP synthesis.',
                strengths: ['Addressed proton motive force clearly'],
                deductions: [{ reason: 'Did not mention F0 and F1 subunits of ATP synthase', pointsDeducted: 2.5, category: 'Conceptual Error' }]
            }
        ],
        overallFeedback: 'Very good grasp of metabolic pathways and cellular bioenergetics.',
        keyStrengths: ['Accurate stoichiometry', 'Clear prose on proton motive force'],
        growthAreas: ['Memorize molecular subunit structures'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '22 Aug 2026 10:15', actor: 'Dr. Evelyn Reed', details: 'Graded and approved' }
        ]
    },
    // 6. Meera Nair - Advanced OS & AI
    {
        id: 'EVAL-2026-CS-012-01',
        submissionId: 'sub_meera_012',
        studentName: 'Meera Nair',
        studentRollNumber: 'CS-2026-012',
        studentEmail: 'meera.nair@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-emerald-600 to-teal-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-16T16:40:00Z',
        evaluationFormattedDate: '16 Sep 2026, 04:40 PM',
        totalMaxMarks: 30,
        totalAwardedMarks: 28.0,
        percentageScore: 93.3,
        letterGrade: 'A+',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Chief Course Instructor',
            designation: 'Department of Computer Science'
        },
        ocrConfidence: 98.1,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 9.0,
                aiSuggestedMarks: 9.0,
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                semanticSimilarityScore: 92.0,
                confidenceScore: 95.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Mutual exclusion is the foundational synchronization requirement preventing concurrent execution within critical sections. Binary semaphores ensure mutual exclusion with atomic decrement/block and increment/unblock operations...',
                modelAnswerSnippet: 'Mutual exclusion ensures isolated execution in critical sections. Semaphores are integer counters supporting atomic wait and signal operations...',
                teacherComment: 'Outstanding mathematical clarity and precise algorithmic pseudocode.',
                evaluationFeedback: 'Demonstrates deep academic understanding of OS concurrency constructs.',
                strengths: ['Accurate definition', 'Clean atomic primitives'],
                deductions: [{ reason: 'Minor stylistic brevity', pointsDeducted: 1.0, category: 'Formatting' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 9.5,
                aiSuggestedMarks: 9.5,
                teacherAdjustedMarks: 9.5,
                finalMarks: 9.5,
                semanticSimilarityScore: 96.0,
                confidenceScore: 97.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Complete derivation with vector Jacobians and partial derivatives dL/dw_ij = dL/da_j * da_j/dz_j * dz_j/dw_ij...',
                modelAnswerSnippet: 'Full chain rule of loss with respect to weights across arbitrary layer depth...',
                teacherComment: 'Highest scoring answer in the cohort on question 2. Vectorized notation is flawless.',
                evaluationFeedback: 'Exceptional vector calculus notation with clear layer index tracking.',
                strengths: ['Full Jacobian expansion', 'Clear computational graph'],
                deductions: [{ reason: 'Minor symbol formatting slip', pointsDeducted: 0.5, category: 'Formatting' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 9.5,
                aiSuggestedMarks: 9.5,
                teacherAdjustedMarks: 9.5,
                finalMarks: 9.5,
                semanticSimilarityScore: 95.0,
                confidenceScore: 96.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V. The scaling factor is necessary because dot product variance scales linearly with d_k, pushing values into regions with microscopic gradients...',
                modelAnswerSnippet: 'Attention computes similarity alignment between Query and Key matrices, scaled by sqrt(d_k)...',
                teacherComment: 'Comprehensive explanation of variance scaling and gradient decay.',
                evaluationFeedback: 'Superb statistical justification for the scaling divisor.',
                strengths: ['Identified linear variance scaling with d_k', 'Accurate mathematical formulation'],
                deductions: [{ reason: 'Did not mention multi-head projection concat step', pointsDeducted: 0.5, category: 'Missing Key Term' }]
            }
        ],
        overallFeedback: 'Highest scoring overall paper in the department. Outstanding mathematical rigour.',
        keyStrengths: ['Vector calculus precision', 'Statistical intuition for transformer scaling'],
        growthAreas: ['None at this level; consider publishing study notes for cohort'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '16 Sep 2026 16:40', actor: 'Prof. Alok Mukherjee', details: 'Full review completed' }
        ]
    },
    // 7. Rohan Varma - Advanced OS & AI
    {
        id: 'EVAL-2026-CS-024-01',
        submissionId: 'sub_rohan_024',
        studentName: 'Rohan Varma',
        studentRollNumber: 'CS-2026-024',
        studentEmail: 'rohan.varma@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-amber-600 to-orange-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-15T11:00:00Z',
        evaluationFormattedDate: '15 Sep 2026, 11:00 AM',
        totalMaxMarks: 30,
        totalAwardedMarks: 25.0,
        percentageScore: 83.3,
        letterGrade: 'A',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Chief Course Instructor',
            designation: 'Department of Computer Science'
        },
        ocrConfidence: 94.0,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 8.5,
                aiSuggestedMarks: 8.5,
                teacherAdjustedMarks: 8.5,
                finalMarks: 8.5,
                semanticSimilarityScore: 88.0,
                confidenceScore: 92.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Mutual exclusion guarantees single-thread entry. Semaphore is an atomic variable initialized to 1 for binary mutex...',
                modelAnswerSnippet: 'Mutual exclusion ensures that when one process executes in its critical section, no other process executes...',
                teacherComment: 'Very solid answer.',
                evaluationFeedback: 'Good understanding of binary semaphore mechanics.',
                strengths: ['Clear terminology'],
                deductions: [{ reason: 'Missed starvation boundary condition', pointsDeducted: 1.5, category: 'Conceptual Error' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 8.0,
                aiSuggestedMarks: 8.0,
                teacherAdjustedMarks: 8.0,
                finalMarks: 8.0,
                semanticSimilarityScore: 84.5,
                confidenceScore: 90.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Chain rule backwards from L to w. dL/dw = dL/dy * dy/dz * dz/dw. Update w = w - alpha * grad...',
                modelAnswerSnippet: 'Backpropagation computes the gradient of the loss function with respect to weights...',
                teacherComment: 'Good formulation of chain rule.',
                evaluationFeedback: 'Solid execution of gradient derivation.',
                strengths: ['Explicit learning rate alpha notation'],
                deductions: [{ reason: 'Omitted bias term gradient', pointsDeducted: 2.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 8.5,
                aiSuggestedMarks: 8.5,
                teacherAdjustedMarks: 8.5,
                finalMarks: 8.5,
                semanticSimilarityScore: 87.0,
                confidenceScore: 91.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Attention = softmax(QK^T / sqrt(d_k)) * V. Query is matched with Key, scaled by sqrt(d_k) to prevent softmax saturation, and multiplied by Value...',
                modelAnswerSnippet: 'Attention computes alignment between Query and Key matrices...',
                teacherComment: 'Good coverage of softmax saturation.',
                evaluationFeedback: 'Accurate formula and clear explanation of softmax behavior.',
                strengths: ['Identified vanishing gradient risk'],
                deductions: [{ reason: 'Matrix dimension labels were missing on V', pointsDeducted: 1.5, category: 'Formatting' }]
            }
        ],
        overallFeedback: 'Very strong performance showing consistent academic competence.',
        keyStrengths: ['Reliable formula accuracy', 'Good handwritten clarity'],
        growthAreas: ['Remember to include bias gradients when deriving neural layers'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '15 Sep 2026 11:00', actor: 'Prof. Alok Mukherjee', details: 'Evaluation verified' }
        ]
    },
    // 8. Kunal Bansal - Advanced OS & AI (Needs support - <60%)
    {
        id: 'EVAL-2026-CS-092-01',
        submissionId: 'sub_kunal_092',
        studentName: 'Kunal Bansal',
        studentRollNumber: 'CS-2026-092',
        studentEmail: 'kunal.bansal@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-red-600 to-amber-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-14T09:30:00Z',
        evaluationFormattedDate: '14 Sep 2026, 09:30 AM',
        totalMaxMarks: 30,
        totalAwardedMarks: 13.5,
        percentageScore: 45.0,
        letterGrade: 'F',
        passed: false,
        status: 'Flagged / Appeal',
        statusCode: 'APPEAL_PENDING',
        statusLabel: 'Flagged / Remediation Needed',
        statusBadgeColor: getStatusTheme('Flagged / Appeal'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Chief Course Instructor',
            designation: 'Department of Computer Science'
        },
        ocrConfidence: 86.4,
        ocrLegibility: 'Low',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 4.5,
                aiSuggestedMarks: 4.0,
                teacherAdjustedMarks: 4.5,
                finalMarks: 4.5,
                semanticSimilarityScore: 48.0,
                confidenceScore: 82.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Mutual exclusion means processes do not stop each other. Semaphore is like a traffic light. wait is red and signal is green...',
                modelAnswerSnippet: 'Mutual exclusion prevents simultaneous entry into critical section...',
                teacherComment: 'Gave partial credit for traffic light analogy, but definition of mutual exclusion is backwards.',
                evaluationFeedback: 'Critical conceptual misconception: mutual exclusion prevents concurrent execution, not stopping each other.',
                strengths: ['Identified synchronization role of semaphores'],
                deductions: [
                    { reason: 'Reversed definition of mutual exclusion', pointsDeducted: 3.5, category: 'Conceptual Error' },
                    { reason: 'Did not specify atomic decrement/increment primitives', pointsDeducted: 2.0, category: 'Missing Key Term' }
                ]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 4.0,
                aiSuggestedMarks: 4.0,
                teacherAdjustedMarks: 4.0,
                finalMarks: 4.0,
                semanticSimilarityScore: 44.0,
                confidenceScore: 80.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Backpropagation trains network by sending error backwards. Chain rule multiplies derivatives...',
                modelAnswerSnippet: 'Gradient computation across layers using chain rule of partial derivatives...',
                teacherComment: 'Very brief, no algebraic derivation of layer weights.',
                evaluationFeedback: 'General conceptual awareness without required algebraic derivation.',
                strengths: ['Recognized backward error flow'],
                deductions: [
                    { reason: 'No mathematical equations provided for loss gradient', pointsDeducted: 4.0, category: 'Incomplete Steps' },
                    { reason: 'Missing weight update equation', pointsDeducted: 2.0, category: 'Missing Key Term' }
                ]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 5.0,
                aiSuggestedMarks: 5.0,
                teacherAdjustedMarks: 5.0,
                finalMarks: 5.0,
                semanticSimilarityScore: 52.0,
                confidenceScore: 84.0,
                evaluationStatus: 'TEACHER_REVIEWED',
                studentAnswerSnippet: 'Formula is Attention = Q * K / sqrt(d) * V. It divides by square root of d so the matrix multiplication is square...',
                modelAnswerSnippet: 'Attention computes alignment between Q and K scaled by sqrt(d_k)...',
                teacherComment: 'Fatal misconception: scaling is for gradient variance, not to make the matrix square.',
                evaluationFeedback: 'Demonstrates common misconception that scaling modifies matrix shape rather than preventing softmax saturation.',
                strengths: ['Recalled Q, K, V components'],
                deductions: [
                    { reason: 'Omitted softmax function in formula', pointsDeducted: 2.5, category: 'Missing Key Term' },
                    { reason: 'Fatal misconception on matrix square shape', pointsDeducted: 2.5, category: 'Conceptual Error' }
                ]
            }
        ],
        overallFeedback: 'Below passing threshold. Student requires targeted remediation in calculus derivations and synchronization theory.',
        keyStrengths: ['Basic familiarity with topics'],
        growthAreas: ['Schedule office hours for Backpropagation chain rule', 'Review semaphore atomic primitives'],
        appeal: {
            id: 'APP-2026-092-01',
            requestedAt: '15 Sep 2026 10:00',
            questionNumber: 3,
            reason: 'Requested re-evaluation for formula credit in question 3',
            studentClaim: 'I wrote Q * K / sqrt(d) * V which is mostly the formula, I request partial marks for remembering the three matrices.',
            status: 'Pending'
        },
        auditTrail: [
            { stage: 'Flagged', timestamp: '14 Sep 2026 09:30', actor: 'AI Evaluator', details: 'Score below 50% threshold; routed to remediation' }
        ]
    },
    // 9. Zoya Khan - Cellular Respiration & Bioenergetics
    {
        id: 'EVAL-2026-BIO-056-01',
        submissionId: 'sub_zoya_bio',
        studentName: 'Zoya Khan',
        studentRollNumber: 'CS-2026-056',
        studentEmail: 'zoya.khan@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-purple-600 to-indigo-600',
        examId: 'exam_bio_202',
        examTitle: 'Cellular Respiration & Bioenergetics',
        subject: 'Molecular Biology',
        courseCode: 'BIO-202',
        gradeLevel: 'College Sophomore',
        examDate: '2026-08-20',
        evaluationDate: '2026-08-23T14:00:00Z',
        evaluationFormattedDate: '23 Aug 2026, 02:00 PM',
        totalMaxMarks: 20,
        totalAwardedMarks: 17.0,
        percentageScore: 85.0,
        letterGrade: 'A',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Dr. Evelyn Reed',
            role: 'Biochemistry Faculty',
            designation: 'School of Biological Sciences'
        },
        ocrConfidence: 96.0,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_glycolysis',
                questionText: 'Outline key phases of Glycolysis in cytoplasm and state net yield of ATP, NADH, Pyruvate.',
                topic: 'Metabolism - Glycolysis',
                maxMarks: 10,
                awardedMarks: 9.0,
                aiSuggestedMarks: 9.0,
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                semanticSimilarityScore: 92.0,
                confidenceScore: 94.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Occurs in the cytoplasm. Investment phase uses 2 ATP. Payoff phase yields 4 ATP and 2 NADH. Net yield is 2 ATP, 2 NADH, 2 Pyruvate molecules...',
                modelAnswerSnippet: 'Glycolysis phases and exact stoichiometry...',
                teacherComment: 'Very concise and mathematically accurate.',
                evaluationFeedback: 'Solid execution of metabolic phase descriptions.',
                strengths: ['Exact stoichiometry', 'Identified substrate level phosphorylation'],
                deductions: [{ reason: 'Brief mention of hexokinase step', pointsDeducted: 1.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_chemiosmosis',
                questionText: 'Explain Chemiosmosis and role of ATP Synthase in mitochondrial inner membrane.',
                topic: 'Oxidative Phosphorylation',
                maxMarks: 10,
                awardedMarks: 8.0,
                aiSuggestedMarks: 8.0,
                teacherAdjustedMarks: 8.0,
                finalMarks: 8.0,
                semanticSimilarityScore: 85.0,
                confidenceScore: 91.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Protons are pumped by ETC into the intermembrane space creating an electrochemical gradient (proton motive force). As protons return through ATP synthase, ADP + Pi synthesizes ATP...',
                modelAnswerSnippet: 'Electrochemical proton gradient across inner mitochondrial membrane...',
                teacherComment: 'Accurate terminology throughout.',
                evaluationFeedback: 'Good conceptual understanding of rotary catalytic synthesis.',
                strengths: ['Identified proton motive force correctly'],
                deductions: [{ reason: 'Did not mention chemical uncouplers', pointsDeducted: 2.0, category: 'Missing Key Term' }]
            }
        ],
        overallFeedback: 'Consistently high caliber work with strong technical nomenclature.',
        keyStrengths: ['Stoichiometric precision', 'Clear handwriting and diagrams'],
        growthAreas: ['Include regulatory enzymes like PFK-1'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '23 Aug 2026 14:00', actor: 'Dr. Evelyn Reed', details: 'Score approved' }
        ]
    },
    // 10. Kabir Malhotra - Advanced OS & AI (Under Review)
    {
        id: 'EVAL-2026-CS-062-01',
        submissionId: 'sub_kabir_062',
        studentName: 'Kabir Malhotra',
        studentRollNumber: 'CS-2026-062',
        studentEmail: 'kabir.malhotra@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-cyan-600 to-blue-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-15T18:20:00Z',
        evaluationFormattedDate: '15 Sep 2026, 06:20 PM',
        totalMaxMarks: 30,
        totalAwardedMarks: 16.5,
        percentageScore: 55.0,
        letterGrade: 'C',
        passed: true,
        status: 'AI Evaluated',
        statusCode: 'AI_SUGGESTED',
        statusLabel: 'AI Evaluated (Pending Teacher Sign-off)',
        statusBadgeColor: getStatusTheme('AI Evaluated'),
        evaluator: {
            name: 'IntelliGrade AI Vision v3.8',
            role: 'Automated Tri-Sheet Grading Engine',
            designation: 'Awaiting Faculty Verification'
        },
        ocrConfidence: 91.0,
        ocrLegibility: 'Medium',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 5.5,
                aiSuggestedMarks: 5.5,
                teacherAdjustedMarks: null,
                finalMarks: null,
                semanticSimilarityScore: 58.0,
                confidenceScore: 86.0,
                evaluationStatus: 'AI_SUGGESTED',
                studentAnswerSnippet: 'Mutual exclusion is making sure only one code runs critical section. Semaphore wait makes process wait, signal allows next process...',
                modelAnswerSnippet: 'Mutual exclusion guarantees isolated execution in critical sections...',
                teacherComment: 'Pending teacher confirmation of informal phrasing.',
                evaluationFeedback: 'Basic grasp of locking without mentioning atomic integer variable.',
                strengths: ['Recognized critical section goal'],
                deductions: [{ reason: 'Did not describe atomic integer variable S or blocking queue', pointsDeducted: 4.5, category: 'Missing Key Term' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 5.0,
                aiSuggestedMarks: 5.0,
                teacherAdjustedMarks: null,
                finalMarks: null,
                semanticSimilarityScore: 54.0,
                confidenceScore: 85.0,
                evaluationStatus: 'AI_SUGGESTED',
                studentAnswerSnippet: 'Backprop computes derivatives backwards using chain rule. Loss function is minimized by gradient descent w = w - lr * dLoss/dw...',
                modelAnswerSnippet: 'Gradient computation across hidden layers using chain rule of partial derivatives...',
                teacherComment: 'Formula correct, needs teacher confirmation on partial steps.',
                evaluationFeedback: 'Included update rule but skipped hidden layer derivative decomposition.',
                strengths: ['Provided gradient descent update equation'],
                deductions: [{ reason: 'Missing intermediate layer activation derivative steps', pointsDeducted: 5.0, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 6.0,
                aiSuggestedMarks: 6.0,
                teacherAdjustedMarks: null,
                finalMarks: null,
                semanticSimilarityScore: 62.0,
                confidenceScore: 88.0,
                evaluationStatus: 'AI_SUGGESTED',
                studentAnswerSnippet: 'Attention(Q,K,V) = softmax((Q*K^T)/sqrt(d_k))*V. We divide by sqrt(d_k) so dot products do not grow too huge and push softmax gradients to zero...',
                modelAnswerSnippet: 'Attention computes alignment between Q and K scaled by sqrt(d_k)...',
                teacherComment: 'Correct formula and correctly noted vanishing gradient.',
                evaluationFeedback: 'Solid recall of formula and vanishing gradient consequence.',
                strengths: ['Correct mathematical formula and identified softmax saturation'],
                deductions: [{ reason: 'Did not explain variance scaling math', pointsDeducted: 4.0, category: 'Incomplete Steps' }]
            }
        ],
        overallFeedback: 'AI evaluation suggests 55% score. Ready for instructor override and confirmation.',
        keyStrengths: ['Formula recall for attention mechanism'],
        growthAreas: ['Elaborate on calculus steps in neural network backpropagation'],
        appeal: null,
        auditTrail: [
            { stage: 'AI Tri-Sheet Evaluated', timestamp: '15 Sep 2026 18:20', actor: 'AI Grading Engine', details: 'Automated evaluation ready for teacher sign-off' }
        ]
    },
    // 11. Ananya Iyer - Advanced OS & AI
    {
        id: 'EVAL-2026-CS-033-01',
        submissionId: 'sub_ananya_033',
        studentName: 'Ananya Iyer',
        studentRollNumber: 'CS-2026-033',
        studentEmail: 'ananya.iyer@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-violet-600 to-fuchsia-600',
        examId: 'exam_cs_ai_301',
        examTitle: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science',
        courseCode: 'CS-301',
        gradeLevel: 'Undergraduate (Year 3)',
        examDate: '2026-09-20',
        evaluationDate: '2026-09-15T15:30:00Z',
        evaluationFormattedDate: '15 Sep 2026, 03:30 PM',
        totalMaxMarks: 30,
        totalAwardedMarks: 23.5,
        percentageScore: 78.3,
        letterGrade: 'B+',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Prof. Alok Mukherjee',
            role: 'Chief Course Instructor',
            designation: 'Department of Computer Science'
        },
        ocrConfidence: 95.0,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_process_sync',
                questionText: 'Explain Mutual Exclusion and how Semaphores solve the Critical Section Problem with wait() and signal().',
                topic: 'Concurrency & Synchronization',
                maxMarks: 10,
                awardedMarks: 8.0,
                aiSuggestedMarks: 8.0,
                teacherAdjustedMarks: 8.0,
                finalMarks: 8.0,
                semanticSimilarityScore: 84.0,
                confidenceScore: 91.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Mutual exclusion prevents race conditions by restricting access to a single process. Semaphores use wait (decrement) and signal (increment) to control access...',
                modelAnswerSnippet: 'Mutual exclusion ensures isolated execution in critical sections...',
                teacherComment: 'Good explanation of race condition avoidance.',
                evaluationFeedback: 'Clear understanding of critical section protection.',
                strengths: ['Identified race condition avoidance'],
                deductions: [{ reason: 'Brief definition of counting vs binary semaphore', pointsDeducted: 2.0, category: 'Missing Key Term' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_neural_backprop',
                questionText: 'Derive Backpropagation training algorithm using chain rule of calculus for loss gradients.',
                topic: 'Neural Networks & Optimization',
                maxMarks: 10,
                awardedMarks: 7.5,
                aiSuggestedMarks: 7.5,
                teacherAdjustedMarks: 7.5,
                finalMarks: 7.5,
                semanticSimilarityScore: 80.0,
                confidenceScore: 89.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Loss function E = 1/2 sum(y - t)^2. By chain rule dE/dw = dE/dy * dy/dz * dz/dw. Weights are adjusted via gradient descent...',
                modelAnswerSnippet: 'Backpropagation computes the gradient of the loss function...',
                teacherComment: 'Good MSE loss equation and chain rule formulation.',
                evaluationFeedback: 'Accurate loss equation with standard gradient descent rule.',
                strengths: ['Explicit MSE equation provided'],
                deductions: [{ reason: 'Omitted hidden-to-hidden layer recurrence', pointsDeducted: 2.5, category: 'Incomplete Steps' }]
            },
            {
                questionNumber: 3,
                questionId: 'q3_transformer_attention',
                questionText: 'Explain Scaled Dot-Product Attention formula Attention(Q,K,V) and why scaling factor sqrt(d_k) is required.',
                topic: 'Transformers & Attention Mechanisms',
                maxMarks: 10,
                awardedMarks: 8.0,
                aiSuggestedMarks: 8.0,
                teacherAdjustedMarks: 8.0,
                finalMarks: 8.0,
                semanticSimilarityScore: 83.0,
                confidenceScore: 90.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Attention = softmax(QK^T / sqrt(d_k)) * V. Scaling by sqrt(d_k) keeps the variance at 1 so softmax does not peak too sharp...',
                modelAnswerSnippet: 'Attention computes alignment between Q and K scaled by sqrt(d_k)...',
                teacherComment: 'Noted that variance is kept at 1 to prevent sharp softmax peaks.',
                evaluationFeedback: 'Solid intuitive and statistical grasp of softmax temperature scaling.',
                strengths: ['Mentioned variance normalization to 1'],
                deductions: [{ reason: 'Missing value matrix dimension specification', pointsDeducted: 2.0, category: 'Formatting' }]
            }
        ],
        overallFeedback: 'Strong academic performance across all exam components.',
        keyStrengths: ['Mathematical clarity', 'Well structured paragraphs'],
        growthAreas: ['Expand on multi-layer backpropagation steps'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '15 Sep 2026 15:30', actor: 'Prof. Alok Mukherjee', details: 'Score finalized' }
        ]
    },
    // 12. Dev Patel - Discrete Mathematics & Graph Theory (Math Subject)
    {
        id: 'EVAL-2026-MATH-049-01',
        submissionId: 'sub_dev_math',
        studentName: 'Dev Patel',
        studentRollNumber: 'CS-2026-049',
        studentEmail: 'dev.patel@campus.edu',
        department: 'Computer Science & Engineering',
        avatarColor: 'from-amber-600 to-yellow-600',
        examId: 'exam_math_ds_2026',
        examTitle: 'Discrete Mathematics & Graph Algorithms',
        subject: 'Mathematics',
        courseCode: 'MATH-210',
        gradeLevel: 'Undergraduate (Year 2)',
        examDate: '2026-08-05',
        evaluationDate: '2026-08-08T12:00:00Z',
        evaluationFormattedDate: '08 Aug 2026, 12:00 PM',
        totalMaxMarks: 25,
        totalAwardedMarks: 18.5,
        percentageScore: 74.0,
        letterGrade: 'B+',
        passed: true,
        status: 'Evaluated',
        statusCode: 'TEACHER_FINALIZED',
        statusLabel: 'Evaluated & Finalized',
        statusBadgeColor: getStatusTheme('Evaluated'),
        evaluator: {
            name: 'Dr. Ramesh Sharma',
            role: 'Professor of Mathematics',
            designation: 'Department of Mathematics'
        },
        ocrConfidence: 93.0,
        ocrLegibility: 'High',
        questionEvaluations: [
            {
                questionNumber: 1,
                questionId: 'q1_dijkstra',
                questionText: 'State Dijkstra\'s shortest path algorithm and prove why it fails with negative edge weights.',
                topic: 'Graph Algorithms',
                maxMarks: 15,
                awardedMarks: 11.5,
                aiSuggestedMarks: 11.5,
                teacherAdjustedMarks: 11.5,
                finalMarks: 11.5,
                semanticSimilarityScore: 82.0,
                confidenceScore: 90.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'Dijkstra finds shortest path from source using a priority queue. It is greedy and assumes once a node is visited its distance is final. With negative edge weights, a longer path can later become shorter...',
                modelAnswerSnippet: 'Greedy choice property invalidated by negative edge cycles or weights...',
                teacherComment: 'Good counter-example graph provided.',
                evaluationFeedback: 'Understands greedy assumption failure with negative edges.',
                strengths: ['Provided clear 3-node counter-example'],
                deductions: [{ reason: 'Time complexity with Fibonacci heap omitted', pointsDeducted: 3.5, category: 'Missing Key Term' }]
            },
            {
                questionNumber: 2,
                questionId: 'q2_eulerian_graph',
                questionText: 'State necessary and sufficient condition for an undirected connected graph to have an Eulerian Circuit.',
                topic: 'Graph Theory',
                maxMarks: 10,
                awardedMarks: 7.0,
                aiSuggestedMarks: 7.0,
                teacherAdjustedMarks: 7.0,
                finalMarks: 7.0,
                semanticSimilarityScore: 80.0,
                confidenceScore: 89.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                studentAnswerSnippet: 'A connected graph has an Eulerian circuit if and only if every vertex has an even degree...',
                modelAnswerSnippet: 'Connected graph where every vertex has even degree...',
                teacherComment: 'Correct theorem stated.',
                evaluationFeedback: 'Accurate theorem statement.',
                strengths: ['Identified even degree condition'],
                deductions: [{ reason: 'Proof sketch for inductive cycle removal was incomplete', pointsDeducted: 3.0, category: 'Incomplete Steps' }]
            }
        ],
        overallFeedback: 'Good understanding of algorithmic graph theory principles.',
        keyStrengths: ['Counter-example design', 'Clean handwriting'],
        growthAreas: ['Include formal inductive proofs'],
        appeal: null,
        auditTrail: [
            { stage: 'Finalized', timestamp: '08 Aug 2026 12:00', actor: 'Dr. Ramesh Sharma', details: 'Grade confirmed' }
        ]
    }
];
/**
 * Combines live dynamic submissions in state with baseline historical records,
 * producing an authoritative, synchronized list of evaluation records.
 */
export function buildUnifiedEvaluationHistory(activeSubmissions = [], exams = []) {
    const result = [...BASELINE_HISTORICAL_EVALUATIONS];
    // Map any active live submissions from App.jsx state that might be newer or custom
    activeSubmissions.forEach((sub) => {
        // Check if this submission is already represented in baseline
        const existingIndex = result.findIndex((e) => e.submissionId === sub.id || (e.studentRollNumber === sub.studentRollNumber && e.examId === sub.examId));
        const relatedExam = exams.find((e) => e.id === sub.examId);
        const examTitle = relatedExam?.title || 'Examination';
        const subject = relatedExam?.subject || 'Computer Science';
        const courseCode = relatedExam?.courseCode || 'CS-301';
        const maxMarks = sub.totalMaxMarks || relatedExam?.totalMarks || 30;
        const awardedMarks = sub.totalAwardedMarks || 0;
        const pct = sub.percentageScore || (maxMarks > 0 ? (awardedMarks / maxMarks) * 100 : 0);
        const { grade, passed } = computeGrade(pct);
        let status = 'Evaluated';
        let statusCode = 'TEACHER_FINALIZED';
        let statusLabel = 'Evaluated & Finalized';
        if (sub.status === 'UNDER_REVIEW' || sub.status === 'Under Review') {
            status = 'Under Review';
            statusCode = 'TEACHER_REVIEWED';
            statusLabel = 'Teacher In-Review';
        }
        else if (sub.status === 'Flagged') {
            status = 'Flagged / Appeal';
            statusCode = 'APPEAL_PENDING';
            statusLabel = 'Flagged / Appeal Filed';
        }
        else if (sub.status === 'PROCESSING' || sub.status === 'WAITING') {
            status = 'Processing';
            statusCode = 'PROCESSING';
            statusLabel = 'Processing Vision OCR';
        }
        else if (sub.questionEvaluations?.some((q) => q.evaluationStatus === 'AI_SUGGESTED')) {
            status = 'AI Evaluated';
            statusCode = 'AI_SUGGESTED';
            statusLabel = 'AI Evaluated (Pending Sign-off)';
        }
        const newRecord = {
            id: `EVAL-${sub.studentRollNumber.replace(/[^a-zA-Z0-9]/g, '')}-${sub.id.slice(-4)}`,
            submissionId: sub.id,
            studentName: sub.studentName,
            studentRollNumber: sub.studentRollNumber,
            studentEmail: `${sub.studentName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
            department: 'Computer Science & Engineering',
            avatarColor: 'from-blue-600 to-indigo-600',
            examId: sub.examId,
            examTitle,
            subject,
            courseCode,
            gradeLevel: relatedExam?.gradeLevel || 'Undergraduate',
            examDate: sub.submissionDate ? sub.submissionDate.split(' ')[0] : '2026-09-20',
            evaluationDate: new Date().toISOString(),
            evaluationFormattedDate: sub.submissionDate || 'Recently Evaluated',
            totalMaxMarks: maxMarks,
            totalAwardedMarks: awardedMarks,
            percentageScore: Number(pct.toFixed(1)),
            letterGrade: grade,
            passed,
            status,
            statusCode,
            statusLabel,
            statusBadgeColor: getStatusTheme(status),
            evaluator: {
                name: 'Prof. Alok Mukherjee',
                role: 'Course Coordinator',
                designation: 'Department of Computer Science'
            },
            ocrConfidence: sub.ocrResult?.averageConfidence || 95.0,
            ocrLegibility: sub.ocrResult?.handwritingLegibility || 'High',
            questionEvaluations: (sub.questionEvaluations || []).map((q, idx) => ({
                questionNumber: q.questionNumber || idx + 1,
                questionId: q.questionId || `q${idx + 1}`,
                questionText: q.questionText || q.question || `Question ${idx + 1}`,
                topic: 'Examination Component',
                maxMarks: q.maxMarks || 10,
                awardedMarks: q.awardedMarks || q.finalMarks || q.aiSuggestedMarks || 0,
                aiSuggestedMarks: q.aiSuggestedMarks || q.awardedMarks || 0,
                teacherAdjustedMarks: q.teacherAdjustedMarks ?? q.teacherOverrideMarks ?? null,
                finalMarks: q.finalMarks ?? null,
                semanticSimilarityScore: q.semanticSimilarityScore || 90.0,
                confidenceScore: q.confidenceScore || 92.0,
                evaluationStatus: q.evaluationStatus || 'TEACHER_FINALIZED',
                studentAnswerSnippet: q.studentAnswerText || q.studentAnswer || '',
                modelAnswerSnippet: q.modelAnswerText || q.modelAnswer || '',
                teacherComment: q.teacherComment,
                evaluationFeedback: q.evaluationFeedback || q.feedback || 'Evaluated successfully.',
                strengths: q.strengths || [],
                deductions: (q.deductions || []).map((d) => ({
                    reason: d.reason,
                    pointsDeducted: d.pointsDeducted,
                    category: d.category || 'General'
                })),
                conceptMatches: (q.conceptMatches || []).map((c) => ({
                    concept: c.concept,
                    status: c.status,
                    weightMarks: c.weightMarks || c.requiredWeight || 2,
                    awardedMarks: c.awardedMarks || c.awardedWeight || 2
                }))
            })),
            overallFeedback: sub.personalizedInsights?.overallSummary || 'Examination evaluation completed with full tri-sheet verification.',
            keyStrengths: sub.personalizedInsights?.keyStrengths || ['Consistent conceptual grasp'],
            growthAreas: sub.personalizedInsights?.criticalGaps || ['Review question details'],
            appeal: null,
            auditTrail: [
                { stage: 'Scan Submission', timestamp: sub.submissionDate || 'Recent', actor: sub.studentName, details: 'Answer sheet submitted' },
                { stage: 'AI Tri-Sheet Evaluated', timestamp: 'Recent', actor: 'AI Grading Engine', details: `Awarded ${awardedMarks} / ${maxMarks} marks` }
            ],
            originalScanUrl: sub.originalScanUrl,
            originalFileName: sub.originalFileName
        };
        if (existingIndex >= 0) {
            // Update existing
            result[existingIndex] = { ...result[existingIndex], ...newRecord };
        }
        else {
            // Prepend newly added live submission
            result.unshift(newRecord);
        }
    });
    return result;
}
