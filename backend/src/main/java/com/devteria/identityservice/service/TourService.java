package com.devteria.identityservice.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.request.TourCreationRequest;
import com.devteria.identityservice.dto.response.TourResponse;
import com.devteria.identityservice.dto.response.VietmapRouteResponse;
import com.devteria.identityservice.entity.Location;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.TourPoint;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.TourStatus;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.LocationRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TourService {
    TourRepository tourRepository;
    LocationRepository locationRepository;
    UserRepository userRepository;
    VietmapService vietmapService;
    ObjectMapper objectMapper;

    @Transactional
    public TourResponse createTour(TourCreationRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Validate points - need at least 1 point
        if (request.getPoints() == null || request.getPoints().isEmpty()) {
            throw new RuntimeException("Tour must have at least 1 point or activity");
        }

        // Separate location-based points and free activities
        List<TourCreationRequest.TourPointRequest> locationPoints = request.getPoints().stream()
                .filter(p -> p.getLocationId() != null)
                .collect(Collectors.toList());
        
        // Fetch locations for location-based points
        Map<Long, Location> locationMap = new java.util.HashMap<>();
        for (TourCreationRequest.TourPointRequest point : locationPoints) {
            if (!locationMap.containsKey(point.getLocationId())) {
                Location location = locationRepository.findById(point.getLocationId())
                        .orElseThrow(() -> new RuntimeException("Location not found: " + point.getLocationId()));
                locationMap.put(point.getLocationId(), location);
            }
        }

        // Build coordinate strings for routing API (only from location-based points)
        List<String> pointStrings = locationPoints.stream()
                .map(p -> {
                    Location loc = locationMap.get(p.getLocationId());
                    return loc.getLatitude() + "," + loc.getLongitude();
                })
                .collect(Collectors.toList());

        // Get route from Vietmap API (only if we have at least 2 location-based points)
        VietmapRouteResponse routeResponse = null;
        String vehicle = request.getVehicle() != null ? request.getVehicle() : "car";
        boolean useOptimization = request.getUseOptimization() != null && request.getUseOptimization();
        boolean roundtrip = request.getRoundtrip() != null && request.getRoundtrip();

        if (pointStrings.size() >= 2) {
            if (useOptimization) {
                routeResponse = vietmapService.getTspRoute(pointStrings, vehicle, roundtrip);
            } else {
                routeResponse = vietmapService.getRoute(pointStrings, vehicle);
            }
        }

        // Extract route data
        String polyline = null;
        Double distance = null;
        Long time = null;
        String instructionsJson = null;

        if (routeResponse != null && routeResponse.getPaths() != null && !routeResponse.getPaths().isEmpty()) {
            VietmapRouteResponse.RoutePath path = routeResponse.getPaths().get(0);
            polyline = path.getPoints();
            distance = path.getDistance();
            time = path.getTime();

            if (path.getInstructions() != null) {
                try {
                    instructionsJson = objectMapper.writeValueAsString(path.getInstructions());
                } catch (JsonProcessingException e) {
                    log.warn("Failed to serialize instructions", e);
                }
            }
        }

        // Create tour entity
        int numberOfDays = request.getNumberOfDays() != null ? request.getNumberOfDays() : 1;
        Tour tour = Tour.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .numberOfDays(numberOfDays)
                .vehicle(vehicle)
                .isOptimized(useOptimization)
                .totalDistance(distance)
                .totalTime(time)
                .routePolyline(polyline)
                .routeInstructions(instructionsJson)
                .imageUrl(request.getImageUrl())  // S3 image URL
                .createdBy(user)
                .tourPoints(new ArrayList<>())
                .build();

        // Create tour points (both location-based and free activities)
        for (int i = 0; i < request.getPoints().size(); i++) {
            TourCreationRequest.TourPointRequest pointReq = request.getPoints().get(i);
            
            // Get location if locationId is provided
            Location location = pointReq.getLocationId() != null 
                    ? locationMap.get(pointReq.getLocationId()) 
                    : null;

            TourPoint tourPoint = TourPoint.builder()
                    .tour(tour)
                    .location(location)  // Can be null for free activities
                    .orderIndex(pointReq.getOrderIndex() != null ? pointReq.getOrderIndex() : i)
                    .note(pointReq.getNote())
                    .stayDurationMinutes(pointReq.getStayDurationMinutes())
                    // Itinerary fields
                    .dayNumber(pointReq.getDayNumber() != null ? pointReq.getDayNumber() : 1)
                    .startTime(pointReq.getStartTime())
                    .activity(pointReq.getActivity())
                    .imageUrl(pointReq.getImageUrl())  // S3 image URL
                    .build();

            tour.getTourPoints().add(tourPoint);
        }

        // Save and return
        tour = tourRepository.save(tour);
        return mapToResponse(tour);
    }

    public List<TourResponse> getMyTours() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return tourRepository.findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));
        return mapToResponse(tour);
    }

    @Transactional
    public void deleteTour(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // Verify ownership
        if (!tour.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to delete this tour");
        }

        tour.setIsActive(false);
        tourRepository.save(tour);
    }

    // Admin: Get all pending tours
    public List<TourResponse> getPendingTours() {
        return tourRepository.findAll().stream()
                .filter(tour -> tour.getStatus() == TourStatus.PENDING && tour.getIsActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: Get all tours (any status)
    public List<TourResponse> getAllTours() {
        return tourRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: Approve tour
    @Transactional
    public TourResponse approveTour(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (tour.getStatus() != TourStatus.PENDING) {
            throw new RuntimeException("Only pending tours can be approved");
        }

        tour.setStatus(TourStatus.APPROVED);
        tour = tourRepository.save(tour);
        
        log.info("Tour {} approved by admin", id);
        return mapToResponse(tour);
    }

    // Admin: Reject tour
    @Transactional
    public TourResponse rejectTour(Long id, String reason) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (tour.getStatus() != TourStatus.PENDING) {
            throw new RuntimeException("Only pending tours can be rejected");
        }

        tour.setStatus(TourStatus.REJECTED);
        tour.setRejectionReason(reason);
        tour = tourRepository.save(tour);
        
        log.info("Tour {} rejected by admin. Reason: {}", id, reason);
        return mapToResponse(tour);
    }

    // User: Get approved tours only
    public List<TourResponse> getApprovedTours() {
        return tourRepository.findAll().stream()
                .filter(tour -> tour.getStatus() == TourStatus.APPROVED && tour.getIsActive())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Agent: Hide tour (change status to HIDDEN)
    @Transactional
    public TourResponse hideTour(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // Verify ownership
        if (!tour.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to hide this tour");
        }

        // Only approved tours can be hidden
        if (tour.getStatus() != TourStatus.APPROVED) {
            throw new RuntimeException("Only approved tours can be hidden");
        }

        tour.setStatus(TourStatus.HIDDEN);
        tour = tourRepository.save(tour);
        
        log.info("Tour {} hidden by agent {}", id, username);
        return mapToResponse(tour);
    }

    // Agent: Unhide tour (change status back to APPROVED)
    @Transactional
    public TourResponse unhideTour(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // Verify ownership
        if (!tour.getCreatedBy().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to unhide this tour");
        }

        // Only hidden tours can be unhidden
        if (tour.getStatus() != TourStatus.HIDDEN) {
            throw new RuntimeException("Only hidden tours can be unhidden");
        }

        tour.setStatus(TourStatus.APPROVED);
        tour = tourRepository.save(tour);
        
        log.info("Tour {} unhidden by agent {}", id, username);
        return mapToResponse(tour);
    }

    private TourResponse mapToResponse(Tour tour) {
        List<TourResponse.TourPointResponse> pointResponses = tour.getTourPoints().stream()
                .map(point -> {
                    Location loc = point.getLocation();
                    return TourResponse.TourPointResponse.builder()
                            .id(point.getId())
                            .orderIndex(point.getOrderIndex())
                            .note(point.getNote())
                            .stayDurationMinutes(point.getStayDurationMinutes())
                            // Itinerary fields
                            .dayNumber(point.getDayNumber())
                            .startTime(point.getStartTime())
                            .activity(point.getActivity())
                            .imageUrl(point.getImageUrl())  // S3 image URL
                            // Location details (can be null for free activities)
                            .locationId(loc != null ? loc.getId() : null)
                            .locationName(loc != null ? loc.getName() : null)
                            .locationAddress(loc != null ? loc.getAddress() : null)
                            .latitude(loc != null ? loc.getLatitude() : null)
                            .longitude(loc != null ? loc.getLongitude() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return TourResponse.builder()
                .id(tour.getId())
                .name(tour.getName())
                .description(tour.getDescription())
                .price(tour.getPrice())
                .numberOfDays(tour.getNumberOfDays())
                .vehicle(tour.getVehicle())
                .isOptimized(tour.getIsOptimized())
                .totalDistance(tour.getTotalDistance())
                .totalTime(tour.getTotalTime())
                .routePolyline(tour.getRoutePolyline())
                .imageUrl(tour.getImageUrl())  // S3 image URL
                .points(pointResponses)
                .createdByUsername(tour.getCreatedBy().getUsername())
                .createdAt(tour.getCreatedAt())
                .isActive(tour.getIsActive())
                .status(tour.getStatus().name())
                .rejectionReason(tour.getRejectionReason())
                .build();
    }
}
