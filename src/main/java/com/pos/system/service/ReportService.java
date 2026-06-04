package com.pos.system.service;

import com.pos.system.dto.DashboardStatsDTO;
import com.pos.system.model.SaleStatus;
import com.pos.system.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final CustomerService customerService;

    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();

        BigDecimal todayRevenue = saleRepository.getTotalRevenueSince(todayStart, SaleStatus.COMPLETED);
        long todaySales = saleRepository.countCompletedSalesSince(todayStart, SaleStatus.COMPLETED);
        BigDecimal monthRevenue = saleRepository.getTotalRevenueSince(monthStart, SaleStatus.COMPLETED);
        long monthSales = saleRepository.countCompletedSalesSince(monthStart, SaleStatus.COMPLETED);

        return new DashboardStatsDTO(
            todayRevenue != null ? todayRevenue : BigDecimal.ZERO,
            todaySales,
            monthRevenue != null ? monthRevenue : BigDecimal.ZERO,
            monthSales,
            productService.countProducts(),
            inventoryService.countLowStock(),
            customerService.countCustomers()
        );
    }
}
