package com.pos.system.repository;

import com.pos.system.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {

    List<PayrollRecord> findByYearAndMonthOrderByUserFullNameAsc(int year, int month);

    List<PayrollRecord> findByUserIdOrderByYearDescMonthDesc(Long userId);

    Optional<PayrollRecord> findByUserIdAndYearAndMonth(Long userId, int year, int month);

    List<PayrollRecord> findAllByOrderByYearDescMonthDescUserFullNameAsc();
}
