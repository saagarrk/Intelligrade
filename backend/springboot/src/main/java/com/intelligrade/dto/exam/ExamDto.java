package com.intelligrade.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private String id;
    private String title;
    private String subject;
    private String courseCode;
    private String gradeLevel;
    private Integer totalMarks;
    private Integer durationMinutes;
    private List<String> instructions;
    private List<QuestionDto> questions;
    private String createdBy;
}
