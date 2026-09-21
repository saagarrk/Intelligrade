export const SAMPLE_EXAMS = [
    {
        id: 'exam_cs_ai_301',
        title: 'Advanced Operating Systems & Artificial Intelligence',
        subject: 'Computer Science & Engineering',
        courseCode: 'CS-301',
        description: 'Comprehensive mid-semester examination covering process synchronization, neural backpropagation derivation, and dynamic memory fragmentation management.',
        gradeLevel: 'Undergraduate (Year 3)',
        totalMarks: 30,
        passingMarks: 15,
        examDate: '2026-09-20T09:30:00.000Z',
        durationMinutes: 90,
        status: 'published',
        createdAt: '2026-08-15T08:00:00.000Z',
        instructions: [
            'Answer all three questions in concise, clear handwriting.',
            'Highlight essential technical terminology and algorithms.',
            'Show diagrams or step-by-step mathematical logic where applicable.'
        ],
        questions: [
            {
                id: 'q1_process_sync',
                questionNumber: 1,
                questionText: 'Explain the concept of Mutual Exclusion in process synchronization. Describe how Semaphores solve the Critical Section Problem with their wait() and signal() atomic primitives.',
                maxMarks: 10,
                topic: 'Operating Systems - Concurrency',
                difficulty: 'Medium',
                modelAnswer: 'Mutual exclusion is a concurrency property ensuring that when one process executes in its critical section, no other process is allowed to execute in that same critical section. A Semaphore is a synchronization variable. An integer semaphore S supports two atomic operations: wait(S) (or P(S)) which decrements S and blocks the calling process if S <= 0, and signal(S) (or V(S)) which increments S and unblocks a waiting process. By initializing a binary semaphore to 1, mutual exclusion is strictly guaranteed across concurrent threads.',
                keyConcepts: [
                    {
                        concept: 'Definition of Mutual Exclusion & Critical Section',
                        weightMarks: 3,
                        synonyms: ['mutex', 'exclusive access', 'isolated execution', 'prevent race conditions'],
                        description: 'Only one process allowed inside critical section at any instant'
                    },
                    {
                        concept: 'Semaphore Variable Definition & Initialization',
                        weightMarks: 2,
                        synonyms: ['synchronization primitive', 'counting semaphore', 'binary flag'],
                        description: 'Integer variable used to coordinate access'
                    },
                    {
                        concept: 'wait() / P() Atomic Operation',
                        weightMarks: 2.5,
                        synonyms: ['decrement', 'P operation', 'acquire lock', 'block if non-positive'],
                        description: 'Decrements counter and blocks caller if resource is unavailable'
                    },
                    {
                        concept: 'signal() / V() Atomic Operation',
                        weightMarks: 2.5,
                        synonyms: ['increment', 'V operation', 'release lock', 'wake up thread'],
                        description: 'Increments counter and wakes waiting processes'
                    }
                ],
                geminiSemanticMatrix: {
                    questionNumber: 1,
                    questionId: 'q1_process_sync',
                    officialModelAnswer: 'Mutual exclusion ensures only one process enters the critical section. Semaphores are synchronization variables supporting atomic wait(S) (decrement/block) and signal(S) (increment/unblock).',
                    aiGeneratedAt: '2026-08-31T03:15:00.000Z',
                    aiModelName: 'gemini-3.8-flash',
                    ownWordsVariations: [
                        {
                            variantId: 'var_1_analogy',
                            variantTitle: 'Restroom Key / Gate Analogy',
                            ownWordsExplanation: 'Mutual exclusion is like a single bathroom key in a coffee shop: only one customer can enter at any time so they never clash. A semaphore is the counter that tracks how many keys exist. wait() takes a key and makes you wait in line if none are left, and signal() returns the key and calls the next person in line.',
                            tone: 'Intuitive Analogy',
                            keyPhrases: ['single bathroom key', 'never clash', 'tracks keys', 'wait in line', 'returns key']
                        },
                        {
                            variantId: 'var_2_dev_colloquial',
                            variantTitle: 'Concurrency Developer Explanation',
                            ownWordsExplanation: 'Mutex keeps multi-threaded apps safe from race conditions by locking critical sections. The semaphore is an atomic counter flag: calling wait() decrements the counter and puts the thread to sleep if <= 0; signal() increments it and wakes up the sleeping thread.',
                            tone: 'Applied Technical',
                            keyPhrases: ['race conditions', 'locking critical sections', 'puts thread to sleep', 'wakes up sleeping thread']
                        },
                        {
                            variantId: 'var_3_math_state',
                            variantTitle: 'Invariant / State Machine Formulation',
                            ownWordsExplanation: 'Mutual exclusion guarantees the state invariant where at most one thread satisfies state in_CS. Semaphore S with atomic P and V operations preserves this invariant by blocking transition when S=0.',
                            tone: 'Formal State Invariant',
                            keyPhrases: ['state invariant', 'in_CS <= 1', 'atomic P and V']
                        }
                    ],
                    acceptedSynonyms: [
                        { technicalTerm: 'Mutual Exclusion', allowedSynonyms: ['mutex', 'exclusive access', 'single-thread isolation', 'one-at-a-time execution', 'lock-out'], description: 'Preventing concurrent entry into shared resource zone' },
                        { technicalTerm: 'wait(S) / P(S)', allowedSynonyms: ['decrement counter', 'acquire permit', 'lock primitive', 'down operation', 'sleep if 0'], description: 'Atomic decrement and sleep on zero' },
                        { technicalTerm: 'signal(S) / V(S)', allowedSynonyms: ['increment counter', 'release permit', 'unlock primitive', 'up operation', 'wake thread'], description: 'Atomic increment and wake thread' }
                    ],
                    alternativeValidDerivations: [
                        'Binary Semaphore initialized to 1 acting as a boolean Mutex lock',
                        'Counting Semaphore initialized to N for multi-resource throttling'
                    ],
                    misconceptionGuards: [
                        {
                            validOwnWordsExample: 'Student writes: "The thread goes to sleep until another thread wakes it up when it finishes."',
                            fatalMisconception: 'Student claiming that busy-waiting spinlocks are identical to non-busy sleep semaphores without mentioning blocking.',
                            explanation: 'Using everyday phrases like "puts to sleep" is conceptually correct for semaphores and receives full marks.'
                        }
                    ],
                    leniencyThresholdPct: 82
                }
            },
            {
                id: 'q2_neural_backprop',
                questionNumber: 2,
                questionText: 'Define the Backpropagation algorithm in Artificial Neural Networks. How is the Chain Rule of calculus used to compute gradients with respect to weights and minimize the loss function?',
                maxMarks: 10,
                topic: 'Machine Learning - Deep Learning',
                difficulty: 'Hard',
                modelAnswer: 'Backpropagation is a supervised learning algorithm for training artificial neural networks. It computes the gradient of the loss function with respect to each network parameter by applying the Chain Rule of differential calculus in reverse from the output layer to the input layer. The computed partial derivatives (dL/dw) quantify how sensitive the loss is to weight adjustments. These gradients are then used in Gradient Descent optimization (w = w - eta * grad) to iteratively update weights and minimize loss.',
                keyConcepts: [
                    {
                        concept: 'Definition of Backpropagation as Supervised Gradient Calculation',
                        weightMarks: 3,
                        synonyms: ['backward propagation of errors', 'reverse-mode automatic differentiation', 'gradient estimation'],
                        description: 'Supervised algorithm computing gradients backwards'
                    },
                    {
                        concept: 'Application of Differential Calculus Chain Rule',
                        weightMarks: 3,
                        synonyms: ['chain rule of differentiation', 'composite derivative', 'partial derivatives'],
                        description: 'Decomposing derivative of composite loss function layer by layer'
                    },
                    {
                        concept: 'Gradient Descent Weight Update Formula',
                        weightMarks: 2.5,
                        synonyms: ['delta rule', 'learning rate parameter', 'w = w - lr * dL/dw', 'optimization step'],
                        description: 'Iterative step to adjust weights in negative gradient direction'
                    },
                    {
                        concept: 'Loss Function Minimization Objective',
                        weightMarks: 1.5,
                        synonyms: ['cost function', 'mean squared error', 'cross-entropy loss', 'objective function'],
                        description: 'Quantifying network error and driving it to global/local minimum'
                    }
                ],
                geminiSemanticMatrix: {
                    questionNumber: 2,
                    questionId: 'q2_neural_backprop',
                    officialModelAnswer: 'Backpropagation applies the Chain Rule in reverse from loss to inputs to compute partial derivatives dL/dw, allowing Gradient Descent (w = w - lr * grad) to minimize prediction error.',
                    aiGeneratedAt: '2026-08-31T03:15:00.000Z',
                    aiModelName: 'gemini-3.8-flash',
                    ownWordsVariations: [
                        {
                            variantId: 'var_2_intuitive',
                            variantTitle: 'Error Blame Assignment Analogy',
                            ownWordsExplanation: 'Backprop is like figuring out which player on a team caused a missed goal. You start from the mistake at the end (the loss) and trace backwards through each pass (layers) using calculus chain rule to find how much each weight contributed to the error. Then you nudge each weight in the opposite direction so the network makes fewer mistakes next time.',
                            tone: 'Intuitive Team Blame Analogy',
                            keyPhrases: ['trace backwards', 'how much each weight contributed', 'nudge each weight in opposite direction']
                        },
                        {
                            variantId: 'var_2_computational',
                            variantTitle: 'Computational Graph & Auto-Diff Phrasing',
                            ownWordsExplanation: 'Backprop is reverse-mode automatic differentiation on the network computation graph. It calculates vector-Jacobian products backwards layer-by-layer using chain rule to get dLoss/dWeight, followed by an SGD step to step down the error surface.',
                            tone: 'Modern Deep Learning / Autodiff',
                            keyPhrases: ['reverse-mode automatic differentiation', 'computation graph', 'step down error surface']
                        }
                    ],
                    acceptedSynonyms: [
                        { technicalTerm: 'Chain Rule', allowedSynonyms: ['composite derivative', 'derivative of nested functions', 'layer-by-layer multiplication of slopes'], description: 'Calculus property for multiplying partial derivatives' },
                        { technicalTerm: 'Loss Function', allowedSynonyms: ['error metric', 'prediction penalty', 'cost function', 'objective loss'], description: 'Measure of network error' }
                    ],
                    alternativeValidDerivations: [
                        'Matrix-form vector-Jacobian product derivation',
                        'Scalar delta-rule error signal decomposition (delta_j * a_i)'
                    ],
                    misconceptionGuards: [
                        {
                            validOwnWordsExample: 'Student writes: "We move backwards from output to input multiplying local gradients together to see what to change."',
                            fatalMisconception: 'Student asserting that weights are updated in the direction of the gradient rather than negative gradient direction.',
                            explanation: 'Explaining chain rule as multiplying local gradients backwards is mathematically sound and receives full credit.'
                        }
                    ],
                    leniencyThresholdPct: 84
                }
            },
            {
                id: 'q3_transformer_attention',
                questionNumber: 3,
                questionText: 'Describe the Scaled Dot-Product Attention mechanism in Transformer architectures. Write the mathematical formula involving Query (Q), Key (K), and Value (V) matrices, and explain why the scaling factor sqrt(d_k) is necessary.',
                maxMarks: 10,
                topic: 'Natural Language Processing - Transformers',
                difficulty: 'Hard',
                modelAnswer: 'Scaled Dot-Product Attention computes attention weights between a set of queries and keys to produce a weighted sum of values. The formula is Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V. The scaling factor 1/sqrt(d_k) is critical because for large key dimensions d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradients), which impedes effective gradient descent learning.',
                keyConcepts: [
                    {
                        concept: 'Scaled Dot-Product Attention Formula: Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V',
                        weightMarks: 4,
                        synonyms: ['Q K V formula', 'softmax matrix product', 'attention equation'],
                        description: 'Complete mathematical expression with matrices and scaling'
                    },
                    {
                        concept: 'Role of Queries (Q), Keys (K), and Values (V)',
                        weightMarks: 3,
                        synonyms: ['query vectors', 'key embeddings', 'value representations', 'context vectors'],
                        description: 'Comparing query with key to weight corresponding value vectors'
                    },
                    {
                        concept: 'Purpose of Scaling Factor sqrt(d_k) (Preventing Vanishing Gradients in Softmax)',
                        weightMarks: 3,
                        synonyms: ['prevent saturation', 'softmax saturation avoidance', 'vanishing gradient protection', 'dimension scaling'],
                        description: 'Avoids large dot product magnitudes from flattening softmax gradients'
                    }
                ],
                geminiSemanticMatrix: {
                    questionNumber: 3,
                    questionId: 'q3_transformer_attention',
                    officialModelAnswer: 'Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V. Q and K calculate similarity weights, scaled by sqrt(d_k) to prevent softmax saturation and vanishing gradients.',
                    aiGeneratedAt: '2026-08-31T03:15:00.000Z',
                    aiModelName: 'gemini-3.8-flash',
                    ownWordsVariations: [
                        {
                            variantId: 'var_3_search_engine',
                            variantTitle: 'Search Engine / Database Lookup Analogy',
                            ownWordsExplanation: 'Attention works just like a search engine: Query (Q) is what you type into the search bar, Key (K) is the title/tags of every webpage in the database, and Value (V) is the actual content of the page. You match Q with every K to get relevance scores, divide by square root of dimension so numbers don\'t blow up into flat softmax saturation, and return a blended mix of Values.',
                            tone: 'Search Engine Analogy',
                            keyPhrases: ['search engine lookup', 'what you type in', 'title/tags in database', 'content of page', 'numbers don\'t blow up']
                        },
                        {
                            variantId: 'var_3_vector_math',
                            variantTitle: 'Geometric Vector Dot-Product Formulation',
                            ownWordsExplanation: 'Attention computes pairwise cosine-like alignments between queries and keys. When dimensionality d_k is large, the variance of the dot product equals d_k, pushing values into extreme tails of softmax where derivatives are almost zero. Scaling by 1/sqrt(d_k) normalizes variance back to 1.',
                            tone: 'Rigorous Geometric Normalization',
                            keyPhrases: ['pairwise cosine-like alignments', 'variance of dot product equals d_k', 'normalizes variance back to 1']
                        }
                    ],
                    acceptedSynonyms: [
                        { technicalTerm: 'Scaling Factor sqrt(d_k)', allowedSynonyms: ['square root of key dimension', 'variance normalization factor', 'softmax temperature / scale factor'], description: 'Divisor that prevents magnitude growth' },
                        { technicalTerm: 'Softmax Saturation', allowedSynonyms: ['vanishing gradients', 'flattened derivatives', 'extreme probability peak', 'gradient death'], description: 'When softmax outputs near 1 and 0 with zero gradient' }
                    ],
                    alternativeValidDerivations: [
                        'Expressing formula row-wise for single query vector q_i',
                        'Deriving variance of sum of d_k independent random variables with zero mean and unit variance'
                    ],
                    misconceptionGuards: [
                        {
                            validOwnWordsExample: 'Student writes: "We divide by sqrt(d_k) because huge vectors make the dot product huge, which causes the softmax curve to go flat and stop learning."',
                            fatalMisconception: 'Student claiming scaling is needed to make the matrix square for matrix multiplication.',
                            explanation: 'Explaining that large values cause the softmax curve to go flat and stop learning captures the exact vanishing gradient concept.'
                        }
                    ],
                    leniencyThresholdPct: 85
                }
            }
        ]
    },
    {
        id: 'exam_bio_202',
        title: 'Cellular Respiration & Bioenergetics',
        subject: 'Molecular Biology',
        courseCode: 'BIO-202',
        description: 'Detailed assessment on metabolic pathways, enzymatic steps of Glycolysis, and mitochondrial ATP synthase chemiosmosis.',
        gradeLevel: 'College Sophomore',
        totalMarks: 20,
        passingMarks: 10,
        examDate: '2026-10-05T11:00:00.000Z',
        durationMinutes: 60,
        status: 'published',
        createdAt: '2026-08-20T10:00:00.000Z',
        instructions: [
            'Write legible chemical pathways and metabolic stages.',
            'Indicate ATP yields and electron carriers.'
        ],
        questions: [
            {
                id: 'q1_glycolysis',
                questionNumber: 1,
                questionText: 'Outline the key phases of Glycolysis in the cytoplasm. State the net yield of ATP, NADH, and Pyruvate generated from one glucose molecule.',
                maxMarks: 10,
                topic: 'Metabolism - Glycolysis',
                difficulty: 'Medium',
                modelAnswer: 'Glycolysis occurs in the cytoplasm and comprises two major phases: the Energy Investment Phase (consuming 2 ATP to phosphorylate glucose) and the Energy Payoff Phase (producing 4 ATP via substrate-level phosphorylation and 2 NADH). From one molecule of glucose (6C), the net yield is 2 Pyruvate molecules (3C each), 2 net ATP, and 2 NADH.',
                keyConcepts: [
                    {
                        concept: 'Location in Cytosol & Two Key Phases (Investment and Payoff)',
                        weightMarks: 3,
                        synonyms: ['cytoplasm', 'investment phase', 'payoff phase', 'hexokinase activation'],
                        description: 'Occurs in cytoplasm with preparatory and energy harvesting phases'
                    },
                    {
                        concept: 'Net Yield: 2 Pyruvate, 2 ATP (net), 2 NADH',
                        weightMarks: 5,
                        synonyms: ['2 pyruvate molecules', '2 net ATP', '2 NADH reduced coenzymes'],
                        description: 'Exact stoichiometric output per glucose molecule'
                    },
                    {
                        concept: 'Substrate-Level Phosphorylation Mechanism',
                        weightMarks: 2,
                        synonyms: ['direct phosphate transfer', 'ADP to ATP phosphorylation'],
                        description: 'Generation of ATP without electron transport chain'
                    }
                ]
            },
            {
                id: 'q2_chemiosmosis',
                questionNumber: 2,
                questionText: 'Explain Chemiosmosis and the role of ATP Synthase in the mitochondrial inner membrane during Oxidative Phosphorylation.',
                maxMarks: 10,
                topic: 'Mitochondria - Oxidative Phosphorylation',
                difficulty: 'Medium',
                modelAnswer: 'Chemiosmosis is the movement of ions across a semipermeable membrane down their electrochemical gradient. In oxidative phosphorylation, the electron transport chain pumps protons (H+) into the mitochondrial intermembrane space, establishing a proton motive force. Protons flow back into the matrix through ATP Synthase (a rotary molecular motor), driving the phosphorylation of ADP + Pi into ATP.',
                keyConcepts: [
                    {
                        concept: 'Proton Gradient / Proton Motive Force across Inner Mitochondrial Membrane',
                        weightMarks: 4,
                        synonyms: ['electrochemical gradient', 'H+ accumulation', 'intermembrane space gradient'],
                        description: 'Pumping of protons into intermembrane space'
                    },
                    {
                        concept: 'ATP Synthase Molecular Turbine Mechanism',
                        weightMarks: 4,
                        synonyms: ['F0 F1 complex', 'rotary catalysis', 'proton channel motor'],
                        description: 'Protons passing through catalytic rotor synthesizing ATP'
                    },
                    {
                        concept: 'Coupling Electron Transport to ATP Synthesis',
                        weightMarks: 2,
                        synonyms: ['oxidative phosphorylation coupling', 'NADH/FADH2 oxidation to ATP'],
                        description: 'Harnessing energy from redox reactions for phosphorylation'
                    }
                ]
            }
        ]
    }
];
export const INITIAL_SUBMISSIONS = [
    {
        id: 'sub_alex_901',
        examId: 'exam_cs_ai_301',
        studentName: 'Aarav Sharma',
        studentRollNumber: 'CS-2026-041',
        submissionDate: '2026-08-30 14:20',
        originalScanUrl: '/assets/samples/alex_rivera_scan.png',
        totalMaxMarks: 30,
        totalAwardedMarks: 27.5,
        percentageScore: 91.7,
        status: 'Graded',
        preprocessingConfig: {
            noiseReduction: true,
            noiseRadius: 2,
            styleNormalization: true,
            contrastStretch: 1.8,
            strokeBoost: 2,
            skewCorrection: true,
            skewAngle: -2.2,
            thinning: true,
            thinningIterations: 2,
            thresholdingType: 'otsu',
            binarizationThreshold: 132
        },
        preprocessingMetrics: {
            originalNoiseScore: 19.4,
            cleanedNoiseScore: 1.8,
            detectedSkewAngle: -2.2,
            contrastRatio: 2.9,
            strokeThinningEfficiency: 95.4,
            binarizationClarity: 99.1,
            processingTimeMs: 38
        },
        ocrResult: {
            fullExtractedText: `Ans 1: Mutual exclusion is a property where only one thread/process can be inside the critical section at any single time, preventing simultaneous race conditions. A Semaphore S is a synchronization integer variable. wait(S) or P(S) decrements S and if S <= 0 the thread is put to sleep/blocked. signal(S) or V(S) increments S and wakes up any blocked thread in queue. Binary semaphore initialized to 1 provides full mutual exclusion.\n\nAns 2: Backpropagation is a supervised neural network training algorithm. It uses the differential calculus Chain Rule backwards from output layer loss to input layer. It computes partial derivatives dL/dw showing how sensitive the loss is. Weights are updated via Gradient Descent: w = w - lr * grad to minimize loss function.\n\nAns 3: Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V. Query and Key compute similarity matrix, scaled by 1/sqrt(d_k) to prevent dot product values from growing too large which causes softmax gradient saturation (vanishing gradients). Finally weighted sum of Value matrix V is returned.`,
            averageConfidence: 96.8,
            detectedLanguage: 'English (US Technical)',
            engineUsed: 'Gemini-Vision-Multimodal',
            durationMs: 412,
            detectedLines: [
                {
                    lineNumber: 1,
                    questionNumberDetected: 1,
                    rawText: 'Ans 1: Mutual exclusion is a property where only one thread/process can be inside the critical section...',
                    cleanedText: 'Ans 1: Mutual exclusion is a property where only one thread/process can be inside the critical section at any single time, preventing simultaneous race conditions.',
                    confidence: 98.2,
                    boundingBox: [50, 150, 700, 30],
                    words: [
                        { text: 'Mutual', confidence: 99, box: [50, 150, 50, 20] },
                        { text: 'exclusion', confidence: 98, box: [105, 150, 70, 20] },
                        { text: 'critical', confidence: 97, box: [180, 150, 60, 20] }
                    ]
                },
                {
                    lineNumber: 2,
                    questionNumberDetected: 2,
                    rawText: 'Ans 2: Backpropagation is a supervised neural network training algorithm...',
                    cleanedText: 'Ans 2: Backpropagation is a supervised neural network training algorithm. It uses the differential calculus Chain Rule backwards...',
                    confidence: 96.4,
                    boundingBox: [50, 310, 700, 30],
                    words: [
                        { text: 'Backpropagation', confidence: 97, box: [50, 310, 110, 20] },
                        { text: 'Chain', confidence: 98, box: [170, 310, 45, 20] },
                        { text: 'Rule', confidence: 98, box: [220, 310, 40, 20] }
                    ]
                },
                {
                    lineNumber: 3,
                    questionNumberDetected: 3,
                    rawText: 'Ans 3: Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V...',
                    cleanedText: 'Ans 3: Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V.',
                    confidence: 95.8,
                    boundingBox: [50, 470, 700, 30],
                    words: [
                        { text: 'Attention', confidence: 97, box: [50, 470, 70, 20] },
                        { text: 'softmax', confidence: 96, box: [130, 470, 60, 20] },
                        { text: 'sqrt(d_k)', confidence: 94, box: [200, 470, 65, 20] }
                    ]
                }
            ]
        },
        questionEvaluations: [
            {
                question: 'Explain the concept of Mutual Exclusion in process synchronization. Describe how Semaphores solve the Critical Section Problem with their wait() and signal() atomic primitives.',
                studentAnswer: 'Mutual exclusion is a property where only one thread/process can be inside the critical section at any single time, preventing simultaneous race conditions. A Semaphore S is a synchronization integer variable. wait(S) or P(S) decrements S and if S <= 0 the thread is put to sleep/blocked. signal(S) or V(S) increments S and wakes up any blocked thread in queue. Binary semaphore initialized to 1 provides full mutual exclusion.',
                modelAnswer: 'Mutual exclusion ensures only one process is inside the critical section. Semaphore S is an integer variable. wait(S) decrements and blocks if <= 0. signal(S) increments and unblocks waiting process.',
                maxMarks: 10,
                aiSuggestedMarks: 9.5,
                confidenceScore: 97,
                evaluationFeedback: 'Exemplary answer with clear grasp of concurrency primitives and OS scheduling mechanics.',
                teacherAdjustedMarks: 9.5,
                finalMarks: 9.5,
                evaluationStatus: 'TEACHER_FINALIZED',
                teacherReviewedAt: '2025-02-15T14:30:00Z',
                teacherReviewedBy: 'Dr. Sarah Jenkins',
                questionId: 'q1_process_sync',
                questionNumber: 1,
                questionText: 'Explain the concept of Mutual Exclusion in process synchronization. Describe how Semaphores solve the Critical Section Problem with their wait() and signal() atomic primitives.',
                awardedMarks: 9.5,
                studentAnswerText: 'Mutual exclusion is a property where only one thread/process can be inside the critical section at any single time, preventing simultaneous race conditions. A Semaphore S is a synchronization integer variable. wait(S) or P(S) decrements S and if S <= 0 the thread is put to sleep/blocked. signal(S) or V(S) increments S and wakes up any blocked thread in queue. Binary semaphore initialized to 1 provides full mutual exclusion.',
                modelAnswerText: 'Mutual exclusion ensures only one process is inside the critical section. Semaphore S is an integer variable. wait(S) decrements and blocks if <= 0. signal(S) increments and unblocks waiting process.',
                semanticSimilarityScore: 97.4,
                conceptMatches: [
                    {
                        concept: 'Definition of Mutual Exclusion & Critical Section',
                        requiredWeight: 3,
                        awardedWeight: 3,
                        status: 'Full',
                        matchedStudentPhrases: ['only one thread/process can be inside the critical section at any single time', 'preventing simultaneous race conditions'],
                        explanation: 'Accurately stated isolated execution of critical section and race prevention.'
                    },
                    {
                        concept: 'Semaphore Variable Definition & Initialization',
                        requiredWeight: 2,
                        awardedWeight: 2,
                        status: 'Full',
                        matchedStudentPhrases: ['Semaphore S is a synchronization integer variable', 'Binary semaphore initialized to 1'],
                        explanation: 'Correctly identified integer synchronization variable and binary initialization.'
                    },
                    {
                        concept: 'wait() / P() Atomic Operation',
                        requiredWeight: 2.5,
                        awardedWeight: 2.5,
                        status: 'Full',
                        matchedStudentPhrases: ['wait(S) or P(S) decrements S', 'if S <= 0 the thread is put to sleep/blocked'],
                        explanation: 'Full description of decrement and blocking condition.'
                    },
                    {
                        concept: 'signal() / V() Atomic Operation',
                        requiredWeight: 2.5,
                        awardedWeight: 2.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['signal(S) or V(S) increments S and wakes up any blocked thread'],
                        explanation: 'Slight omission: did not explicitly mention atomicity constraint under multi-core concurrency.'
                    }
                ],
                deductions: [
                    {
                        reason: 'Minor omission: Did not explicitly state the strict requirement for atomicity in hardware (test-and-set).',
                        pointsDeducted: 0.5,
                        category: 'Incomplete Steps'
                    }
                ],
                feedback: 'Exemplary answer with clear grasp of concurrency primitives and OS scheduling mechanics.',
                strengths: ['Clear definition of critical section', 'Identified both classical Dutch (P/V) and POSIX terms'],
                weaknesses: ['Mention hardware atomicity for 100% score']
            },
            {
                question: 'Define the Backpropagation algorithm in Artificial Neural Networks. How is the Chain Rule of calculus used to compute gradients with respect to weights and minimize the loss function?',
                studentAnswer: 'Backpropagation is a supervised neural network training algorithm. It uses the differential calculus Chain Rule backwards from output layer loss to input layer. It computes partial derivatives dL/dw showing how sensitive the loss is. Weights are updated via Gradient Descent: w = w - lr * grad to minimize loss function.',
                modelAnswer: 'Backpropagation computes the gradient of the loss function with respect to weights using the Chain Rule in reverse, updating weights via gradient descent.',
                maxMarks: 10,
                aiSuggestedMarks: 9.0,
                confidenceScore: 95,
                evaluationFeedback: 'Very strong answer. Well-structured and demonstrates clear intuition of reverse-mode automatic differentiation.',
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                teacherReviewedAt: '2025-02-15T14:30:00Z',
                teacherReviewedBy: 'Dr. Sarah Jenkins',
                questionId: 'q2_neural_backprop',
                questionNumber: 2,
                questionText: 'Define the Backpropagation algorithm in Artificial Neural Networks. How is the Chain Rule of calculus used to compute gradients with respect to weights and minimize the loss function?',
                awardedMarks: 9.0,
                studentAnswerText: 'Backpropagation is a supervised neural network training algorithm. It uses the differential calculus Chain Rule backwards from output layer loss to input layer. It computes partial derivatives dL/dw showing how sensitive the loss is. Weights are updated via Gradient Descent: w = w - lr * grad to minimize loss function.',
                modelAnswerText: 'Backpropagation computes the gradient of the loss function with respect to weights using the Chain Rule in reverse, updating weights via gradient descent.',
                semanticSimilarityScore: 94.8,
                conceptMatches: [
                    {
                        concept: 'Definition of Backpropagation as Supervised Gradient Calculation',
                        requiredWeight: 3,
                        awardedWeight: 3,
                        status: 'Full',
                        matchedStudentPhrases: ['supervised neural network training algorithm', 'computes partial derivatives dL/dw'],
                        explanation: 'Exact definition provided.'
                    },
                    {
                        concept: 'Application of Differential Calculus Chain Rule',
                        requiredWeight: 3,
                        awardedWeight: 2.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['differential calculus Chain Rule backwards from output layer loss to input layer'],
                        explanation: 'Correct concept, did not expand explicit composite derivative notation dL/da * da/dz * dz/dw.'
                    },
                    {
                        concept: 'Gradient Descent Weight Update Formula',
                        requiredWeight: 2.5,
                        awardedWeight: 2.5,
                        status: 'Full',
                        matchedStudentPhrases: ['Weights are updated via Gradient Descent: w = w - lr * grad'],
                        explanation: 'Correct formula and learning rate utilization.'
                    },
                    {
                        concept: 'Loss Function Minimization Objective',
                        requiredWeight: 1.5,
                        awardedWeight: 1.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['to minimize loss function'],
                        explanation: 'Did not cite specific loss functions (e.g. MSE or Cross Entropy).'
                    }
                ],
                deductions: [
                    {
                        reason: 'Composite derivative expansion equation was not explicitly expanded.',
                        pointsDeducted: 1.0,
                        category: 'Incomplete Steps'
                    }
                ],
                feedback: 'Very strong answer. Well-structured and demonstrates clear intuition of reverse-mode automatic differentiation.',
                strengths: ['Provided clean update formula', 'Understands loss sensitivity gradient'],
                weaknesses: ['Write explicit intermediate chain rule steps for full marks']
            },
            {
                question: 'Describe the Scaled Dot-Product Attention mechanism in Transformer architectures. Write the mathematical formula involving Query (Q), Key (K), and Value (V) matrices, and explain why the scaling factor sqrt(d_k) is necessary.',
                studentAnswer: 'Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V. Query and Key compute similarity matrix, scaled by 1/sqrt(d_k) to prevent dot product values from growing too large which causes softmax gradient saturation (vanishing gradients). Finally weighted sum of Value matrix V is returned.',
                modelAnswer: 'Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V. Q and K produce attention weights, sqrt(d_k) prevents large dot products from saturating softmax gradients.',
                maxMarks: 10,
                aiSuggestedMarks: 9.0,
                confidenceScore: 96,
                evaluationFeedback: 'Excellent explanation of attention mechanics and why dimensional scaling is necessary for transformer stability.',
                teacherAdjustedMarks: 9.0,
                finalMarks: 9.0,
                evaluationStatus: 'TEACHER_FINALIZED',
                teacherReviewedAt: '2025-02-15T14:30:00Z',
                teacherReviewedBy: 'Dr. Sarah Jenkins',
                questionId: 'q3_transformer_attention',
                questionNumber: 3,
                questionText: 'Describe the Scaled Dot-Product Attention mechanism in Transformer architectures. Write the mathematical formula involving Query (Q), Key (K), and Value (V) matrices, and explain why the scaling factor sqrt(d_k) is necessary.',
                awardedMarks: 9.0,
                studentAnswerText: 'Scaled Dot-Product Attention formula is Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V. Query and Key compute similarity matrix, scaled by 1/sqrt(d_k) to prevent dot product values from growing too large which causes softmax gradient saturation (vanishing gradients). Finally weighted sum of Value matrix V is returned.',
                modelAnswerText: 'Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V. Q and K produce attention weights, sqrt(d_k) prevents large dot products from saturating softmax gradients.',
                semanticSimilarityScore: 96.0,
                conceptMatches: [
                    {
                        concept: 'Scaled Dot-Product Attention Formula: Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V',
                        requiredWeight: 4,
                        awardedWeight: 4,
                        status: 'Full',
                        matchedStudentPhrases: ['Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V'],
                        explanation: 'Accurate mathematical formulation including matrix transpose and scalar division.'
                    },
                    {
                        concept: 'Role of Queries (Q), Keys (K), and Values (V)',
                        requiredWeight: 3,
                        awardedWeight: 2.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['Query and Key compute similarity matrix', 'weighted sum of Value matrix V is returned'],
                        explanation: 'Explained roles concisely; could elaborate on embedding dimension projection.'
                    },
                    {
                        concept: 'Purpose of Scaling Factor sqrt(d_k) (Preventing Vanishing Gradients in Softmax)',
                        requiredWeight: 3,
                        awardedWeight: 2.5,
                        status: 'Full',
                        matchedStudentPhrases: ['prevent dot product values from growing too large which causes softmax gradient saturation (vanishing gradients)'],
                        explanation: 'Accurately recognized vanishing gradient risk during softmax saturation.'
                    }
                ],
                deductions: [
                    {
                        reason: 'Did not state the statistical expectation variance of dot product of independent vectors with mean 0 variance 1.',
                        pointsDeducted: 1.0,
                        category: 'Factual Inaccuracy'
                    }
                ],
                feedback: 'Excellent explanation of attention mechanics and why dimensional scaling is necessary for transformer stability.',
                strengths: ['Precise formula', 'Understands vanishing gradient problem in softmax'],
                weaknesses: ['Add statistical variance justification for sqrt(d_k)']
            }
        ],
        personalizedInsights: {
            overallSummary: 'Aarav exhibits top-tier conceptual mastery across Operating Systems concurrency, Machine Learning backpropagation, and Modern Transformer attention mechanisms.',
            keyStrengths: [
                'Precise mathematical definitions and algorithm formulation',
                'Strong grasp of hardware and architectural implications (e.g. softmax saturation, mutex locks)',
                'Neat structured handwriting with 96.8% OCR clarity'
            ],
            criticalGaps: [
                'Needs to write explicit mathematical intermediate steps (e.g., full chain rule decomposition)',
                'Include hardware-level atomicity primitives (test-and-set instructions)'
            ],
            actionableRecommendations: [
                'Practice writing out multi-layer partial derivative trees for neural network architectures',
                'In corporate or university finals, state statistical derivations (e.g. variance d_k) to secure maximum points'
            ],
            studyTopicsToRevise: [
                {
                    topic: 'Differential Calculus in Multi-layer Perceptrons',
                    urgency: 'Low',
                    resourcesRecommended: 'Deep Learning Book (Goodfellow) Ch. 6.5 & Backpropagation Derivation Notes'
                },
                {
                    topic: 'Hardware-assisted Concurrency Primitives',
                    urgency: 'Low',
                    resourcesRecommended: 'Silberschatz OS Concepts Ch. 6.4 (Hardware Synchronization)'
                }
            ]
        },
        predictiveAnalytics: {
            predictedNextScore: 94.5,
            scoreRangeConfidence: [91.0, 97.0],
            predictedPassProbability: 99.8,
            knowledgeRetentionIndex: 94,
            classPercentileRank: 95.8,
            examReadinessLevel: 'High Mastery',
            radarSkills: [
                { skill: 'Conceptual Clarity', studentScore: 96, cohortAverage: 71 },
                { skill: 'Mathematical Rigor', studentScore: 89, cohortAverage: 62 },
                { skill: 'Terminology & Keywords', studentScore: 95, cohortAverage: 74 },
                { skill: 'Handwriting OCR Quality', studentScore: 97, cohortAverage: 78 },
                { skill: 'Step-by-Step Completeness', studentScore: 88, cohortAverage: 65 }
            ]
        }
    },
    {
        id: 'sub_priya_802',
        examId: 'exam_cs_ai_301',
        studentName: 'Priya Sharma',
        studentRollNumber: 'CS-2026-088',
        submissionDate: '2026-08-30 15:10',
        originalScanUrl: '/assets/samples/priya_sharma_scan.png',
        totalMaxMarks: 30,
        totalAwardedMarks: 19.5,
        percentageScore: 65.0,
        status: 'Graded',
        preprocessingConfig: {
            noiseReduction: true,
            noiseRadius: 3,
            styleNormalization: true,
            contrastStretch: 1.6,
            strokeBoost: 3,
            skewCorrection: true,
            skewAngle: 3.5,
            thinning: true,
            thinningIterations: 2,
            thresholdingType: 'sauvola',
            binarizationThreshold: 140
        },
        preprocessingMetrics: {
            originalNoiseScore: 28.5,
            cleanedNoiseScore: 3.2,
            detectedSkewAngle: 3.5,
            contrastRatio: 2.4,
            strokeThinningEfficiency: 91.2,
            binarizationClarity: 96.5,
            processingTimeMs: 44
        },
        ocrResult: {
            fullExtractedText: `Ans 1: Mutual exclusion means only one program runs in the critical section to stop conflict. Semaphores are counters. Wait operation makes counter go down, signal operation makes counter go up when done.\n\nAns 2: Backprop is used in deep learning to train weights. It uses chain rule to find error derivative and updates weights using learning rate.\n\nAns 3: Attention takes Q, K, V. Formula: Attention = softmax(QK / dk) * V. It matches query with key to find which words are important. dk makes numbers smaller.`,
            averageConfidence: 89.2,
            detectedLanguage: 'English (Indian English/Regional)',
            engineUsed: 'Gemini-Vision-Multimodal',
            durationMs: 450,
            detectedLines: [
                {
                    lineNumber: 1,
                    questionNumberDetected: 1,
                    rawText: 'Ans 1: Mutual exclusion means only one program runs in the critical section to stop conflict...',
                    cleanedText: 'Ans 1: Mutual exclusion means only one program runs in the critical section to stop conflict.',
                    confidence: 91.0,
                    boundingBox: [50, 150, 700, 30],
                    words: []
                }
            ]
        },
        questionEvaluations: [
            {
                question: 'Explain the concept of Mutual Exclusion in process synchronization. Describe how Semaphores solve the Critical Section Problem with their wait() and signal() atomic primitives.',
                studentAnswer: 'Mutual exclusion means only one program runs in the critical section to stop conflict. Semaphores are counters. Wait operation makes counter go down, signal operation makes counter go up when done.',
                modelAnswer: 'Mutual exclusion ensures only one process is inside critical section. Wait decrements and blocks if <=0. Signal increments and wakes process.',
                maxMarks: 10,
                aiSuggestedMarks: 6.5,
                confidenceScore: 74,
                evaluationFeedback: 'Good basic understanding, but answers need formal computer science nomenclature and detailed execution logic.',
                teacherAdjustedMarks: null,
                finalMarks: null,
                evaluationStatus: 'AI_SUGGESTED',
                questionId: 'q1_process_sync',
                questionNumber: 1,
                questionText: 'Explain the concept of Mutual Exclusion in process synchronization. Describe how Semaphores solve the Critical Section Problem with their wait() and signal() atomic primitives.',
                awardedMarks: 6.5,
                studentAnswerText: 'Mutual exclusion means only one program runs in the critical section to stop conflict. Semaphores are counters. Wait operation makes counter go down, signal operation makes counter go up when done.',
                modelAnswerText: 'Mutual exclusion ensures only one process is inside critical section. Wait decrements and blocks if <=0. Signal increments and wakes process.',
                semanticSimilarityScore: 72.5,
                conceptMatches: [
                    {
                        concept: 'Definition of Mutual Exclusion & Critical Section',
                        requiredWeight: 3,
                        awardedWeight: 2.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['only one program runs in the critical section to stop conflict'],
                        synonymUsed: 'conflict -> race conditions',
                        explanation: 'Understands basic exclusion, but terminology is colloquial.'
                    },
                    {
                        concept: 'Semaphore Variable Definition & Initialization',
                        requiredWeight: 2,
                        awardedWeight: 1.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['Semaphores are counters'],
                        explanation: 'Mentioned counter, but omitted binary vs counting semaphore initialization.'
                    },
                    {
                        concept: 'wait() / P() Atomic Operation',
                        requiredWeight: 2.5,
                        awardedWeight: 1.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['Wait operation makes counter go down'],
                        explanation: 'Omitted blocking mechanism when S <= 0.'
                    },
                    {
                        concept: 'signal() / V() Atomic Operation',
                        requiredWeight: 2.5,
                        awardedWeight: 1.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['signal operation makes counter go up when done'],
                        explanation: 'Did not explain waking up of queued processes.'
                    }
                ],
                deductions: [
                    {
                        reason: 'Omitted blocking/waking process queue mechanics in semaphore operations.',
                        pointsDeducted: 2.0,
                        category: 'Incomplete Steps'
                    },
                    {
                        reason: 'Lacks formal synchronization terminology (e.g. race condition, atomic operation).',
                        pointsDeducted: 1.5,
                        category: 'Missing Key Term'
                    }
                ],
                feedback: 'Good basic understanding, but answers need formal computer science nomenclature and detailed execution logic.',
                strengths: ['Identified core goal of critical section', 'Identified increment/decrement'],
                weaknesses: ['Add blocking logic', 'Use standard terms: race condition, atomic']
            },
            {
                question: 'Define the Backpropagation algorithm in Artificial Neural Networks. How is the Chain Rule of calculus used to compute gradients with respect to weights and minimize the loss function?',
                studentAnswer: 'Backprop is used in deep learning to train weights. It uses chain rule to find error derivative and updates weights using learning rate.',
                modelAnswer: 'Backpropagation computes gradient of loss wrt weights using Chain Rule in reverse, updating weights via gradient descent.',
                maxMarks: 10,
                aiSuggestedMarks: 6.5,
                confidenceScore: 71,
                evaluationFeedback: 'Answers are too brief. University level assessments require formal equations and directional flow diagrams.',
                teacherAdjustedMarks: null,
                finalMarks: null,
                evaluationStatus: 'AI_SUGGESTED',
                questionId: 'q2_neural_backprop',
                questionNumber: 2,
                questionText: 'Define the Backpropagation algorithm in Artificial Neural Networks. How is the Chain Rule of calculus used to compute gradients with respect to weights and minimize the loss function?',
                awardedMarks: 6.5,
                studentAnswerText: 'Backprop is used in deep learning to train weights. It uses chain rule to find error derivative and updates weights using learning rate.',
                modelAnswerText: 'Backpropagation computes gradient of loss wrt weights using Chain Rule in reverse, updating weights via gradient descent.',
                semanticSimilarityScore: 68.0,
                conceptMatches: [
                    {
                        concept: 'Definition of Backpropagation as Supervised Gradient Calculation',
                        requiredWeight: 3,
                        awardedWeight: 2.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['Backprop is used in deep learning to train weights'],
                        explanation: 'Understands it trains weights, lacks supervised and backward pass details.'
                    },
                    {
                        concept: 'Application of Differential Calculus Chain Rule',
                        requiredWeight: 3,
                        awardedWeight: 2.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['uses chain rule to find error derivative'],
                        explanation: 'Mentioned chain rule and derivative without formula.'
                    },
                    {
                        concept: 'Gradient Descent Weight Update Formula',
                        requiredWeight: 2.5,
                        awardedWeight: 1.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['updates weights using learning rate'],
                        explanation: 'No mathematical formula provided.'
                    },
                    {
                        concept: 'Loss Function Minimization Objective',
                        requiredWeight: 1.5,
                        awardedWeight: 1.0,
                        status: 'Partial',
                        matchedStudentPhrases: ['find error derivative'],
                        explanation: 'Briefly touched upon error.'
                    }
                ],
                deductions: [
                    {
                        reason: 'No mathematical formula written for Gradient Descent (w = w - eta * grad).',
                        pointsDeducted: 2.0,
                        category: 'Incomplete Steps'
                    },
                    {
                        reason: 'Did not explain backward traversal from output layer to input layer.',
                        pointsDeducted: 1.5,
                        category: 'Conceptual Error'
                    }
                ],
                feedback: 'Answers are too brief. University level assessments require formal equations and directional flow diagrams.',
                strengths: ['Mentioned chain rule correctly', 'Identified learning rate parameter'],
                weaknesses: ['Missing update formula w := w - lr * dL/dw', 'Elaborate on reverse pass']
            },
            {
                question: 'Describe the Scaled Dot-Product Attention mechanism in Transformer architectures. Write the mathematical formula involving Query (Q), Key (K), and Value (V) matrices, and explain why the scaling factor sqrt(d_k) is necessary.',
                studentAnswer: 'Attention takes Q, K, V. Formula: Attention = softmax(QK / dk) * V. It matches query with key to find which words are important. dk makes numbers smaller.',
                modelAnswer: 'Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V. sqrt(d_k) prevents vanishing gradients in softmax.',
                maxMarks: 10,
                aiSuggestedMarks: 6.5,
                confidenceScore: 73,
                evaluationFeedback: 'Attention takes Q, K, V. Partial credit awarded. Need formal mathematical notation for matrix operations.',
                teacherAdjustedMarks: null,
                finalMarks: null,
                evaluationStatus: 'AI_SUGGESTED',
                questionId: 'q3_transformer_attention',
                questionNumber: 3,
                questionText: 'Describe the Scaled Dot-Product Attention mechanism in Transformer architectures. Write the mathematical formula involving Query (Q), Key (K), and Value (V) matrices, and explain why the scaling factor sqrt(d_k) is necessary.',
                awardedMarks: 6.5,
                studentAnswerText: 'Attention takes Q, K, V. Formula: Attention = softmax(QK / dk) * V. It matches query with key to find which words are important. dk makes numbers smaller.',
                modelAnswerText: 'Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V. sqrt(d_k) prevents vanishing gradients in softmax.',
                semanticSimilarityScore: 71.0,
                conceptMatches: [
                    {
                        concept: 'Scaled Dot-Product Attention Formula: Attention(Q,K,V) = softmax((QK^T)/sqrt(d_k))V',
                        requiredWeight: 4,
                        awardedWeight: 2.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['Attention = softmax(QK / dk) * V'],
                        explanation: 'Omitted transpose on Key matrix (K^T) and omitted square root on d_k (wrote dk instead of sqrt(d_k)).'
                    },
                    {
                        concept: 'Role of Queries (Q), Keys (K), and Values (V)',
                        requiredWeight: 3,
                        awardedWeight: 2.5,
                        status: 'Full',
                        matchedStudentPhrases: ['matches query with key to find which words are important'],
                        explanation: 'Intuitive explanation of similarity matching.'
                    },
                    {
                        concept: 'Purpose of Scaling Factor sqrt(d_k) (Preventing Vanishing Gradients in Softmax)',
                        requiredWeight: 3,
                        awardedWeight: 1.5,
                        status: 'Partial',
                        matchedStudentPhrases: ['dk makes numbers smaller'],
                        explanation: 'Recognized reduction in magnitude, but did not explain vanishing gradient prevention in softmax.'
                    }
                ],
                deductions: [
                    {
                        reason: 'Incorrect formula: missing K^T transpose and wrote dk instead of sqrt(d_k).',
                        pointsDeducted: 2.0,
                        category: 'Factual Inaccuracy'
                    },
                    {
                        reason: 'Omitted explanation of softmax gradient vanishing / saturation.',
                        pointsDeducted: 1.5,
                        category: 'Missing Key Term'
                    }
                ],
                feedback: 'Good intuitive understanding of attention, but accuracy in mathematical indexing is vital.',
                strengths: ['Identified role of Q/K matching', 'Included softmax'],
                weaknesses: ['Correct formula to sqrt(d_k) and K^T', 'Explain vanishing gradients']
            }
        ],
        personalizedInsights: {
            overallSummary: 'Priya possesses sound intuition of AI & OS concepts, but loses marks due to brief colloquial explanations and missing mathematical formulas.',
            keyStrengths: [
                'Intuitive grasp of what the algorithms do in practice',
                'Recognized core mechanisms (Chain rule, learning rate, attention matching)',
                'Good potential with targeted technical vocabulary reinforcement'
            ],
            criticalGaps: [
                'Formulas must include precise notation (e.g. K^T, sqrt(d_k), w = w - eta * grad)',
                'Must explain "Why" and "How" rather than just giving a 1-sentence definition'
            ],
            actionableRecommendations: [
                'Create a formula cheat-sheet for ML optimization and Transformer equations',
                'Practice writing structured 3-point answers: 1) Definition 2) Formula 3) Mechanism'
            ],
            studyTopicsToRevise: [
                {
                    topic: 'Attention Mechanism Mathematical Derivations',
                    urgency: 'High',
                    resourcesRecommended: 'Attention Is All You Need (Vaswani et al.) Section 3.2.1'
                },
                {
                    topic: 'Process Synchronization Primitives & State Queues',
                    urgency: 'Medium',
                    resourcesRecommended: 'Operating Systems: Three Easy Pieces (Arpaci-Dusseau) Ch. 31'
                }
            ]
        },
        predictiveAnalytics: {
            predictedNextScore: 76.0,
            scoreRangeConfidence: [70.0, 82.0],
            predictedPassProbability: 88.5,
            knowledgeRetentionIndex: 72,
            classPercentileRank: 62.4,
            examReadinessLevel: 'Moderate Competence',
            radarSkills: [
                { skill: 'Conceptual Clarity', studentScore: 74, cohortAverage: 71 },
                { skill: 'Mathematical Rigor', studentScore: 52, cohortAverage: 62 },
                { skill: 'Terminology & Keywords', studentScore: 60, cohortAverage: 74 },
                { skill: 'Handwriting OCR Quality', studentScore: 89, cohortAverage: 78 },
                { skill: 'Step-by-Step Completeness', studentScore: 58, cohortAverage: 65 }
            ]
        }
    }
];
export const SPRING_BOOT_ARCHITECTURE_CODE = {
    controllerJava: `package com.intelligrade.controller;

import com.intelligrade.dto.*;
import com.intelligrade.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class GradingController {

    private final PreprocessingService preprocessingService;
    private final OcrDigitizationService ocrService;
    private final ModelAnswerService modelAnswerService;
    private final NlpMarkingService nlpMarkingService;
    private final InsightGenerationService insightService;

    public GradingController(
            PreprocessingService preprocessingService,
            OcrDigitizationService ocrService,
            ModelAnswerService modelAnswerService,
            NlpMarkingService nlpMarkingService,
            InsightGenerationService insightService) {
        this.preprocessingService = preprocessingService;
        this.ocrService = ocrService;
        this.modelAnswerService = modelAnswerService;
        this.nlpMarkingService = nlpMarkingService;
        this.insightService = insightService;
    }

    /**
     * Stage 1: Preprocessing scanned handwritten answer sheet
     * Applies noise reduction, skew correction, stroke normalization, thinning, binarization.
     */
    @PostMapping("/preprocess")
    public ResponseEntity<PreprocessingResponse> preprocessScan(
            @RequestParam("file") MultipartFile scanFile,
            @RequestBody(required = false) PreprocessingConfigDTO config) {
        PreprocessingResponse response = preprocessingService.executePipeline(scanFile, config);
        return ResponseEntity.ok(response);
    }

    /**
     * Stage 2: OCR Extraction & Digitization
     */
    @PostMapping("/ocr/extract")
    public ResponseEntity<OcrResultDTO> extractText(
            @RequestBody OcrRequestDTO request) {
        OcrResultDTO ocrResult = ocrService.extractHandwrittenText(request.getImageBase64());
        return ResponseEntity.ok(ocrResult);
    }

    /**
     * Stage 2b: Generate / Customize AI Model Answers
     */
    @PostMapping("/model-answers/generate")
    public ResponseEntity<ModelAnswerDTO> generateModelAnswer(
            @RequestBody GenerateModelAnswerRequest request) {
        ModelAnswerDTO modelAnswer = modelAnswerService.generateGoldStandardRubric(request);
        return ResponseEntity.ok(modelAnswer);
    }

    /**
     * Stage 3: Context-Based Semantic Grading & Marking Algorithm
     */
    @PostMapping("/grade/evaluate")
    public ResponseEntity<GradingResultDTO> evaluateSubmission(
            @RequestBody EvaluationRequestDTO request) {
        GradingResultDTO gradingResult = nlpMarkingService.evaluateAnswerSheet(request);
        return ResponseEntity.ok(gradingResult);
    }

    /**
     * Stage 3b: Insight Generation & Predictive Analytics
     */
    @PostMapping("/analytics/insights")
    public ResponseEntity<PersonalizedInsightDTO> generateInsights(
            @RequestBody InsightRequestDTO request) {
        PersonalizedInsightDTO insights = insightService.generateStudentInsights(request);
        return ResponseEntity.ok(insights);
    }

    /**
     * Teacher Grade Override Endpoint
     */
    @PutMapping("/submissions/{submissionId}/override")
    public ResponseEntity<SubmissionResponseDTO> overrideGrade(
            @PathVariable("submissionId") String submissionId,
            @RequestBody TeacherOverrideDTO overrideDTO) {
        SubmissionResponseDTO updated = nlpMarkingService.applyTeacherOverride(submissionId, overrideDTO);
        return ResponseEntity.ok(updated);
    }
}`,
    mysqlSchemaSql: `-- =========================================================
-- IntelliGrade MySQL Production Relational Database Schema
-- Follows 3NF normalization with indexing for fast analytics
-- =========================================================

CREATE DATABASE IF NOT EXISTS intelligrade_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intelligrade_db;

-- 1. Exams & Question Papers
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(128) NOT NULL,
    grade_level VARCHAR(64) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Questions & Model Answers
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    model_answer LONGTEXT NOT NULL,
    topic VARCHAR(128),
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_exam_q (exam_id, question_number)
) ENGINE=InnoDB;

-- 3. Question Rubric Key Concepts
CREATE TABLE IF NOT EXISTS rubric_key_concepts (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL,
    concept_title VARCHAR(255) NOT NULL,
    weight_marks DECIMAL(5,2) NOT NULL,
    description TEXT,
    synonyms_json JSON,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Student Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    student_roll_no VARCHAR(64) NOT NULL,
    scan_storage_url VARCHAR(512),
    total_awarded_marks DECIMAL(5,2) DEFAULT 0.00,
    percentage_score DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('Graded', 'Under Review', 'Flagged') DEFAULT 'Graded',
    ocr_confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_student_roll (student_roll_no)
) ENGINE=InnoDB;

-- 5. Question Evaluations & Marks Breakdown
CREATE TABLE IF NOT EXISTS question_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    student_extracted_text LONGTEXT,
    awarded_marks DECIMAL(5,2) NOT NULL,
    teacher_override_marks DECIMAL(5,2) NULL,
    semantic_similarity_score DECIMAL(5,2) NOT NULL,
    teacher_comment TEXT NULL,
    feedback TEXT,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Personalized Insights & Predictive Analytics
CREATE TABLE IF NOT EXISTS predictive_insights (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL UNIQUE,
    predicted_next_score DECIMAL(5,2),
    pass_probability DECIMAL(5,2),
    retention_index DECIMAL(5,2),
    class_percentile DECIMAL(5,2),
    readiness_level VARCHAR(64),
    strengths_json JSON,
    gaps_json JSON,
    recommendations_json JSON,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;`
};
export const SAMPLE_SUBMISSIONS = INITIAL_SUBMISSIONS;
