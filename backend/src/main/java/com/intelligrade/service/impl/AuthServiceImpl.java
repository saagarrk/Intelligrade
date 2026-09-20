package com.intelligrade.service.impl;

import com.intelligrade.dto.auth.AuthResponseDto;
import com.intelligrade.dto.auth.LoginRequestDto;
import com.intelligrade.dto.auth.RegisterRequestDto;
import com.intelligrade.dto.auth.UserDto;
import com.intelligrade.entity.UserEntity;
import com.intelligrade.repository.UserRepository;
import com.intelligrade.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    // Cache / in-memory store mirroring verified institutions
    private static final Map<String, UserDto> MOCK_USERS = new ConcurrentHashMap<>();

    static {
        UserDto student = UserDto.builder()
                .id("usr_student_01")
                .name("Alex Rivera")
                .email("student@intelligrade.edu")
                .role("student")
                .department("Computer Science & Engineering")
                .rollNumber("CS-2026-041")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80")
                .permissions(List.of("read:submissions", "read:grades", "read:insights", "request:reevaluation"))
                .build();
        MOCK_USERS.put("student@intelligrade.edu", student);

        UserDto teacher = UserDto.builder()
                .id("usr_teacher_01")
                .name("Prof. Sarah Jenkins")
                .email("teacher@intelligrade.edu")
                .role("teacher")
                .title("Lead Instructor & Associate Professor")
                .department("Department of Computer Science")
                .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80")
                .permissions(List.of("read:all", "write:preprocess", "write:ocr", "write:grades", "override:marks", "read:insights", "run:batch"))
                .build();
        MOCK_USERS.put("teacher@intelligrade.edu", teacher);

        UserDto admin = UserDto.builder()
                .id("usr_admin_01")
                .name("Dr. Eleanor Vance")
                .email("admin@intelligrade.edu")
                .role("admin")
                .title("Dean of Academic Computing")
                .department("Office of Academic Assessment")
                .avatarUrl("https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&q=80")
                .permissions(List.of("*"))
                .build();
        MOCK_USERS.put("admin@intelligrade.edu", admin);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null;
        String role = request.getRole();

        UserDto userDto = null;

        // 1. Try finding in database
        if (email != null) {
            Optional<UserEntity> dbUser = userRepository.findByEmailIgnoreCase(email);
            if (dbUser.isPresent()) {
                userDto = toDto(dbUser.get());
            }
        }

        // 2. Fallback to pre-seeded users
        if (userDto == null) {
            if (role != null && !role.isBlank()) {
                for (UserDto u : MOCK_USERS.values()) {
                    if (role.equalsIgnoreCase(u.getRole())) {
                        userDto = u;
                        break;
                    }
                }
            } else if (email != null && MOCK_USERS.containsKey(email)) {
                userDto = MOCK_USERS.get(email);
            }
        }

        if (userDto == null) {
            return AuthResponseDto.builder()
                    .success(false)
                    .message("User account not found for credentials provided")
                    .build();
        }

        String token = "ig_jwt_token_" + userDto.getRole() + "_" + System.currentTimeMillis();
        String expiresAt = new Date(System.currentTimeMillis() + 86400000).toString();

        return AuthResponseDto.builder()
                .success(true)
                .token(token)
                .user(userDto)
                .expiresAt(expiresAt)
                .message("Authentication successful")
                .build();
    }

    @Override
    public AuthResponseDto register(RegisterRequestDto request) {
        if (request.getName() == null || request.getEmail() == null) {
            return AuthResponseDto.builder()
                    .success(false)
                    .message("Name and institutional email are mandatory.")
                    .build();
        }

        String email = request.getEmail().toLowerCase().trim();
        String role = request.getRole() != null ? request.getRole().toLowerCase().trim() : "student";

        if (userRepository.existsByEmailIgnoreCase(email) || MOCK_USERS.containsKey(email)) {
            return AuthResponseDto.builder()
                    .success(false)
                    .message("User email already registered: " + email)
                    .build();
        }

        // Create Entity
        UserEntity entity = new UserEntity();
        entity.setId("usr_" + role + "_" + System.currentTimeMillis());
        entity.setName(request.getName());
        entity.setEmail(email);
        entity.setPasswordHash("hashed_" + System.currentTimeMillis());
        entity.setRole(role);
        entity.setDepartment(request.getDepartment() != null ? request.getDepartment() : "Computer Science");
        entity.setRollNumber(request.getRollNumber());
        entity.setTitle(request.getTitle());
        entity.setCreatedAt(LocalDateTime.now());

        try {
            userRepository.save(entity);
        } catch (Exception e) {
            log.warn("Database persistence failed, keeping in memory: {}", e.getMessage());
        }

        UserDto userDto = toDto(entity);
        userDto.setPermissions(resolvePermissionsForRole(role));
        MOCK_USERS.put(email, userDto);

        String token = "ig_jwt_token_" + role + "_" + System.currentTimeMillis();
        String expiresAt = new Date(System.currentTimeMillis() + 86400000).toString();

        return AuthResponseDto.builder()
                .success(true)
                .token(token)
                .user(userDto)
                .expiresAt(expiresAt)
                .message("Registration completed successfully")
                .build();
    }

    @Override
    public UserDto getCurrentUser(String token) {
        // Default to teacher in mock environment
        return MOCK_USERS.get("teacher@intelligrade.edu");
    }

    @Override
    public UserDto findUserByEmail(String email) {
        if (email == null) return null;
        Optional<UserEntity> entity = userRepository.findByEmailIgnoreCase(email.trim());
        if (entity.isPresent()) {
            return toDto(entity.get());
        }
        return MOCK_USERS.get(email.toLowerCase().trim());
    }

    private UserDto toDto(UserEntity entity) {
        return UserDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .role(entity.getRole())
                .department(entity.getDepartment())
                .rollNumber(entity.getRollNumber())
                .title(entity.getTitle())
                .avatarUrl(entity.getAvatarUrl())
                .permissions(resolvePermissionsForRole(entity.getRole()))
                .build();
    }

    private List<String> resolvePermissionsForRole(String role) {
        if ("admin".equalsIgnoreCase(role)) {
            return List.of("*");
        } else if ("teacher".equalsIgnoreCase(role)) {
            return List.of("read:all", "write:preprocess", "write:ocr", "write:grades", "override:marks", "read:insights", "run:batch");
        } else {
            return List.of("read:submissions", "read:grades", "read:insights", "request:reevaluation");
        }
    }
}
