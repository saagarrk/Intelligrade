package com.intelligrade.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    // Mock session storage matching production contract
    private static final Map<String, Map<String, Object>> USERS_STORE = new HashMap<>();

    static {
        Map<String, Object> student = new HashMap<>();
        student.put("id", "usr_student_01");
        student.put("name", "Alex Rivera");
        student.put("email", "student@intelligrade.edu");
        student.put("role", "student");
        student.put("department", "Computer Science & Engineering");
        student.put("rollNumber", "CS-2026-041");
        student.put("permissions", List.of("read:submissions", "read:grades", "read:insights", "request:reevaluation"));
        USERS_STORE.put("student@intelligrade.edu", student);

        Map<String, Object> teacher = new HashMap<>();
        teacher.put("id", "usr_teacher_01");
        teacher.put("name", "Prof. Sarah Jenkins");
        teacher.put("email", "teacher@intelligrade.edu");
        teacher.put("role", "teacher");
        teacher.put("title", "Lead Instructor & Associate Professor");
        teacher.put("department", "Department of Computer Science");
        teacher.put("permissions", List.of("read:all", "write:preprocess", "write:ocr", "write:grades", "override:marks", "read:insights", "run:batch"));
        USERS_STORE.put("teacher@intelligrade.edu", teacher);

        Map<String, Object> admin = new HashMap<>();
        admin.put("id", "usr_admin_01");
        admin.put("name", "Dr. Eleanor Vance");
        admin.put("email", "admin@intelligrade.edu");
        admin.put("role", "admin");
        admin.put("title", "Dean of Academic Computing");
        admin.put("department", "Office of Academic Assessment");
        admin.put("permissions", List.of("*"));
        USERS_STORE.put("admin@intelligrade.edu", admin);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String role = (String) body.get("role");

        Map<String, Object> user = null;
        if (role != null && !role.isEmpty()) {
            for (Map<String, Object> u : USERS_STORE.values()) {
                if (role.equalsIgnoreCase((String) u.get("role"))) {
                    user = u;
                    break;
                }
            }
        } else if (email != null) {
            user = USERS_STORE.get(email.toLowerCase());
        }

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User account not found"));
        }

        String token = "ig_jwt_token_" + user.get("role") + "_" + System.currentTimeMillis();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        response.put("expiresAt", new Date(System.currentTimeMillis() + 86400000).toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        String role = (String) body.getOrDefault("role", "student");
        String department = (String) body.get("department");

        if (name == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required."));
        }

        if (USERS_STORE.containsKey(email.toLowerCase())) {
            return ResponseEntity.status(409).body(Map.of("error", "User email already registered."));
        }

        Map<String, Object> newUser = new HashMap<>();
        newUser.put("id", "usr_" + role + "_" + System.currentTimeMillis());
        newUser.put("name", name);
        newUser.put("email", email.toLowerCase());
        newUser.put("role", role);
        newUser.put("department", department != null ? department : "Computer Science");
        newUser.put("permissions", "admin".equals(role) ? List.of("*") : "teacher".equals(role) 
            ? List.of("read:all", "write:preprocess", "write:ocr", "write:grades", "override:marks", "read:insights")
            : List.of("read:submissions", "read:grades", "read:insights", "request:reevaluation"));

        USERS_STORE.put(email.toLowerCase(), newUser);

        String token = "ig_jwt_token_" + role + "_" + System.currentTimeMillis();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", newUser
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        return ResponseEntity.ok(Map.of("success", true, "user", USERS_STORE.get("teacher@intelligrade.edu")));
    }
}
