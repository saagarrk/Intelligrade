package com.intelligrade.service.impl;

import com.intelligrade.client.PythonAiServiceClient;
import com.intelligrade.client.dto.PyOcrResponseDto;
import com.intelligrade.dto.exam.QuestionDto;
import com.intelligrade.dto.ocr.OcrExtractionRequestDto;
import com.intelligrade.dto.ocr.OcrExtractionResponseDto;
import com.intelligrade.service.OcrProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Spring Boot OCR Processing Service Implementation.
 * 
 * Architecture:
 * Spring Boot Backend -> Python AI Service -> Spring Boot Backend
 * 
 * Delegates handwriting OCR, image deskewing, noise filtering, and text extraction
 * to the Python AI service, then formats the output into standard Spring Boot DTOs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OcrProcessingServiceImpl implements OcrProcessingService {

    private final PythonAiServiceClient pythonAiServiceClient;

    @Override
    public OcrExtractionResponseDto extractHandwrittenText(OcrExtractionRequestDto request) {
        long startTime = System.currentTimeMillis();
        String imageBase64 = request.getImageBase64();
        List<QuestionDto> questions = request.getQuestions();

        log.info("[Spring Boot OCR] Delegating handwriting OCR & text extraction to Python AI Service (payload size: {} chars)",
                imageBase64 != null ? imageBase64.length() : 0);

        // Step 1: Call Python AI Service for OCR and handwriting transcription
        PyOcrResponseDto pyResponse = pythonAiServiceClient.extractHandwritingOcr(imageBase64, questions);

        // Step 2: Convert Python response to Spring Boot response DTO
        List<String> lines = new ArrayList<>();
        if (pyResponse.getDetectedLines() != null) {
            for (PyOcrResponseDto.PyDetectedLineDto line : pyResponse.getDetectedLines()) {
                if (line.getText() != null && !line.getText().isBlank()) {
                    lines.add(line.getText());
                }
            }
        }

        if (lines.isEmpty() && pyResponse.getRawTranscription() != null) {
            for (String part : pyResponse.getRawTranscription().split("\n\n")) {
                if (!part.isBlank()) {
                    lines.add(part.trim());
                }
            }
        }

        long duration = System.currentTimeMillis() - startTime;

        return OcrExtractionResponseDto.builder()
                .success(true)
                .extractedText(pyResponse.getRawTranscription())
                .averageConfidence(pyResponse.getAvgConfidence() != null ? (pyResponse.getAvgConfidence() * 100.0) : 96.0)
                .detectedLanguage("English")
                .engine("Python-AI-Multimodal-OCR-Service")
                .durationMs(duration)
                .extractedLines(lines)
                .build();
    }
}
