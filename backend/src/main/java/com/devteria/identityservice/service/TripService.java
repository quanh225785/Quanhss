package com.devteria.identityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.TripCreationRequest;
import com.devteria.identityservice.dto.request.TripUpdateRequest;
import com.devteria.identityservice.dto.response.TripResponse;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.Trip;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.TourStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.TripRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TripService {
    
    TripRepository tripRepository;
    TourRepository tourRepository;
    UserRepository userRepository;
    
    /**
     * Create a new trip for an approved tour
     * Only the tour owner can create trips
     */
    @Transactional
    public TripResponse createTrip(TripCreationRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get tour
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        // Check if user is the tour owner
        if (!tour.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the tour owner can create trips");
        }
        
        // Check if tour is approved
        if (tour.getStatus() != TourStatus.APPROVED) {
            throw new RuntimeException("Can only create trips for approved tours");
        }
        
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        
        // Create trip
        Trip trip = Trip.builder()
                .tour(tour)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .currentParticipants(0)
                .isActive(true)
                .build();
        
        trip = tripRepository.save(trip);
        
        log.info("Trip created for tour: {} by user: {}", tour.getName(), username);
        
        return mapToResponse(trip);
    }
    
    /**
     * Update an existing trip
     * Only the tour owner can update trips
     */
    @Transactional
    public TripResponse updateTrip(Long id, TripUpdateRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get trip
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        // Check if user is the tour owner
        if (!trip.getTour().getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the tour owner can update trips");
        }
        
        // Update fields if provided
        if (request.getStartDate() != null) {
            trip.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            trip.setEndDate(request.getEndDate());
        }
        if (request.getMaxParticipants() != null) {
            // Cannot set max below current
            if (request.getMaxParticipants() < trip.getCurrentParticipants()) {
                throw new RuntimeException("Cannot set max participants below current count");
            }
            trip.setMaxParticipants(request.getMaxParticipants());
        }
        if (request.getIsActive() != null) {
            trip.setIsActive(request.getIsActive());
        }
        
        // Validate dates
        if (trip.getEndDate().isBefore(trip.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        
        trip = tripRepository.save(trip);
        
        log.info("Trip updated: {} for tour: {}", id, trip.getTour().getName());
        
        return mapToResponse(trip);
    }
    
    /**
     * Delete a trip
     * Only the tour owner can delete trips
     * Cannot delete if there are bookings
     */
    @Transactional
    public void deleteTrip(Long id) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get trip
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        // Check if user is the tour owner
        if (!trip.getTour().getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Only the tour owner can delete trips");
        }
        
        // Check if there are any participants
        if (trip.getCurrentParticipants() > 0) {
            throw new RuntimeException("Cannot delete trip with existing bookings");
        }
        
        tripRepository.delete(trip);
        
        log.info("Trip deleted: {} for tour: {}", id, trip.getTour().getName());
    }
    
    /**
     * Get all trips for a tour
     */
    @Transactional(readOnly = true)
    public List<TripResponse> getTripsForTour(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        return tripRepository.findByTourOrderByStartDateAsc(tour)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active trips for a tour (for users to book)
     */
    @Transactional(readOnly = true)
    public List<TripResponse> getActiveTripsForTour(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        return tripRepository.findByTourAndIsActiveTrueOrderByStartDateAsc(tour)
                .stream()
                .filter(trip -> !trip.isFull())  // Only show trips with available slots
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a single trip by ID
     */
    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        return mapToResponse(trip);
    }
    
    /**
     * Map Trip entity to TripResponse DTO
     */
    private TripResponse mapToResponse(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .tourId(trip.getTour().getId())
                .tourName(trip.getTour().getName())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .maxParticipants(trip.getMaxParticipants())
                .currentParticipants(trip.getCurrentParticipants())
                .availableSlots(trip.getAvailableSlots())
                .isActive(trip.getIsActive())
                .isFull(trip.isFull())
                .createdAt(trip.getCreatedAt())
                .build();
    }
}
