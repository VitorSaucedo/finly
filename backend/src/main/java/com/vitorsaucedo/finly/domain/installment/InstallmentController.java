package com.vitorsaucedo.finly.domain.installment;

import com.vitorsaucedo.finly.dto.request.InstallmentRequest;
import com.vitorsaucedo.finly.dto.response.InstallmentGroupResponse;
import com.vitorsaucedo.finly.dto.response.InstallmentResponse;
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
@RequestMapping("/api/installments")
@RequiredArgsConstructor
@Tag(name = "Installments", description = "Installment management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class InstallmentController {

    private final InstallmentService installmentService;

    @GetMapping
    @Operation(summary = "List all installment groups paginated")
    public ResponseEntity<Page<InstallmentGroupResponse>> findAll(
            @PageableDefault(size = 10) Pageable pageable,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(installmentService.findAll(extractUserId(token), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get installment group by id")
    public ResponseEntity<InstallmentGroupResponse> findById(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(installmentService.findById(id, extractUserId(token)));
    }

    @PostMapping
    @Operation(summary = "Create a new installment group")
    public ResponseEntity<InstallmentGroupResponse> create(
            @Valid @RequestBody InstallmentRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(installmentService.create(request, extractUserId(token)));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Pay an installment")
    public ResponseEntity<InstallmentResponse> pay(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(installmentService.payInstallment(id, extractUserId(token)));
    }

    @DeleteMapping("/{id}/cancel")
    @Operation(summary = "Cancel all pending installments of a group")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            JwtAuthenticationToken token) {
        installmentService.cancel(id, extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}