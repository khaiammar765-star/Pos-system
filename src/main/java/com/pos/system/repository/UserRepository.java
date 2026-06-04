package com.pos.system.repository;

import com.pos.system.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.failedAttempts = u.failedAttempts + 1 WHERE u.username = :username")
    void incrementFailedAttempts(String username);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.failedAttempts = 0, u.accountNonLocked = true, u.lockedAt = null WHERE u.username = :username")
    void resetFailedAttempts(String username);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.accountNonLocked = false, u.lockedAt = CURRENT_TIMESTAMP WHERE u.username = :username")
    void lockAccount(String username);
}
