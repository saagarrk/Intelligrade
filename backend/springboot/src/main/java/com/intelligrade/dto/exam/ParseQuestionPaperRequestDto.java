package com.intelligrade.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParseQuestionPaperRequestDto {
    private String rawText;
    private String subject;
    private String examTitle;
}
