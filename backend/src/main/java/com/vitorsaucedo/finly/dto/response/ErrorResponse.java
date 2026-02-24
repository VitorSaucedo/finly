package com.vitorsaucedo.finly.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
        int status,
        String error,
        String message,
        LocalDateTime timestamp,
        List<FieldError> fields
) {
    public record FieldError(
            String field,
            String message
    ) {}
}