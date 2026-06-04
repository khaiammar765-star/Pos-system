package com.pos.system.repository;

import com.pos.system.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByActiveTrueAndCategoryId(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);

    boolean existsBySku(String sku);

    long countByCategoryId(Long categoryId);
}
