package com.devteria.identityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Find reviews by tour ID
    List<Review> findByTourIdOrderByCreatedAtDesc(Long tourId);
    
    // Find reviews for tours created by a specific agent
    List<Review> findByTour_CreatedByIdOrderByCreatedAtDesc(String agentId);
    
    // Find reviews by user ID
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Find review by booking ID
    Optional<Review> findByBookingId(Long bookingId);
    
    // Check if review exists for a booking
    boolean existsByBookingId(Long bookingId);
    
    // Calculate average rating for a tour
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tour.id = :tourId")
    Double findAverageRatingByTourId(@Param("tourId") Long tourId);
    
    // Count reviews for a tour
    @Query("SELECT COUNT(r) FROM Review r WHERE r.tour.id = :tourId")
    Integer countByTourId(@Param("tourId") Long tourId);
}
