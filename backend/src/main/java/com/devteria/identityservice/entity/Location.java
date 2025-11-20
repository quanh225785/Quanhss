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
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    String address;

    @Column(columnDefinition = "TEXT")
    String description;

    // Vietmap API fields
    @Column(unique = true)
    String refId; // Reference ID from Vietmap API

    @Column(nullable = false)
    Double latitude;

    @Column(nullable = false)
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

    @Column(nullable = false)
    LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    User createdBy;

    // Link back to the suggestion that was approved (optional, for tracking)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_from_suggestion_id")
    LocationSuggestion approvedFromSuggestion;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
