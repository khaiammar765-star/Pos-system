package com.pos.system.service;

import com.pos.system.exception.ResourceNotFoundException;
import com.pos.system.model.Attendance;
import com.pos.system.model.PayrollRecord;
import com.pos.system.model.User;
import com.pos.system.repository.AttendanceRepository;
import com.pos.system.repository.PayrollRecordRepository;
import com.pos.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final PayrollRecordRepository payrollRecordRepository;

    // ── Staff & Rate ─────────────────────────────────────────
    public List<User> getActiveStaff() {
        return userRepository.findAll().stream()
            .filter(User::isActive)
            .toList();
    }

    public User setDailyRate(Long userId, double rate) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setDailyRate(rate);
        return userRepository.save(user);
    }

    // ── Attendance ────────────────────────────────────────────
    public List<Attendance> getAttendance(Long userId, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return attendanceRepository.findByUserIdAndDateBetween(userId, from, to);
    }

    /**
     * Toggle kehadiran: kalau rekod belum ada → create (present=true).
     * Kalau dah ada → flip present/absent.
     */
    public Attendance toggleAttendance(Long userId, LocalDate date) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<Attendance> existing = attendanceRepository.findByUserIdAndDate(userId, date);
        if (existing.isPresent()) {
            Attendance att = existing.get();
            att.setPresent(!att.isPresent());
            return attendanceRepository.save(att);
        } else {
            Attendance att = new Attendance();
            att.setUser(user);
            att.setDate(date);
            att.setPresent(true);
            return attendanceRepository.save(att);
        }
    }

    // ── Payroll ───────────────────────────────────────────────
    /**
     * Kira gaji untuk bulan tertentu dan simpan/update PayrollRecord.
     */
    public PayrollRecord calculatePayroll(Long userId, int year, int month) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        int daysWorked = (int) attendanceRepository.countByUserIdAndDateBetweenAndPresentTrue(userId, from, to);

        PayrollRecord record = payrollRecordRepository
            .findByUserIdAndYearAndMonth(userId, year, month)
            .orElse(new PayrollRecord());

        record.setUser(user);
        record.setYear(year);
        record.setMonth(month);
        record.setDaysWorked(daysWorked);
        record.setDailyRate(user.getDailyRate());
        record.setTotalAmount(daysWorked * user.getDailyRate());

        return payrollRecordRepository.save(record);
    }

    public PayrollRecord markAsPaid(Long recordId) {
        PayrollRecord record = payrollRecordRepository.findById(recordId)
            .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found: " + recordId));
        record.setPaid(true);
        record.setPaidDate(LocalDate.now());
        return payrollRecordRepository.save(record);
    }

    public List<PayrollRecord> getAllRecords() {
        return payrollRecordRepository.findAllByOrderByYearDescMonthDescUserFullNameAsc();
    }

    public List<PayrollRecord> getRecordsByMonth(int year, int month) {
        return payrollRecordRepository.findByYearAndMonthOrderByUserFullNameAsc(year, month);
    }
}
