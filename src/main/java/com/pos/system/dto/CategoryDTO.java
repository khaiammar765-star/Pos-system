package com.pos.system.dto;

import com.pos.system.model.Category;
import lombok.Getter;

@Getter
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private long productCount;

    public CategoryDTO(Category category, long productCount) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.productCount = productCount;
    }
}
