/**
 * IntelliGrade OpenAPI 3.0.3 Specification
 * Provides full contract documentation for Authentication, Examinations,
 * Questions, Submissions, Evaluations, Results, and System Health endpoints.
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'IntelliGrade Production REST API Engine',
    version: '2.5.0',
    description: 'Enterprise AI-Powered Handwritten Answer Sheet Evaluation Engine. Provides robust multi-role evaluation, handwriting OCR transcription, rubric alignment, automated mark computation, and institutional academic administration.',
    contact: {
      name: 'IntelliGrade Engineering Support',
      email: 'engineering@intelligrade.edu'
    },
    license: {
      name: 'Proprietary - Academic Institutional License',
      url: 'https://intelligrade.edu/license'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production API v1 Gateway'
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local Full-Stack Development Container'
    },
    {
      url: 'http://localhost:8080/api/v1',
      description: 'Spring Boot Backend Gateway'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token in standard Authorization header: `Bearer <token>`'
      },
      InternalApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Internal-API-Key',
        description: 'Shared service secret key for inter-service microservice authentication'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Resource not found' },
          code: { type: 'string', example: 'NOT_FOUND' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'teacher@intelligrade.edu' },
          password: { type: 'string', example: 'Password123!' },
          rememberMe: { type: 'boolean', default: false }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'Dr. Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sconnor@intelligrade.edu' },
          password: { type: 'string', minLength: 8, example: 'SecureP@ss2026!' },
          role: { type: 'string', enum: ['student', 'teacher', 'admin'], example: 'teacher' },
          secretKey: { type: 'string', description: 'Required for teacher (TEACHER-SEC-2026) or admin (ADMIN-SEC-2026) roles' }
        }
      },
      Question: {
        type: 'object',
        required: ['questionNumber', 'questionText', 'maxMarks', 'modelAnswer'],
        properties: {
          id: { type: 'string', example: 'q_1' },
          questionNumber: { type: 'integer', example: 1 },
          questionText: { type: 'string', example: 'Explain the architecture and mathematical principles of Convolutional Neural Networks.' },
          maxMarks: { type: 'number', example: 10 },
          modelAnswer: { type: 'string', example: 'CNNs utilize convolution layers, activation functions (ReLU), pooling layers, and fully connected dense layers...' },
          topic: { type: 'string', example: 'Deep Learning' },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'], example: 'Medium' },
          keyConcepts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concept: { type: 'string', example: 'Convolution Operation' },
                weightMarks: { type: 'number', example: 4 },
                synonyms: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      ExamPaper: {
        type: 'object',
        required: ['title', 'courseCode', 'subject', 'totalMarks'],
        properties: {
          id: { type: 'string', example: 'exam_cs_ai_301' },
          title: { type: 'string', example: 'Advanced Operating Systems & Artificial Intelligence' },
          courseCode: { type: 'string', example: 'CS-AI-301' },
          subject: { type: 'string', example: 'Computer Science' },
          totalMarks: { type: 'number', example: 100 },
          durationMinutes: { type: 'integer', example: 120 },
          gradeLevel: { type: 'string', example: 'Undergraduate' },
          status: { type: 'string', enum: ['published', 'draft', 'archived'], example: 'published' },
          questions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Question' }
          }
        }
      },
      Submission: {
        type: 'object',
        required: ['examId'],
        properties: {
          id: { type: 'string', example: 'sub_101' },
          examId: { type: 'string', example: 'exam_cs_ai_301' },
          studentName: { type: 'string', example: 'Aarav Sharma' },
          studentRollNo: { type: 'string', example: 'CS-2026-041' },
          status: { type: 'string', enum: ['UPLOADED', 'PROCESSING', 'GRADED', 'REVIEWED', 'FLAGGED'], example: 'GRADED' },
          totalScore: { type: 'number', example: 87.5 },
          maxMarks: { type: 'number', example: 100 },
          percentageScore: { type: 'number', example: 87.5 },
          gradeAwarded: { type: 'string', example: 'A' },
          isFlagged: { type: 'boolean', example: false },
          pages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageNumber: { type: 'integer', example: 1 },
                dataUrl: { type: 'string', description: 'Base64 data URL of scanned answer sheet' }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['System Health'],
        summary: 'System Health Check',
        description: 'Checks gateway health, database connectivity, and Gemini AI status.',
        responses: {
          '200': {
            description: 'Service is operational',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'UP' },
                    service: { type: 'string', example: 'IntelliGrade Production REST API Engine' },
                    geminiConfigured: { type: 'boolean', example: true },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Authentication APIs'],
        summary: 'Authenticate User',
        description: 'Generates JWT Bearer session token with user claims and clearance level.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': { description: 'Authentication successful with JWT token' },
          '400': { description: 'Invalid email or password' },
          '401': { description: 'Incorrect credentials' }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Authentication APIs'],
        summary: 'Register New Account',
        description: 'Registers students, teachers, or administrators. Teacher & Admin registrations require institutional security clearance keys.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': { description: 'Account registered successfully' },
          '400': { description: 'Validation failed or missing secret key' },
          '409': { description: 'Email already registered' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Authentication APIs'],
        summary: 'Get Current Authenticated Profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'User profile details returned' },
          '401': { description: 'Unauthorized / invalid token' }
        }
      }
    },
    '/auth/session-validate': {
      get: {
        tags: ['Authentication APIs'],
        summary: 'Validate Session Token',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Session is valid' },
          '401': { description: 'Session expired or invalid' }
        }
      }
    },
    '/exams': {
      get: {
        tags: ['Examination APIs'],
        summary: 'List Examinations',
        description: 'Retrieves published examination papers and rubrics with optional pagination.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search term' },
          { name: 'subject', in: 'query', schema: { type: 'string' }, description: 'Filter by academic subject' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
        ],
        responses: {
          '200': { description: 'List of exams' }
        }
      },
      post: {
        tags: ['Examination APIs'],
        summary: 'Create Examination Paper',
        security: [{ BearerAuth: [] }],
        description: 'Restricted to Teachers and Administrators.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ExamPaper' }
            }
          }
        },
        responses: {
          '201': { description: 'Examination created' },
          '403': { description: 'Forbidden - Teachers & Admins only' }
        }
      }
    },
    '/exams/{id}': {
      get: {
        tags: ['Examination APIs'],
        summary: 'Get Examination Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Examination with questions returned' },
          '404': { description: 'Exam not found' }
        }
      },
      put: {
        tags: ['Examination APIs'],
        summary: 'Update Examination',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Exam updated' },
          '403': { description: 'Forbidden' }
        }
      },
      delete: {
        tags: ['Examination APIs'],
        summary: 'Delete Examination',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Exam deleted' },
          '403': { description: 'Forbidden - Admins only' }
        }
      }
    },
    '/questions/exam/{examId}': {
      get: {
        tags: ['Question APIs'],
        summary: 'List Questions for Exam',
        parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Exam questions returned' },
          '404': { description: 'Exam not found' }
        }
      },
      post: {
        tags: ['Question APIs'],
        summary: 'Add Question to Exam',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Question' }
            }
          }
        },
        responses: {
          '201': { description: 'Question added' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/questions/exam/{examId}/{questionNumber}': {
      get: {
        tags: ['Question APIs'],
        summary: 'Get Specific Question',
        parameters: [
          { name: 'examId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionNumber', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Question rubric details returned' }
        }
      },
      put: {
        tags: ['Question APIs'],
        summary: 'Update Question Rubric',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'examId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionNumber', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Question rubric updated' }
        }
      },
      delete: {
        tags: ['Question APIs'],
        summary: 'Delete Question',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'examId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionNumber', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Question removed from examination' }
        }
      }
    },
    '/submissions': {
      get: {
        tags: ['Submission APIs'],
        summary: 'List Submissions',
        security: [{ BearerAuth: [] }],
        description: 'Students only see their own submissions; teachers and administrators see all.',
        responses: {
          '200': { description: 'Submissions list' }
        }
      },
      post: {
        tags: ['Submission APIs'],
        summary: 'Create / Upload Student Submission',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' }
            }
          }
        },
        responses: {
          '201': { description: 'Submission uploaded successfully' },
          '413': { description: 'Payload too large (>25MB)' },
          '415': { description: 'Unsupported media type' }
        }
      }
    },
    '/submissions/{id}': {
      get: {
        tags: ['Submission APIs'],
        summary: 'Get Submission by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Submission details' },
          '403': { description: 'Forbidden (IDOR Protection for other students)' },
          '404': { description: 'Submission not found' }
        }
      },
      delete: {
        tags: ['Submission APIs'],
        summary: 'Delete Submission',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Submission deleted' }
        }
      }
    },
    '/submissions/{id}/process-pipeline': {
      post: {
        tags: ['Submission APIs', 'Evaluation APIs'],
        summary: 'Execute OCR & Evaluation Pipeline',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Pipeline triggered / executed' }
        }
      }
    },
    '/ai/evaluate': {
      post: {
        tags: ['Evaluation APIs'],
        summary: 'Evaluate Answers via Gemini AI Orchestrator',
        security: [{ BearerAuth: [] }],
        description: 'Evaluates transcribed student answers against rubric and model answers.',
        responses: {
          '200': { description: 'Itemized evaluation with marks, semantic similarity, and feedback' },
          '403': { description: 'Forbidden - Instructors only' }
        }
      }
    },
    '/evaluations/{id}/accept-ai': {
      post: {
        tags: ['Evaluation APIs'],
        summary: 'Accept AI Marks Suggestion',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'AI suggestion accepted and persisted' },
          '403': { description: 'Forbidden - Teachers only' }
        }
      }
    },
    '/evaluations/{id}/modify-marks': {
      post: {
        tags: ['Evaluation APIs'],
        summary: 'Teacher Marks Adjustment Override',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Marks updated with teacher audit notes' },
          '403': { description: 'Forbidden - Teachers only' }
        }
      }
    },
    '/evaluations/{id}/finalize': {
      post: {
        tags: ['Evaluation APIs'],
        summary: 'Finalize & Lock Evaluation',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Evaluation finalized; grade locked' }
        }
      }
    },
    '/results/student/{studentRollNo}': {
      get: {
        tags: ['Result APIs'],
        summary: 'Get Student Exam Results',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'studentRollNo', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'All exam results for the specified student' },
          '403': { description: 'Forbidden - Cannot access other student results' }
        }
      }
    },
    '/results/submission/{submissionId}': {
      get: {
        tags: ['Result APIs'],
        summary: 'Get Detailed Graded Submission Mark Breakdown',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Itemized question marks, percentage, pass/fail status, and rubric match' },
          '404': { description: 'Submission not found' }
        }
      }
    },
    '/results/exam/{examId}/analytics': {
      get: {
        tags: ['Result APIs'],
        summary: 'Exam Class Analytics & Score Distribution',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'examId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Average score, highest/lowest marks, pass rate, and grade distribution curve' },
          '403': { description: 'Forbidden - Teachers & Admins only' }
        }
      }
    }
  }
};
