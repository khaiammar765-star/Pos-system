package com.pos.system.dto;

import com.pos.system.model.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequestDTO {
    private Long customerId;
    private List<SaleItemRequestDTO> items;
    private PaymentMethod paymentMethod;
    private BigDecimal paymentAmount;
    private String notes;
    private Integer tableNumber;
}
