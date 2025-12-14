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
public class TourPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    Tour tour;

    // Location is optional - can be null for free activities like "Rest", "Lunch", etc.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = true)
    Location location;

    @Column(nullable = false)
    Integer orderIndex;  // position in tour (0, 1, 2...)

    @Column(columnDefinition = "TEXT")
    String note;  // optional note for this stop

    Integer stayDurationMinutes;  // suggested stay time at this location

    @Column(nullable = false)
    @Builder.Default
    Integer dayNumber = 1;  // Which day of the tour (1, 2, 3...)

    String startTime;  // Time slot, e.g., "08:00", "09:30", "14:00"

    @Column(columnDefinition = "TEXT")
    String activity;  // What to do at this location, e.g., "Ăn sáng tại Mì Quảng 1A"

    String imageUrl;  // S3 URL for tour point image
}
