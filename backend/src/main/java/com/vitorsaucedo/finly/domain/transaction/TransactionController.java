package com.vitorsaucedo.finly.domain.transaction;

import com.vitorsaucedo.finly.dto.request.TransactionRequest;
import com.vitorsaucedo.finly.dto.response.TransactionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "List all transactions paginated")
    public ResponseEntity<Page<TransactionResponse>> findAll(
            @PageableDefault(size = 10, sort = "transactionDate") Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(transactionService.findAll(extractUserId(token), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by id")
    public ResponseEntity<TransactionResponse> findById(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(transactionService.findById(id, extractUserId(token)));
    }

    @PostMapping
    @Operation(summary = "Create a new transaction")
    public ResponseEntity<TransactionResponse> create(
            @Valid @RequestBody TransactionRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.create(request, extractUserId(token)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a transaction")
    public ResponseEntity<TransactionResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(transactionService.update(id, request, extractUserId(token)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        transactionService.delete(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}