package com.pos.system.repository;

import com.pos.system.model.Sale;
import com.pos.system.model.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findAllByOrderByCreatedAtDesc();

    boolean existsByCustomerId(Long customerId);

    List<Sale> findTop10ByStatusOrderByCreatedAtDesc(SaleStatus status);

    List<Sale> findByStatusOrderByCreatedAtAsc(SaleStatus status);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.status = :status AND s.createdAt >= :startDate")
    BigDecimal getTotalRevenueSince(@Param("startDate") LocalDateTime startDate, @Param("status") SaleStatus status);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status AND s.createdAt >= :startDate")
    long countCompletedSalesSince(@Param("startDate") LocalDateTime startDate, @Param("status") SaleStatus status);

    // ===== Analytics =====

    // Revenue within a date window (used for trend comparisons, e.g. last week/month)
    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end")
    BigDecimal getTotalRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("status") SaleStatus status);

    // Cashier name, number of sales, total revenue — ordered by revenue
    @Query("SELECT s.user.fullName, COUNT(s), COALESCE(SUM(s.totalAmount), 0) FROM Sale s " +
           "WHERE s.status = :status GROUP BY s.user.id, s.user.fullName ORDER BY SUM(s.totalAmount) DESC")
    List<Object[]> getStaffPerformance(@Param("status") SaleStatus status);

    // Customer name, visit count, total spent — ordered by visit count
    @Query("SELECT s.customer.name, COUNT(s), COALESCE(SUM(s.totalAmount), 0) FROM Sale s " +
           "WHERE s.status = :status AND s.customer IS NOT NULL " +
           "GROUP BY s.customer.id, s.customer.name ORDER BY COUNT(s) DESC")
    List<Object[]> getFrequentCustomers(@Param("status") SaleStatus status);

    // Per-customer sale counts — used to classify new (1 visit) vs returning (2+ visits)
    @Query("SELECT s.customer.id, COUNT(s) FROM Sale s " +
           "WHERE s.status = :status AND s.customer IS NOT NULL GROUP BY s.customer.id")
    List<Object[]> getCustomerSaleCounts(@Param("status") SaleStatus status);

    // Timestamp + amount of every completed sale — aggregated in Java for peak hours / day of week
    // (kept database-agnostic so it works the same on H2 and MySQL)
    @Query("SELECT s.createdAt, s.totalAmount FROM Sale s WHERE s.status = :status")
    List<Object[]> getCompletedSaleTimes(@Param("status") SaleStatus status);
}
