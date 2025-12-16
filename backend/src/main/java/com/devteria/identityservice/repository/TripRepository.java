package com.devteria.identityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    // Get all trips for a tour, ordered by start date
    List<Trip> findByTourOrderByStartDateAsc(Tour tour);
    
    // Get active trips for a tour (for users to book)
    List<Trip> findByTourAndIsActiveTrueOrderByStartDateAsc(Tour tour);
    
    // Find trip by id and tour (for validation)
    Optional<Trip> findByIdAndTour(Long id, Tour tour);
    
    // Count trips for a tour
    long countByTour(Tour tour);
    
    // Count active trips for a tour
    long countByTourAndIsActiveTrue(Tour tour);
}
