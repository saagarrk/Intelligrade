package com.intelligrade.dto.ocr;

import com.intelligrade.dto.exam.QuestionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrExtractionRequestDto {
    private String imageBase64;
    private String examContext;
    private List<QuestionDto> questions;
}
