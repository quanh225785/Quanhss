package com.devteria.identityservice.enums;

public enum TourStatus {
    PENDING,    // Waiting for admin approval
    APPROVED,   // Approved by admin, visible to users
    REJECTED,   // Rejected by admin
    HIDDEN      // Hidden by agent, not visible to users
}
