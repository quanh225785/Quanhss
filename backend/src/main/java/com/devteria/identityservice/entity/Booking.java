package com.devteria.identityservice.entity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import com.devteria.identityservice.enums.BookingStatus;
import com.devteria.identityservice.enums.PaymentStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(unique = true, nullable = false)
    String bookingCode;  // VD: "BK-20241215-001"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;  // Người đặt tour

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    Tour tour;  // Tour được đặt (giữ lại để tiện truy vấn)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    Trip trip;  // Chuyến được đặt

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<Participant> participants = new ArrayList<>();  // Danh sách người tham gia

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    BookingStatus status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus paymentStatus;  // PENDING, PAID, REFUNDED

    @Column(nullable = false)
    Double totalPrice;  // Tổng tiền

    String contactPhone;  // Số điện thoại liên hệ

    @Column(columnDefinition = "TEXT")
    String note;  // Ghi chú

    String qrCodeUrl;  // URL to QR code image (S3)

    @Column(nullable = false)
    @Builder.Default
    Boolean reminderSent = false;  // Đã gửi nhắc nhở chuyến đi chưa

    @Column(nullable = false)
    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BookingStatus.PENDING;
        }
        if (paymentStatus == null) {
            paymentStatus = PaymentStatus.PENDING;
        }
        if (reminderSent == null) {
            reminderSent = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to add participant
    public void addParticipant(Participant participant) {
        participants.add(participant);
        participant.setBooking(this);
    }

    // Helper method to get number of participants
    public int getNumberOfParticipants() {
        return participants != null ? participants.size() : 0;
    }
}
