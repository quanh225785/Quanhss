package com.devteria.identityservice.entity;

import java.time.LocalDateTime;

import com.devteria.identityservice.enums.ReportStatus;
import com.devteria.identityservice.enums.ReportTargetType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "report")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    User reporter;  // Người báo cáo

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReportTargetType targetType;  // Loại đối tượng bị report (AGENT, TOUR, REVIEW...)

    @Column(nullable = false)
    String targetId;  // ID của đối tượng bị report

    @Column(nullable = false, length = 1000)
    String reason;  // Lý do báo cáo

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReportStatus status = ReportStatus.PENDING;

    @Column(length = 500)
    String adminNote;  // Ghi chú của admin khi xử lý

    LocalDateTime createdAt;
    LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ReportStatus.PENDING;
        }
    }
}
