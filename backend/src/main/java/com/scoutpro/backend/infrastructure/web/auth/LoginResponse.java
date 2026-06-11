package com.scoutpro.backend.infrastructure.web.auth;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresInSeconds
) {
}
