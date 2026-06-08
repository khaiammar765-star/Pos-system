package com.pos.system.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
@Getter
@Setter
@NoArgsConstructor
public class PayrollRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // NOTE: "month" and "year" are reserved SQL keywords in H2 & MySQL,
    // so the physical columns are renamed. The Java field names stay the
    // same, so JPQL/derived queries (p.month, p.year) are unaffected.
    @Column(name = "pay_month", nullable = false)
    private int month;   // 1–12

    @Column(name = "pay_year", nullable = false)
    private int year;

    private int daysWorked;

    private double dailyRate;

    private double totalAmount;

    @Column(nullable = false)
    private boolean paid = false;

    private LocalDate paidDate;

    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
