package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordChangeRequest {
    String currentPassword;

    @Pattern(regexp = "^(?=.*[a-zA-Z]).{6,}$", message = "INVALID_PASSWORD")
    String newPassword;
}
