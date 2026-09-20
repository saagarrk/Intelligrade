package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity for Rubric Dimensions and Key Concept Breakdown under an Evaluation.
 * Stores criterion-level marks, AI match status, confidence, and criteria feedback.
 */
@Entity
@Table(name = "evaluation_criteria", indexes = {
    @Index(name = "idx_crit_evaluation_id", columnList = "evaluation_id"),
    @Index(name = "idx_crit_match_status", columnList = "match_status"),
    @Index(name = "idx_crit_created_at", columnList = "created_timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationCriterionEntity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private EvaluationEntity evaluation;

    @Column(name = "criterion_name", nullable = false, length = 255)
    private String criterionName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_marks", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxMarks = BigDecimal.valueOf(2.0);

    @Column(name = "ai_suggested_marks", precision = 5, scale = 2)
    private BigDecimal aiSuggestedMarks;

    @Column(name = "ai_confidence", precision = 5, scale = 4)
    private BigDecimal aiConfidence;

    @Column(name = "teacher_adjusted_marks", precision = 5, scale = 2)
    private BigDecimal teacherAdjustedMarks;

    @Column(name = "final_marks", precision = 5, scale = 2)
    private BigDecimal finalMarks;

    @Column(name = "match_status", length = 32)
    @Builder.Default
    private String matchStatus = "FULL_MATCH";

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

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
        if (finalMarks == null && aiSuggestedMarks != null) {
            finalMarks = aiSuggestedMarks;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTimestamp = LocalDateTime.now();
    }
}
