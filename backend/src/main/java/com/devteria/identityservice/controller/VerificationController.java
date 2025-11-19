package com.devteria.identityservice.controller;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.service.VerificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VerificationController {

    VerificationService verificationService;

    @GetMapping("/verify")
    @Transactional
    public ApiResponse<String> verifyEmail(@RequestParam("token") String token) {
        log.info("Email verification requested with token: {}", token);
        verificationService.verifyEmail(token);
        return ApiResponse.<String>builder()
                .result("Email verified successfully")
                .build();
    }

    @PostMapping("/resend-verify")
    public ApiResponse<String> resendVerification(@RequestParam("email") String email) {
        log.info("Resend verification email requested for: {}", email);
        verificationService.resendVerificationEmail(email);
        return ApiResponse.<String>builder()
                .result("Verification email sent")
                .build();
    }
}
