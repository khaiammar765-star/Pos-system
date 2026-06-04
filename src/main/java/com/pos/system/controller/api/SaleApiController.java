package com.pos.system.controller.api;

import com.pos.system.dto.SaleRequestDTO;
import com.pos.system.model.Sale;
import com.pos.system.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleApiController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<Sale>> getAll() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> processSale(@RequestBody SaleRequestDTO dto) {
        try {
            Sale sale = saleService.processSale(dto);
            return ResponseEntity.ok(Map.of("success", true, "saleId", sale.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/void")
    public ResponseEntity<Map<String, Object>> voidSale(@PathVariable Long id) {
        try {
            saleService.voidSale(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
