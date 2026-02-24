package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.installment.InstallmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record InstallmentResponse(
        UUID id,
        UUID groupId,
        UUID transactionId,
        Integer installmentNumber,
        BigDecimal amount,
        LocalDate dueDate,
        InstallmentStatus status,
        LocalDateTime createdAt
) {}