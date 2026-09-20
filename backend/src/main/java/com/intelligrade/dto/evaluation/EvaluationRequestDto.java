package com.intelligrade.dto.evaluation;

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
public class EvaluationRequestDto {
    private String examId;
    private String studentId;
    private String studentName;
    private String studentRollNumber;
    private String originalScanUrl;
    private List<QuestionDto> questions;
    private List<StudentAnswerDto> studentAnswers;
}
