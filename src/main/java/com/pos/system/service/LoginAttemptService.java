package com.pos.system.service;

import com.pos.system.model.User;
import com.pos.system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 3;

    private final UserRepository userRepository;

    // Called when login FAILS
    public void loginFailed(String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) return;

        User user = optionalUser.get();

        // Increment failed attempts
        userRepository.incrementFailedAttempts(username);

        // If reached max attempts → lock the account
        if (user.getFailedAttempts() + 1 >= MAX_ATTEMPTS) {
            userRepository.lockAccount(username);
        }
    }

    // Called when login SUCCEEDS
    public void loginSucceeded(String username) {
        userRepository.resetFailedAttempts(username);
    }

    // Check how many attempts left
    public int getAttemptsLeft(String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) return MAX_ATTEMPTS;
        int used = optionalUser.get().getFailedAttempts();
        return Math.max(0, MAX_ATTEMPTS - used);
    }
}
