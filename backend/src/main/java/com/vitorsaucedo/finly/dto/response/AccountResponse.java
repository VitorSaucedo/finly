package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.account.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        AccountType type,
        BigDecimal balance,
        String currency,
        LocalDateTime createdAt
) {}