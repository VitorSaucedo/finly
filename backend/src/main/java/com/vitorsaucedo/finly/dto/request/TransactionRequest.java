package com.vitorsaucedo.finly.dto.request;

import com.vitorsaucedo.finly.domain.transaction.TransactionStatus;
import com.vitorsaucedo.finly.domain.transaction.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(

        @NotNull(message = "Account is required")
        UUID accountId,

        UUID categoryId,

        UUID destinationAccountId,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        BigDecimal amount,

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Status is required")
        TransactionStatus status,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate,

        String notes
) {}