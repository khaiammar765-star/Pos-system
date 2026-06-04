package com.pos.system.controller.api;

import com.pos.system.model.User;
import com.pos.system.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Tells the frontend who is currently logged in.
 * The React ProtectedRoute calls GET /api/auth/me on page load:
 *  - 200 + user info  → logged in, render the page
 *  - 401 (handled by Spring Security) → not logged in, redirect to /login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthApiController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(Map.of(
            "username", user.getUsername(),
            "fullName", user.getFullName(),
            "role", user.getRole().name()
        ));
    }
}
