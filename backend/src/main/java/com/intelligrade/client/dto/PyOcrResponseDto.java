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
public class PyOcrResponseDto {
    @JsonProperty("raw_transcription")
    private String rawTranscription;

    @JsonProperty("detected_answers")
    private List<PyDetectedAnswerDto> detectedAnswers;

    @JsonProperty("detected_lines")
    private List<PyDetectedLineDto> detectedLines;

    @JsonProperty("total_words_detected")
    private Integer totalWordsDetected;

    @JsonProperty("avg_confidence")
    private Double avgConfidence;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyDetectedAnswerDto {
        @JsonProperty("question_number")
        private Integer questionNumber;

        @JsonProperty("answer_text")
        private String answerText;

        @JsonProperty("confidence")
        private Double confidence;

        @JsonProperty("line_count")
        private Integer lineCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyDetectedLineDto {
        @JsonProperty("line_number")
        private Integer lineNumber;

        @JsonProperty("text")
        private String text;

        @JsonProperty("confidence")
        private Double confidence;

        @JsonProperty("bounding_box")
        private PyBoundingBoxDto boundingBox;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PyBoundingBoxDto {
        private Double x;
        private Double y;
        private Double width;
        private Double height;
    }
}
