package com.devteria.identityservice.entity;

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
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;

    @Column(nullable = false)
    String fullName;  // Họ tên đầy đủ của người tham gia

    // Có thể mở rộng sau:
    // String dateOfBirth;
    // String idNumber;  // CMND/CCCD
    // String phoneNumber;
}
