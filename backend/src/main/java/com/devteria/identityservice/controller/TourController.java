package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.TourCreationRequest;
import com.devteria.identityservice.dto.response.TourResponse;
import com.devteria.identityservice.service.TourService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/tours")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TourController {
    TourService tourService;

    /**
     * Create a new tour
     * POST /tours
     */
    @PostMapping
    ApiResponse<TourResponse> createTour(@RequestBody TourCreationRequest request) {
        log.info("Creating tour: {}", request.getName());
        return ApiResponse.<TourResponse>builder()
                .result(tourService.createTour(request))
                .build();
    }

    /**
     * Get all tours created by current user
     * GET /tours
     */
    @GetMapping
    ApiResponse<List<TourResponse>> getMyTours() {
        return ApiResponse.<List<TourResponse>>builder()
                .result(tourService.getMyTours())
                .build();
    }

    /**
     * Get pending tours (Admin only)
     * GET /tours/pending
     */
    @GetMapping("/pending")
    ApiResponse<List<TourResponse>> getPendingTours() {
        return ApiResponse.<List<TourResponse>>builder()
                .result(tourService.getPendingTours())
                .build();
    }

    /**
     * Get all tours including status (Admin only)
     * GET /tours/all
     */
    @GetMapping("/all")
    ApiResponse<List<TourResponse>> getAllTours() {
        return ApiResponse.<List<TourResponse>>builder()
                .result(tourService.getAllTours())
                .build();
    }

    /**
     * Get approved tours (for users)
     * GET /tours/approved
     */
    @GetMapping("/approved")
    ApiResponse<List<TourResponse>> getApprovedTours() {
        return ApiResponse.<List<TourResponse>>builder()
                .result(tourService.getApprovedTours())
                .build();
    }

    /**
     * Get tour by ID
     * GET /tours/{id}
     */
    @GetMapping("/{id}")
    ApiResponse<TourResponse> getTourById(@PathVariable Long id) {
        return ApiResponse.<TourResponse>builder()
                .result(tourService.getTourById(id))
                .build();
    }

    /**
     * Delete tour (soft delete)
     * DELETE /tours/{id}
     */
    @DeleteMapping("/{id}")
    ApiResponse<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ApiResponse.<Void>builder()
                .message("Tour deleted successfully")
                .build();
    }

    /**
     * Approve tour (Admin only)
     * POST /tours/{id}/approve
     */
    @PostMapping("/{id}/approve")
    ApiResponse<TourResponse> approveTour(@PathVariable Long id) {
        log.info("Approving tour: {}", id);
        return ApiResponse.<TourResponse>builder()
                .result(tourService.approveTour(id))
                .build();
    }

    /**
     * Reject tour (Admin only)
     * POST /tours/{id}/reject
     */
    @PostMapping("/{id}/reject")
    ApiResponse<TourResponse> rejectTour(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Rejecting tour: {} with reason: {}", id, reason);
        return ApiResponse.<TourResponse>builder()
                .result(tourService.rejectTour(id, reason))
                .build();
    }

    /**
     * Hide tour (Agent only)
     * POST /tours/{id}/hide
     */
    @PostMapping("/{id}/hide")
    ApiResponse<TourResponse> hideTour(@PathVariable Long id) {
        log.info("Hiding tour: {}", id);
        return ApiResponse.<TourResponse>builder()
                .result(tourService.hideTour(id))
                .build();
    }

    /**
     * Unhide tour (Agent only)
     * POST /tours/{id}/unhide
     */
    @PostMapping("/{id}/unhide")
    ApiResponse<TourResponse> unhideTour(@PathVariable Long id) {
        log.info("Unhiding tour: {}", id);
        return ApiResponse.<TourResponse>builder()
                .result(tourService.unhideTour(id))
                .build();
    }

    /**
     * Search tours with filters (Public - for users)
     * GET /tours/search?keyword=...&minPrice=...&maxPrice=...&numberOfDays=...&vehicle=...&locationId=...
     */
    @GetMapping("/search")
    ApiResponse<List<TourResponse>> searchTours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer numberOfDays,
            @RequestParam(required = false) String vehicle,
            @RequestParam(required = false) Long locationId) {
        log.info("Searching tours with filters - keyword: {}, minPrice: {}, maxPrice: {}, numberOfDays: {}, vehicle: {}, locationId: {}",
                keyword, minPrice, maxPrice, numberOfDays, vehicle, locationId);
        return ApiResponse.<List<TourResponse>>builder()
                .result(tourService.searchTours(keyword, minPrice, maxPrice, numberOfDays, vehicle, locationId))
                .build();
    }
}
