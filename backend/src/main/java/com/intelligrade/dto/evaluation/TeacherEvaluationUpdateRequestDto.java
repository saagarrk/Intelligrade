package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherEvaluationUpdateRequestDto {
    private Double teacherAdjustedMarks;
    private Double awardedMarks;
    private String teacherComment;
    private String teacherNotes;
    private String feedback;
    private List<EvaluationCriterionDto> criteria;
}
