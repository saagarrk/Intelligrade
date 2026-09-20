package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Feedback.
 * Used for safely transferring feedback data across REST APIs without exposing JPA entities.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private String id;
    private String evaluationId;
    private String feedbackType;
    private String feedbackText;
    private String author;
    private String authorRole;
    private Boolean isPublicToStudent;
    private LocalDateTime createdTimestamp;
    private LocalDateTime updatedTimestamp;
}
