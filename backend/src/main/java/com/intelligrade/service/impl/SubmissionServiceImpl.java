package com.intelligrade.service.impl;

import com.intelligrade.dto.evaluation.AnswerDto;
import com.intelligrade.dto.evaluation.EvaluationDto;
import com.intelligrade.dto.evaluation.FeedbackDto;
import com.intelligrade.dto.evaluation.QuestionEvaluationDto;
import com.intelligrade.dto.submission.SubmissionDto;
import com.intelligrade.entity.*;
import com.intelligrade.mapper.EvaluationEntityMapper;
import com.intelligrade.repository.*;
import com.intelligrade.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final EvaluationRecordRepository evaluationRecordRepository;
    private final AnswerRepository answerRepository;
    private final EvaluationRepository evaluationRepository;
    private final FeedbackRepository feedbackRepository;
    private final EvaluationEntityMapper evaluationEntityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(sub -> evaluationEntityMapper.toSubmissionDto(sub, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByExamId(String examId) {
        return submissionRepository.findByExamId(examId).stream()
                .map(sub -> evaluationEntityMapper.toSubmissionDto(sub, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByStudentId(String studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(sub -> evaluationEntityMapper.toSubmissionDto(sub, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDto getSubmissionById(String submissionId) {
        Optional<SubmissionEntity> opt = submissionRepository.findById(submissionId);
        if (opt.isEmpty()) {
            return null;
        }

        SubmissionEntity sub = opt.get();
        // Load normalized answers with evaluations, criteria, and feedbacks
        List<AnswerEntity> answers = answerRepository.findBySubmissionIdWithEvaluationDetails(submissionId);
        if (answers != null && !answers.isEmpty()) {
            sub.setAnswers(answers);
        }

        return evaluationEntityMapper.toSubmissionDto(sub, true);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkDuplicateSubmission(String examId, String studentRollNumber) {
        return submissionRepository.existsByExamIdAndStudentRollNumber(examId, studentRollNumber);
    }

    @Override
    @Transactional
    public SubmissionDto reviewAndModifyEvaluation(
            String submissionId,
            List<QuestionEvaluationDto> modifiedRecords,
            String teacherNotes,
            String reviewerName
    ) {
        Optional<SubmissionEntity> opt = submissionRepository.findById(submissionId);
        if (opt.isEmpty()) {
            return null;
        }

        SubmissionEntity sub = opt.get();
        List<EvaluationRecordEntity> legacyRecords = evaluationRecordRepository.findBySubmissionIdOrderByQuestionNumberAsc(submissionId);
        List<AnswerEntity> answers = answerRepository.findBySubmissionIdWithEvaluationDetails(submissionId);

        if (modifiedRecords != null && !modifiedRecords.isEmpty()) {
            for (QuestionEvaluationDto mod : modifiedRecords) {
                if (mod.getQuestionNumber() == null) continue;

                // 1. Update legacy evaluation record
                for (EvaluationRecordEntity rec : legacyRecords) {
                    if (rec.getQuestionNumber().equals(mod.getQuestionNumber())) {
                        if (mod.getAwardedMarks() != null) {
                            double boundedMarks = Math.max(0.0, Math.min(
                                    rec.getMaxMarks() != null ? rec.getMaxMarks().doubleValue() : 100.0,
                                    mod.getAwardedMarks()
                            ));
                            rec.setAwardedMarks(BigDecimal.valueOf(boundedMarks));
                        }
                        if (mod.getTeacherFeedback() != null) {
                            rec.setTeacherFeedback(mod.getTeacherFeedback());
                        }
                        if (mod.getFeedback() != null && !mod.getFeedback().isBlank()) {
                            rec.setFeedback(mod.getFeedback());
                        }
                        rec.setIsReviewed(true);
                        evaluationRecordRepository.save(rec);
                        break;
                    }
                }

                // 2. Update normalized Answer and Evaluation entities
                if (answers != null) {
                    for (AnswerEntity ans : answers) {
                        if (ans.getQuestionNumber().equals(mod.getQuestionNumber())) {
                            EvaluationEntity eval = ans.getEvaluation();
                            if (eval != null) {
                                double max = ans.getMaxMarks() != null ? ans.getMaxMarks().doubleValue() : 100.0;
                                if (mod.getAwardedMarks() != null) {
                                    double boundedMarks = Math.max(0.0, Math.min(max, mod.getAwardedMarks()));
                                    eval.setTeacherAdjustedMarks(BigDecimal.valueOf(boundedMarks));
                                    eval.setFinalMarks(BigDecimal.valueOf(boundedMarks));
                                }
                                eval.setIsTeacherReviewed(true);
                                eval.setReviewedBy(reviewerName != null ? reviewerName : "Teacher");
                                eval.setEvaluationStatus("TEACHER_REVIEWED");
                                if (mod.getTeacherFeedback() != null && !mod.getTeacherFeedback().isBlank()) {
                                    eval.setTeacherNotes(mod.getTeacherFeedback());

                                    // Add or update teacher feedback entity
                                    FeedbackEntity tfb = FeedbackEntity.builder()
                                            .id("fb_" + submissionId + "_q" + mod.getQuestionNumber() + "_teacher")
                                            .feedbackType("TEACHER_FEEDBACK")
                                            .feedbackText(mod.getTeacherFeedback())
                                            .author(reviewerName != null ? reviewerName : "Faculty Reviewer")
                                            .authorRole("TEACHER")
                                            .isPublicToStudent(true)
                                            .build();
                                    eval.addFeedback(tfb);
                                }
                                evaluationRepository.save(eval);
                            }
                            break;
                        }
                    }
                }
            }
        }

        // Recalculate total awarded score & percentage based on reviewed records
        double totalMax = 0.0;
        double totalAwarded = 0.0;
        if (answers != null && !answers.isEmpty()) {
            for (AnswerEntity ans : answers) {
                double max = ans.getMaxMarks() != null ? ans.getMaxMarks().doubleValue() : 10.0;
                EvaluationEntity eval = ans.getEvaluation();
                double awarded = eval != null && eval.getFinalMarks() != null
                        ? eval.getFinalMarks().doubleValue()
                        : (eval != null && eval.getAiSuggestedMarks() != null ? eval.getAiSuggestedMarks().doubleValue() : 0.0);
                totalMax += max;
                totalAwarded += awarded;
            }
        } else {
            for (EvaluationRecordEntity rec : legacyRecords) {
                double max = rec.getMaxMarks() != null ? rec.getMaxMarks().doubleValue() : 10.0;
                double awarded = rec.getAwardedMarks() != null ? rec.getAwardedMarks().doubleValue() : 0.0;
                totalMax += max;
                totalAwarded += awarded;
            }
        }

        double pct = totalMax > 0.0 ? (totalAwarded / totalMax) * 100.0 : 0.0;
        double roundedPct = Math.round(pct * 10.0) / 10.0;
        double roundedAwarded = Math.round(totalAwarded * 10.0) / 10.0;

        sub.setTotalMaxMarks(BigDecimal.valueOf(totalMax));
        sub.setFinalMarks(BigDecimal.valueOf(roundedAwarded));
        sub.setTeacherAdjustedMarks(BigDecimal.valueOf(roundedAwarded));
        sub.setTotalScoreAwarded(BigDecimal.valueOf(roundedAwarded));
        sub.setPercentageScore(BigDecimal.valueOf(roundedPct));
        sub.setLetterGrade(calculateLetterGrade(roundedPct));
        sub.setIsReviewedByTeacher(true);
        if (reviewerName != null && !reviewerName.isBlank()) {
            sub.setReviewedBy(reviewerName);
        }
        if (teacherNotes != null && !teacherNotes.isBlank()) {
            sub.setTeacherNotes(teacherNotes);
        }
        sub.setEvaluationStatus("TEACHER_REVIEWED");
        sub.setPipelineStatus("TEACHER_REVIEWED");
        sub.setUpdatedTimestamp(LocalDateTime.now());
        submissionRepository.save(sub);

        log.info("[Spring Boot Teacher Review] Submission '{}' reviewed by {}. Updated score: {}/{} ({}%)",
                submissionId, reviewerName, roundedAwarded, totalMax, roundedPct);

        if (answers != null && !answers.isEmpty()) {
            sub.setAnswers(answers);
        }
        return evaluationEntityMapper.toSubmissionDto(sub, true);
    }

    @Override
    @Transactional
    public SubmissionDto finalizeSubmission(String submissionId, Double teacherOverrideMarks, String teacherNotes, String finalizedBy) {
        Optional<SubmissionEntity> opt = submissionRepository.findById(submissionId);
        if (opt.isEmpty()) {
            return null;
        }

        SubmissionEntity sub = opt.get();
        List<AnswerEntity> answers = answerRepository.findBySubmissionIdWithEvaluationDetails(submissionId);

        if (teacherOverrideMarks != null) {
            sub.setFinalMarks(BigDecimal.valueOf(teacherOverrideMarks));
            sub.setTotalScoreAwarded(BigDecimal.valueOf(teacherOverrideMarks));
            sub.setTeacherAdjustedMarks(BigDecimal.valueOf(teacherOverrideMarks));
            double totalMax = sub.getTotalMaxMarks() != null ? sub.getTotalMaxMarks().doubleValue() : 100.0;
            if (totalMax > 0.0) {
                double pct = Math.round(((teacherOverrideMarks / totalMax) * 100.0) * 10.0) / 10.0;
                sub.setPercentageScore(BigDecimal.valueOf(pct));
                sub.setLetterGrade(calculateLetterGrade(pct));
            }
        }

        sub.setIsReviewedByTeacher(true);
        if (finalizedBy != null && !finalizedBy.isBlank()) {
            sub.setReviewedBy(finalizedBy);
        }
        if (teacherNotes != null && !teacherNotes.isBlank()) {
            sub.setTeacherNotes(teacherNotes);
        }
        sub.setEvaluationStatus("TEACHER_FINALIZED");
        sub.setPipelineStatus("TEACHER_FINALIZED");
        sub.setUpdatedTimestamp(LocalDateTime.now());

        if (answers != null) {
            for (AnswerEntity ans : answers) {
                if (ans.getEvaluation() != null) {
                    ans.getEvaluation().setEvaluationStatus("FINALIZED");
                    ans.getEvaluation().setIsTeacherReviewed(true);
                    evaluationRepository.save(ans.getEvaluation());
                }
            }
            sub.setAnswers(answers);
        }

        submissionRepository.save(sub);

        log.info("[Spring Boot Final Results] Submission '{}' officially finalized by {} with score {}",
                submissionId, finalizedBy, sub.getFinalMarks());

        return evaluationEntityMapper.toSubmissionDto(sub, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnswerDto> getAnswersForSubmission(String submissionId) {
        return answerRepository.findBySubmissionIdWithEvaluationDetails(submissionId).stream()
                .map(evaluationEntityMapper::toAnswerDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationDto getEvaluationForAnswer(String submissionId, Integer questionNumber) {
        Optional<AnswerEntity> ansOpt = answerRepository.findBySubmissionIdAndQuestionNumber(submissionId, questionNumber);
        if (ansOpt.isEmpty() || ansOpt.get().getEvaluation() == null) {
            return null;
        }
        return evaluationEntityMapper.toEvaluationDto(ansOpt.get().getEvaluation());
    }

    @Override
    @Transactional
    public FeedbackDto addTeacherFeedback(String submissionId, Integer questionNumber, String feedbackText, String author) {
        Optional<AnswerEntity> ansOpt = answerRepository.findBySubmissionIdAndQuestionNumber(submissionId, questionNumber);
        if (ansOpt.isEmpty() || ansOpt.get().getEvaluation() == null) {
            return null;
        }

        EvaluationEntity eval = ansOpt.get().getEvaluation();
        FeedbackEntity fb = FeedbackEntity.builder()
                .id("fb_" + submissionId + "_q" + questionNumber + "_" + System.currentTimeMillis())
                .feedbackType("TEACHER_FEEDBACK")
                .feedbackText(feedbackText)
                .author(author != null ? author : "Teacher")
                .authorRole("TEACHER")
                .isPublicToStudent(true)
                .build();

        eval.addFeedback(fb);
        feedbackRepository.save(fb);
        return evaluationEntityMapper.toFeedbackDto(fb);
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
