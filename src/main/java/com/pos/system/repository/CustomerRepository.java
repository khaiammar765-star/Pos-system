package com.pos.system.repository;

import com.pos.system.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "c.phone LIKE CONCAT('%', :keyword, '%') OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Customer> search(@Param("keyword") String keyword);
}
