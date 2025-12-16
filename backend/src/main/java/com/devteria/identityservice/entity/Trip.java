package com.devteria.identityservice.entity;

import java.time.LocalDateTime;

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
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    Tour tour;  // Tour mà chuyến này thuộc về

    @Column(nullable = false)
    LocalDateTime startDate;  // Ngày bắt đầu chuyến

    @Column(nullable = false)
    LocalDateTime endDate;  // Ngày kết thúc chuyến

    @Column(nullable = false)
    Integer maxParticipants;  // Số người tối đa

    @Column(nullable = false)
    @Builder.Default
    Integer currentParticipants = 0;  // Số người đã đăng ký

    @Column(nullable = false)
    @Builder.Default
    Boolean isActive = true;  // Còn mở đăng ký không

    @Column(nullable = false)
    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (currentParticipants == null) {
            currentParticipants = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to check available slots
    public int getAvailableSlots() {
        return maxParticipants - (currentParticipants != null ? currentParticipants : 0);
    }

    // Helper method to check if trip is full
    public boolean isFull() {
        return getAvailableSlots() <= 0;
    }
}
