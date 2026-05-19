package com.fitforge.auth.dto.response;

import com.fitforge.auth.entity.User;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String username,
        String firstName,
        String lastName,
        String avatarUrl,
        String role,
        int level,
        int xp,
        int streakDays,
        boolean totpEnabled,
        OffsetDateTime createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getEmail(), u.getUsername(),
                u.getFirstName(), u.getLastName(), u.getAvatarUrl(),
                u.getRole().name(), u.getLevel(), u.getXp(),
                u.getStreakDays(), u.isTotpEnabled(), u.getCreatedAt()
        );
    }
}
