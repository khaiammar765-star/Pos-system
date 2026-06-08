package com.pos.system.repository;

import com.pos.system.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to);

    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    int countByUserIdAndDateBetweenAndPresentTrue(Long userId, LocalDate from, LocalDate to);
}
