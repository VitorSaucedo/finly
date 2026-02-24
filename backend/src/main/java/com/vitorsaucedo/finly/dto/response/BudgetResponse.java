package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.budget.BudgetStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        BigDecimal amount,
        BigDecimal spent,
        BigDecimal remaining,
        Double percentageUsed,
        Integer month,
        Integer year,
        BudgetStatus status,
        LocalDateTime createdAt
) {}