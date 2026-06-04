package com.pos.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * A single point of chart/analytics data: a label and its numeric value.
 * Reused for many charts (peak hours, day of week, category sales, etc.)
 * so we don't need a separate DTO for every chart.
 */
@Data
@AllArgsConstructor
public class ChartPointDTO {
    private String label;
    private double value;
}
