package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity for Student Exam Submissions.
 * Stores overall student submission metadata, total marks, evaluation status, and audit timestamps.
 */
@Entity
@Table(name = "submissions", indexes = {
    @Index(name = "idx_submission_exam_id", columnList = "exam_id"),
    @Index(name = "idx_submission_student_id", columnList = "student_id"),
    @Index(name = "idx_submission_roll_no", columnList = "student_roll_number"),
    @Index(name = "idx_submission_eval_status", columnList = "evaluation_status"),
    @Index(name = "idx_submission_created_at", columnList = "created_timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "exam_id", nullable = false, length = 64)
    private String examId;

    @Column(name = "student_id", nullable = false, length = 64)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 128)
    private String studentName;

    @Column(name = "student_roll_number", nullable = false, length = 64)
    private String studentRollNumber;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @Column(name = "original_scan_url", columnDefinition = "LONGTEXT")
    private String originalScanUrl;

    @Column(name = "ocr_raw_text", columnDefinition = "LONGTEXT")
    private String ocrRawText;

    @Column(name = "ocr_confidence_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal ocrConfidenceScore = BigDecimal.valueOf(95.0);

    @Column(name = "total_max_marks", precision = 6, scale = 2)
    private BigDecimal totalMaxMarks;

    @Column(name = "ai_suggested_total_marks", precision = 6, scale = 2)
    private BigDecimal aiSuggestedTotalMarks;

    @Column(name = "teacher_adjusted_marks", precision = 6, scale = 2)
    private BigDecimal teacherAdjustedMarks;

    @Column(name = "final_marks", precision = 6, scale = 2)
    private BigDecimal finalMarks;

    @Column(name = "percentage_score", precision = 5, scale = 2)
    private BigDecimal percentageScore;

    @Column(name = "letter_grade", length = 8)
    private String letterGrade;

    @Column(name = "evaluation_status", nullable = false, length = 32)
    @Builder.Default
    private String evaluationStatus = "PENDING_TEACHER_REVIEW";

    @Column(name = "pipeline_status", length = 32)
    @Builder.Default
    private String pipelineStatus = "PENDING_TEACHER_REVIEW";

    @Column(name = "is_reviewed_by_teacher")
    @Builder.Default
    private Boolean isReviewedByTeacher = false;

    @Column(name = "teacher_notes", columnDefinition = "TEXT")
    private String teacherNotes;

    @Column(name = "reviewed_by", length = 128)
    private String reviewedBy;

    @Column(name = "created_timestamp", nullable = false, updatable = false)
    private LocalDateTime createdTimestamp;

    @Column(name = "updated_timestamp", nullable = false)
    private LocalDateTime updatedTimestamp;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<AnswerEntity> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdTimestamp == null) {
            createdTimestamp = now;
        }
        if (updatedTimestamp == null) {
            updatedTimestamp = now;
        }
        if (submissionDate == null) {
            submissionDate = now;
        }
        if (evaluationStatus == null) {
            evaluationStatus = "PENDING_TEACHER_REVIEW";
        }
        if (pipelineStatus == null) {
            pipelineStatus = evaluationStatus;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTimestamp = LocalDateTime.now();
        if (evaluationStatus != null && pipelineStatus == null) {
            pipelineStatus = evaluationStatus;
        }
    }

    // Bidirectional helper methods
    public void addAnswer(AnswerEntity answer) {
        if (answers == null) {
            answers = new ArrayList<>();
        }
        answers.add(answer);
        answer.setSubmission(this);
    }

    public void removeAnswer(AnswerEntity answer) {
        if (answers != null) {
            answers.remove(answer);
            answer.setSubmission(null);
        }
    }

    // Compatibility getters & setters
    public BigDecimal getTotalScoreAwarded() {
        return finalMarks != null ? finalMarks : aiSuggestedTotalMarks;
    }

    public void setTotalScoreAwarded(BigDecimal marks) {
        this.finalMarks = marks;
        if (this.aiSuggestedTotalMarks == null) {
            this.aiSuggestedTotalMarks = marks;
        }
    }

    public BigDecimal getSuggestedTotalMarks() {
        return aiSuggestedTotalMarks;
    }

    public void setSuggestedTotalMarks(BigDecimal marks) {
        this.aiSuggestedTotalMarks = marks;
    }
}
