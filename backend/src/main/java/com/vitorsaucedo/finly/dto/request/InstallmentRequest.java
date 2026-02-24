package com.vitorsaucedo.finly.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InstallmentRequest(

        @NotNull(message = "Account is required")
        UUID accountId,

        UUID categoryId,

        @NotBlank(message = "Description is required")
        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Total amount is required")
        @Positive(message = "Total amount must be positive")
        BigDecimal totalAmount,

        @NotNull(message = "Installment count is required")
        @Min(value = 2, message = "Installment count must be at least 2")
        @Max(value = 360, message = "Installment count must be at most 360")
        Integer installmentCount,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        String notes
) {}