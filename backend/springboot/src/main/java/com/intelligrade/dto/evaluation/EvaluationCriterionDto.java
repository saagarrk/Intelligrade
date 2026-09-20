package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for EvaluationCriterion.
 * Used for safely transferring rubric criterion evaluation data across REST APIs without exposing JPA entities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationCriterionDto {
    private String id;
    private String evaluationId;
    private String criterionName;
    private String description;
    private Double maxMarks;
    private Double aiSuggestedMarks;
    private Double aiConfidence;
    private Double teacherAdjustedMarks;
    private Double finalMarks;
    private String matchStatus;
    private String feedback;
    private LocalDateTime createdTimestamp;
    private LocalDateTime updatedTimestamp;
}
