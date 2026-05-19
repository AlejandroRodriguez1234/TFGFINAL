package com.fitforge.auth.controller;

import com.fitforge.auth.dto.request.LoginRequest;
import com.fitforge.auth.dto.request.RegisterRequest;
import com.fitforge.auth.dto.response.ApiResponse;
import com.fitforge.auth.dto.response.AuthResponse;
import com.fitforge.auth.dto.response.UserResponse;
import com.fitforge.auth.entity.User;
import com.fitforge.auth.repository.UserRepository;
import com.fitforge.auth.security.JwtService;
import com.fitforge.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.register(req);
        return ResponseEntity.status(201).body(ApiResponse.success(response, "Usuario registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success(response, "Login correcto"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse.Tokens>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        AuthResponse response = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response.tokens(), "Token renovado"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody Map<String, String> body) {
        authService.logout(body.get("refreshToken"));
        return ResponseEntity.ok(ApiResponse.success(null, "Sesión cerrada"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(UserResponse.from(user)));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<AuthService.TotpSetupResponse>> setup2fa(@AuthenticationPrincipal User user) {
        var result = authService.setup2fa(user.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<ApiResponse<Void>> verify2fa(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        authService.verify2fa(user.getId(), body.get("code"));
        return ResponseEntity.ok(ApiResponse.success(null, "2FA activado correctamente"));
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<ApiResponse<Void>> disable2fa(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        authService.disable2fa(user.getId(), body.get("code"));
        return ResponseEntity.ok(ApiResponse.success(null, "2FA desactivado correctamente"));
    }
}
