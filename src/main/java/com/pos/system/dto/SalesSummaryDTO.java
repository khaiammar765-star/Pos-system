package com.pos.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Headline sales numbers for the dashboard, including how this week/month
 * compares to the previous one (trend %, positive = up, negative = down).
 */
@Data
@AllArgsConstructor
public class SalesSummaryDTO {
    private BigDecimal todayRevenue;
    private long todayCount;

    private BigDecimal weekRevenue;
    private long weekCount;
    private double weekTrendPercent;   // vs previous week

    private BigDecimal monthRevenue;
    private long monthCount;
    private double monthTrendPercent;  // vs previous month
}
