package com.intelligrade.repository;

import com.intelligrade.entity.EvaluationCriterionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationCriterionRepository extends JpaRepository<EvaluationCriterionEntity, String> {

    List<EvaluationCriterionEntity> findByEvaluationId(String evaluationId);

    List<EvaluationCriterionEntity> findByEvaluationIdAndMatchStatus(String evaluationId, String matchStatus);
}
