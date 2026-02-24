package com.vitorsaucedo.finly.dto.response;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Long expiresIn,
        UserResponse user
) {}