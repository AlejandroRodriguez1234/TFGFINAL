package com.fitforge.auth.dto.response;

public record AuthResponse(UserResponse user, Tokens tokens) {
    public record Tokens(String accessToken, String refreshToken, long expiresIn) {}
}
