package com.pos.system.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pos.system.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final LoginAttemptService loginAttemptService;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        // Return JSON (React reads res.data.message) — NOT a redirect.
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        String message;
        if (exception instanceof LockedException) {
            message = "Your account has been locked. Please contact admin.";
        } else {
            String username = request.getParameter("username");
            loginAttemptService.loginFailed(username);
            int attemptsLeft = loginAttemptService.getAttemptsLeft(username);

            if (attemptsLeft <= 0) {
                message = "Your account has been locked after too many failed attempts.";
            } else {
                message = "Invalid username or password. " + attemptsLeft + " attempt(s) remaining.";
            }
        }

        response.getWriter().write(objectMapper.writeValueAsString(Map.of("success", false, "message", message)));
    }
}
