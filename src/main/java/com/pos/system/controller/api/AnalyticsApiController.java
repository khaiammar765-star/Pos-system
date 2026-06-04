package com.pos.system.controller.api;

import com.pos.system.dto.ChartPointDTO;
import com.pos.system.dto.SalesSummaryDTO;
import com.pos.system.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsApiController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<SalesSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSalesSummary());
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<ChartPointDTO>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakHours());
    }

    @GetMapping("/sales-by-day")
    public ResponseEntity<List<ChartPointDTO>> getSalesByDay() {
        return ResponseEntity.ok(analyticsService.getSalesByDayOfWeek());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ChartPointDTO>> getTopProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getTopProducts(limit));
    }

    @GetMapping("/least-products")
    public ResponseEntity<List<ChartPointDTO>> getLeastProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getLeastProducts(limit));
    }

    @GetMapping("/category-sales")
    public ResponseEntity<List<ChartPointDTO>> getCategorySales() {
        return ResponseEntity.ok(analyticsService.getCategorySales());
    }

    @GetMapping("/staff-performance")
    public ResponseEntity<List<Map<String, Object>>> getStaffPerformance() {
        return ResponseEntity.ok(analyticsService.getStaffPerformance());
    }

    @GetMapping("/frequent-customers")
    public ResponseEntity<List<Map<String, Object>>> getFrequentCustomers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getFrequentCustomers(limit));
    }

    @GetMapping("/customers-new-vs-returning")
    public ResponseEntity<List<ChartPointDTO>> getNewVsReturning() {
        return ResponseEntity.ok(analyticsService.getNewVsReturningCustomers());
    }
}
