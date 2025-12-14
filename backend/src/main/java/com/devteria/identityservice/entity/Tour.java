package com.devteria.identityservice.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import com.devteria.identityservice.enums.TourStatus;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    Double price;

    @Column(nullable = false)
    @Builder.Default
    Integer numberOfDays = 1;  // Number of days for the tour (default 1)

    @Column(nullable = false)
    String vehicle;  // car, motorcycle

    @Column(nullable = false)
    Boolean isOptimized;  // true if TSP was used

    Double totalDistance;  // in meters

    Long totalTime;  // in milliseconds

    @Column(columnDefinition = "TEXT")
    String routePolyline;  // encoded polyline from Vietmap

    @Column(columnDefinition = "TEXT")
    String routeInstructions;  // JSON string of instructions

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    User createdBy;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    List<TourPoint> tourPoints;

    @Column(nullable = false)
    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TourStatus status;  // PENDING, APPROVED, REJECTED

    @Column(columnDefinition = "TEXT")
    String rejectionReason;  // Reason if rejected by admin

    @Column(nullable = false)
    Boolean isActive;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
        status = TourStatus.PENDING;  // New tours need approval
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
