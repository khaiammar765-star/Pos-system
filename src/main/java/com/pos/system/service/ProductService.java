package com.pos.system.service;

import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.Inventory;
import com.pos.system.model.Product;
import com.pos.system.repository.InventoryRepository;
import com.pos.system.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.isBlank()) return getActiveProducts();
        return productRepository.searchActiveProducts(keyword);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional
    public Product saveProduct(Product product, int initialStock, int minStockLevel) {
        Product saved = productRepository.save(product);
        Inventory inventory = new Inventory();
        inventory.setProduct(saved);
        inventory.setQuantity(initialStock);
        inventory.setMinStockLevel(minStockLevel);
        inventoryRepository.save(inventory);
        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setSku(updated.getSku());
        existing.setCategory(updated.getCategory());
        existing.setActive(updated.isActive());
        return productRepository.save(existing);
    }

    public void toggleProductStatus(Long id) {
        Product product = getProductById(id);
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    public long countProducts() {
        return productRepository.count();
    }
}
