package com.intelligrade.service;

import com.intelligrade.dto.evaluation.AnswerDto;
import com.intelligrade.dto.evaluation.EvaluationDto;
import com.intelligrade.dto.evaluation.FeedbackDto;
import com.intelligrade.dto.evaluation.QuestionEvaluationDto;
import com.intelligrade.dto.submission.SubmissionDto;

import java.util.List;

/**
 * Service defining Spring Boot's authority over Submissions,
 * Answers, Evaluations, Criteria, Feedbacks, Database operations, and Final results.
 * 
 * Strict Constraint: All operations return typed DTOs and never expose JPA entities.
 */
public interface SubmissionService {
    List<SubmissionDto> getAllSubmissions();
    List<SubmissionDto> getSubmissionsByExamId(String examId);
    List<SubmissionDto> getSubmissionsByStudentId(String studentId);
    SubmissionDto getSubmissionById(String submissionId);
    boolean checkDuplicateSubmission(String examId, String studentRollNumber);
    SubmissionDto reviewAndModifyEvaluation(String submissionId, List<QuestionEvaluationDto> modifiedRecords, String teacherNotes, String reviewerName);
    SubmissionDto finalizeSubmission(String submissionId, Double teacherOverrideMarks, String teacherNotes, String finalizedBy);

    // Normalized answer, evaluation, and feedback methods
    List<AnswerDto> getAnswersForSubmission(String submissionId);
    EvaluationDto getEvaluationForAnswer(String submissionId, Integer questionNumber);
    FeedbackDto addTeacherFeedback(String submissionId, Integer questionNumber, String feedbackText, String author);
}
