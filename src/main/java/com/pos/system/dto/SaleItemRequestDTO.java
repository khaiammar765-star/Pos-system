package com.pos.system.dto;

import lombok.Data;

@Data
public class SaleItemRequestDTO {
    private Long productId;
    private int quantity;
}
