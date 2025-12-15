package com.devteria.identityservice.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    Long id;
    String bookingCode;
    
    // Tour info
    Long tourId;
    String tourName;
    String tourImageUrl;
    LocalDateTime tourStartDate;
    LocalDateTime tourEndDate;
    Integer tourNumberOfDays;
    
    // User info (người đặt)
    String userName;
    String userEmail;
    
    // Participants
    List<String> participantNames;
    Integer numberOfParticipants;
    
    // Booking details
    String status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED
    String paymentStatus;  // PENDING, PAID, REFUNDED
    Double totalPrice;
    String contactPhone;
    String note;
    String qrCodeUrl;
    
    LocalDateTime createdAt;
}
