package com.intelligrade.dto.submission;

import com.intelligrade.dto.evaluation.AnswerDto;
import com.intelligrade.dto.evaluation.QuestionEvaluationDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for Submission.
 * Encapsulates the entire submission tree (answers, evaluations, criteria, feedbacks)
 * ensuring JPA entities are NEVER exposed directly through REST APIs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDto {
    private String id;
    private String examId;
    private String studentId;
    private String studentName;
    private String studentRollNumber;
    private LocalDateTime submissionDate;
    private String originalScanUrl;
    private String ocrRawText;
    private Double ocrConfidenceScore;
    private Double totalScoreAwarded;
    private Double suggestedTotalMarks;
    private Double teacherAdjustedMarks;
    private Double finalMarks;
    private Double totalMaxMarks;
    private Double percentageScore;
    private String letterGrade;
    private String evaluationStatus;
    private String pipelineStatus;
    private Boolean isSuggestion;
    private Boolean isReviewedByTeacher;
    private String teacherNotes;
    private String reviewedBy;
    private String summaryFeedback;
    private LocalDateTime createdTimestamp;
    private LocalDateTime updatedTimestamp;
    private List<AnswerDto> answers;
    private List<QuestionEvaluationDto> evaluationRecords;
}
