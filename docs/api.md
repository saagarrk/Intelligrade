# IntelliGrade REST API Specification (v2.5)

Base URI: `http://localhost:8080/api/v1` (Backend Gateway) or `http://localhost:8000/api/v1` (AI Microservice)

---

## 1. Authentication & Session Management

### `POST /auth/login`
Authenticates user and returns JWT Bearer session token.
- **Request Body**:
  ```json
  {
    "email": "teacher@intelligrade.edu",
    "password": "Password123!",
    "rememberMe": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "usr_teacher_01",
        "name": "Prof. Ananya Sen",
        "email": "teacher@intelligrade.edu",
        "role": "teacher"
      },
      "expiresAt": "2026-09-25T18:00:00.000Z"
    }
  }
  ```

### `GET /auth/session-validate`
Validates currently active JWT token.
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "valid": true,
    "user": { ... },
    "expiresAt": "2026-09-25T18:00:00.000Z"
  }
  ```

---

## 2. Exam Catalog & Rubric Configuration

### `GET /exams`
Retrieves all registered exam papers and grading rubrics.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "exam_cs_ai_301",
      "title": "Advanced Operating Systems & Artificial Intelligence",
      "courseCode": "CS-AI-301",
      "totalMarks": 30,
      "questionsCount": 3,
      "questions": [
        {
          "id": "q1_deadlock_bankers",
          "questionNumber": 1,
          "questionText": "Explain the Banker's Algorithm for Deadlock Avoidance...",
          "maxMarks": 10,
          "topic": "Operating Systems - Concurrency",
          "modelAnswer": "...",
          "keyConcepts": [
            { "concept": "Safe State vs Unsafe State", "weightMarks": 4 }
          ]
        }
      ]
    }
  ]
  ```

### `POST /exams`
Registers a new exam rubric (Teacher/Admin only).
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Complete Exam Rubric entity.

---

## 3. Submissions & Automated Grading

### `GET /submissions`
Retrieves list of student submissions for an exam.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `examId=exam_cs_ai_301`

### `POST /submissions/upload`
Uploads a scanned handwritten student answer sheet.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body (Multipart or JSON)**:
  ```json
  {
    "examId": "exam_cs_ai_301",
    "studentName": "Aarav Sharma",
    "imageBase64": "data:image/png;base64,iVBORw0KGgo..."
  }
  ```

### `PUT /submissions/:id/override`
Applies teacher manual mark override and cryptographic audit notation.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "questionNumber": 1,
    "overrideMarks": 9.5,
    "reason": "Clear mathematical proof in margins"
  }
  ```

---

## 4. AI Python Microservice Direct Endpoints

### `POST /ai/preprocess`
Applies bilateral smoothing, Otsu binarization, deskewing, and skeleton thinning.
- **Request Body**:
  ```json
  {
    "image_base64": "data:image/png;base64,...",
    "apply_thinning": true,
    "auto_deskew": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "processed_image_base64": "data:image/png;base64,...",
    "skew_angle_deg": -1.45,
    "dpi_detected": 300,
    "contrast_ratio": 88.5,
    "stroke_width_px": 2.4
  }
  ```

### `POST /ai/evaluate`
Executes semantic sentence embedding scoring and rubric marks attribution.
- **Request Body**:
  ```json
  {
    "questions": [ ... ],
    "student_answers": [
      {
        "question_number": 1,
        "student_answer_text": "Bankers algorithm ensures system never enters unsafe state..."
      }
    ],
    "student_name": "Aarav Sharma"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "student_name": "Aarav Sharma",
    "total_score": 27.5,
    "max_score": 30.0,
    "percentage": 91.7,
    "grade": "A+",
    "overall_summary": "Candidate demonstrated exceptional mastery...",
    "blooms_taxonomy_level": "Synthesizing & Evaluating (Level 5-6)"
  }
  ```

---

## 5. Student Appeals

### `POST /student/appeal-reevaluation`
Submits a formal grievance and re-evaluation appeal.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "submissionId": "sub_alex_901",
    "questionNumber": 1,
    "studentId": "usr_student_01",
    "appealReason": "I included full proof steps for Safe State in paragraph 2."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "ticketId": "REV-2026-7842",
    "status": "QUEUED_FOR_INSTRUCTOR_REVIEW",
    "message": "Appeal ticket submitted successfully."
  }
  ```
