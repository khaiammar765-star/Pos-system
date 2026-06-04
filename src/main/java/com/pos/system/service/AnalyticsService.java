package com.pos.system.service;

import com.pos.system.dto.ChartPointDTO;
import com.pos.system.dto.SalesSummaryDTO;
import com.pos.system.model.SaleStatus;
import com.pos.system.repository.SaleItemRepository;
import com.pos.system.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only business analytics for the reports/dashboard page.
 * Kept separate from ReportService (which holds the simple headline stats)
 * so each class stays small and focused.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final SaleStatus DONE = SaleStatus.COMPLETED;

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;

    // ===== Sales summary (today / week / month + trend) =====

    public SalesSummaryDTO getSalesSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();
        LocalDateTime weekStart = today.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime lastWeekStart = weekStart.minusWeeks(1);
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime lastMonthStart = monthStart.minusMonths(1);

        BigDecimal todayRevenue = saleRepository.getTotalRevenueSince(todayStart, DONE);
        long todayCount = saleRepository.countCompletedSalesSince(todayStart, DONE);

        BigDecimal weekRevenue = saleRepository.getTotalRevenueSince(weekStart, DONE);
        long weekCount = saleRepository.countCompletedSalesSince(weekStart, DONE);
        BigDecimal lastWeekRevenue = saleRepository.getTotalRevenueBetween(lastWeekStart, weekStart, DONE);

        BigDecimal monthRevenue = saleRepository.getTotalRevenueSince(monthStart, DONE);
        long monthCount = saleRepository.countCompletedSalesSince(monthStart, DONE);
        BigDecimal lastMonthRevenue = saleRepository.getTotalRevenueBetween(lastMonthStart, monthStart, DONE);

        return new SalesSummaryDTO(
                nz(todayRevenue), todayCount,
                nz(weekRevenue), weekCount, trend(weekRevenue, lastWeekRevenue),
                nz(monthRevenue), monthCount, trend(monthRevenue, lastMonthRevenue)
        );
    }

    // ===== Peak hours (aggregated in Java) =====

    public List<ChartPointDTO> getPeakHours() {
        Map<Integer, Double> byHour = new LinkedHashMap<>();
        for (int h = 0; h < 24; h++) byHour.put(h, 0.0);

        for (Object[] row : saleRepository.getCompletedSaleTimes(DONE)) {
            LocalDateTime when = (LocalDateTime) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            int hour = when.getHour();
            byHour.put(hour, byHour.get(hour) + (amount == null ? 0 : amount.doubleValue()));
        }

        List<ChartPointDTO> result = new ArrayList<>();
        for (Map.Entry<Integer, Double> e : byHour.entrySet()) {
            if (e.getValue() > 0) {
                result.add(new ChartPointDTO(formatHour(e.getKey()), round2(e.getValue())));
            }
        }
        return result;
    }

    // ===== Sales by day of week (aggregated in Java) =====

    public List<ChartPointDTO> getSalesByDayOfWeek() {
        Map<DayOfWeek, Double> byDay = new LinkedHashMap<>();
        for (DayOfWeek d : DayOfWeek.values()) byDay.put(d, 0.0);

        for (Object[] row : saleRepository.getCompletedSaleTimes(DONE)) {
            LocalDateTime when = (LocalDateTime) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            DayOfWeek day = when.getDayOfWeek();
            byDay.put(day, byDay.get(day) + (amount == null ? 0 : amount.doubleValue()));
        }

        List<ChartPointDTO> result = new ArrayList<>();
        for (Map.Entry<DayOfWeek, Double> e : byDay.entrySet()) {
            result.add(new ChartPointDTO(capitalize(e.getKey().name()), round2(e.getValue())));
        }
        return result;
    }

    // ===== Products =====

    public List<ChartPointDTO> getTopProducts(int limit) {
        List<Object[]> rows = saleItemRepository.findTopSellingProducts();
        List<ChartPointDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            if (result.size() >= limit) break;
            result.add(new ChartPointDTO((String) row[0], ((Number) row[1]).doubleValue()));
        }
        return result;
    }

    public List<ChartPointDTO> getLeastProducts(int limit) {
        List<Object[]> rows = saleItemRepository.findTopSellingProducts();
        // The query is ordered most-sold first, so the least-sold are at the end.
        List<ChartPointDTO> result = new ArrayList<>();
        for (int i = rows.size() - 1; i >= 0 && result.size() < limit; i--) {
            Object[] row = rows.get(i);
            result.add(new ChartPointDTO((String) row[0], ((Number) row[1]).doubleValue()));
        }
        return result;
    }

    public List<ChartPointDTO> getCategorySales() {
        List<ChartPointDTO> result = new ArrayList<>();
        for (Object[] row : saleItemRepository.getCategorySales()) {
            result.add(new ChartPointDTO((String) row[0], round2(((Number) row[1]).doubleValue())));
        }
        return result;
    }

    // ===== Staff =====

    public List<Map<String, Object>> getStaffPerformance() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : saleRepository.getStaffPerformance(DONE)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", row[0]);
            m.put("salesCount", ((Number) row[1]).longValue());
            m.put("revenue", round2(((Number) row[2]).doubleValue()));
            result.add(m);
        }
        return result;
    }

    // ===== Customers =====

    public List<Map<String, Object>> getFrequentCustomers(int limit) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : saleRepository.getFrequentCustomers(DONE)) {
            if (result.size() >= limit) break;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", row[0]);
            m.put("visits", ((Number) row[1]).longValue());
            m.put("totalSpent", round2(((Number) row[2]).doubleValue()));
            result.add(m);
        }
        return result;
    }

    public List<ChartPointDTO> getNewVsReturningCustomers() {
        long newCustomers = 0;
        long returning = 0;
        for (Object[] row : saleRepository.getCustomerSaleCounts(DONE)) {
            long count = ((Number) row[1]).longValue();
            if (count <= 1) newCustomers++;
            else returning++;
        }
        List<ChartPointDTO> result = new ArrayList<>();
        result.add(new ChartPointDTO("New", newCustomers));
        result.add(new ChartPointDTO("Returning", returning));
        return result;
    }

    // ===== Helpers =====

    private static BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    // Percentage change of current vs previous. Rounded to 1 decimal.
    private static double trend(BigDecimal current, BigDecimal previous) {
        double cur = current != null ? current.doubleValue() : 0;
        double prev = previous != null ? previous.doubleValue() : 0;
        if (prev == 0) return cur > 0 ? 100.0 : 0.0;
        return Math.round(((cur - prev) / prev) * 1000.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static String formatHour(int hour) {
        if (hour == 0) return "12 AM";
        if (hour < 12) return hour + " AM";
        if (hour == 12) return "12 PM";
        return (hour - 12) + " PM";
    }

    private static String capitalize(String day) {
        return day.charAt(0) + day.substring(1).toLowerCase();
    }
}
