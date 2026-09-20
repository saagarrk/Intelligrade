package com.intelligrade.repository;

import com.intelligrade.entity.ExamEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<ExamEntity, String> {
    List<ExamEntity> findBySubjectIgnoreCase(String subject);
    List<ExamEntity> findByCreatedBy(String createdBy);
}
