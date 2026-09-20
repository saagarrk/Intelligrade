package com.intelligrade.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PyEvaluationResponseDto {
    @JsonProperty("student_name")
    private String studentName;

    @JsonProperty("suggested_total_marks")
    private Double suggestedTotalMarks;

    @JsonProperty("total_score")
    private Double totalScore;

    @JsonProperty("max_score")
    private Double maxScore;

    @JsonProperty("percentage")
    private Double percentage;

    @JsonProperty("grade")
    private String grade;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("is_suggestion")
    private Boolean isSuggestion;

    @JsonProperty("status")
    private String status;

    @JsonProperty("disclaimer")
    private String disclaimer;

    @JsonProperty("question_evaluations")
    private List<PyQuestionEvaluationDto> questionEvaluations;

    @JsonProperty("overall_summary")
    private String overallSummary;

    @JsonProperty("key_strengths")
    private List<String> keyStrengths;

    @JsonProperty("priority_improvements")
    private List<String> priorityImprovements;

    @JsonProperty("blooms_taxonomy_level")
    private String bloomsTaxonomyLevel;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyQuestionEvaluationDto {
        @JsonProperty("question_number")
        private Integer questionNumber;

        @JsonProperty("question_text")
        private String questionText;

        @JsonProperty("student_answer_text")
        private String studentAnswerText;

        @JsonProperty("model_answer_text")
        private String modelAnswerText;

        @JsonProperty("max_marks")
        private Double maxMarks;

        @JsonProperty("suggested_marks")
        private Double suggestedMarks;

        @JsonProperty("awarded_marks")
        private Double awardedMarks;

        @JsonProperty("semantic_similarity_score")
        private Double semanticSimilarityScore;

        @JsonProperty("concept_matches")
        private List<PyConceptMatchDto> conceptMatches;

        @JsonProperty("feedback")
        private String feedback;

        @JsonProperty("strengths")
        private List<String> strengths;

        @JsonProperty("improvements")
        private List<String> improvements;

        @JsonProperty("confidence")
        private Double confidence;

        @JsonProperty("confidence_score")
        private Double confidenceScore;

        @JsonProperty("is_suggestion")
        private Boolean isSuggestion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyConceptMatchDto {
        @JsonProperty("concept")
        private String concept;

        @JsonProperty("awarded_marks")
        private Double awardedMarks;

        @JsonProperty("max_marks")
        private Double maxMarks;

        @JsonProperty("matched_phrases")
        private List<String> matchedPhrases;

        @JsonProperty("is_satisfied")
        private Boolean isSatisfied;
    }
}
