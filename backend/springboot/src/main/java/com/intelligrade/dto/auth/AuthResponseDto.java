package com.intelligrade.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {
    private boolean success;
    private String token;
    private UserDto user;
    private String expiresAt;
    private String message;
}
