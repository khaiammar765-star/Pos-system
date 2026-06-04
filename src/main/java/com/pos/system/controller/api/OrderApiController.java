package com.pos.system.controller.api;

import com.pos.system.model.Sale;
import com.pos.system.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderApiController {

    private final SaleService saleService;

    // Staff views all pending orders
    @GetMapping("/pending")
    public ResponseEntity<List<Sale>> getPendingOrders() {
        return ResponseEntity.ok(saleService.getPendingOrders());
    }

    // Staff marks order as completed
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeOrder(@PathVariable Long id) {
        try {
            Sale sale = saleService.completeOrder(id);
            return ResponseEntity.ok(Map.of("success", true, "saleId", sale.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Staff voids a pending order
    @PatchMapping("/{id}/void")
    public ResponseEntity<Map<String, Object>> voidOrder(@PathVariable Long id) {
        try {
            saleService.voidSale(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
