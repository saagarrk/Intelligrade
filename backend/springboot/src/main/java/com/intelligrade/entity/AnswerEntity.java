package com.intelligrade.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity for Student Answers.
 * Represents an individual answer submitted for an exam question.
 * Stores question snapshot, student answer script, model answer benchmark, and max marks.
 */
@Entity
@Table(name = "answers", indexes = {
    @Index(name = "idx_answer_submission_id", columnList = "submission_id"),
    @Index(name = "idx_answer_question_id", columnList = "question_id"),
    @Index(name = "idx_answer_sub_qnum", columnList = "submission_id, question_number"),
    @Index(name = "idx_answer_created_at", columnList = "created_timestamp")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerEntity {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private SubmissionEntity submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private QuestionEntity question;

    @Column(name = "question_number", nullable = false)
    private Integer questionNumber;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "student_answer", columnDefinition = "LONGTEXT")
    private String studentAnswer;

    @Column(name = "model_answer", columnDefinition = "LONGTEXT")
    private String modelAnswer;

    @Column(name = "max_marks", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxMarks = BigDecimal.valueOf(10.0);

    @Column(name = "created_timestamp", nullable = false, updatable = false)
    private LocalDateTime createdTimestamp;

    @Column(name = "updated_timestamp", nullable = false)
    private LocalDateTime updatedTimestamp;

    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private EvaluationEntity evaluation;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdTimestamp == null) {
            createdTimestamp = now;
        }
        if (updatedTimestamp == null) {
            updatedTimestamp = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedTimestamp = LocalDateTime.now();
    }

    // Bidirectional helper for Evaluation
    public void setEvaluation(EvaluationEntity eval) {
        this.evaluation = eval;
        if (eval != null && eval.getAnswer() != this) {
            eval.setAnswer(this);
        }
    }
}
