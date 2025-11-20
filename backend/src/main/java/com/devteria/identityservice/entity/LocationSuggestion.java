package com.devteria.identityservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.devteria.identityservice.enums.SuggestionStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class LocationSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    String address;

    @Column(columnDefinition = "TEXT")
    String description;

    // Vietmap API fields
    String refId; // Reference ID from Vietmap API
    Double latitude;
    Double longitude;

    // Administrative information from Vietmap
    Integer cityId;
    String cityName;
    Integer districtId;
    String districtName;
    Integer wardId;
    String wardName;
    String houseNumber;
    String streetName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    SuggestionStatus status = SuggestionStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_by_user_id", nullable = false)
    User suggestedBy;

    @Column(nullable = false)
    LocalDateTime createdAt;

    LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    User reviewedBy;

    String rejectionReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
