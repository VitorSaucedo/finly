package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.goal.GoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String name,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        BigDecimal remainingAmount,
        Double percentageCompleted,
        LocalDate deadline,
        GoalStatus status,
        String notes,
        LocalDateTime createdAt
) {}