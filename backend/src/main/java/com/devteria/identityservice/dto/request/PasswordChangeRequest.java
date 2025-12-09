package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordChangeRequest {
    @Size(min = 8, message = "PASSWORD_INVALID")
    String currentPassword;

    @Size(min = 8, message = "PASSWORD_INVALID")
    String newPassword;
}
