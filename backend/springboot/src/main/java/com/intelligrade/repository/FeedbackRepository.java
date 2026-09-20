package com.intelligrade.repository;

import com.intelligrade.entity.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, String> {

    List<FeedbackEntity> findByEvaluationId(String evaluationId);

    List<FeedbackEntity> findByEvaluationIdAndFeedbackType(String evaluationId, String feedbackType);

    List<FeedbackEntity> findByEvaluationIdAndIsPublicToStudentTrue(String evaluationId);
}
