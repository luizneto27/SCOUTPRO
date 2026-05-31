package com.scoutpro.backend.config.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

@Component
public class JwtService {

    private final SecurityProperties securityProperties;

    public JwtService(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @PostConstruct
    void validateSecret() {
        String secret = securityProperties.getJwtSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET is required and cannot be empty.");
        }
        int minBytes = 32; // 256 bits
        int actualBytes = secret.getBytes(StandardCharsets.UTF_8).length;
        if (actualBytes < minBytes) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short. Minimum is 32 bytes (256 bits), got " + actualBytes + " bytes.");
        }
    }

    public String generateToken(String username) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(securityProperties.getJwtExpirationSeconds());

        return Jwts.builder()
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = securityProperties.getJwtSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
