package com.pos.system.controller.api;

import com.pos.system.model.Product;
import com.pos.system.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductApiController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product,
                                          @RequestParam(defaultValue = "0") int initialStock,
                                          @RequestParam(defaultValue = "5") int minStockLevel) {
        return ResponseEntity.ok(productService.saveProduct(product, initialStock, minStockLevel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        productService.toggleProductStatus(id);
        return ResponseEntity.ok().build();
    }
}
