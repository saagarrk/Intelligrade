package com.intelligrade.controller;

import com.intelligrade.dto.evaluation.EvaluationRequestDto;
import com.intelligrade.dto.evaluation.EvaluationResponseDto;
import com.intelligrade.service.AiEvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller exposing secure AI evaluation endpoints on the Spring Boot backend.
 * 
 * Flow:
 * Frontend Client -> Spring Boot AiEvaluationController -> AiEvaluationService -> Python FastAPI AI Service -> Spring Boot DB -> Frontend Client
 * 
 * Direct access to the Python service is blocked; all evaluation requests MUST route through this controller.
 */
@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AiEvaluationController {

    private final AiEvaluationService aiEvaluationService;

    @PostMapping({"/api/ai/evaluate", "/api/v1/ai/evaluate"})
    public ResponseEntity<EvaluationResponseDto> evaluate(@RequestBody EvaluationRequestDto request) {
        log.info("[Spring Boot AiEvaluationController] Received evaluation request for student '{}', exam '{}'",
                request.getStudentName(), request.getExamId());

        EvaluationResponseDto response = aiEvaluationService.evaluateAndStore(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping({"/api/ai/status", "/api/v1/ai/status"})
    public ResponseEntity<?> getAiStatus() {
        boolean reachable = aiEvaluationService.isAiServiceReachable();
        return ResponseEntity.ok(Map.of(
                "status", reachable ? "CONNECTED" : "DEGRADED_FALLBACK_ACTIVE",
                "orchestrator", "Spring Boot Backend (Port 8080)",
                "aiMicroservice", "Python FastAPI (Port 8000)",
                "security", "Internal Token Protected",
                "serviceReachable", reachable
        ));
    }
}
