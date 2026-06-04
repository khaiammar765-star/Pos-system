package com.pos.system.controller.api;

import com.pos.system.model.Inventory;
import com.pos.system.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryApiController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PatchMapping("/{productId}/adjust")
    public ResponseEntity<Void> adjustStock(@PathVariable Long productId,
                                            @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        inventoryService.adjustStock(productId, quantity);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{productId}/min-stock")
    public ResponseEntity<Void> updateMinStock(@PathVariable Long productId,
                                               @RequestBody Map<String, Integer> body) {
        Integer minStockLevel = body.get("minStockLevel");
        if (minStockLevel == null) {
            return ResponseEntity.badRequest().build();
        }
        inventoryService.updateMinStockLevel(productId, minStockLevel);
        return ResponseEntity.ok().build();
    }
}
