package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity for Feedback associated with an Evaluation.
 * Stores AI formative feedback, pedagogical strengths, areas of improvement, and teacher remarks.
 */
@Entity
@Table(name = "feedbacks", indexes = {
    @Index(name = "idx_feedback_evaluation_id", columnList = "evaluation_id"),
    @Index(name = "idx_feedback_type", columnList = "feedback_type"),
    @Index(name = "idx_feedback_created_at", columnList = "created_timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEntity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private EvaluationEntity evaluation;

    @Column(name = "feedback_type", nullable = false, length = 64)
    @Builder.Default
    private String feedbackType = "AI_FEEDBACK";

    @Column(name = "feedback_text", nullable = false, columnDefinition = "TEXT")
    private String feedbackText;

    @Column(name = "author", length = 128)
    @Builder.Default
    private String author = "AI_EVALUATOR";

    @Column(name = "author_role", length = 64)
    @Builder.Default
    private String authorRole = "AI_SYSTEM";

    @Column(name = "is_public_to_student")
    @Builder.Default
    private Boolean isPublicToStudent = true;

    @Column(name = "created_timestamp", nullable = false, updatable = false)
    private LocalDateTime createdTimestamp;

    @Column(name = "updated_timestamp", nullable = false)
    private LocalDateTime updatedTimestamp;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdTimestamp == null) {
            createdTimestamp = now;
        }
        if (updatedTimestamp == null) {
            updatedTimestamp = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTimestamp = LocalDateTime.now();
    }
}
