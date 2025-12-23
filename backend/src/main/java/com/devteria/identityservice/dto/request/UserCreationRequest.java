package com.devteria.identityservice.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.devteria.identityservice.validator.DobConstraint;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Size(min = 4, message = "USERNAME_INVALID")
    String username;

    @Pattern(regexp = "^(?=.*[a-zA-Z]).{6,}$", message = "INVALID_PASSWORD")
    String password;

    @Email(message = "INVALID_EMAIL")
    String email;
    String firstName;
    String lastName;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

    String role; // USER hoặc AGENT
}
