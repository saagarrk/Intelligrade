package com.intelligrade.controller;

import com.intelligrade.dto.common.ApiResponseDto;
import com.intelligrade.dto.submission.SubmissionDto;
import com.intelligrade.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for Submissions, Evaluation Records, and Final Results.
 * Spring Boot is responsible for Submissions, Database operations, Evaluation records, and Final results.
 */
@RestController
@RequestMapping("/api/v1/submissions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<SubmissionDto>>> getSubmissions(
            @RequestParam(required = false) String examId,
            @RequestParam(required = false) String studentId
    ) {
        List<SubmissionDto> list;
        if (examId != null && !examId.isBlank()) {
            list = submissionService.getSubmissionsByExamId(examId);
        } else if (studentId != null && !studentId.isBlank()) {
            list = submissionService.getSubmissionsByStudentId(studentId);
        } else {
            list = submissionService.getAllSubmissions();
        }
        return ResponseEntity.ok(ApiResponseDto.ok("Submissions fetched successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<SubmissionDto>> getSubmissionById(@PathVariable String id) {
        SubmissionDto sub = submissionService.getSubmissionById(id);
        if (sub == null) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("Submission not found: " + id));
        }
        return ResponseEntity.ok(ApiResponseDto.ok("Submission retrieved", sub));
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<ApiResponseDto<Map<String, Object>>> checkDuplicate(
            @RequestParam String examId,
            @RequestParam String rollNumber
    ) {
        boolean isDuplicate = submissionService.checkDuplicateSubmission(examId, rollNumber);
        return ResponseEntity.ok(ApiResponseDto.ok("Duplicate check completed", Map.of(
                "isDuplicate", isDuplicate,
                "examId", examId,
                "rollNumber", rollNumber
        )));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<SubmissionDto>> reviewSubmission(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        String notes = payload.getOrDefault("teacherNotes", "").toString();
        String reviewer = payload.getOrDefault("reviewerName", "Faculty Reviewer").toString();
        
        List<com.intelligrade.dto.evaluation.QuestionEvaluationDto> modifiedRecords = new java.util.ArrayList<>();
        if (payload.containsKey("evaluations") && payload.get("evaluations") instanceof List<?> list) {
            for (Object obj : list) {
                if (obj instanceof Map<?, ?> m) {
                    Integer qNum = m.get("questionNumber") != null ? Integer.valueOf(m.get("questionNumber").toString()) : null;
                    Double awarded = m.get("awardedMarks") != null ? Double.valueOf(m.get("awardedMarks").toString()) : null;
                    String fb = m.get("feedback") != null ? m.get("feedback").toString() : null;
                    String tfb = m.get("teacherFeedback") != null ? m.get("teacherFeedback").toString() : null;
                    if (qNum != null) {
                        modifiedRecords.add(com.intelligrade.dto.evaluation.QuestionEvaluationDto.builder()
                                .questionNumber(qNum)
                                .awardedMarks(awarded)
                                .feedback(fb)
                                .teacherFeedback(tfb)
                                .build());
                    }
                }
            }
        }

        SubmissionDto reviewed = submissionService.reviewAndModifyEvaluation(id, modifiedRecords, notes, reviewer);
        if (reviewed == null) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("Submission not found: " + id));
        }

        return ResponseEntity.ok(ApiResponseDto.ok("Submission evaluation reviewed and updated", reviewed));
    }

    @PostMapping("/{id}/finalize")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<SubmissionDto>> finalizeSubmission(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        Double overrideMarks = payload.containsKey("teacherOverrideMarks")
                ? Double.valueOf(payload.get("teacherOverrideMarks").toString())
                : null;
        String notes = payload.getOrDefault("teacherNotes", "").toString();
        String finalizedBy = payload.getOrDefault("finalizedBy", "Faculty Reviewer").toString();

        SubmissionDto finalized = submissionService.finalizeSubmission(id, overrideMarks, notes, finalizedBy);
        if (finalized == null) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("Submission not found: " + id));
        }

        return ResponseEntity.ok(ApiResponseDto.ok("Submission finalized successfully", finalized));
    }

    @GetMapping("/{id}/answers")
    public ResponseEntity<ApiResponseDto<List<com.intelligrade.dto.evaluation.AnswerDto>>> getAnswersForSubmission(
            @PathVariable String id
    ) {
        List<com.intelligrade.dto.evaluation.AnswerDto> answers = submissionService.getAnswersForSubmission(id);
        return ResponseEntity.ok(ApiResponseDto.ok("Answers retrieved for submission", answers));
    }

    @GetMapping("/{id}/answers/{questionNumber}/evaluation")
    public ResponseEntity<ApiResponseDto<com.intelligrade.dto.evaluation.EvaluationDto>> getEvaluationForAnswer(
            @PathVariable String id,
            @PathVariable Integer questionNumber
    ) {
        com.intelligrade.dto.evaluation.EvaluationDto eval = submissionService.getEvaluationForAnswer(id, questionNumber);
        if (eval == null) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("Evaluation not found for submission " + id + " question " + questionNumber));
        }
        return ResponseEntity.ok(ApiResponseDto.ok("Evaluation retrieved", eval));
    }

    @PostMapping("/{id}/answers/{questionNumber}/feedback")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponseDto<com.intelligrade.dto.evaluation.FeedbackDto>> addTeacherFeedback(
            @PathVariable String id,
            @PathVariable Integer questionNumber,
            @RequestBody Map<String, String> payload
    ) {
        String text = payload.getOrDefault("feedbackText", "");
        String author = payload.getOrDefault("author", "Faculty Reviewer");
        if (text.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponseDto.error("feedbackText is required"));
        }
        com.intelligrade.dto.evaluation.FeedbackDto fb = submissionService.addTeacherFeedback(id, questionNumber, text, author);
        if (fb == null) {
            return ResponseEntity.status(404).body(ApiResponseDto.error("Evaluation not found for submission " + id + " question " + questionNumber));
        }
        return ResponseEntity.ok(ApiResponseDto.ok("Teacher feedback added successfully", fb));
    }
}
