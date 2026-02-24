package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.transaction.TransactionStatus;
import com.vitorsaucedo.finly.domain.transaction.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID accountId,
        String accountName,
        UUID categoryId,
        String categoryName,
        UUID destinationAccountId,
        String destinationAccountName,
        String description,
        BigDecimal amount,
        TransactionType type,
        TransactionStatus status,
        LocalDate transactionDate,
        String notes,
        LocalDateTime createdAt
) {}