package com.intelligrade.service;

import com.intelligrade.dto.exam.ExamDto;
import com.intelligrade.dto.exam.ParseQuestionPaperRequestDto;

import java.util.List;

public interface ExamService {
    List<ExamDto> getAllExams();
    ExamDto getExamById(String id);
    ExamDto saveExam(ExamDto examDto);
    ExamDto parseQuestionPaper(ParseQuestionPaperRequestDto request);
}
