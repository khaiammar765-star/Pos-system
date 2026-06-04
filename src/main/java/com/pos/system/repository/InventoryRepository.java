package com.pos.system.repository;

import com.pos.system.model.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    // Locks the inventory row until the transaction commits, so two simultaneous
    // sales can't both pass the stock check and oversell the same product.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId")
    Optional<Inventory> findByProductIdForUpdate(@Param("productId") Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minStockLevel")
    List<Inventory> findLowStockItems();
}
