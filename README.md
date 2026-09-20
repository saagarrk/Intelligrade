# IntelliGrade — Automated Handwritten Answer Sheet Evaluation Platform

[![Architecture: Microservices + Polyglot](https://img.shields.io/badge/Architecture-React%20%7C%20Spring%20Boot%20%7C%20FastAPI-6366f1.svg)](#architecture--system-topology)
[![AI Engine: Gemini Vision + OpenCV](https://img.shields.io/badge/AI%20Engine-Gemini%20Vision%20%2B%20OpenCV-10b981.svg)](#-5-stage-ai-evaluation-pipeline)
[![API Docs: OpenAPI 3.0 / Swagger](https://img.shields.io/badge/Swagger%20UI-Interactive%20Docs-3b82f6.svg)](#-rest-api-contracts--swagger-docs)
[![Test Suite: 65 Passed](https://img.shields.io/badge/Tests-65%2F65%20Passing-emerald.svg)](#-automated-testing-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

**IntelliGrade** is an enterprise-grade academic evaluation platform engineered to automate the ingestion, visual preprocessing, handwriting OCR digitization, semantic rubric evaluation, and pedagogical performance tracking of student handwritten exam papers.

---

## 🏛️ Architecture & System Topology

IntelliGrade is architected with a decoupled microservices model:

```
                               ┌───────────────────────────┐
                               │   Web Browser Client      │
                               │  (React 19 + Tailwind CSS)│
                               └─────────────┬─────────────┘
                                             │ HTTP / Port 3000
                                             ▼
                               ┌───────────────────────────┐
                               │ Application Gateway       │
                               │ Express / REST v1 Engine  │
                               └──────┬────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │                                             │
               ▼                                             ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐
│  Core Enterprise Backend    │               │  AI & Vision Microservice   │
│  (Spring Boot 3 + Java 17)  │               │  (Python 3.11 + FastAPI)    │
│  Port 8080 (REST / JPA)     │               │  Port 8000 (OpenCV / PyTorch)│
└──────────────┬──────────────┘               └──────────────┬──────────────┘
               │                                             │
               ▼                                             ▼
┌─────────────────────────────┐               ┌─────────────────────────────┐
│ Relational Database         │               │  Google Gemini Vision       │
│ MySQL 8.0 + InnoDB          │               │  Multimodal Handwriting OCR │
│ Port 3306                   │               │  API Engine                 │
└─────────────────────────────┘               └─────────────────────────────┘
```

### Microservices Responsibility Breakdown:
1. **Frontend Presentation Layer (`/src`)**:
   - Built on React 19 and Vite with modular JavaScript components.
   - Role-specific workspaces for **Students** (submission, scorecards, radar skill profiles, re-evaluation appeals), **Teachers** (batch grading, OCR verification, rubric matrix tuning, PDF reports), and **Admins** (system health, user provisioning, security audit trails).
2. **Enterprise Core Backend (`/backend`)**:
   - Implemented in **Spring Boot 3.2 (Java 17)** with Spring Data JPA and Hibernate.
   - Handles institutional transactions, exam catalog definitions, mark overrides, and RBAC token authentication.
3. **AI & Computer Vision Microservice (`/ai-service`)**:
   - Implemented in **Python 3.11 (FastAPI + OpenCV)**.
   - Executes image binarization, deskewing, Zhang-Suen morphological skeletonization, and semantic rubric NLP.
4. **Relational Database (`MySQL 8.0`)**:
   - Relational schemas enforcing referential integrity across Users, Exams, Questions, Rubrics, Submissions, and Audit Trails.

---

## 🔬 5-Stage AI Evaluation Pipeline

1. **Stage 1: Document Ingestion & Computer Vision Preprocessing**
   - Validates MIME type, file signature (magic bytes), and base64 payload size.
   - Runs grayscale normalization, bilateral filtering for noise removal, and **Otsu adaptive binarization**.
   - Computes minimum bounding box contours to determine rotation angles and applies affine deskew transformations.
   - Performs two-pass **Zhang-Suen morphological skeletonization** for stroke thinning.

2. **Stage 2: Multimodal OCR & Question Segmentation**
   - Invokes Gemini Vision with academic handwriting prompts.
   - Structures raw handwritten scans into segment markers (`[Q1]`, `[Q2]`, `[Q3]`), identifying question numbers, transcribed answer bodies, and confidence scores.

3. **Stage 3: Semantic Rubric Scoring & Key Concept Matching**
   - Sanitizes and tokenizes student text with stop-word removal.
   - Evaluates answers against teacher-defined model answers and key concepts using Jaccard and cosine similarity scoring.
   - Applies technical synonym expansions and assigns proportional marks weighted per concept.

4. **Stage 4: Formative Feedback & Bloom's Taxonomy Classification**
   - Maps responses against cognitive tiers: *Remembering*, *Understanding*, *Applying*, *Analyzing*, *Evaluating*, and *Creating*.
   - Flags misconceptions, conceptual omissions, and generates targeted study recommendations.

5. **Stage 5: Teacher Review, Mark Override & Export**
   - Side-by-side synchronized comparison workspace showing the raw scan, extracted OCR text, and model answer.
   - Allows teachers to adjust marks with mandatory audit trail logging.
   - Generates university-grade, multi-page vector PDF evaluation reports.

---

## 🔒 Security Measures

- **Stateless HMAC-SHA256 JWT Authentication**:
  - Validates tokens on protected routes with user roles (`student`, `teacher`, `admin`).
- **Registration Clearance Keys**:
  - Teacher and Admin self-registration requires authorization keys (`TEACHER_SECRET_KEY`, `ADMIN_SECRET_KEY`).
  - Clearance key validation utilizes `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
- **In-Depth IDOR Protection**:
  - Students cannot query submissions or scorecard results of other students; roll numbers and user identities are enforced in service logic.
- **Mass-Assignment Protection**:
  - DTO input sanitization ensures student submission endpoints cannot tamper with marks, evaluation status, or teacher feedback.
- **File Upload Defenses**:
  - Strictly limits uploads to PDF and JPEG/PNG image formats.
  - Multi-page PDF conversion renders directly in sandboxed canvas contexts with 30MB payload boundaries.
- **HTTP Hardening Headers**:
  - `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict CORS policies.
- **Immutable Security Audit Log**:
  - Tracks all administrative actions, mark adjustments, exam deletions, and logins with IP addresses and timestamps.

---

## 📡 REST API Contracts & Swagger Docs

Interactive Swagger UI documentation is available at:
- **Swagger UI Portal**: `http://localhost:3000/api/v1/docs`
- **OpenAPI 3.0 Specification**: `http://localhost:3000/api/v1/docs/openapi.json`

### Key Endpoints:
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticates user and returns JWT token | Public |
| `POST` | `/api/v1/auth/register` | Registers new user with role verification | Public |
| `GET` | `/api/v1/auth/me` | Fetches active user profile from JWT token | Authenticated |
| `GET` | `/api/v1/exams` | Lists all examination papers and rubrics | Public |
| `POST` | `/api/v1/exams` | Creates new examination paper with rubrics | Teacher / Admin |
| `POST` | `/api/v1/submissions` | Ingests student answer sheet scan for grading | Authenticated |
| `GET` | `/api/v1/submissions` | Lists submissions (filtered by role / student) | Authenticated |
| `POST` | `/api/v1/evaluations/modify-marks` | Updates question marks with audit reason | Teacher / Admin |
| `POST` | `/api/v1/ocr/parse-handwritten` | Performs OCR and structured extraction | Authenticated |
| `GET` | `/api/v1/results/student/:rollNumber` | Fetches student scorecard and radar metrics | Student / Teacher |
| `GET` | `/api/v1/admin/audit-logs` | Retrieves security and mark modification logs | Admin |

---

## 🗄️ Database Entities & Relational Design

The system implements the following normalized schema:

- **`UserEntity`**: `id`, `name`, `email`, `password_hash`, `role` (`STUDENT`, `TEACHER`, `ADMIN`), `roll_number`, `created_at`.
- **`ExamEntity`**: `id`, `title`, `course_code`, `total_marks`, `passing_marks`, `exam_date`, `created_by`.
- **`QuestionEntity`**: `id`, `exam_id` (FK), `question_number`, `question_text`, `max_marks`, `topic`, `model_answer`.
- **`EvaluationCriterionEntity`**: `id`, `question_id` (FK), `concept`, `weight_marks`.
- **`SubmissionEntity`**: `id`, `exam_id` (FK), `student_id` (FK), `student_roll_number`, `answer_sheet_url`, `status`, `total_awarded_marks`, `total_max_marks`, `percentage_score`, `submitted_at`.
- **`AnswerEntity`**: `id`, `submission_id` (FK), `question_id` (FK), `raw_ocr_text`, `awarded_marks`, `teacher_override_marks`, `confidence_score`.
- **`FeedbackEntity`**: `id`, `answer_id` (FK), `strengths`, `weaknesses`, `misconceptions`, `blooms_level`.
- **`AuditRecordEntity`**: `id`, `action`, `performed_by`, `target_id`, `ip_address`, `details`, `timestamp`.

---

## 🧪 Automated Testing Framework

Run the comprehensive test runner covering 14 suites:
```bash
npm test
```

### Coverage Overview:
- **Suite 1**: System Health & Gateway Endpoints
- **Suites 2–4**: Auth, Clearance Keys, Role-Based Access Control (RBAC) Isolation
- **Suite 5**: Academic Workflows & Notifications
- **Suite 5B**: Gemini Multimodal OCR & Handwritten Extraction
- **Suite 6**: Semantic NLP Scoring & Text Analysis Algorithms
- **Suite 7**: Computer Vision & Zhang-Suen Morphological Skeletonization
- **Suite 8**: Schema Validation & Input Sanitization
- **Suites 9–10**: File Ingestion, IDOR Defense, Mass-Assignment Protection, Timing-Safe Equality
- **Suites 11–13**: Service Layer Logic, Mark Calculations, and Controller Contracts
- **Suite 14**: OpenAPI 3.0 & Swagger UI Verification

---

## 🚀 Deployment Instructions

### Option 1: Docker Compose (Full-Stack Orchestration)
Spin up the application, Python AI microservice, Spring Boot backend, MySQL, and Redis:
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/IntelliGrade.git
cd IntelliGrade

# 2. Setup environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and secrets

# 3. Build and launch
docker compose up --build
```
- **Web App**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/api/v1/docs`

### Option 2: Standalone Production Build (Node.js + Vite)
```bash
npm install
npm run build
npm start
```

---

## 📄 License
MIT © IntelliGrade Academic Computing Group
