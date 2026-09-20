package com.intelligrade.controller;

import com.intelligrade.dto.ocr.OcrExtractionRequestDto;
import com.intelligrade.dto.ocr.OcrExtractionResponseDto;
import com.intelligrade.service.OcrProcessingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Multimodal OCR Handwriting Extraction
 * Flow: OcrController -> OcrProcessingService
 */
@RestController
@RequestMapping("/api/v1/ocr")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OcrController {

    private final OcrProcessingService ocrProcessingService;

    @PostMapping("/extract")
    public ResponseEntity<OcrExtractionResponseDto> extractOcr(@RequestBody OcrExtractionRequestDto request) {
        OcrExtractionResponseDto response = ocrProcessingService.extractHandwrittenText(request);
        return ResponseEntity.ok(response);
    }
}
