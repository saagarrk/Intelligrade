package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Evaluation.
 * Used for safely transferring evaluation data across REST APIs without exposing JPA entities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationDto {
    private String id;
    private String answerId;
    private String submissionId;
    private String questionId;
    private Integer questionNumber;
    private String questionText;
    private String studentAnswer;
    private String modelAnswer;
    private Double maxMarks;
    private Double aiSuggestedMarks;
    private Double aiConfidence;
    private String aiFeedback;
    private Double semanticSimilarityScore;
    private Double teacherAdjustedMarks;
    private Double finalMarks;
    private String evaluationStatus;
    private Boolean isTeacherReviewed;
    private String reviewedBy;
    private String teacherNotes;
    private String teacherComment;
    private List<EvaluationCriterionDto> criteria;
    private List<FeedbackDto> feedbacks;
    private LocalDateTime createdTimestamp;
    private LocalDateTime updatedTimestamp;
}
