package com.vitorsaucedo.finly.domain.account;

import com.vitorsaucedo.finly.dto.request.AccountRequest;
import com.vitorsaucedo.finly.dto.response.AccountResponse;
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
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "List all accounts")
    public ResponseEntity<List<AccountResponse>> findAll(JwtAuthenticationToken token) {
        return ResponseEntity.ok(accountService.findAll(extractUserId(token)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by id")
    public ResponseEntity<AccountResponse> findById(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(accountService.findById(id, extractUserId(token)));
    }

    @PostMapping
    @Operation(summary = "Create a new account")
    public ResponseEntity<AccountResponse> create(
            @Valid @RequestBody AccountRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accountService.create(request, extractUserId(token)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an account")
    public ResponseEntity<AccountResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody AccountRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(accountService.update(id, request, extractUserId(token)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an account")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        accountService.delete(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}