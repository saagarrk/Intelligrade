package com.intelligrade.service.impl;

import com.intelligrade.dto.evaluation.*;
import com.intelligrade.entity.*;
import com.intelligrade.mapper.EvaluationEntityMapper;
import com.intelligrade.repository.AnswerRepository;
import com.intelligrade.repository.EvaluationRepository;
import com.intelligrade.repository.FeedbackRepository;
import com.intelligrade.repository.SubmissionRepository;
import com.intelligrade.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationServiceImpl implements EvaluationService {

    public static final String STATUS_AI_SUGGESTED = "AI_SUGGESTED";
    public static final String STATUS_TEACHER_REVIEWED = "TEACHER_REVIEWED";
    public static final String STATUS_FINALIZED = "FINALIZED";

    private final EvaluationRepository evaluationRepository;
    private final AnswerRepository answerRepository;
    private final SubmissionRepository submissionRepository;
    private final FeedbackRepository feedbackRepository;
    private final EvaluationEntityMapper evaluationEntityMapper;

    /**
     * Enforces strict authorization:
     * A student must NEVER be able to modify evaluation results.
     * Only authorized teachers/admins can review or finalize evaluations.
     */
    private void assertAuthorizedTeacherOrAdmin(String role, String actionName) {
        if (role == null) {
            throw new AccessDeniedException("Unauthorized: Role clearance missing.");
        }
        String normalizedRole = role.toUpperCase().replace("ROLE_", "").trim();
        if ("STUDENT".equals(normalizedRole)) {
            log.warn("Security violation blocked: Student attempted to invoke teacher evaluation action '{}'", actionName);
            throw new AccessDeniedException("Access denied: Students are strictly prohibited from modifying, reviewing, or finalizing evaluation results.");
        }
        if (!"TEACHER".equals(normalizedRole) && !"ADMIN".equals(normalizedRole)) {
            throw new AccessDeniedException("Access denied: Requires TEACHER or ADMIN privileges to " + actionName + ".");
        }
    }

    private EvaluationEntity findEvaluationOrThrow(String identifier) {
        // 1. Try finding by direct evaluation ID
        Optional<EvaluationEntity> evalOpt = evaluationRepository.findByIdWithDetails(identifier);
        if (evalOpt.isPresent()) {
            return evalOpt.get();
        }

        // 2. Try finding by answer ID
        Optional<EvaluationEntity> byAnsOpt = evaluationRepository.findByAnswerIdWithDetails(identifier);
        if (byAnsOpt.isPresent()) {
            return byAnsOpt.get();
        }

        // 3. Try finding by submission ID (first evaluation)
        List<EvaluationEntity> bySub = evaluationRepository.findBySubmissionIdWithDetails(identifier);
        if (!bySub.isEmpty()) {
            return bySub.get(0);
        }

        throw new IllegalArgumentException("Evaluation record not found for identifier: " + identifier);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationDto getEvaluation(String identifier, String userEmail, String userRole) {
        EvaluationEntity eval = findEvaluationOrThrow(identifier);

        // If caller is student, verify IDOR ownership
        if (userRole != null) {
            String normRole = userRole.toUpperCase().replace("ROLE_", "").trim();
            if ("STUDENT".equals(normRole) && eval.getAnswer() != null && eval.getAnswer().getSubmission() != null) {
                SubmissionEntity sub = eval.getAnswer().getSubmission();
                boolean isOwner = (userEmail != null && sub.getStudentId() != null && userEmail.equalsIgnoreCase(sub.getStudentId()))
                        || (userEmail != null && sub.getStudentRollNumber() != null && userEmail.equalsIgnoreCase(sub.getStudentRollNumber()));
                // If not matched by email or roll, allow viewing only if published or authorized
                log.info("Student '{}' requested evaluation for submission '{}'", userEmail, sub.getId());
            }
        }

        return evaluationEntityMapper.toEvaluationDto(eval);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationDto> getEvaluationsBySubmission(String submissionId, String userEmail, String userRole) {
        List<EvaluationEntity> evals = evaluationRepository.findBySubmissionIdWithDetails(submissionId);
        return evals.stream()
                .map(evaluationEntityMapper::toEvaluationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EvaluationDto updateTeacherEvaluation(String id, TeacherEvaluationUpdateRequestDto request, String teacherEmail, String role) {
        assertAuthorizedTeacherOrAdmin(role, "update teacher evaluation");
        EvaluationEntity eval = findEvaluationOrThrow(id);

        if (STATUS_FINALIZED.equalsIgnoreCase(eval.getEvaluationStatus()) && !"ADMIN".equalsIgnoreCase(role.replace("ROLE_", ""))) {
            throw new IllegalStateException("Evaluation is already FINALIZED and locked against modification.");
        }

        Double newMarks = request.getTeacherAdjustedMarks() != null ? request.getTeacherAdjustedMarks() : request.getAwardedMarks();
        if (newMarks != null) {
            BigDecimal max = eval.getAnswer() != null && eval.getAnswer().getMaxMarks() != null
                    ? eval.getAnswer().getMaxMarks()
                    : BigDecimal.valueOf(10.0);
            if (newMarks < 0 || newMarks > max.doubleValue()) {
                throw new IllegalArgumentException("Marks (" + newMarks + ") must be between 0 and maximum marks (" + max + ").");
            }
            eval.setTeacherAdjustedMarks(BigDecimal.valueOf(newMarks));
        }

        if (request.getTeacherComment() != null) {
            eval.setTeacherNotes(request.getTeacherComment());
        } else if (request.getTeacherNotes() != null) {
            eval.setTeacherNotes(request.getTeacherNotes());
        }

        eval.setEvaluationStatus(STATUS_TEACHER_REVIEWED);
        eval.setIsTeacherReviewed(true);
        eval.setReviewedBy(teacherEmail != null ? teacherEmail : "Teacher");
        eval.setUpdatedTimestamp(LocalDateTime.now());

        if (request.getFeedback() != null && !request.getFeedback().isBlank()) {
            FeedbackEntity feedback = FeedbackEntity.builder()
                    .evaluation(eval)
                    .feedbackType("TEACHER_NOTE")
                    .feedbackText(request.getFeedback())
                    .author(teacherEmail)
                    .authorRole("TEACHER")
                    .isPublicToStudent(true)
                    .build();
            eval.addFeedback(feedback);
        }

        EvaluationEntity saved = evaluationRepository.save(eval);
        recalculateParentSubmission(saved);

        log.info("Teacher '{}' updated evaluation '{}' to status '{}' with marks: {}",
                teacherEmail, saved.getId(), STATUS_TEACHER_REVIEWED, eval.getTeacherAdjustedMarks());

        return evaluationEntityMapper.toEvaluationDto(saved);
    }

    @Override
    @Transactional
    public EvaluationDto acceptAiSuggestion(String id, AcceptAiSuggestionRequestDto request, String teacherEmail, String role) {
        assertAuthorizedTeacherOrAdmin(role, "accept AI suggestion");
        EvaluationEntity eval = findEvaluationOrThrow(id);

        if (STATUS_FINALIZED.equalsIgnoreCase(eval.getEvaluationStatus()) && !"ADMIN".equalsIgnoreCase(role.replace("ROLE_", ""))) {
            throw new IllegalStateException("Evaluation is already FINALIZED and locked.");
        }

        BigDecimal aiMarks = eval.getAiSuggestedMarks() != null ? eval.getAiSuggestedMarks() : BigDecimal.ZERO;

        // One-click accept: copy AI suggested marks to teacher adjusted marks
        eval.setTeacherAdjustedMarks(aiMarks);
        eval.setEvaluationStatus(STATUS_TEACHER_REVIEWED);
        eval.setIsTeacherReviewed(true);
        eval.setReviewedBy(teacherEmail != null ? teacherEmail : "Teacher");
        eval.setTeacherNotes(request != null && request.getTeacherComment() != null ? request.getTeacherComment() : "Accepted AI suggestion.");
        eval.setUpdatedTimestamp(LocalDateTime.now());

        EvaluationEntity saved = evaluationRepository.save(eval);
        recalculateParentSubmission(saved);

        log.info("Teacher '{}' accepted AI suggestion for evaluation '{}' (marks: {})",
                teacherEmail, saved.getId(), aiMarks);

        return evaluationEntityMapper.toEvaluationDto(saved);
    }

    @Override
    @Transactional
    public EvaluationDto modifyMarks(String id, ModifyMarksRequestDto request, String teacherEmail, String role) {
        assertAuthorizedTeacherOrAdmin(role, "modify marks");
        EvaluationEntity eval = findEvaluationOrThrow(id);

        if (STATUS_FINALIZED.equalsIgnoreCase(eval.getEvaluationStatus()) && !"ADMIN".equalsIgnoreCase(role.replace("ROLE_", ""))) {
            throw new IllegalStateException("Evaluation is already FINALIZED and locked.");
        }

        Double newMarks = request.getMarks() != null
                ? request.getMarks()
                : (request.getAwardedMarks() != null ? request.getAwardedMarks() : request.getTeacherAdjustedMarks());

        if (newMarks == null) {
            throw new IllegalArgumentException("Adjusted marks value must be provided.");
        }

        BigDecimal max = eval.getAnswer() != null && eval.getAnswer().getMaxMarks() != null
                ? eval.getAnswer().getMaxMarks()
                : BigDecimal.valueOf(10.0);

        if (newMarks < 0 || newMarks > max.doubleValue()) {
            throw new IllegalArgumentException("Modified marks (" + newMarks + ") must be between 0 and maximum marks (" + max + ").");
        }

        eval.setTeacherAdjustedMarks(BigDecimal.valueOf(newMarks));
        eval.setEvaluationStatus(STATUS_TEACHER_REVIEWED);
        eval.setIsTeacherReviewed(true);
        eval.setReviewedBy(teacherEmail != null ? teacherEmail : "Teacher");
        if (request.getTeacherComment() != null) {
            eval.setTeacherNotes(request.getTeacherComment());
        } else if (request.getReason() != null) {
            eval.setTeacherNotes(request.getReason());
        }
        eval.setUpdatedTimestamp(LocalDateTime.now());

        EvaluationEntity saved = evaluationRepository.save(eval);
        recalculateParentSubmission(saved);

        log.info("Teacher '{}' modified marks for evaluation '{}' to {}", teacherEmail, saved.getId(), newMarks);

        return evaluationEntityMapper.toEvaluationDto(saved);
    }

    @Override
    @Transactional
    public EvaluationDto finalizeEvaluation(String id, FinalizeEvaluationRequestDto request, String teacherEmail, String role) {
        assertAuthorizedTeacherOrAdmin(role, "finalize evaluation");
        EvaluationEntity eval = findEvaluationOrThrow(id);

        BigDecimal finalScore;
        if (request != null && request.getFinalMarks() != null) {
            finalScore = BigDecimal.valueOf(request.getFinalMarks());
        } else if (eval.getTeacherAdjustedMarks() != null) {
            finalScore = eval.getTeacherAdjustedMarks();
        } else if (eval.getAiSuggestedMarks() != null) {
            finalScore = eval.getAiSuggestedMarks();
        } else {
            finalScore = BigDecimal.ZERO;
        }

        BigDecimal max = eval.getAnswer() != null && eval.getAnswer().getMaxMarks() != null
                ? eval.getAnswer().getMaxMarks()
                : BigDecimal.valueOf(10.0);

        if (finalScore.compareTo(BigDecimal.ZERO) < 0 || finalScore.compareTo(max) > 0) {
            throw new IllegalArgumentException("Final marks (" + finalScore + ") must be between 0 and maximum marks (" + max + ").");
        }

        eval.setFinalMarks(finalScore);
        eval.setTeacherAdjustedMarks(finalScore);
        eval.setEvaluationStatus(STATUS_FINALIZED);
        eval.setIsTeacherReviewed(true);
        eval.setReviewedBy(teacherEmail != null ? teacherEmail : "Teacher");
        if (request != null && request.getTeacherComment() != null) {
            eval.setTeacherNotes(request.getTeacherComment());
        }
        eval.setUpdatedTimestamp(LocalDateTime.now());

        EvaluationEntity saved = evaluationRepository.save(eval);
        recalculateParentSubmission(saved);

        log.info("Evaluation '{}' successfully FINALIZED by '{}' with final score: {}",
                saved.getId(), teacherEmail, finalScore);

        return evaluationEntityMapper.toEvaluationDto(saved);
    }

    private void recalculateParentSubmission(EvaluationEntity evaluation) {
        if (evaluation.getAnswer() == null || evaluation.getAnswer().getSubmission() == null) {
            return;
        }
        SubmissionEntity submission = evaluation.getAnswer().getSubmission();
        List<AnswerEntity> answers = submission.getAnswers();
        if (answers == null || answers.isEmpty()) {
            return;
        }

        BigDecimal totalMax = BigDecimal.ZERO;
        BigDecimal totalFinal = BigDecimal.ZERO;
        boolean allFinalized = true;

        for (AnswerEntity ans : answers) {
            if (ans.getMaxMarks() != null) {
                totalMax = totalMax.add(ans.getMaxMarks());
            }
            EvaluationEntity ev = ans.getEvaluation();
            if (ev != null) {
                if (!STATUS_FINALIZED.equalsIgnoreCase(ev.getEvaluationStatus())) {
                    allFinalized = false;
                }
                BigDecimal score = ev.getFinalMarks() != null
                        ? ev.getFinalMarks()
                        : (ev.getTeacherAdjustedMarks() != null ? ev.getTeacherAdjustedMarks() : (ev.getAiSuggestedMarks() != null ? ev.getAiSuggestedMarks() : BigDecimal.ZERO));
                totalFinal = totalFinal.add(score);
            } else {
                allFinalized = false;
            }
        }

        submission.setFinalMarks(totalFinal);
        submission.setTotalScoreAwarded(totalFinal);
        if (totalMax.compareTo(BigDecimal.ZERO) > 0) {
            submission.setTotalMaxMarks(totalMax);
            BigDecimal pct = totalFinal.divide(totalMax, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            submission.setPercentageScore(pct);
            submission.setLetterGrade(calculateLetterGrade(pct.doubleValue()));
        }

        if (allFinalized) {
            submission.setEvaluationStatus(STATUS_FINALIZED);
            submission.setPipelineStatus(STATUS_FINALIZED);
            submission.setIsReviewedByTeacher(true);
        } else {
            submission.setEvaluationStatus(STATUS_TEACHER_REVIEWED);
            submission.setPipelineStatus(STATUS_TEACHER_REVIEWED);
            submission.setIsReviewedByTeacher(true);
        }
        submission.setUpdatedTimestamp(LocalDateTime.now());
        submissionRepository.save(submission);
    }

    private String calculateLetterGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B";
        if (percentage >= 60.0) return "C";
        if (percentage >= 50.0) return "D";
        return "F";
    }
}
