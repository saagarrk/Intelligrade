package com.intelligrade.service;

import com.intelligrade.client.dto.PyEvaluationResponseDto;
import com.intelligrade.dto.evaluation.EvaluationRequestDto;
import com.intelligrade.dto.evaluation.EvaluationResponseDto;

/**
 * Dedicated Spring Boot Service managing secure communication with the Python FastAPI AI Service.
 * 
 * Flow:
 * React Frontend -> Spring Boot Backend (Controller) -> AiEvaluationService -> POST /api/ai/evaluate (Python FastAPI) -> Spring Boot DB Persistence -> React Frontend
 * 
 * Responsibilities:
 * - Send evaluation request to Python with internal security token
 * - Handle timeout (connectTimeout: 5s, readTimeout: 30s)
 * - Handle connection failure gracefully with structured fallback
 * - Validate AI response (bounds checking, confidence normalization, completeness)
 * - Convert response into strongly typed Java DTOs (EvaluationResponseDto, QuestionEvaluationDto)
 * - Store evaluation result in database (SubmissionEntity, EvaluationRecordEntity) marked for teacher review
 */
public interface AiEvaluationService {

    /**
     * Executes complete evaluation: sends secure request to Python AI service,
     * validates response, converts to Java DTOs, and persists to database.
     */
    EvaluationResponseDto evaluateAndStore(EvaluationRequestDto request);

    /**
     * Calls Python AI service endpoint POST /api/ai/evaluate with security headers,
     * timeout handling, and connection failure handling.
     */
    PyEvaluationResponseDto callPythonAiService(EvaluationRequestDto request);

    /**
     * Validates AI response according to rubric bounds, marks range, and data integrity constraints.
     */
    PyEvaluationResponseDto validateAiResponse(PyEvaluationResponseDto response, EvaluationRequestDto request);

    /**
     * Checks if Python AI microservice is responsive and healthy.
     */
    boolean isAiServiceReachable();
}
