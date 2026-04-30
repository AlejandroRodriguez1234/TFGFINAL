package com.fitforge.auth.service;

import com.fitforge.auth.dto.request.LoginRequest;
import com.fitforge.auth.dto.request.RegisterRequest;
import com.fitforge.auth.dto.response.AuthResponse;
import com.fitforge.auth.dto.response.UserResponse;
import com.fitforge.auth.entity.User;
import com.fitforge.auth.exception.AuthException;
import com.fitforge.auth.repository.UserRepository;
import com.fitforge.auth.security.JwtService;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_KEY = "refresh:";

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AuthException("EMAIL_EXISTS", "El email ya está registrado", 409);
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new AuthException("USERNAME_EXISTS", "El nombre de usuario ya está en uso", 409);
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase().strip())
                .username(req.getUsername().toLowerCase().strip())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.CLIENT)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().strip())
                .orElseThrow(() -> new AuthException("INVALID_CREDENTIALS", "Credenciales incorrectas", 401));

        if (!user.isActive()) {
            throw new AuthException("ACCOUNT_DISABLED", "Cuenta desactivada", 403);
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new AuthException("INVALID_CREDENTIALS", "Credenciales incorrectas", 401);
        }

        if (user.isTotpEnabled()) {
            if (req.getTotpCode() == null || req.getTotpCode().isBlank()) {
                throw new AuthException("TOTP_REQUIRED", "Se requiere código 2FA", 428);
            }
            if (!verifyTotp(user.getTotpSecret(), req.getTotpCode())) {
                throw new AuthException("INVALID_TOTP", "Código 2FA incorrecto", 401);
            }
        }

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        String userId = (String) redisTemplate.opsForValue().get(REFRESH_KEY + refreshToken);
        if (userId == null) {
            throw new AuthException("INVALID_REFRESH_TOKEN", "Token de refresco inválido o expirado", 401);
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "Usuario no encontrado", 404));

        // Rotate refresh token
        redisTemplate.delete(REFRESH_KEY + refreshToken);
        return buildAuthResponse(user);
    }

    public void logout(String refreshToken) {
        redisTemplate.delete(REFRESH_KEY + refreshToken);
    }

    public TotpSetupResponse setup2fa(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "Usuario no encontrado", 404));

        SecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();

        user.setTotpSecret(secret);
        userRepository.save(user);

        String otpAuthUrl = String.format("otpauth://totp/FitForge:%s?secret=%s&issuer=FitForge", user.getEmail(), secret);
        return new TotpSetupResponse(secret, otpAuthUrl);
    }

    @Transactional
    public void verify2fa(UUID userId, String code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("USER_NOT_FOUND", "Usuario no encontrado", 404));

        if (!verifyTotp(user.getTotpSecret(), code)) {
            throw new AuthException("INVALID_TOTP", "Código 2FA incorrecto", 401);
        }

        user.setTotpEnabled(true);
        userRepository.save(user);
    }

    private boolean verifyTotp(String secret, String code) {
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        CodeVerifier   codeVerifier  = new DefaultCodeVerifier(codeGenerator, new SystemTimeProvider());
        return codeVerifier.isValidCode(secret, code);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken();

        long refreshExp = jwtService.getRefreshExpirationMs();
        redisTemplate.opsForValue().set(REFRESH_KEY + refreshToken, user.getId().toString(), Duration.ofMillis(refreshExp));

        return new AuthResponse(
                UserResponse.from(user),
                new AuthResponse.Tokens(
                        accessToken,
                        refreshToken,
                        jwtService.getAccessExpirationMs()
                )
        );
    }

    public record TotpSetupResponse(String secret, String otpAuthUrl) {}
}
