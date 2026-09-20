package com.intelligrade.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private String rollNumber;
    private String title;
    private String avatarUrl;
    private List<String> permissions;
}
