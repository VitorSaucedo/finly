package com.vitorsaucedo.finly.domain.user;

import com.vitorsaucedo.finly.dto.request.RegisterRequest;
import com.vitorsaucedo.finly.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get authenticated user profile")
    public ResponseEntity<UserResponse> getMe(JwtAuthenticationToken token) {
        return ResponseEntity.ok(userService.findById(extractUserId(token)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated user profile")
    public ResponseEntity<UserResponse> update(
            @Valid @RequestBody RegisterRequest request,
            JwtAuthenticationToken token) {
        return ResponseEntity.ok(userService.update(extractUserId(token), request));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete authenticated user account")
    public ResponseEntity<Void> delete(JwtAuthenticationToken token) {
        userService.delete(extractUserId(token));
        return ResponseEntity.noContent().build();
    }

    private UUID extractUserId(JwtAuthenticationToken token) {
        return UUID.fromString(token.getToken().getSubject());
    }
}