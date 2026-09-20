# IntelliGrade System Architecture

IntelliGrade is an enterprise-grade automated handwritten answer sheet evaluation platform engineered with a decoupled, high-performance microservices topology.

```
                                  [ Browser / Client ]
                                           │
                                           ▼ (HTTPS / Port 3000)
                              ┌─────────────────────────┐
                              │  frontend/ (React/Vite) │
                              └────────────┬────────────┘
                                           │
                       REST / Bearer JWT   │ (Proxy or Direct API)
                                           ▼
                              ┌─────────────────────────┐
                              │ backend/ (Spring Boot)  │
                              │     Port 8080 (REST)    │
                              └───────┬────────────┬────┘
                                      │            │
                     JSON RPC / HTTP  │            │ JDBC / HikariCP
                                      ▼            ▼
         ┌──────────────────────────────┐     ┌───────────────────┐
         │  ai-service/ (FastAPI Python)│     │ MySQL 8.0 Engine  │
         │      Port 8000 (FastAPI)     │     │     Port 3306     │
         └──────────────┬───────────────┘     └───────────────────┘
                        │
                        ▼ (gRPC / HTTPS)
         ┌──────────────────────────────┐
         │   Google Gemini 2.5 Flash    │
         │ (Multimodal Vision + OCR)    │
         └──────────────────────────────┘
```

---

## 1. System Services

### 1.1 `frontend/` (Presentation Layer)
- **Framework**: React 19 + Vite + Tailwind CSS.
- **State Management**: Context API (`AuthContext`, `ThemeContext`) with optimistic offline fallbacks.
- **Interactive Dashboards**:
  - Teacher Portal: Answer script upload, live OCR inspection, rubric matrix adjustments, and grade export.
  - Student Portal: Scorecard review, concept breakdown radar, and re-evaluation appeal submission.
  - System Architecture Explorer: Interactive REST sandbox and multi-tier schema inspection.

### 1.2 `backend/` (Core Enterprise Backend)
- **Framework**: Java 17 + Spring Boot 3.2.
- **Persistence**: Spring Data JPA + Hibernate ORM backed by MySQL 8.0 (with in-memory H2 support for rapid local runs).
- **Authentication & RBAC**: Spring Security with stateless HMAC-SHA256 JWT tokens, enforcing role isolation across `STUDENT`, `TEACHER`, and `ADMIN`.
- **Orchestration**: Manages batch job lifecycles, audit logging, student rosters, exam rubrics, and coordinates calls to the AI Service.

### 1.3 `ai-service/` (AI & Computer Vision Microservice)
- **Framework**: Python 3.11 + FastAPI + Uvicorn.
- **Computer Vision (`preprocessing_service.py`)**:
  - Grayscale conversion, bilateral filtering, and Otsu adaptive thresholding.
  - Minimum bounding-box angle estimation and affine transformation deskewing.
  - Zhang-Suen 2-pass morphological skeletonization for stroke thinning.
- **Handwritten OCR (`ocr_service.py`)**:
  - Multimodal Gemini Vision handwriting recognition with question segmentation, bounding-box tagging, and mathematical equation formatting.
- **Semantic Grading (`evaluation_service.py`)**:
  - Jaccard and cosine token embeddings, technical synonym normalization, key concept rubrics weighting, and proportional mark attribution.
- **Formative Feedback (`feedback_service.py`)**:
  - Automated diagnostic feedback, misconception alerts, and Bloom's Taxonomy cognitive level classification.

---

## 2. 5-Stage Grading Pipeline Flow

```
[ Stage 1: Document Ingestion & Preprocessing ]
       │ Image Upload -> Bilateral Filter -> Otsu Binarization -> Deskew -> Stroke Thinning
       ▼
[ Stage 2: Multimodal OCR & Handwriting Extraction ]
       │ Gemini Multimodal Vision -> Question Segmentation -> Line Coordinates
       ▼
[ Stage 3: Semantic NLP & Rubric Attribution ]
       │ Key Concept Matching -> Synonym Matrix Expansion -> Proportional Marks Attribution
       ▼
[ Stage 4: Pedagogical Feedback & Cohort Analytics ]
       │ Bloom's Taxonomy Tagging -> Misconception Alerts -> Class Performance Insights
       ▼
[ Stage 5: Teacher Review & Audit Verification ]
       │ Manual Override -> Cryptographic Audit Trail -> Final Grade Release Notification
```

---

## 3. Database Schema Entity Model

```sql
-- Core Exam Rubric Definition
CREATE TABLE exams (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(32) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions & Model Answers
CREATE TABLE exam_questions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    model_answer TEXT NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Student Answer Sheet Submissions
CREATE TABLE student_submissions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    total_score DECIMAL(5,2) DEFAULT 0.00,
    percentage_score DECIMAL(5,2) DEFAULT 0.00,
    grade_awarded VARCHAR(8),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question-by-Question Granular Evaluations
CREATE TABLE question_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    student_answer_text TEXT,
    awarded_marks DECIMAL(5,2) NOT NULL,
    semantic_similarity_score DECIMAL(5,2),
    teacher_override_marks DECIMAL(5,2),
    feedback TEXT,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id) ON DELETE CASCADE
);
```

---

## 4. Scalability & Fault Tolerance
- **Stateless Services**: All three tiers (`frontend`, `backend`, `ai-service`) maintain zero in-memory session locks, allowing horizontal scaling via Kubernetes Deployments.
- **Failover & Fallbacks**: If the Python AI service or Gemini API experiences network interruption, the Spring Boot / Express gateway automatically activates dynamic local heuristic grading to guarantee zero downtime for grading workflows.
