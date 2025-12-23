package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.ProcessReportRequest;
import com.devteria.identityservice.dto.request.ReportRequest;
import com.devteria.identityservice.dto.response.ReportResponse;
import com.devteria.identityservice.service.ReportService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReportController {
    
    ReportService reportService;

    /**
     * Tạo báo cáo mới
     * POST /reports
     */
    @PostMapping
    ApiResponse<ReportResponse> createReport(@Valid @RequestBody ReportRequest request) {
        log.info("Creating report for {} {}", request.getTargetType(), request.getTargetId());
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.createReport(request))
                .message("Báo cáo đã được gửi thành công")
                .build();
    }

    /**
     * Lấy tất cả báo cáo (Admin only)
     * GET /reports
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<ReportResponse>> getAllReports() {
        log.info("Getting all reports");
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getAllReports())
                .build();
    }

    /**
     * Lấy báo cáo đang chờ xử lý (Admin only)
     * GET /reports/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<ReportResponse>> getPendingReports() {
        log.info("Getting pending reports");
        return ApiResponse.<List<ReportResponse>>builder()
                .result(reportService.getPendingReports())
                .build();
    }

    /**
     * Đếm số báo cáo pending (Admin only)
     * GET /reports/count/pending
     */
    @GetMapping("/count/pending")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<Long> countPendingReports() {
        return ApiResponse.<Long>builder()
                .result(reportService.countPendingReports())
                .build();
    }

    /**
     * Xử lý báo cáo (Admin only)
     * POST /reports/{id}/process
     */
    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<ReportResponse> processReport(
            @PathVariable Long id,
            @RequestBody ProcessReportRequest request) {
        log.info("Processing report {} - approved: {}", id, request.getApproved());
        return ApiResponse.<ReportResponse>builder()
                .result(reportService.processReport(id, request))
                .message(request.getApproved() ? "Báo cáo đã được duyệt" : "Báo cáo đã bị từ chối")
                .build();
    }
}
