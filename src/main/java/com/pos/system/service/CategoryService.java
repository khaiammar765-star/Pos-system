package com.pos.system.service;

import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.Category;
import com.pos.system.repository.CategoryRepository;
import com.pos.system.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updated) {
        Category existing = getCategoryById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new IllegalStateException(
                "Cannot delete \"" + category.getName() + "\" — " + productCount +
                " product(s) still use this category. Move or remove them first.");
        }
        categoryRepository.delete(category);
    }
}
