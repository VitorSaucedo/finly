package com.vitorsaucedo.finly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public record JwtConfig(
        String privateKeyLocation,
        Long expirationSeconds
) {}