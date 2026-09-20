package com.intelligrade.repository;

import com.intelligrade.entity.SubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<SubmissionEntity, String> {

    List<SubmissionEntity> findByExamId(String examId);

    List<SubmissionEntity> findByStudentId(String studentId);

    List<SubmissionEntity> findByEvaluationStatus(String evaluationStatus);

    boolean existsByExamIdAndStudentRollNumber(String examId, String studentRollNumber);

    @Query("SELECT s FROM SubmissionEntity s LEFT JOIN FETCH s.answers a WHERE s.id = :id")
    Optional<SubmissionEntity> findByIdWithAnswers(@Param("id") String id);
}
