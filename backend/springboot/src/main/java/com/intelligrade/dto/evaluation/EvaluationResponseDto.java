package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponseDto {
    private boolean success;
    private String submissionId;
    private Double totalMaxMarks;
    private Double totalAwardedMarks;
    private Double suggestedTotalMarks;
    private Double percentageScore;
    private Double confidenceScore;
    private String letterGrade;
    private String status;
    private Boolean isSuggestion;
    private String disclaimer;
    private List<QuestionEvaluationDto> evaluations;
    private String summaryFeedback;
}
