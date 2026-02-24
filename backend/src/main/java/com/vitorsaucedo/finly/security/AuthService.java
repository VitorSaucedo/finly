package com.vitorsaucedo.finly.security;

import com.vitorsaucedo.finly.domain.user.User;
import com.vitorsaucedo.finly.domain.user.UserRepository;
import com.vitorsaucedo.finly.dto.request.LoginRequest;
import com.vitorsaucedo.finly.dto.request.RegisterRequest;
import com.vitorsaucedo.finly.dto.response.AuthResponse;
import com.vitorsaucedo.finly.dto.response.UserResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already in use");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("User not found"));

        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt())
        );
    }
}