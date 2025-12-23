package com.devteria.identityservice.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LockUserRequest {
    @NotBlank(message = "Lock reason is required")
    String lockReason;
}
