package com.devteria.identityservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.TripCreationRequest;
import com.devteria.identityservice.dto.request.TripUpdateRequest;
import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.TripResponse;
import com.devteria.identityservice.service.TripService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TripController {
    
    TripService tripService;
    
    /**
     * Create a new trip for an approved tour
     * Only tour owner (agent) can create trips
     */
    @PostMapping
    public ApiResponse<TripResponse> createTrip(@Valid @RequestBody TripCreationRequest request) {
        log.info("Creating trip for tour: {}", request.getTourId());
        return ApiResponse.<TripResponse>builder()
                .result(tripService.createTrip(request))
                .build();
    }
    
    /**
     * Update an existing trip
     */
    @PutMapping("/{id}")
    public ApiResponse<TripResponse> updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody TripUpdateRequest request) {
        log.info("Updating trip: {}", id);
        return ApiResponse.<TripResponse>builder()
                .result(tripService.updateTrip(id, request))
                .build();
    }
    
    /**
     * Delete a trip
     */
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTrip(@PathVariable Long id) {
        log.info("Deleting trip: {}", id);
        tripService.deleteTrip(id);
        return ApiResponse.<String>builder()
                .result("Trip deleted successfully")
                .build();
    }
    
    /**
     * Get a single trip by ID
     */
    @GetMapping("/{id}")
    public ApiResponse<TripResponse> getTripById(@PathVariable Long id) {
        return ApiResponse.<TripResponse>builder()
                .result(tripService.getTripById(id))
                .build();
    }
    
    /**
     * Get all trips for a tour (for agent/owner)
     */
    @GetMapping("/tour/{tourId}")
    public ApiResponse<List<TripResponse>> getTripsForTour(@PathVariable Long tourId) {
        return ApiResponse.<List<TripResponse>>builder()
                .result(tripService.getTripsForTour(tourId))
                .build();
    }
    
    /**
     * Get active trips with available slots for a tour (for users to book)
     */
    @GetMapping("/tour/{tourId}/available")
    public ApiResponse<List<TripResponse>> getAvailableTripsForTour(@PathVariable Long tourId) {
        return ApiResponse.<List<TripResponse>>builder()
                .result(tripService.getActiveTripsForTour(tourId))
                .build();
    }
}
