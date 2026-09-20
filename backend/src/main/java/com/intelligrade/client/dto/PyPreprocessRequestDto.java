package com.intelligrade.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PyPreprocessRequestDto {
    @JsonProperty("image_base64")
    private String imageBase64;

    @JsonProperty("apply_thinning")
    @Builder.Default
    private boolean applyThinning = true;

    @JsonProperty("auto_deskew")
    @Builder.Default
    private boolean autoDeskew = true;
}
