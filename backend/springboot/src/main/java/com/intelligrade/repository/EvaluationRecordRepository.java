package com.intelligrade.repository;

import com.intelligrade.entity.EvaluationRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for EvaluationRecordEntity.
 */
@Repository
public interface EvaluationRecordRepository extends JpaRepository<EvaluationRecordEntity, String> {
    List<EvaluationRecordEntity> findBySubmissionIdOrderByQuestionNumberAsc(String submissionId);
    void deleteBySubmissionId(String submissionId);
}
