package com.pos.system.repository;

import com.pos.system.model.SessionStatus;
import com.pos.system.model.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    // findFirst...OrderBy is resilient: even if two OPEN sessions ever exist for the
    // same table (e.g. two phones ordering at the exact same moment), this returns one
    // instead of throwing "non-unique result" and breaking that table's ordering.
    Optional<TableSession> findFirstByTableNumberAndStatusOrderByOpenedAtDesc(Integer tableNumber, SessionStatus status);
}
