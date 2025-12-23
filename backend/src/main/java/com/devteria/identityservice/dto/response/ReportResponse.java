package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;

import com.devteria.identityservice.enums.ReportStatus;
import com.devteria.identityservice.enums.ReportTargetType;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReportResponse {
    Long id;
    
    // Reporter info
    String reporterId;
    String reporterName;
    String reporterEmail;
    
    // Target info
    ReportTargetType targetType;
    String targetId;
    String targetName;  // Tên đối tượng bị report (agent name, tour name, etc.)
    
    String reason;
    ReportStatus status;
    String adminNote;
    
    LocalDateTime createdAt;
    LocalDateTime processedAt;
}
