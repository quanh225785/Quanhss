package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.LocationSuggestionRequest;
import com.devteria.identityservice.dto.response.LocationResponse;
import com.devteria.identityservice.dto.response.LocationSuggestionResponse;
import com.devteria.identityservice.entity.Location;
import com.devteria.identityservice.entity.LocationSuggestion;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.SuggestionStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.LocationMapper;
import com.devteria.identityservice.repository.LocationRepository;
import com.devteria.identityservice.repository.LocationSuggestionRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationSuggestionService {
    LocationSuggestionRepository locationSuggestionRepository;
    LocationRepository locationRepository;
    UserRepository userRepository;
    LocationMapper locationMapper;

    /**
     * UC_10: Agent/Customer submits a location suggestion
     */
    @Transactional
    public LocationSuggestionResponse createLocationSuggestion(LocationSuggestionRequest request) {
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Validate coordinates (already validated by @NotNull, but double check)
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new AppException(ErrorCode.COORDINATES_REQUIRED);
        }

        // Map request to entity
        LocationSuggestion suggestion = locationMapper.toLocationSuggestion(request);
        suggestion.setSuggestedBy(user);
        suggestion.setStatus(SuggestionStatus.PENDING);

        // Save suggestion
        suggestion = locationSuggestionRepository.save(suggestion);
        log.info("Location suggestion created by user: {} with id: {} at coordinates ({}, {})",
                username, suggestion.getId(), suggestion.getLatitude(), suggestion.getLongitude());

        return locationMapper.toLocationSuggestionResponse(suggestion);
    }

    /**
     * UC_11: Admin approves a location suggestion
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public LocationResponse approveLocationSuggestion(Long suggestionId) {
        // Get current authenticated admin
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Find and validate suggestion
        LocationSuggestion suggestion = locationSuggestionRepository
                .findById(suggestionId)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_SUGGESTION_NOT_FOUND));

        // Check if already processed
        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new AppException(ErrorCode.LOCATION_SUGGESTION_ALREADY_PROCESSED);
        }

        // Check if location name already exists
        if (locationRepository.existsByName(suggestion.getName())) {
            throw new AppException(ErrorCode.LOCATION_NAME_ALREADY_EXISTS);
        }

        // Create Location from suggestion
        Location location = locationMapper.toLocation(suggestion);
        location.setCreatedBy(admin);
        location.setApprovedFromSuggestion(suggestion);

        // Normalize empty refId to null to avoid unique constraint violation
        if (location.getRefId() != null && location.getRefId().trim().isEmpty()) {
            location.setRefId(null);
        }

        // Save location
        location = locationRepository.save(location);

        // Update suggestion status
        suggestion.setStatus(SuggestionStatus.APPROVED);
        suggestion.setReviewedBy(admin);
        suggestion.setReviewedAt(LocalDateTime.now());
        locationSuggestionRepository.save(suggestion);

        log.info("Location suggestion {} approved by admin: {}", suggestionId, username);

        return locationMapper.toLocationResponse(location);
    }

    /**
     * Admin rejects a location suggestion
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public LocationSuggestionResponse rejectLocationSuggestion(Long suggestionId, String reason) {
        // Get current authenticated admin
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Find and validate suggestion
        LocationSuggestion suggestion = locationSuggestionRepository
                .findById(suggestionId)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_SUGGESTION_NOT_FOUND));

        // Check if already processed
        if (suggestion.getStatus() != SuggestionStatus.PENDING) {
            throw new AppException(ErrorCode.LOCATION_SUGGESTION_ALREADY_PROCESSED);
        }

        // Update suggestion status
        suggestion.setStatus(SuggestionStatus.REJECTED);
        suggestion.setReviewedBy(admin);
        suggestion.setReviewedAt(LocalDateTime.now());
        suggestion.setRejectionReason(reason);
        suggestion = locationSuggestionRepository.save(suggestion);

        log.info("Location suggestion {} rejected by admin: {}", suggestionId, username);

        return locationMapper.toLocationSuggestionResponse(suggestion);
    }

    /**
     * Get all pending suggestions (for Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<LocationSuggestionResponse> getPendingSuggestions() {
        return locationSuggestionRepository.findByStatus(SuggestionStatus.PENDING).stream()
                .map(locationMapper::toLocationSuggestionResponse)
                .toList();
    }

    /**
     * Get all suggestions with any status (for Admin)
     */
    @PreAuthorize("hasRole('ADMIN')")
    public List<LocationSuggestionResponse> getAllSuggestions() {
        return locationSuggestionRepository.findAll().stream()
                .map(locationMapper::toLocationSuggestionResponse)
                .toList();
    }

    /**
     * Get my suggestions (for Agent/Customer)
     */
    public List<LocationSuggestionResponse> getMySuggestions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return locationSuggestionRepository.findBySuggestedBy_Id(user.getId()).stream()
                .map(locationMapper::toLocationSuggestionResponse)
                .toList();
    }

    /**
     * Get suggestion by ID
     */
    public LocationSuggestionResponse getSuggestionById(Long suggestionId) {
        LocationSuggestion suggestion = locationSuggestionRepository
                .findById(suggestionId)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_SUGGESTION_NOT_FOUND));

        return locationMapper.toLocationSuggestionResponse(suggestion);
    }

    /**
     * Get all approved locations
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getAllLocations() {
        List<Location> locations = locationRepository.findAll();

        // Force load lazy relationships to avoid LazyInitializationException
        locations.forEach(location -> {
            if (location.getCreatedBy() != null) {
                location.getCreatedBy().getUsername(); // Force load user
            }
            if (location.getApprovedFromSuggestion() != null) {
                location.getApprovedFromSuggestion().getId(); // Force load suggestion
            }
        });

        return locations.stream()
                .map(locationMapper::toLocationResponse)
                .toList();
    }

    /**
     * Get locations by city name
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getLocationsByCity(String cityName) {
        List<Location> locations = locationRepository.findByCityNameContainingIgnoreCase(cityName);
        return locations.stream()
                .map(locationMapper::toLocationResponse)
                .toList();
    }

    /**
     * Get location by ID
     */
    public LocationResponse getLocationById(Long locationId) {
        Location location = locationRepository
                .findById(locationId)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

        return locationMapper.toLocationResponse(location);
    }

    /**
     * Get distinct city names for filter dropdown
     */
    public List<String> getDistinctCityNames() {
        return locationRepository.findDistinctCityNames();
    }

    /**
     * Admin creates a location directly (auto-approved)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public LocationResponse createLocationDirectly(LocationSuggestionRequest request) {
        // Get current authenticated admin
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Validate coordinates
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new AppException(ErrorCode.COORDINATES_REQUIRED);
        }

        // Check if location name already exists
        if (locationRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.LOCATION_NAME_ALREADY_EXISTS);
        }

        // Normalize empty refId to null to avoid unique constraint violation
        String normalizedRefId = (request.getRefId() != null && request.getRefId().trim().isEmpty())
                ? null
                : request.getRefId();

        // Create Location entity directly (bypass suggestion)
        Location location = Location.builder()
                .name(request.getName())
                .address(request.getAddress())
                .description(request.getDescription())
                .refId(normalizedRefId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .cityId(request.getCityId())
                .cityName(request.getCityName())
                .districtId(request.getDistrictId())
                .districtName(request.getDistrictName())
                .wardId(request.getWardId())
                .wardName(request.getWardName())
                .houseNumber(request.getHouseNumber())
                .streetName(request.getStreetName())
                .createdBy(admin)
                .approvedFromSuggestion(null) // No suggestion, created directly by admin
                .build();

        // Save location
        location = locationRepository.save(location);
        log.info("Location created directly by admin: {} with id: {} at coordinates ({}, {})",
                username, location.getId(), location.getLatitude(), location.getLongitude());

        return locationMapper.toLocationResponse(location);
    }
}
