package com.vitorsaucedo.finly.security;

import com.vitorsaucedo.finly.config.JwtConfig;
import com.vitorsaucedo.finly.domain.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtConfig jwtConfig;

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtConfig.expirationSeconds());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("finly")
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .issuedAt(now)
                .expiresAt(expiry)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public Long getExpirationSeconds() {
        return jwtConfig.expirationSeconds();
    }
}