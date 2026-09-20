package com.intelligrade.mapper;

import com.intelligrade.dto.evaluation.*;
import com.intelligrade.dto.submission.SubmissionDto;
import com.intelligrade.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper responsible for safely converting JPA entities to REST DTOs.
 * Ensures that JPA entities (SubmissionEntity, AnswerEntity, EvaluationEntity, EvaluationCriterionEntity, FeedbackEntity)
 * are NEVER exposed directly through REST APIs.
 */
@Component
public class EvaluationEntityMapper {

    public SubmissionDto toSubmissionDto(SubmissionEntity entity, boolean includeDetails) {
        if (entity == null) return null;

        double finalScore = entity.getFinalMarks() != null
                ? entity.getFinalMarks().doubleValue()
                : (entity.getTotalScoreAwarded() != null ? entity.getTotalScoreAwarded().doubleValue() : 0.0);

        double suggestedScore = entity.getAiSuggestedTotalMarks() != null
                ? entity.getAiSuggestedTotalMarks().doubleValue()
                : (entity.getSuggestedTotalMarks() != null ? entity.getSuggestedTotalMarks().doubleValue() : finalScore);

        double teacherAdj = entity.getTeacherAdjustedMarks() != null
                ? entity.getTeacherAdjustedMarks().doubleValue()
                : finalScore;

        double maxScore = entity.getTotalMaxMarks() != null
                ? entity.getTotalMaxMarks().doubleValue()
                : 100.0;

        double pct = entity.getPercentageScore() != null ? entity.getPercentageScore().doubleValue() : 0.0;

        String status = entity.getEvaluationStatus() != null
                ? entity.getEvaluationStatus()
                : (entity.getPipelineStatus() != null ? entity.getPipelineStatus() : "PENDING_TEACHER_REVIEW");

        boolean isFinalized = "TEACHER_FINALIZED".equalsIgnoreCase(status) || "FINALIZED".equalsIgnoreCase(status);

        SubmissionDto.SubmissionDtoBuilder builder = SubmissionDto.builder()
                .id(entity.getId())
                .examId(entity.getExamId())
                .studentId(entity.getStudentId())
                .studentName(entity.getStudentName())
                .studentRollNumber(entity.getStudentRollNumber())
                .submissionDate(entity.getSubmissionDate())
                .originalScanUrl(entity.getOriginalScanUrl())
                .ocrRawText(entity.getOcrRawText())
                .ocrConfidenceScore(entity.getOcrConfidenceScore() != null ? entity.getOcrConfidenceScore().doubleValue() : 95.0)
                .totalScoreAwarded(finalScore)
                .suggestedTotalMarks(suggestedScore)
                .teacherAdjustedMarks(teacherAdj)
                .finalMarks(finalScore)
                .totalMaxMarks(maxScore)
                .percentageScore(pct)
                .letterGrade(entity.getLetterGrade() != null ? entity.getLetterGrade() : calculateLetterGrade(pct))
                .evaluationStatus(status)
                .pipelineStatus(status)
                .isSuggestion(!isFinalized)
                .isReviewedByTeacher(Boolean.TRUE.equals(entity.getIsReviewedByTeacher()))
                .teacherNotes(entity.getTeacherNotes())
                .reviewedBy(entity.getReviewedBy())
                .createdTimestamp(entity.getCreatedTimestamp())
                .updatedTimestamp(entity.getUpdatedTimestamp());

        if (includeDetails && entity.getAnswers() != null && !entity.getAnswers().isEmpty()) {
            List<AnswerDto> answerDtos = entity.getAnswers().stream()
                    .map(this::toAnswerDto)
                    .collect(Collectors.toList());
            builder.answers(answerDtos);

            // Also convert to backwards-compatible QuestionEvaluationDto list
            List<QuestionEvaluationDto> evalRecords = new ArrayList<>();
            for (AnswerEntity ans : entity.getAnswers()) {
                evalRecords.add(toQuestionEvaluationDto(ans));
            }
            builder.evaluationRecords(evalRecords);
        }

        return builder.build();
    }

    public AnswerDto toAnswerDto(AnswerEntity entity) {
        if (entity == null) return null;

        return AnswerDto.builder()
                .id(entity.getId())
                .submissionId(entity.getSubmission() != null ? entity.getSubmission().getId() : null)
                .questionId(entity.getQuestion() != null ? entity.getQuestion().getId() : null)
                .questionNumber(entity.getQuestionNumber())
                .questionText(entity.getQuestionText())
                .studentAnswer(entity.getStudentAnswer())
                .modelAnswer(entity.getModelAnswer())
                .maxMarks(entity.getMaxMarks() != null ? entity.getMaxMarks().doubleValue() : 10.0)
                .evaluation(entity.getEvaluation() != null ? toEvaluationDto(entity.getEvaluation()) : null)
                .createdTimestamp(entity.getCreatedTimestamp())
                .updatedTimestamp(entity.getUpdatedTimestamp())
                .build();
    }

    public EvaluationDto toEvaluationDto(EvaluationEntity entity) {
        if (entity == null) return null;

        List<EvaluationCriterionDto> criteriaDtos = entity.getCriteria() != null
                ? entity.getCriteria().stream().map(this::toEvaluationCriterionDto).collect(Collectors.toList())
                : Collections.emptyList();

        List<FeedbackDto> feedbackDtos = entity.getFeedbacks() != null
                ? entity.getFeedbacks().stream().map(this::toFeedbackDto).collect(Collectors.toList())
                : Collections.emptyList();

        AnswerEntity ans = entity.getAnswer();
        String submissionId = ans != null && ans.getSubmission() != null ? ans.getSubmission().getId() : null;
        String qId = ans != null && ans.getQuestion() != null ? ans.getQuestion().getId() : (ans != null ? "q_" + ans.getQuestionNumber() : null);
        Integer qNum = ans != null ? ans.getQuestionNumber() : null;
        String qText = ans != null ? ans.getQuestionText() : null;
        String sAns = ans != null ? ans.getStudentAnswer() : null;
        String mAns = ans != null ? ans.getModelAnswer() : null;
        Double maxM = ans != null && ans.getMaxMarks() != null ? ans.getMaxMarks().doubleValue() : 10.0;

        return EvaluationDto.builder()
                .id(entity.getId())
                .answerId(ans != null ? ans.getId() : null)
                .submissionId(submissionId)
                .questionId(qId)
                .questionNumber(qNum)
                .questionText(qText)
                .studentAnswer(sAns)
                .modelAnswer(mAns)
                .maxMarks(maxM)
                .aiSuggestedMarks(entity.getAiSuggestedMarks() != null ? entity.getAiSuggestedMarks().doubleValue() : null)
                .aiConfidence(entity.getAiConfidence() != null ? entity.getAiConfidence().doubleValue() : null)
                .aiFeedback(entity.getAiFeedback())
                .semanticSimilarityScore(entity.getSemanticSimilarityScore() != null ? entity.getSemanticSimilarityScore().doubleValue() : null)
                .teacherAdjustedMarks(entity.getTeacherAdjustedMarks() != null ? entity.getTeacherAdjustedMarks().doubleValue() : null)
                .finalMarks(entity.getFinalMarks() != null ? entity.getFinalMarks().doubleValue() : null)
                .evaluationStatus(entity.getEvaluationStatus())
                .isTeacherReviewed(Boolean.TRUE.equals(entity.getIsTeacherReviewed()))
                .reviewedBy(entity.getReviewedBy())
                .teacherNotes(entity.getTeacherNotes())
                .teacherComment(entity.getTeacherNotes())
                .criteria(criteriaDtos)
                .feedbacks(feedbackDtos)
                .createdTimestamp(entity.getCreatedTimestamp())
                .updatedTimestamp(entity.getUpdatedTimestamp())
                .build();
    }

    public EvaluationCriterionDto toEvaluationCriterionDto(EvaluationCriterionEntity entity) {
        if (entity == null) return null;

        return EvaluationCriterionDto.builder()
                .id(entity.getId())
                .evaluationId(entity.getEvaluation() != null ? entity.getEvaluation().getId() : null)
                .criterionName(entity.getCriterionName())
                .description(entity.getDescription())
                .maxMarks(entity.getMaxMarks() != null ? entity.getMaxMarks().doubleValue() : 2.0)
                .aiSuggestedMarks(entity.getAiSuggestedMarks() != null ? entity.getAiSuggestedMarks().doubleValue() : null)
                .aiConfidence(entity.getAiConfidence() != null ? entity.getAiConfidence().doubleValue() : null)
                .teacherAdjustedMarks(entity.getTeacherAdjustedMarks() != null ? entity.getTeacherAdjustedMarks().doubleValue() : null)
                .finalMarks(entity.getFinalMarks() != null ? entity.getFinalMarks().doubleValue() : null)
                .matchStatus(entity.getMatchStatus())
                .feedback(entity.getFeedback())
                .createdTimestamp(entity.getCreatedTimestamp())
                .updatedTimestamp(entity.getUpdatedTimestamp())
                .build();
    }

    public FeedbackDto toFeedbackDto(FeedbackEntity entity) {
        if (entity == null) return null;

        return FeedbackDto.builder()
                .id(entity.getId())
                .evaluationId(entity.getEvaluation() != null ? entity.getEvaluation().getId() : null)
                .feedbackType(entity.getFeedbackType())
                .feedbackText(entity.getFeedbackText())
                .author(entity.getAuthor())
                .authorRole(entity.getAuthorRole())
                .isPublicToStudent(entity.getIsPublicToStudent())
                .createdTimestamp(entity.getCreatedTimestamp())
                .updatedTimestamp(entity.getUpdatedTimestamp())
                .build();
    }

    public QuestionEvaluationDto toQuestionEvaluationDto(AnswerEntity ans) {
        if (ans == null) return null;

        EvaluationEntity eval = ans.getEvaluation();
        double max = ans.getMaxMarks() != null ? ans.getMaxMarks().doubleValue() : 10.0;
        double suggested = (eval != null && eval.getAiSuggestedMarks() != null)
                ? eval.getAiSuggestedMarks().doubleValue()
                : 0.0;
        double awarded = (eval != null && eval.getFinalMarks() != null)
                ? eval.getFinalMarks().doubleValue()
                : suggested;
        double confidence = (eval != null && eval.getAiConfidence() != null)
                ? eval.getAiConfidence().doubleValue()
                : 0.95;
        double sim = (eval != null && eval.getSemanticSimilarityScore() != null)
                ? eval.getSemanticSimilarityScore().doubleValue()
                : 0.0;

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        if (eval != null && eval.getCriteria() != null) {
            for (EvaluationCriterionEntity crit : eval.getCriteria()) {
                if ("FULL_MATCH".equalsIgnoreCase(crit.getMatchStatus()) || "PARTIAL_MATCH".equalsIgnoreCase(crit.getMatchStatus())) {
                    matched.add(crit.getCriterionName());
                } else {
                    missing.add(crit.getCriterionName());
                }
            }
        }

        return QuestionEvaluationDto.builder()
                .questionId(ans.getQuestion() != null ? ans.getQuestion().getId() : null)
                .questionNumber(ans.getQuestionNumber())
                .questionText(ans.getQuestionText())
                .maxMarks(max)
                .suggestedMarks(suggested)
                .awardedMarks(awarded)
                .confidenceScore(confidence)
                .isReviewed(eval != null && Boolean.TRUE.equals(eval.getIsTeacherReviewed()))
                .semanticSimilarityScore(sim)
                .feedback(eval != null ? eval.getAiFeedback() : null)
                .teacherFeedback(eval != null ? eval.getTeacherNotes() : null)
                .matchedConcepts(matched)
                .missingConcepts(missing)
                .build();
    }

    private String calculateLetterGrade(double pct) {
        if (pct >= 90.0) return "A+";
        if (pct >= 80.0) return "A";
        if (pct >= 70.0) return "B+";
        if (pct >= 60.0) return "B";
        if (pct >= 50.0) return "C";
        if (pct >= 40.0) return "D";
        return "F";
    }
}
