package com.pos.system.service;

import com.pos.system.dto.SaleItemRequestDTO;
import com.pos.system.dto.SaleRequestDTO;
import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.*;
import com.pos.system.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final UserService userService;
    private final CustomerService customerService;
    private final TableSessionService tableSessionService;

    public List<Sale> getAllSales() {
        return saleRepository.findAllByOrderByCreatedAtDesc();
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
    }

    public List<Sale> getRecentSales() {
        return saleRepository.findTop10ByStatusOrderByCreatedAtDesc(SaleStatus.COMPLETED);
    }

    @Transactional
    public Sale processSale(SaleRequestDTO dto) {
        // Guard: an order must have items, and every quantity must be positive.
        // Without this, a negative quantity (e.g. from the public QR endpoint) would
        // ADD stock instead of deducting and produce a negative total.
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalStateException("Order has no items.");
        }
        for (SaleItemRequestDTO itemDto : dto.getItems()) {
            if (itemDto.getQuantity() <= 0) {
                throw new IllegalStateException("Quantity must be at least 1.");
            }
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User cashier = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal()))
                ? userService.getUserByUsername(auth.getName())
                : userService.getUserByUsername("admin");

        Sale sale = new Sale();
        sale.setUser(cashier);
        sale.setPaymentMethod(dto.getPaymentMethod());
        sale.setNotes(dto.getNotes());
        sale.setTableNumber(dto.getTableNumber());
        sale.setStatus(dto.getTableNumber() != null ? SaleStatus.PENDING : SaleStatus.COMPLETED);
        if (dto.getTableNumber() != null) {
            sale.setTableSession(tableSessionService.getOrOpenSession(dto.getTableNumber()));
        }

        if (dto.getCustomerId() != null) {
            sale.setCustomer(customerService.getCustomerById(dto.getCustomerId()));
        }

        List<SaleItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SaleItemRequestDTO itemDto : dto.getItems()) {
            Product product = productService.getProductById(itemDto.getProductId());
            inventoryService.deductStock(product.getId(), itemDto.getQuantity());

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(product.getPrice());
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            item.setSubtotal(subtotal);
            items.add(item);
            total = total.add(subtotal);
        }

        sale.setItems(items);
        sale.setTotalAmount(total);
        // Null-safe: if no payment amount was provided, treat it as exact payment (no change).
        BigDecimal payment = dto.getPaymentAmount() != null ? dto.getPaymentAmount() : total;
        sale.setPaymentAmount(payment);
        sale.setChangeAmount(payment.subtract(total));

        return saleRepository.save(sale);
    }

    public List<Sale> getPendingOrders() {
        return saleRepository.findByStatusOrderByCreatedAtAsc(SaleStatus.PENDING);
    }

    @Transactional
    public Sale completeOrder(Long id) {
        Sale sale = getSaleById(id);
        if (sale.getStatus() != SaleStatus.PENDING) {
            throw new IllegalStateException("Order is not in PENDING state");
        }
        sale.setStatus(SaleStatus.COMPLETED);
        return saleRepository.save(sale);
    }

    @Transactional
    public void voidSale(Long id) {
        Sale sale = getSaleById(id);
        if (sale.getStatus() == SaleStatus.VOIDED) {
            throw new IllegalStateException("Sale is already voided");
        }
        sale.setStatus(SaleStatus.VOIDED);
        for (SaleItem item : sale.getItems()) {
            inventoryService.adjustStock(item.getProduct().getId(), item.getQuantity());
        }
        saleRepository.save(sale);
    }
}
