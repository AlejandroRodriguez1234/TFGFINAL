package com.fitforge.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 3, max = 50) @Pattern(regexp = "^[a-z0-9_]+$")
    private String username;

    @NotBlank @Size(min = 2, max = 100)
    private String firstName;

    @NotBlank @Size(min = 2, max = 100)
    private String lastName;

    @NotBlank @Size(min = 8, max = 255)
    private String password;
}
