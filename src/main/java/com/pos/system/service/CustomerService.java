package com.pos.system.service;

import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.Customer;
import com.pos.system.repository.CustomerRepository;
import com.pos.system.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public List<Customer> searchCustomers(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllCustomers();
        return customerRepository.search(keyword);
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updated) {
        Customer existing = getCustomerById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        return customerRepository.save(existing);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        if (saleRepository.existsByCustomerId(id)) {
            throw new IllegalStateException(
                "Cannot delete \"" + customer.getName() + "\" — this customer has past sales on record.");
        }
        customerRepository.delete(customer);
    }

    public long countCustomers() {
        return customerRepository.count();
    }
}
