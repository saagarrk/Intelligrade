package com.intelligrade.controller;

import com.intelligrade.dto.evaluation.EvaluationRequestDto;
import com.intelligrade.dto.evaluation.EvaluationResponseDto;
import com.intelligrade.service.GradingPipelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Exam Submission Evaluation and Grading Pipeline
 * Flow: GradingPipelineController -> GradingPipelineService -> SubmissionRepository
 */
@RestController
@RequestMapping("/api/v1/grade")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GradingPipelineController {

    private final GradingPipelineService gradingPipelineService;

    @PostMapping("/evaluate")
    public ResponseEntity<EvaluationResponseDto> evaluateSubmission(@RequestBody EvaluationRequestDto request) {
        EvaluationResponseDto response = gradingPipelineService.evaluateSubmission(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/submission/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        EvaluationResponseDto response = gradingPipelineService.getSubmissionById(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
