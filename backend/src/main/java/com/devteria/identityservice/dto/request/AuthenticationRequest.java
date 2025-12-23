package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.Pattern;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    String usernameOrEmail; // Có thể là username hoặc email
    @Pattern(regexp = "^(?=.*[a-zA-Z]).{6,}$", message = "INVALID_PASSWORD")
    String password;
}
