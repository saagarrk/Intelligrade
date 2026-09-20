package com.intelligrade.controller;

import com.intelligrade.dto.exam.ExamDto;
import com.intelligrade.dto.exam.ParseQuestionPaperRequestDto;
import com.intelligrade.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for Question Paper Management and NLP Examination Parsing
 * Flow: ExamPaperController -> ExamService -> ExamRepository / QuestionRepository
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ExamPaperController {

    private final ExamService examService;

    @GetMapping("/exams")
    public ResponseEntity<?> getAllExams() {
        List<ExamDto> exams = examService.getAllExams();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", exams.size(),
                "exams", exams
        ));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<?> getExamById(@PathVariable String id) {
        ExamDto exam = examService.getExamById(id);
        if (exam == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Exam not found: " + id));
        }
        return ResponseEntity.ok(Map.of("success", true, "exam", exam));
    }

    @PostMapping("/exams")
    public ResponseEntity<?> saveExam(@RequestBody ExamDto exam) {
        ExamDto saved = examService.saveExam(exam);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Exam saved to database",
                "exam", saved
        ));
    }

    @PostMapping("/gemini/parse-question-paper")
    public ResponseEntity<?> parseQuestionPaper(@RequestBody ParseQuestionPaperRequestDto request) {
        ExamDto examPaper = examService.parseQuestionPaper(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "engine", "Spring-Boot-Academic-Parser-v2",
                "examPaper", examPaper
        ));
    }
}
