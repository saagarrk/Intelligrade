package com.intelligrade.service;

import com.intelligrade.dto.evaluation.*;

import java.util.List;

/**
 * Service interface for teacher review of AI evaluations.
 * Supports:
 * - GET evaluation
 * - PUT/update teacher evaluation
 * - POST accept AI suggestion
 * - POST modify marks
 * - POST finalize evaluation
 *
 * Enforces:
 * - Distinguishing states: AI_SUGGESTED, TEACHER_REVIEWED, FINALIZED
 * - A student must never be able to modify evaluation results.
 * - Only authorized teachers/admins can review or finalize evaluations.
 */
public interface EvaluationService {

    /**
     * Retrieves an evaluation by its evaluation ID, answer ID, or question context.
     */
    EvaluationDto getEvaluation(String identifier, String userEmail, String userRole);

    /**
     * Retrieves all evaluations for a specific student submission.
     */
    List<EvaluationDto> getEvaluationsBySubmission(String submissionId, String userEmail, String userRole);

    /**
     * Updates teacher evaluation (marks, criteria, notes, comments).
     * Transitions status to TEACHER_REVIEWED.
     */
    EvaluationDto updateTeacherEvaluation(String id, TeacherEvaluationUpdateRequestDto request, String teacherEmail, String role);

    /**
     * Accepts AI suggested marks as the teacher-approved marks.
     * Transitions status to TEACHER_REVIEWED.
     */
    EvaluationDto acceptAiSuggestion(String id, AcceptAiSuggestionRequestDto request, String teacherEmail, String role);

    /**
     * Modifies awarded marks for an evaluation question.
     * Transitions status to TEACHER_REVIEWED.
     */
    EvaluationDto modifyMarks(String id, ModifyMarksRequestDto request, String teacherEmail, String role);

    /**
     * Finalizes evaluation, locking results and setting status to FINALIZED.
     */
    EvaluationDto finalizeEvaluation(String id, FinalizeEvaluationRequestDto request, String teacherEmail, String role);
}
