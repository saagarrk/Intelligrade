package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Student Answer.
 * Used for safely transferring student answer and question data across REST APIs without exposing JPA entities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDto {
    private String id;
    private String submissionId;
    private String questionId;
    private Integer questionNumber;
    private String questionText;
    private String studentAnswer;
    private String modelAnswer;
    private Double maxMarks;
    private EvaluationDto evaluation;
    private LocalDateTime createdTimestamp;
    private LocalDateTime updatedTimestamp;
}
