package com.fitforge.auth.config;

import com.fitforge.auth.entity.User;
import com.fitforge.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        ensureAdminUser();
    }

    private void ensureAdminUser() {
        String adminEmail = "admin@fitforge.app";
        String adminPassword = "admin123";

        userRepository.findByEmail(adminEmail).ifPresentOrElse(
            admin -> {
                admin.setPasswordHash(passwordEncoder.encode(adminPassword));
                admin.setActive(true);
                admin.setVerified(true);
                userRepository.save(admin);
                log.info("Admin user password updated");
            },
            () -> {
                User admin = User.builder()
                    .email(adminEmail)
                    .username("admin")
                    .firstName("Admin")
                    .lastName("FitForge")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(User.Role.ADMIN)
                    .level(10)
                    .xp(9500)
                    .build();
                admin.setActive(true);
                admin.setVerified(true);
                userRepository.save(admin);
                log.info("Admin user created");
            }
        );
    }
}
