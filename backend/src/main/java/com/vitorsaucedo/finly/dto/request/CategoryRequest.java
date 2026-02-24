package com.vitorsaucedo.finly.dto.request;

import com.vitorsaucedo.finly.domain.category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @NotNull(message = "Category type is required")
        CategoryType type,

        @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a valid hex code")
        String color,

        @Size(max = 50, message = "Icon must be at most 50 characters")
        String icon
) {}