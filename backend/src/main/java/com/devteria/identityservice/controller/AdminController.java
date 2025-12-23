package com.devteria.identityservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.AdminStatsResponse;
import com.devteria.identityservice.service.AdminService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<AdminStatsResponse> getSystemStats() {
        log.info("Fetching system-wide statistics for admin");
        return ApiResponse.<AdminStatsResponse>builder()
                .result(adminService.getSystemStats())
                .build();
    }
}
