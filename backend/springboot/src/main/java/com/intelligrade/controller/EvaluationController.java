package com.intelligrade.controller;

import com.intelligrade.dto.common.ApiResponseDto;
import com.intelligrade.dto.evaluation.*;
import com.intelligrade.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller exposing REST endpoints for teacher review of AI evaluations.
 *
 * Requirements satisfied:
 * - GET evaluation
 * - PUT/update teacher evaluation
 * - POST accept AI suggestion
 * - POST modify marks
 * - POST finalize evaluation
 *
 * Statuses distinguished:
 * - AI_SUGGESTED
 * - TEACHER_REVIEWED
 * - FINALIZED
 *
 * Security:
 * - A student must never be able to modify evaluation results.
 * - Only authorized teachers/admins can review or finalize evaluations.
 */
@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final EvaluationService evaluationService;

    private String extractUserEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return "teacher@intelligrade.edu";
        }
        return authentication.getName();
    }

    private String extractUserRole(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null || authentication.getAuthorities().isEmpty()) {
            return "TEACHER";
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("TEACHER");
    }

    /**
     * GET evaluation
     * Retrieves an evaluation record by ID or context.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<EvaluationDto>> getEvaluation(
            @PathVariable("id") String id,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);
        EvaluationDto dto = evaluationService.getEvaluation(id, email, role);
        return ResponseEntity.ok(ApiResponseDto.success("Evaluation retrieved successfully", dto));
    }

    /**
     * GET evaluations for a submission
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<List<EvaluationDto>>> getEvaluations(
            @RequestParam(value = "submissionId", required = false) String submissionId,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);

        if (submissionId != null && !submissionId.isBlank()) {
            List<EvaluationDto> dtos = evaluationService.getEvaluationsBySubmission(submissionId, email, role);
            return ResponseEntity.ok(ApiResponseDto.success("Evaluations retrieved successfully", dtos));
        }

        return ResponseEntity.ok(ApiResponseDto.success("Evaluations retrieved", List.of()));
    }

    /**
     * PUT/update teacher evaluation
     * Adjusts teacher marks, criteria feedback, and evaluation notes.
     * Transitions status to TEACHER_REVIEWED.
     * STRICT SECURITY: Students are never allowed.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<EvaluationDto>> updateTeacherEvaluation(
            @PathVariable("id") String id,
            @RequestBody TeacherEvaluationUpdateRequestDto request,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);
        EvaluationDto updated = evaluationService.updateTeacherEvaluation(id, request, email, role);
        return ResponseEntity.ok(ApiResponseDto.success("Teacher evaluation updated successfully", updated));
    }

    /**
     * POST accept AI suggestion
     * One-click accepts AI suggestion, copying suggested marks into teacher adjusted marks.
     * Transitions status to TEACHER_REVIEWED.
     * STRICT SECURITY: Students are never allowed.
     */
    @PostMapping("/{id}/accept-ai")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<EvaluationDto>> acceptAiSuggestion(
            @PathVariable("id") String id,
            @RequestBody(required = false) AcceptAiSuggestionRequestDto request,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);
        EvaluationDto updated = evaluationService.acceptAiSuggestion(id, request, email, role);
        return ResponseEntity.ok(ApiResponseDto.success("AI suggestion accepted successfully", updated));
    }

    /**
     * POST modify marks
     * Modifies the awarded marks with an optional audit reason.
     * Transitions status to TEACHER_REVIEWED.
     * STRICT SECURITY: Students are never allowed.
     */
    @PostMapping("/{id}/modify-marks")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<EvaluationDto>> modifyMarks(
            @PathVariable("id") String id,
            @RequestBody ModifyMarksRequestDto request,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);
        EvaluationDto updated = evaluationService.modifyMarks(id, request, email, role);
        return ResponseEntity.ok(ApiResponseDto.success("Evaluation marks modified successfully", updated));
    }

    /**
     * POST finalize evaluation
     * Locks evaluation results and marks status as FINALIZED.
     * STRICT SECURITY: Students are never allowed.
     */
    @PostMapping("/{id}/finalize")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<EvaluationDto>> finalizeEvaluation(
            @PathVariable("id") String id,
            @RequestBody(required = false) FinalizeEvaluationRequestDto request,
            Authentication authentication) {
        String email = extractUserEmail(authentication);
        String role = extractUserRole(authentication);
        EvaluationDto finalized = evaluationService.finalizeEvaluation(id, request, email, role);
        return ResponseEntity.ok(ApiResponseDto.success("Evaluation finalized successfully", finalized));
    }
}
