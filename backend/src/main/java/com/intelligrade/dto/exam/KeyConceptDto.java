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
public class KeyConceptDto {
    private String concept;
    private Double weightMarks;
    private List<String> synonyms;
    private String description;
}
