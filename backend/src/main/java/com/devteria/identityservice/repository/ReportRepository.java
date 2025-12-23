package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Report;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.ReportStatus;
import com.devteria.identityservice.enums.ReportTargetType;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findAllByOrderByCreatedAtDesc();
    
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    
    List<Report> findByTargetTypeOrderByCreatedAtDesc(ReportTargetType targetType);
    
    List<Report> findByTargetTypeAndStatusOrderByCreatedAtDesc(ReportTargetType targetType, ReportStatus status);
    
    boolean existsByReporterAndTargetTypeAndTargetIdAndStatus(
            User reporter, ReportTargetType targetType, String targetId, ReportStatus status);
    
    long countByStatus(ReportStatus status);
}
