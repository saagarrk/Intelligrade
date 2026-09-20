package com.intelligrade.repository;

import com.intelligrade.entity.EvaluationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<EvaluationEntity, String> {

    Optional<EvaluationEntity> findByAnswerId(String answerId);

    List<EvaluationEntity> findByEvaluationStatus(String evaluationStatus);

    @Query("SELECT e FROM EvaluationEntity e LEFT JOIN FETCH e.criteria LEFT JOIN FETCH e.feedbacks WHERE e.answer.id = :answerId")
    Optional<EvaluationEntity> findByAnswerIdWithDetails(@Param("answerId") String answerId);
}
