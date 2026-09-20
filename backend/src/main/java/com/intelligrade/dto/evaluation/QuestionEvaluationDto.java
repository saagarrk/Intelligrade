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
public class QuestionEvaluationDto {
    private String questionId;
    private Integer questionNumber;
    private String questionText;
    private Double maxMarks;
    private Double suggestedMarks;
    private Double awardedMarks;
    private Double confidenceScore;
    private Boolean isReviewed;
    private Double semanticSimilarityScore;
    private String feedback;
    private String teacherFeedback;
    private List<String> matchedConcepts;
    private List<String> missingConcepts;
}
