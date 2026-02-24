package com.vitorsaucedo.finly.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InstallmentGroupResponse(
        UUID id,
        UUID accountId,
        String accountName,
        UUID categoryId,
        String categoryName,
        String description,
        BigDecimal totalAmount,
        Integer installmentCount,
        Integer paidCount,
        LocalDate startDate,
        String notes,
        List<InstallmentResponse> installments,
        LocalDateTime createdAt
) {}