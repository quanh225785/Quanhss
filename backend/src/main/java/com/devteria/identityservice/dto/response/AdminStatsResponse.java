package com.devteria.identityservice.dto.response;

import java.util.Map;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminStatsResponse {
    // User Statistics
    Long totalUsers;
    Long totalGuests;
    Long totalAgents;
    Long totalAdmins;
    
    // Tour Statistics
    Long totalTours;
    Long pendingTours;
    Long approvedTours;
    Long rejectedTours;
    Long hiddenTours;
    
    // Booking Statistics
    Long totalBookings;
    Long pendingBookings;
    Long confirmedBookings;
    Long completedBookings;
    Long cancelledBookings;
    
    // Revenue Statistics
    Double totalRevenue;
    Double thisMonthRevenue;
    
    // Monthly Trends (Key: "YYYY-MM")
    Map<String, Long> usersByMonth;
    Map<String, Long> toursByMonth;
    Map<String, Long> bookingsByMonth;
    Map<String, Double> revenueByMonth;
}
