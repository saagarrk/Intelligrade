package com.intelligrade.dto.evaluation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModifyMarksRequestDto {
    private Double marks;
    private Double awardedMarks;
    private Double teacherAdjustedMarks;
    private String reason;
    private String teacherComment;
    private String teacherNotes;
}
