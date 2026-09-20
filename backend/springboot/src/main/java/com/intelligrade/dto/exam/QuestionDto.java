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
public class QuestionDto {
    private String id;
    private Integer questionNumber;
    private String questionText;
    private Double maxMarks;
    private String topic;
    private String difficulty;
    private String modelAnswer;
    private List<KeyConceptDto> keyConcepts;
}
