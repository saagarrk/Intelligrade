package com.intelligrade.controller;

import com.intelligrade.dto.auth.AuthResponseDto;
import com.intelligrade.dto.auth.LoginRequestDto;
import com.intelligrade.dto.auth.RegisterRequestDto;
import com.intelligrade.dto.auth.UserDto;
import com.intelligrade.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for Authentication & Identity Management
 * Flow: AuthController -> AuthService -> UserRepository
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        if (request.getName() == null || request.getEmail() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required."));
        }

        AuthResponseDto response = authService.register(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access"));
        }
        String token = authHeader.substring(7);
        UserDto user = authService.getCurrentUser(token);
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }
}
