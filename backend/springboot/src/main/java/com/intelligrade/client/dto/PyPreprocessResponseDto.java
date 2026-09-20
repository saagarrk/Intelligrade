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
public class PyPreprocessResponseDto {
    @JsonProperty("processed_image_base64")
    private String processedImageBase64;

    @JsonProperty("skew_angle_deg")
    private Double skewAngleDeg;

    @JsonProperty("dpi_detected")
    private Integer dpiDetected;

    @JsonProperty("contrast_ratio")
    private Double contrastRatio;

    @JsonProperty("stroke_width_px")
    private Double strokeWidthPx;
}
