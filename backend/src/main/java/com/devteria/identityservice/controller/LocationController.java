package com.devteria.identityservice.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.LocationSuggestionRequest;
import com.devteria.identityservice.dto.response.LocationResponse;
import com.devteria.identityservice.dto.response.LocationSuggestionResponse;
import com.devteria.identityservice.service.LocationSuggestionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationController {
    LocationSuggestionService locationSuggestionService;

    /**
     * UC_10: Agent/Customer submits a location suggestion
     * POST /locations/suggestions
     */
    @PostMapping("/suggestions")
    ApiResponse<LocationSuggestionResponse> createLocationSuggestion(
            @RequestBody @Valid LocationSuggestionRequest request) {
        return ApiResponse.<LocationSuggestionResponse>builder()
                .result(locationSuggestionService.createLocationSuggestion(request))
                .build();
    }

    /**
     * UC_11: Admin approves a location suggestion
     * POST /locations/suggestions/{suggestionId}/approve
     */
    @PostMapping("/suggestions/{suggestionId}/approve")
    ApiResponse<LocationResponse> approveLocationSuggestion(@PathVariable Long suggestionId) {
        return ApiResponse.<LocationResponse>builder()
                .result(locationSuggestionService.approveLocationSuggestion(suggestionId))
                .build();
    }

    /**
     * Admin rejects a location suggestion
     * POST /locations/suggestions/{suggestionId}/reject
     */
    @PostMapping("/suggestions/{suggestionId}/reject")
    ApiResponse<LocationSuggestionResponse> rejectLocationSuggestion(
            @PathVariable Long suggestionId, @RequestParam(required = false) String reason) {
        return ApiResponse.<LocationSuggestionResponse>builder()
                .result(locationSuggestionService.rejectLocationSuggestion(suggestionId, reason))
                .build();
    }

    /**
     * Get all pending suggestions (Admin only)
     * GET /locations/suggestions/pending
     */
    @GetMapping("/suggestions/pending")
    ApiResponse<List<LocationSuggestionResponse>> getPendingSuggestions() {
        return ApiResponse.<List<LocationSuggestionResponse>>builder()
                .result(locationSuggestionService.getPendingSuggestions())
                .build();
    }

    /**
     * Get all suggestions (Admin only)
     * GET /locations/suggestions
     */
    @GetMapping("/suggestions")
    ApiResponse<List<LocationSuggestionResponse>> getAllSuggestions() {
        return ApiResponse.<List<LocationSuggestionResponse>>builder()
                .result(locationSuggestionService.getAllSuggestions())
                .build();
    }

    /**
     * Get my suggestions (Agent/Customer)
     * GET /locations/suggestions/my
     */
    @GetMapping("/suggestions/my")
    ApiResponse<List<LocationSuggestionResponse>> getMySuggestions() {
        return ApiResponse.<List<LocationSuggestionResponse>>builder()
                .result(locationSuggestionService.getMySuggestions())
                .build();
    }

    /**
     * Get suggestion by ID
     * GET /locations/suggestions/{suggestionId}
     */
    @GetMapping("/suggestions/{suggestionId}")
    ApiResponse<LocationSuggestionResponse> getSuggestionById(@PathVariable Long suggestionId) {
        return ApiResponse.<LocationSuggestionResponse>builder()
                .result(locationSuggestionService.getSuggestionById(suggestionId))
                .build();
    }

    /**
     * Get all approved locations
     * GET /locations
     */
    @GetMapping
    ApiResponse<List<LocationResponse>> getAllLocations() {
        return ApiResponse.<List<LocationResponse>>builder()
                .result(locationSuggestionService.getAllLocations())
                .build();
    }

    /**
     * Get location by ID
     * GET /locations/{locationId}
     */
    @GetMapping("/{locationId}")
    ApiResponse<LocationResponse> getLocationById(@PathVariable Long locationId) {
        return ApiResponse.<LocationResponse>builder()
                .result(locationSuggestionService.getLocationById(locationId))
                .build();
    }

    /**
     * Admin creates a location directly (auto-approved, no suggestion needed)
     * POST /locations
     */
    @PostMapping
    ApiResponse<LocationResponse> createLocationDirectly(@RequestBody @Valid LocationSuggestionRequest request) {
        return ApiResponse.<LocationResponse>builder()
                .result(locationSuggestionService.createLocationDirectly(request))
                .build();
    }
}
