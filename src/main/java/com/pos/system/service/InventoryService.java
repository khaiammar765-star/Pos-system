package com.pos.system.service;

import com.pos.system.exception.InsufficientStockException;
import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.Inventory;
import com.pos.system.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }

    public Inventory getByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
    }

    @Transactional
    public void adjustStock(Long productId, int quantity) {
        Inventory inventory = getByProductId(productId);
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void deductStock(Long productId, int quantity) {
        // Use the row-locking lookup so concurrent sales are serialized and can't oversell.
        Inventory inventory = inventoryRepository.findByProductIdForUpdate(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product: " + productId));
        if (inventory.getQuantity() < quantity) {
            throw new InsufficientStockException(
                "Not enough stock for \"" + inventory.getProduct().getName() +
                "\". Available: " + inventory.getQuantity() + ", Requested: " + quantity
            );
        }
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void updateMinStockLevel(Long productId, int minStockLevel) {
        Inventory inventory = getByProductId(productId);
        inventory.setMinStockLevel(minStockLevel);
        inventoryRepository.save(inventory);
    }

    public long countLowStock() {
        return inventoryRepository.findLowStockItems().size();
    }
}
