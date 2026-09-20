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
public class PyOcrRequestDto {
    @JsonProperty("image_base64")
    private String imageBase64;

    @JsonProperty("questions")
    private List<PyQuestionRubricDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyQuestionRubricDto {
        @JsonProperty("question_number")
        private Integer questionNumber;

        @JsonProperty("question_text")
        private String questionText;

        @JsonProperty("max_marks")
        private Double maxMarks;

        @JsonProperty("model_answer")
        private String modelAnswer;
    }
}
