package com.pos.system.repository;

import com.pos.system.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query("SELECT si.product.name, SUM(si.quantity), SUM(si.subtotal) " +
           "FROM SaleItem si JOIN si.sale s " +
           "WHERE s.status = com.pos.system.model.SaleStatus.COMPLETED " +
           "GROUP BY si.product.id, si.product.name " +
           "ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findTopSellingProducts();

    // Revenue grouped by category — for the "which category sells most" pie chart
    @Query("SELECT si.product.category.name, COALESCE(SUM(si.subtotal), 0) " +
           "FROM SaleItem si JOIN si.sale s " +
           "WHERE s.status = com.pos.system.model.SaleStatus.COMPLETED " +
           "AND si.product.category IS NOT NULL " +
           "GROUP BY si.product.category.id, si.product.category.name " +
           "ORDER BY SUM(si.subtotal) DESC")
    List<Object[]> getCategorySales();
}
