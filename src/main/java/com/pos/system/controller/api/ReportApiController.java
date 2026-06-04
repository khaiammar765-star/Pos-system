package com.pos.system.controller.api;

import com.pos.system.dto.DashboardStatsDTO;
import com.pos.system.model.Sale;
import com.pos.system.repository.SaleItemRepository;
import com.pos.system.service.ReportService;
import com.pos.system.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportApiController {

    private final ReportService reportService;
    private final SaleService saleService;
    private final SaleItemRepository saleItemRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/sales")
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts() {
        List<Map<String, Object>> result = saleItemRepository.findTopSellingProducts()
                .stream()
                .map(row -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("productName", row[0]);
                    map.put("totalQty", row[1]);
                    map.put("totalRevenue", row[2]);
                    return map;
                })
                .toList();
        return ResponseEntity.ok(result);
    }
}
