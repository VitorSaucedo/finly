package com.vitorsaucedo.finly.domain.dashboard;

import com.vitorsaucedo.finly.dto.response.DashboardResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard summary endpoint")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get financial dashboard summary")
    public ResponseEntity<DashboardResponse> getDashboard(JwtAuthenticationToken token) {
        return ResponseEntity.ok(dashboardService.getDashboard(extractUserId(token)));
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}