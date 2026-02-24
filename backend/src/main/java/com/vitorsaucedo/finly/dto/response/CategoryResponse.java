package com.vitorsaucedo.finly.dto.response;

import com.vitorsaucedo.finly.domain.category.CategoryType;

import java.time.LocalDateTime;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        CategoryType type,
        String color,
        String icon,
        boolean isDefault,
        LocalDateTime createdAt
) {}