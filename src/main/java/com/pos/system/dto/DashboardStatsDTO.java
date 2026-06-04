package com.pos.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal todayRevenue;
    private long todaySalesCount;
    private BigDecimal monthRevenue;
    private long monthSalesCount;
    private long totalProducts;
    private long lowStockCount;
    private long totalCustomers;
}
