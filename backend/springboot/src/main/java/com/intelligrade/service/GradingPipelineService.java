package com.intelligrade.service;

import com.intelligrade.dto.evaluation.EvaluationRequestDto;
import com.intelligrade.dto.evaluation.EvaluationResponseDto;

public interface GradingPipelineService {
    EvaluationResponseDto evaluateSubmission(EvaluationRequestDto request);
    EvaluationResponseDto getSubmissionById(String submissionId);
}
