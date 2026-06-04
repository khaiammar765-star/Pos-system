package com.pos.system.controller.api;

import com.pos.system.dto.SaleItemRequestDTO;
import com.pos.system.dto.SaleRequestDTO;
import com.pos.system.model.Category;
import com.pos.system.model.Product;
import com.pos.system.model.Sale;
import com.pos.system.service.CategoryService;
import com.pos.system.service.ProductService;
import com.pos.system.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicOrderController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final SaleService saleService;

    // Customer browses active products
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts() {
        return ResponseEntity.ok(productService.getActiveProducts());
    }

    // Customer browses categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Customer places order from table
    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody SaleRequestDTO dto) {
        try {
            if (dto.getTableNumber() == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Table number is required."));
            }
            if (dto.getItems() == null || dto.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order cannot be empty."));
            }

            // Calculate total from products
            BigDecimal total = BigDecimal.ZERO;
            for (SaleItemRequestDTO item : dto.getItems()) {
                Product product = productService.getProductById(item.getProductId());
                total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }

            // Set defaults for self-order
            dto.setPaymentMethod(com.pos.system.model.PaymentMethod.CASH);
            dto.setPaymentAmount(total);

            Sale sale = saleService.processSale(dto);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", sale.getId(),
                "tableNumber", dto.getTableNumber(),
                "total", total
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
