package com.vitorsaucedo.finly.domain.budget;

import com.vitorsaucedo.finly.dto.request.BudgetRequest;
import com.vitorsaucedo.finly.dto.response.BudgetResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Budget management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "List budgets by month and year")
    public ResponseEntity<List<BudgetResponse>> findAll(
            @RequestParam int month,
            @RequestParam int year,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(budgetService.findAllByMonthAndYear(extractUserId(token), month, year));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by id")
    public ResponseEntity<BudgetResponse> findById(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(budgetService.findById(id, extractUserId(token)));
    }

    @PostMapping
    @Operation(summary = "Create a new budget")
    public ResponseEntity<BudgetResponse> create(
            @Valid @RequestBody BudgetRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.create(request, extractUserId(token)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a budget")
    public ResponseEntity<BudgetResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody BudgetRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(budgetService.update(id, request, extractUserId(token)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        budgetService.delete(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}