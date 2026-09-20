package com.intelligrade.service;

import com.intelligrade.dto.auth.AuthResponseDto;
import com.intelligrade.dto.auth.LoginRequestDto;
import com.intelligrade.dto.auth.RegisterRequestDto;
import com.intelligrade.dto.auth.UserDto;

public interface AuthService {
    AuthResponseDto login(LoginRequestDto request);
    AuthResponseDto register(RegisterRequestDto request);
    UserDto getCurrentUser(String token);
    UserDto findUserByEmail(String email);
}
