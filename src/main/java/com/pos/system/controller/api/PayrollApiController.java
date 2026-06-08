package com.pos.system.controller.api;

import com.pos.system.model.Attendance;
import com.pos.system.model.PayrollRecord;
import com.pos.system.model.User;
import com.pos.system.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class PayrollApiController {

    private final PayrollService payrollService;

    // ── Staff & Rate ──────────────────────────────────────────────────────────

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getStaff() {
        return ResponseEntity.ok(payrollService.getActiveStaff());
    }

    @PatchMapping("/staff/{userId}/rate")
    public ResponseEntity<User> setRate(
            @PathVariable Long userId,
            @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(payrollService.setDailyRate(userId, body.get("dailyRate")));
    }

    // ── Attendance ────────────────────────────────────────────────────────────

    @GetMapping("/attendance/{userId}/{year}/{month}")
    public ResponseEntity<List<Attendance>> getAttendance(
            @PathVariable Long userId,
            @PathVariable int year,
            @PathVariable int month) {
        return ResponseEntity.ok(payrollService.getAttendance(userId, year, month));
    }

    @PostMapping("/attendance/toggle")
    public ResponseEntity<Attendance> toggle(@RequestBody Map<String, String> body) {
        Long userId = Long.parseLong(body.get("userId"));
        LocalDate date = LocalDate.parse(body.get("date"));
        return ResponseEntity.ok(payrollService.toggleAttendance(userId, date));
    }

    // ── Payroll Records ───────────────────────────────────────────────────────

    @GetMapping("/records")
    public ResponseEntity<List<PayrollRecord>> getAllRecords() {
        return ResponseEntity.ok(payrollService.getAllRecords());
    }

    @GetMapping("/records/{year}/{month}")
    public ResponseEntity<List<PayrollRecord>> getByMonth(
            @PathVariable int year,
            @PathVariable int month) {
        return ResponseEntity.ok(payrollService.getRecordsByMonth(year, month));
    }

    @PostMapping("/calculate")
    public ResponseEntity<PayrollRecord> calculate(@RequestBody Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        int year = Integer.parseInt(body.get("year").toString());
        int month = Integer.parseInt(body.get("month").toString());
        return ResponseEntity.ok(payrollService.calculatePayroll(userId, year, month));
    }

    @PatchMapping("/records/{id}/pay")
    public ResponseEntity<PayrollRecord> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }
}
