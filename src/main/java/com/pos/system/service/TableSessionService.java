package com.pos.system.service;

import com.pos.system.model.Sale;
import com.pos.system.model.SaleStatus;
import com.pos.system.model.SessionStatus;
import com.pos.system.model.TableSession;
import com.pos.system.repository.SaleRepository;
import com.pos.system.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TableSessionService {

    private final TableSessionRepository repo;
    private final SaleRepository saleRepository;

    public TableSession getOrOpenSession(Integer tableNumber) {
        return repo.findFirstByTableNumberAndStatusOrderByOpenedAtDesc(tableNumber, SessionStatus.OPEN)
                .orElseGet(() -> {
                    TableSession session = new TableSession();
                    session.setTableNumber(tableNumber);
                    session.setStatus(SessionStatus.OPEN);
                    return repo.save(session);
                });
    }

    public Optional<TableSession> getOpenSession(Integer tableNumber) {
        return repo.findFirstByTableNumberAndStatusOrderByOpenedAtDesc(tableNumber, SessionStatus.OPEN);
    }

    public List<TableSession> getAllOpenSessions() {
        return repo.findAll().stream()
                .filter(s -> s.getStatus() == SessionStatus.OPEN)
                .toList();
    }

    @Transactional
    public TableSession closeSession(Long sessionId) {
        TableSession session = repo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        // Auto-complete any pending orders before closing
        for (Sale sale : session.getOrders()) {
            if (sale.getStatus() == SaleStatus.PENDING) {
                sale.setStatus(SaleStatus.COMPLETED);
                saleRepository.save(sale);
            }
        }
        session.setStatus(SessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        return repo.save(session);
    }

    public TableSession getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    @Transactional(readOnly = true)
    public List<Sale> getOrdersForSession(Long id) {
        TableSession session = getById(id);
        return new ArrayList<>(session.getOrders());
    }
}
