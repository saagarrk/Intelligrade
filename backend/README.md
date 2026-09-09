# IntelliGrade Backend Microservices & API Architecture

Welcome to the **IntelliGrade Backend Repository**. This folder provides complete, production-ready backend implementations for both **Node.js/Express (TypeScript)** and **Spring Boot 3 (Java 17 + MySQL)**.

---

## 📁 Repository Structure

```
├── /server.ts                      # Root Node.js Express REST API server
├── /backend/
│   ├── README.md                   # Complete Backend Developer Guide (This file)
│   ├── database/
│   │   └── schema.sql              # Production MySQL & PostgreSQL DDL / DML Schema & Seeds
│   ├── src/                        # Modular Node/TypeScript controllers & services
│   │   ├── controllers/            # Auth, Grading, OCR, Admin, Student REST handlers
│   │   ├── services/               # Gemini AI SDK & Semantic Evaluator engines
│   │   └── models/                 # TypeScript data contracts & DTOs
│   └── springboot/                 # Full Spring Boot 3 Java Maven Project
│       ├── pom.xml                 # Maven dependencies (Spring Web, Security, JPA, MySQL, JJWT)
│       └── src/
│           ├── main/resources/
│           │   └── application.yml # Spring Data JPA & MySQL configurations
│           └── main/java/com/intelligrade/
│               ├── IntelliGradeApplication.java
│               ├── config/SecurityConfig.java
│               ├── controller/AuthController.java
│               └── controller/GradingPipelineController.java
```

---

## 🚀 1. Running the Node.js / Express Server

The root server runs on port `3000` with native TypeScript and Vite middleware:

```bash
# Install dependencies
npm install

# Start development full-stack server
npm run dev

# Build and compile for production
npm run build
npm start
```

---

## ☕ 2. Running the Spring Boot Java Backend

To run the standalone Spring Boot microservice:

```bash
cd backend/springboot

# Build and run with Maven
mvn clean spring-boot:run
```

By default, the Spring Boot application will bind to `http://localhost:8080` and connect to the MySQL database defined in `application.yml`.

---

## 🗄️ 3. Database Setup (MySQL / PostgreSQL)

1. Open your MySQL client or CLI:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
2. The schema creates the following tables:
   - `users` & `user_permissions` (Fine-grained RBAC for Student, Faculty, Admin)
   - `exams`, `exam_questions`, `question_key_concepts` (Curriculum & Model answers)
   - `semantic_rubric_matrices` (Gemini AI Sheet 3 Paraphrase Matrix)
   - `student_submissions` & `submission_preprocessing` (Handwritten papers & filter audits)
   - `question_evaluations` (AI scores, semantic similarity & teacher overrides)
   - `reevaluation_appeals` (Student remarking ticket queue)
   - `audit_logs` (Immutable system security ledger)

---

## 📡 4. Core REST API Endpoints

### 🔐 Authentication & Access Control
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate with email/password or 1-click role | Public |
| `POST` | `/api/v1/auth/register` | Register new student, faculty or administrator | Public |
| `GET` | `/api/v1/auth/me` | Fetch active session & permissions | Authenticated |
| `POST` | `/api/v1/auth/logout` | Invalidate token session | Authenticated |

### 📝 Multimodal OCR & Semantic Grading Pipeline
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/v1/ocr/extract` | Gemini Multimodal Vision handwriting OCR | Teacher, Admin |
| `POST` | `/api/v1/model-answers/generate` | Generate gold standard rubric & key concepts | Teacher, Admin |
| `POST` | `/api/v1/gemini/generate-semantic-variants`| Auto-generate Sheet 3 "Own-Words" semantic matrix | Teacher, Admin |
| `POST` | `/api/v1/grade/evaluate` | Execute 3-way Tri-Sheet semantic grading | Teacher, Admin |

### 🛡️ Administration & Student Appeals
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | List user directory & active tokens | Admin |
| `GET` | `/api/v1/admin/audit-logs` | Fetch system audit ledger | Admin |
| `POST` | `/api/v1/student/appeal-reevaluation` | Submit remarking appeal ticket | Student |
