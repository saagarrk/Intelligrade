package com.intelligrade.service;

import com.intelligrade.dto.ocr.OcrExtractionRequestDto;
import com.intelligrade.dto.ocr.OcrExtractionResponseDto;

public interface OcrProcessingService {
    OcrExtractionResponseDto extractHandwrittenText(OcrExtractionRequestDto request);
}
