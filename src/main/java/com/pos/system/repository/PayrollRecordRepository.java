package com.pos.system.repository;

import com.pos.system.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {

    @Query("SELECT p FROM PayrollRecord p WHERE p.year = :year AND p.month = :month ORDER BY p.user.fullName ASC")
    List<PayrollRecord> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT p FROM PayrollRecord p WHERE p.user.id = :userId ORDER BY p.year DESC, p.month DESC")
    List<PayrollRecord> findByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM PayrollRecord p WHERE p.user.id = :userId AND p.year = :year AND p.month = :month")
    Optional<PayrollRecord> findByUserIdAndYearAndMonth(
        @Param("userId") Long userId,
        @Param("year") int year,
        @Param("month") int month);

    @Query("SELECT p FROM PayrollRecord p ORDER BY p.year DESC, p.month DESC, p.user.fullName ASC")
    List<PayrollRecord> findAllOrdered();
}
