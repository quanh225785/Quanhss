package com.devteria.identityservice.dto.request;

import lombok.Builder;
import lombok.Data;

/**
 * DTO để truyền dữ liệu email cho booking success
 * Được sử dụng thay cho entity Booking trong async method để tránh LazyInitializationException
 */
@Data
@Builder
public class BookingEmailRequest {
    private String recipientEmail;
    private String recipientName;
    private String bookingCode;
    private String tourName;
    private Double totalPrice;
    private String startDate;  // Đã format sẵn
    private int numberOfParticipants;
    private String qrCodeUrl;
}
