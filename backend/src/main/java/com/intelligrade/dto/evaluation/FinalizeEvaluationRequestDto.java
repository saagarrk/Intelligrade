package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinalizeEvaluationRequestDto {
    private Double finalMarks;
    private String teacherComment;
    private String teacherNotes;
    private String finalizedBy;
}
