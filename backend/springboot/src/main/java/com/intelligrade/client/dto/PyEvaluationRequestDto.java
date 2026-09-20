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
public class PyEvaluationRequestDto {
    @JsonProperty("questions")
    private List<PyQuestionRubricItemDto> questions;

    @JsonProperty("student_answers")
    private List<PyStudentAnswerItemDto> studentAnswers;

    @JsonProperty("student_name")
    private String studentName;

    @JsonProperty("exam_id")
    private String examId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyQuestionRubricItemDto {
        @JsonProperty("question_number")
        private Integer questionNumber;

        @JsonProperty("question_text")
        private String questionText;

        @JsonProperty("max_marks")
        private Double maxMarks;

        @JsonProperty("model_answer")
        private String modelAnswer;

        @JsonProperty("key_concepts")
        private List<PyKeyConceptRubricDto> keyConcepts;

        @JsonProperty("leniency_threshold_pct")
        private Double leniencyThresholdPct;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyKeyConceptRubricDto {
        @JsonProperty("concept")
        private String concept;

        @JsonProperty("weight_marks")
        private Double weightMarks;

        @JsonProperty("synonyms")
        private List<String> synonyms;

        @JsonProperty("description")
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyStudentAnswerItemDto {
        @JsonProperty("question_number")
        private Integer questionNumber;

        @JsonProperty("student_answer_text")
        private String studentAnswerText;
    }
}
