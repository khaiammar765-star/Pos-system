package com.pos.system.controller.api;

import com.pos.system.dto.CategoryDTO;
import com.pos.system.model.Category;
import com.pos.system.repository.ProductRepository;
import com.pos.system.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryApiController {

    private final CategoryService categoryService;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAll() {
        List<CategoryDTO> result = categoryService.getAllCategories().stream()
                .map(c -> new CategoryDTO(c, productRepository.countByCategoryId(c.getId())))
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
