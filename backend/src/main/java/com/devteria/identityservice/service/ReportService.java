package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.ProcessReportRequest;
import com.devteria.identityservice.dto.request.ReportRequest;
import com.devteria.identityservice.dto.response.ReportResponse;
import com.devteria.identityservice.entity.Report;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.NotificationType;
import com.devteria.identityservice.enums.ReportStatus;
import com.devteria.identityservice.enums.ReportTargetType;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.ReportRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReportService {

    ReportRepository reportRepository;
    UserRepository userRepository;
    TourRepository tourRepository;
    NotificationService notificationService;

    /**
     * Tạo báo cáo mới
     */
    @Transactional
    public ReportResponse createReport(ReportRequest request) {
        User reporter = getCurrentUser();
        
        // Kiểm tra không tự report bản thân (nếu report AGENT)
        if (request.getTargetType() == ReportTargetType.AGENT 
                && request.getTargetId().equals(reporter.getId())) {
            throw new AppException(ErrorCode.CANNOT_REPORT_SELF);
        }
        
        // Kiểm tra đã report pending chưa
        if (reportRepository.existsByReporterAndTargetTypeAndTargetIdAndStatus(
                reporter, request.getTargetType(), request.getTargetId(), ReportStatus.PENDING)) {
            throw new AppException(ErrorCode.ALREADY_REPORTED);
        }
        
        // Validate target exists
        validateTargetExists(request.getTargetType(), request.getTargetId());
        
        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .build();
        
        report = reportRepository.save(report);
        log.info("Created report {} for {} {} by user {}", 
                report.getId(), request.getTargetType(), request.getTargetId(), reporter.getId());
        
        return mapToResponse(report);
    }

    /**
     * Lấy tất cả báo cáo (Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy báo cáo đang chờ xử lý (Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số báo cáo pending (Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public long countPendingReports() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }

    /**
     * Xử lý báo cáo (Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ReportResponse processReport(Long reportId, ProcessReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(ErrorCode.REPORT_NOT_FOUND));
        
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new AppException(ErrorCode.REPORT_ALREADY_PROCESSED);
        }
        
        report.setStatus(request.getApproved() ? ReportStatus.APPROVED : ReportStatus.REJECTED);
        report.setAdminNote(request.getAdminNote());
        report.setProcessedAt(LocalDateTime.now());
        
        report = reportRepository.save(report);
        log.info("Processed report {} as {} by admin", reportId, report.getStatus());
        
        // Nếu report được duyệt, gửi thông báo cảnh báo cho đối tượng bị report
        if (request.getApproved() && report.getTargetType() == ReportTargetType.AGENT) {
            sendWarningNotification(report);
        }
        
        return mapToResponse(report);
    }

    private void validateTargetExists(ReportTargetType targetType, String targetId) {
        switch (targetType) {
            case AGENT:
                userRepository.findById(targetId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                break;
            case TOUR:
                tourRepository.findById(Long.parseLong(targetId))
                        .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_FOUND));
                break;
            case REVIEW:
                // Can add review validation later
                break;
        }
    }

    private void sendWarningNotification(Report report) {
        try {
            if (report.getTargetType() == ReportTargetType.AGENT) {
                User agent = userRepository.findById(report.getTargetId())
                        .orElse(null);
                if (agent != null) {
                    String message = "Tài khoản của bạn đã nhận được cảnh báo vi phạm.";
                    if (report.getAdminNote() != null && !report.getAdminNote().isEmpty()) {
                        message += " Lý do: " + report.getAdminNote();
                    }
                    notificationService.createNotification(
                            agent,
                            NotificationType.REPORT_WARNING,
                            "Cảnh báo vi phạm",
                            message,
                            report.getId(),
                            "REPORT"
                    );
                }
            }
        } catch (Exception e) {
            log.error("Failed to send warning notification for report {}", report.getId(), e);
        }
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private ReportResponse mapToResponse(Report report) {
        String targetName = getTargetName(report.getTargetType(), report.getTargetId());
        
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterName(getFullName(report.getReporter()))
                .reporterEmail(report.getReporter().getEmail())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .targetName(targetName)
                .reason(report.getReason())
                .status(report.getStatus())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreatedAt())
                .processedAt(report.getProcessedAt())
                .build();
    }

    private String getTargetName(ReportTargetType targetType, String targetId) {
        try {
            switch (targetType) {
                case AGENT:
                    return userRepository.findById(targetId)
                            .map(this::getFullName)
                            .orElse("Unknown Agent");
                case TOUR:
                    return tourRepository.findById(Long.parseLong(targetId))
                            .map(Tour::getName)
                            .orElse("Unknown Tour");
                case REVIEW:
                    return "Review #" + targetId;
                default:
                    return "Unknown";
            }
        } catch (Exception e) {
            return "Unknown";
        }
    }

    private String getFullName(User user) {
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        return user.getUsername();
    }
}
