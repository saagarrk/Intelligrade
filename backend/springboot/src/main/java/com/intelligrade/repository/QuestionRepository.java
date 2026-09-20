package com.intelligrade.repository;

import com.intelligrade.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, String> {
    List<QuestionEntity> findByExamIdOrderByQuestionNumberAsc(String examId);
}
