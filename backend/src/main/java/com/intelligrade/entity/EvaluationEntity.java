package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity for AI-Assisted and Teacher-Reviewed Evaluations.
 * Stores AI suggested marks, AI confidence, AI feedback, teacher adjustments, final marks, and status.
 */
@Entity
@Table(name = "evaluations", indexes = {
    @Index(name = "idx_eval_answer_id", columnList = "answer_id"),
    @Index(name = "idx_eval_status", columnList = "evaluation_status"),
    @Index(name = "idx_eval_created_at", columnList = "created_timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationEntity {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answer_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AnswerEntity answer;

    @Column(name = "ai_suggested_marks", precision = 5, scale = 2)
    private BigDecimal aiSuggestedMarks;

    @Column(name = "ai_confidence", precision = 5, scale = 4)
    private BigDecimal aiConfidence;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "semantic_similarity_score", precision = 5, scale = 4)
    private BigDecimal semanticSimilarityScore;

    @Column(name = "teacher_adjusted_marks", precision = 5, scale = 2)
    private BigDecimal teacherAdjustedMarks;

    @Column(name = "final_marks", precision = 5, scale = 2)
    private BigDecimal finalMarks;

    @Column(name = "evaluation_status", nullable = false, length = 32)
    @Builder.Default
    private String evaluationStatus = "PENDING_TEACHER_REVIEW";

    @Column(name = "is_teacher_reviewed")
    @Builder.Default
    private Boolean isTeacherReviewed = false;

    @Column(name = "reviewed_by", length = 128)
    private String reviewedBy;

    @Column(name = "teacher_notes", columnDefinition = "TEXT")
    private String teacherNotes;

    @Column(name = "created_timestamp", nullable = false, updatable = false)
    private LocalDateTime createdTimestamp;

    @Column(name = "updated_timestamp", nullable = false)
    private LocalDateTime updatedTimestamp;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<EvaluationCriterionEntity> criteria = new ArrayList<>();

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<FeedbackEntity> feedbacks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdTimestamp == null) {
            createdTimestamp = now;
        }
        if (updatedTimestamp == null) {
            updatedTimestamp = now;
        }
        if (evaluationStatus == null) {
            evaluationStatus = "PENDING_TEACHER_REVIEW";
        }
        if (finalMarks == null && aiSuggestedMarks != null) {
            finalMarks = aiSuggestedMarks;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTimestamp = LocalDateTime.now();
    }

    // Bidirectional helper methods
    public void addCriterion(EvaluationCriterionEntity criterion) {
        if (criteria == null) {
            criteria = new ArrayList<>();
        }
        criteria.add(criterion);
        criterion.setEvaluation(this);
    }

    public void removeCriterion(EvaluationCriterionEntity criterion) {
        if (criteria != null) {
            criteria.remove(criterion);
            criterion.setEvaluation(null);
        }
    }

    public void addFeedback(FeedbackEntity feedback) {
        if (feedbacks == null) {
            feedbacks = new ArrayList<>();
        }
        feedbacks.add(feedback);
        feedback.setEvaluation(this);
    }

    public void removeFeedback(FeedbackEntity feedback) {
        if (feedbacks != null) {
            feedbacks.remove(feedback);
            feedback.setEvaluation(null);
        }
    }
}
