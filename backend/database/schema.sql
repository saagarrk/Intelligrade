-- =========================================================================
-- IntelliGrade AI - Production MySQL & PostgreSQL Database Schema
-- Academic Assessment & Automated Multimodal Grading Platform
-- =========================================================================

CREATE DATABASE IF NOT EXISTS intelligrade_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intelligrade_db;

-- 1. USERS & RBAC PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
    department VARCHAR(128),
    roll_number VARCHAR(64),
    title VARCHAR(128),
    avatar_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 2. USER PERMISSIONS MAPPING
CREATE TABLE IF NOT EXISTS user_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    permission_name VARCHAR(64) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_perm (user_id, permission_name)
) ENGINE=InnoDB;

-- 3. EXAM PAPERS MASTER TABLE
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(128) NOT NULL,
    grade_level VARCHAR(64),
    total_marks INT NOT NULL DEFAULT 100,
    instructions JSON,
    created_by VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. EXAM QUESTIONS & OFFICIAL RUBRICS (Sheet 2: Model Answers)
CREATE TABLE IF NOT EXISTS exam_questions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    topic VARCHAR(128),
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    official_model_answer LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    UNIQUE KEY uq_exam_qnum (exam_id, question_number)
) ENGINE=InnoDB;

-- 5. WEIGHTED KEY CONCEPTS PER QUESTION
CREATE TABLE IF NOT EXISTS question_key_concepts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL,
    concept_name VARCHAR(255) NOT NULL,
    weight_marks DECIMAL(5,2) NOT NULL,
    synonyms JSON,
    description TEXT,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. GEMINI AI AUTO-GENERATED SEMANTIC MATRIX (Sheet 3: "Own-Words" Reference)
CREATE TABLE IF NOT EXISTS semantic_rubric_matrices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL UNIQUE,
    official_model_answer LONGTEXT NOT NULL,
    ai_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_model_name VARCHAR(64) DEFAULT 'gemini-3.8-flash',
    leniency_threshold_pct DECIMAL(5,2) DEFAULT 82.00,
    own_words_variations JSON NOT NULL,
    accepted_synonyms JSON NOT NULL,
    alternative_derivations JSON,
    misconception_guards JSON,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. STUDENT PAPER SUBMISSIONS (Sheet 1: Student Handwritten Papers)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    student_roll_number VARCHAR(64) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_scan_url LONGTEXT,
    ocr_raw_text LONGTEXT,
    ocr_confidence_score DECIMAL(5,2) DEFAULT 95.00,
    total_max_marks DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    ai_suggested_total_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    teacher_adjusted_marks DECIMAL(6,2) NULL,
    final_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    percentage_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    letter_grade VARCHAR(8) DEFAULT 'F',
    evaluation_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_TEACHER_REVIEW',
    pipeline_status VARCHAR(32) DEFAULT 'PENDING_TEACHER_REVIEW',
    is_reviewed_by_teacher BOOLEAN DEFAULT FALSE,
    teacher_notes TEXT,
    reviewed_by VARCHAR(128),
    created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_submission_exam_id (exam_id),
    INDEX idx_submission_student_id (student_id),
    INDEX idx_submission_roll_no (student_roll_number),
    INDEX idx_submission_eval_status (evaluation_status),
    INDEX idx_submission_created_at (created_timestamp)
) ENGINE=InnoDB;

-- Backwards-compatible view/table alias for student_submissions
CREATE TABLE IF NOT EXISTS student_submissions (
    id VARCHAR(64) PRIMARY KEY,
    exam_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    student_roll_number VARCHAR(64) NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    original_scan_url LONGTEXT,
    ocr_raw_text LONGTEXT,
    ocr_average_confidence DECIMAL(5,2) DEFAULT 95.00,
    ocr_engine VARCHAR(64) DEFAULT 'Gemini-Vision-Multimodal',
    total_max_marks DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    total_awarded_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    percentage_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    status ENUM('Graded', 'Under Review', 'Flagged') DEFAULT 'Graded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sub_student (student_id),
    INDEX idx_sub_exam (exam_id)
) ENGINE=InnoDB;

-- 8. PREPROCESSING CONFIGURATION AUDIT
CREATE TABLE IF NOT EXISTS submission_preprocessing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL UNIQUE,
    noise_reduction BOOLEAN DEFAULT TRUE,
    noise_radius INT DEFAULT 2,
    contrast_stretch DECIMAL(3,2) DEFAULT 1.6,
    skew_angle DECIMAL(4,2) DEFAULT 0.0,
    thinning_iterations INT DEFAULT 1,
    thresholding_type VARCHAR(32) DEFAULT 'sauvola',
    processing_time_ms INT DEFAULT 120,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. PER-QUESTION EVALUATIONS & AI / TEACHER OVERRIDES (Legacy compatibility table)
CREATE TABLE IF NOT EXISTS question_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    max_marks DECIMAL(5,2) NOT NULL,
    ai_awarded_marks DECIMAL(5,2) NOT NULL,
    teacher_override_marks DECIMAL(5,2) NULL,
    teacher_comment TEXT NULL,
    semantic_similarity_score DECIMAL(5,2) NOT NULL,
    student_extracted_answer LONGTEXT,
    feedback TEXT,
    own_words_variant_matched VARCHAR(255),
    equivalence_justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================================
-- NEW NORMALIZED SCHEMA: ANSWERS, EVALUATIONS, CRITERIA & FEEDBACKS
-- =========================================================================

-- 10. ANSWERS (Per-Question student answers submitted with model benchmark)
CREATE TABLE IF NOT EXISTS answers (
    id VARCHAR(64) PRIMARY KEY,
    submission_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    student_answer LONGTEXT,
    model_answer LONGTEXT,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE SET NULL,
    INDEX idx_answer_submission_id (submission_id),
    INDEX idx_answer_question_id (question_id),
    INDEX idx_answer_sub_qnum (submission_id, question_number),
    INDEX idx_answer_created_at (created_timestamp)
) ENGINE=InnoDB;

-- 11. EVALUATIONS (Per-Answer AI Evaluation, Confidence, Status & Teacher Adjustments)
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(64) PRIMARY KEY,
    answer_id VARCHAR(64) NOT NULL UNIQUE,
    ai_suggested_marks DECIMAL(5,2) NULL,
    ai_confidence DECIMAL(5,4) NULL,
    ai_feedback TEXT NULL,
    semantic_similarity_score DECIMAL(5,4) NULL,
    teacher_adjusted_marks DECIMAL(5,2) NULL,
    final_marks DECIMAL(5,2) NULL,
    evaluation_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_TEACHER_REVIEW',
    is_teacher_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(128) NULL,
    teacher_notes TEXT NULL,
    created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
    INDEX idx_eval_answer_id (answer_id),
    INDEX idx_eval_status (evaluation_status),
    INDEX idx_eval_created_at (created_timestamp)
) ENGINE=InnoDB;

-- 12. EVALUATION CRITERIA (Rubric Dimensions & Key Concept Breakdown)
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id VARCHAR(64) PRIMARY KEY,
    evaluation_id VARCHAR(64) NOT NULL,
    criterion_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    ai_suggested_marks DECIMAL(5,2) NULL,
    ai_confidence DECIMAL(5,4) NULL,
    teacher_adjusted_marks DECIMAL(5,2) NULL,
    final_marks DECIMAL(5,2) NULL,
    match_status VARCHAR(32) DEFAULT 'FULL_MATCH',
    feedback TEXT NULL,
    created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    INDEX idx_crit_evaluation_id (evaluation_id),
    INDEX idx_crit_match_status (match_status),
    INDEX idx_crit_created_at (created_timestamp)
) ENGINE=InnoDB;

-- 13. FEEDBACKS (Multi-author Pedagogical Feedback & Teacher Observations)
CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(64) PRIMARY KEY,
    evaluation_id VARCHAR(64) NOT NULL,
    feedback_type VARCHAR(64) NOT NULL DEFAULT 'AI_FEEDBACK',
    feedback_text TEXT NOT NULL,
    author VARCHAR(128) DEFAULT 'AI_EVALUATOR',
    author_role VARCHAR(64) DEFAULT 'AI_SYSTEM',
    is_public_to_student BOOLEAN DEFAULT TRUE,
    created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    INDEX idx_feedback_evaluation_id (evaluation_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_feedback_created_at (created_timestamp)
) ENGINE=InnoDB;

-- 10. RE-EVALUATION / REMARKING APPEALS TABLE
CREATE TABLE IF NOT EXISTS reevaluation_appeals (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(32) NOT NULL UNIQUE,
    submission_id VARCHAR(64) NOT NULL,
    student_id VARCHAR(64) NOT NULL,
    question_number INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending Review', 'Under Evaluation', 'Approved', 'Rejected') DEFAULT 'Pending Review',
    instructor_notes TEXT,
    adjusted_marks DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES student_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. IMMUTABLE SYSTEM SECURITY & AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(128) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    status ENUM('Success', 'Denied', 'Warning') DEFAULT 'Success',
    ip_address VARCHAR(45),
    INDEX idx_audit_time (timestamp),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB;

-- =========================================================================
-- SEED INITIAL DATA FOR INSTANT TESTING
-- =========================================================================

-- Seed Demo Users
INSERT INTO users (id, name, email, password_hash, role, department, roll_number, title)
VALUES 
('usr_student_01', 'Alex Rivera', 'student@intelligrade.edu', 'student123', 'student', 'Computer Science & Engineering', 'CS-2026-041', NULL),
('usr_teacher_01', 'Prof. Sarah Jenkins', 'teacher@intelligrade.edu', 'teacher123', 'teacher', 'Department of Computer Science', NULL, 'Lead Instructor & Associate Professor'),
('usr_admin_01', 'Dr. Eleanor Vance', 'admin@intelligrade.edu', 'admin123', 'admin', 'Office of Academic Assessment', NULL, 'Dean of Academic Computing')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Seed Default Audit Log
INSERT INTO audit_logs (id, user_email, user_role, action, resource, status)
VALUES
('log_001', 'admin@intelligrade.edu', 'admin', 'SYSTEM_BOOTSTRAP', 'Spring Boot & Node REST Layer', 'Success'),
('log_002', 'teacher@intelligrade.edu', 'teacher', 'EXAM_RUBRIC_CONFIGURED', 'CS301-Midterm-Operating-Systems', 'Success'),
('log_003', 'student@intelligrade.edu', 'student', 'VIEW_PERFORMANCE_SCORECARD', 'Alex-Rivera-CS-2026-041', 'Success');
