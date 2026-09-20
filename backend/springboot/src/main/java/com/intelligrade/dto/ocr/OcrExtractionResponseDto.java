package com.intelligrade.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrExtractionResponseDto {
    private boolean success;
    private String extractedText;
    private Double averageConfidence;
    private String detectedLanguage;
    private String engine;
    private Long durationMs;
    private List<String> extractedLines;
}
