package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity for persisting per-question evaluation records in Spring Boot database.
 * Spring Boot is responsible for evaluation records and persistent database operations.
 */
@Entity
@Table(name = "evaluation_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationRecordEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "submission_id", nullable = false, length = 64)
    private String submissionId;

    @Column(name = "question_id", length = 64)
    private String questionId;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "student_answer_text", columnDefinition = "LONGTEXT")
    private String studentAnswerText;

    @Column(name = "model_answer_text", columnDefinition = "LONGTEXT")
    private String modelAnswerText;

    @Column(name = "max_marks", precision = 5, scale = 2)
    private BigDecimal maxMarks;

    @Column(name = "suggested_marks", precision = 5, scale = 2)
    private BigDecimal suggestedMarks;

    @Column(name = "awarded_marks", precision = 5, scale = 2)
    private BigDecimal awardedMarks;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "semantic_similarity_score", precision = 5, scale = 2)
    private BigDecimal semanticSimilarityScore;

    @Column(name = "is_reviewed")
    @Builder.Default
    private Boolean isReviewed = false;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "teacher_feedback", columnDefinition = "TEXT")
    private String teacherFeedback;

    @Column(name = "matched_concepts_json", columnDefinition = "TEXT")
    private String matchedConceptsJson;

    @Column(name = "missing_concepts_json", columnDefinition = "TEXT")
    private String missingConceptsJson;

    @Column(name = "evaluated_at")
    @Builder.Default
    private LocalDateTime evaluatedAt = LocalDateTime.now();
}
