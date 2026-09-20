package com.intelligrade.service.impl;

import com.intelligrade.dto.evaluation.EvaluationRequestDto;
import com.intelligrade.dto.evaluation.EvaluationResponseDto;
import com.intelligrade.dto.evaluation.QuestionEvaluationDto;
import com.intelligrade.entity.EvaluationRecordEntity;
import com.intelligrade.entity.SubmissionEntity;
import com.intelligrade.repository.EvaluationRecordRepository;
import com.intelligrade.repository.SubmissionRepository;
import com.intelligrade.service.AiEvaluationService;
import com.intelligrade.service.GradingPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Spring Boot Grading Pipeline Service Implementation.
 * 
 * Orchestrates evaluation requests through the dedicated AiEvaluationService
 * and provides institutional submission querying.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GradingPipelineServiceImpl implements GradingPipelineService {

    private final AiEvaluationService aiEvaluationService;
    private final SubmissionRepository submissionRepository;
    private final EvaluationRecordRepository evaluationRecordRepository;

    @Override
    @Transactional
    public EvaluationResponseDto evaluateSubmission(EvaluationRequestDto request) {
        log.info("[Spring Boot Grading Pipeline] Delegating evaluation workflow to AiEvaluationService for student '{}', exam '{}'",
                request.getStudentName(), request.getExamId());
        return aiEvaluationService.evaluateAndStore(request);
    }

    @Override
    public EvaluationResponseDto getSubmissionById(String submissionId) {
        Optional<SubmissionEntity> entity = submissionRepository.findById(submissionId);
        if (entity.isEmpty()) {
            return null;
        }
        SubmissionEntity sub = entity.get();

        // Fetch persisted evaluation records
        List<EvaluationRecordEntity> records = evaluationRecordRepository.findBySubmissionIdOrderByQuestionNumberAsc(submissionId);
        List<QuestionEvaluationDto> evals = new ArrayList<>();
        double totalMax = 0.0;

        for (EvaluationRecordEntity rec : records) {
            double max = rec.getMaxMarks() != null ? rec.getMaxMarks().doubleValue() : 10.0;
            totalMax += max;
            evals.add(QuestionEvaluationDto.builder()
                    .questionId(rec.getQuestionId())
                    .questionNumber(rec.getQuestionNumber())
                    .questionText(rec.getQuestionText())
                    .maxMarks(max)
                    .suggestedMarks(rec.getSuggestedMarks() != null ? rec.getSuggestedMarks().doubleValue() : 0.0)
                    .awardedMarks(rec.getAwardedMarks() != null ? rec.getAwardedMarks().doubleValue() : 0.0)
                    .confidenceScore(rec.getConfidenceScore() != null ? rec.getConfidenceScore().doubleValue() : 0.95)
                    .isReviewed(Boolean.TRUE.equals(rec.getIsReviewed()))
                    .teacherFeedback(rec.getTeacherFeedback())
                    .semanticSimilarityScore(rec.getSemanticSimilarityScore() != null ? rec.getSemanticSimilarityScore().doubleValue() : 0.0)
                    .feedback(rec.getFeedback())
                    .build());
        }

        double awarded = sub.getTotalScoreAwarded() != null ? sub.getTotalScoreAwarded().doubleValue() : 0.0;
        double suggested = sub.getSuggestedTotalMarks() != null ? sub.getSuggestedTotalMarks().doubleValue() : awarded;
        double pct = sub.getPercentageScore() != null ? sub.getPercentageScore().doubleValue() : 0.0;

        return EvaluationResponseDto.builder()
                .success(true)
                .submissionId(sub.getId())
                .totalMaxMarks(totalMax)
                .totalAwardedMarks(awarded)
                .suggestedTotalMarks(suggested)
                .percentageScore(pct)
                .confidenceScore(0.95)
                .status(sub.getPipelineStatus())
                .isSuggestion(!Boolean.TRUE.equals(sub.getIsReviewedByTeacher()))
                .disclaimer("AI evaluation results are suggestions pending faculty review.")
                .letterGrade(calculateLetterGrade(pct))
                .evaluations(evals)
                .summaryFeedback("Submission retrieved from Spring Boot institutional database.")
                .build();
    }

    private String calculateLetterGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B+";
        if (percentage >= 60.0) return "B";
        if (percentage >= 50.0) return "C";
        if (percentage >= 40.0) return "D";
        return "F";
    }
}
