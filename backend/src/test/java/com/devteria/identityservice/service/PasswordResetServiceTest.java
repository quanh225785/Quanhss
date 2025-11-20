package com.devteria.identityservice.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

import com.devteria.identityservice.entity.PasswordResetToken;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.repository.PasswordResetTokenRepository;
import com.devteria.identityservice.repository.UserRepository;

@SpringBootTest
@TestPropertySource("/test.properties")
public class PasswordResetServiceTest {

    @Autowired
    private PasswordResetService passwordResetService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @MockBean
    private EmailVerify emailVerify;

    private User user;
    private PasswordResetToken token;

    @BeforeEach
    void init() {
        user = User.builder().id("u1").email("john@example.com").username("john").build();

        token = PasswordResetToken.builder()
                .id("t1")
                .token("tok")
                .user(user)
                .createdAt(LocalDateTime.now().minusMinutes(30))
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();
    }

    @Test
    void requestPasswordReset_success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        // This should not throw
        passwordResetService.requestPasswordReset("john@example.com");
    }

    @Test
    void resetPassword_invalidToken_error() {
        when(passwordResetTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

        var e = assertThrows(AppException.class, () -> passwordResetService.resetPassword("invalid", "newpass"));
        Assertions.assertThat(e.getErrorCode().getCode()).isEqualTo(1011);
    }

    @Test
    void resetPassword_expiredToken_error() {
        token.setExpiryDate(LocalDateTime.now().minusHours(2));

        when(passwordResetTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));

        var e = assertThrows(AppException.class, () -> passwordResetService.resetPassword("tok", "newpass"));
        Assertions.assertThat(e.getErrorCode().getCode()).isEqualTo(1011);
    }

    @Test
    void resetPassword_success() {
        when(passwordResetTokenRepository.findByToken(anyString())).thenReturn(Optional.of(token));

        passwordResetService.resetPassword("tok", "new-pass");

        // No exception implies success
    }
}
