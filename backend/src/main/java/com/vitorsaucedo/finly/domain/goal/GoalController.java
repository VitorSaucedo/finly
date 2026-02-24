package com.vitorsaucedo.finly.domain.goal;

import com.vitorsaucedo.finly.dto.request.GoalRequest;
import com.vitorsaucedo.finly.dto.response.GoalResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@Tag(name = "Goals", description = "Financial goals management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @Operation(summary = "List all goals")
    public ResponseEntity<List<GoalResponse>> findAll(JwtAuthenticationToken token) {
        return ResponseEntity.ok(goalService.findAll(extractUserId(token)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get goal by id")
    public ResponseEntity<GoalResponse> findById(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(goalService.findById(id, extractUserId(token)));
    }

    @PostMapping
    @Operation(summary = "Create a new goal")
    public ResponseEntity<GoalResponse> create(
            @Valid @RequestBody GoalRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.create(request, extractUserId(token)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a goal")
    public ResponseEntity<GoalResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody GoalRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(goalService.update(id, request, extractUserId(token)));
    }

    @PatchMapping("/{id}/deposit")
    @Operation(summary = "Add amount to a goal")
    public ResponseEntity<GoalResponse> deposit(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(goalService.addAmount(id, amount, extractUserId(token)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a goal")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        goalService.delete(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}