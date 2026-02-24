package com.vitorsaucedo.finly.dto.request;

import com.vitorsaucedo.finly.domain.account.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AccountRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotNull(message = "Account type is required")
        AccountType type,

        @NotNull(message = "Initial balance is required")
        @PositiveOrZero(message = "Balance must be zero or positive")
        BigDecimal balance,

        @NotBlank(message = "Currency is required")
        @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
        String currency
) {}