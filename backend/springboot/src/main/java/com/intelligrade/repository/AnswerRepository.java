package com.intelligrade.repository;

import com.intelligrade.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<AnswerEntity, String> {

    List<AnswerEntity> findBySubmissionIdOrderByQuestionNumberAsc(String submissionId);

    Optional<AnswerEntity> findBySubmissionIdAndQuestionNumber(String submissionId, Integer questionNumber);

    @Query("SELECT a FROM AnswerEntity a LEFT JOIN FETCH a.evaluation e LEFT JOIN FETCH e.criteria LEFT JOIN FETCH e.feedbacks WHERE a.submission.id = :submissionId ORDER BY a.questionNumber ASC")
    List<AnswerEntity> findBySubmissionIdWithEvaluationDetails(@Param("submissionId") String submissionId);
}
