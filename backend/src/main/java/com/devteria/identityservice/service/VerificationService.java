package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.entity.VerificationToken;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.UserRepository;
import com.devteria.identityservice.repository.VerificationTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VerificationService {

    VerificationTokenRepository verificationTokenRepository;
    UserRepository userRepository;
    EmailVerify emailVerify;

    @NonFinal
    @Value("${app.verification-token-expiry:24}")
    long tokenExpiryHours;

    @Transactional
    public void verifyEmail(String token) {
        VerificationToken verificationToken = verificationTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN));

        if (verificationToken.isExpired()) {
            log.warn("Verification token expired: {}", token);
            throw new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN);
        }

        User user = verificationToken.getUser();
        user.setIsVerified(true);
        userRepository.save(user);

        // Delete used token
        verificationTokenRepository.delete(verificationToken);

        log.info("Email verified successfully for user: {}", user.getUsername());

        // Send welcome email async - không cần đợi
        emailVerify.sendWelcomeEmail(user);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getIsVerified() != null && user.getIsVerified()) {
            log.warn("User already verified: {}", email);
            throw new AppException(ErrorCode.USER_EXISTED); // Reuse error code
        }

        // Delete old tokens for this user
        verificationTokenRepository.deleteByUserId(user.getId());

        // Generate new token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusHours(tokenExpiryHours))
                .build();

        verificationTokenRepository.save(verificationToken);

        // Send email
        emailVerify.sendVerificationEmail(user, token);

        log.info("Verification email resent to: {}", email);
    }
}
