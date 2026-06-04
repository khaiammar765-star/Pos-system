package com.pos.system.controller.api;

import com.pos.system.model.Sale;
import com.pos.system.model.TableSession;
import com.pos.system.service.TableSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TableSessionApiController {

    private final TableSessionService tableSessionService;

    // Get all open table sessions
    @GetMapping("/open")
    public ResponseEntity<List<TableSession>> getOpenSessions() {
        return ResponseEntity.ok(tableSessionService.getAllOpenSessions());
    }

    // Get orders for a specific session
    @GetMapping("/{id}/orders")
    public ResponseEntity<List<Sale>> getSessionOrders(@PathVariable Long id) {
        return ResponseEntity.ok(tableSessionService.getOrdersForSession(id));
    }

    // Close a session (staff finishes the tab)
    @PatchMapping("/{id}/close")
    public ResponseEntity<Map<String, Object>> closeSession(@PathVariable Long id) {
        try {
            TableSession session = tableSessionService.closeSession(id);
            return ResponseEntity.ok(Map.of("success", true, "sessionId", session.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
