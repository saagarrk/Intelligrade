package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAnswerDto {
    private String questionId;
    private Integer questionNumber;
    private String studentAnswerText;
    private String extractedAnswerBase64;
}
