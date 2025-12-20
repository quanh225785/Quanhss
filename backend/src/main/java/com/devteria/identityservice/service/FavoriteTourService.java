package com.devteria.identityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.dto.response.TourResponse;
import com.devteria.identityservice.entity.FavoriteTour;
import com.devteria.identityservice.entity.Location;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.repository.FavoriteTourRepository;
import com.devteria.identityservice.repository.ReviewRepository;
import com.devteria.identityservice.repository.TourRepository;
import com.devteria.identityservice.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FavoriteTourService {
    FavoriteTourRepository favoriteTourRepository;
    TourRepository tourRepository;
    UserRepository userRepository;
    ReviewRepository reviewRepository;

    private User getCurrentUser() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Transactional
    public void addFavorite(Long tourId) {
        User user = getCurrentUser();
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_FOUND));
        
        // Check if already favorite
        if (favoriteTourRepository.existsByUserAndTour(user, tour)) {
            log.info("Tour {} is already in favorites for user {}", tourId, user.getUsername());
            return;
        }
        
        FavoriteTour favoriteTour = FavoriteTour.builder()
                .user(user)
                .tour(tour)
                .build();
        
        favoriteTourRepository.save(favoriteTour);
        log.info("Added tour {} to favorites for user {}", tourId, user.getUsername());
    }

    @Transactional
    public void removeFavorite(Long tourId) {
        User user = getCurrentUser();
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_FOUND));
        
        favoriteTourRepository.deleteByUserAndTour(user, tour);
        log.info("Removed tour {} from favorites for user {}", tourId, user.getUsername());
    }

    public List<TourResponse> getMyFavorites() {
        User user = getCurrentUser();
        List<FavoriteTour> favorites = favoriteTourRepository.findByUserWithTour(user);
        
        return favorites.stream()
                .map(fav -> mapToResponse(fav.getTour()))
                .collect(Collectors.toList());
    }

    public boolean isFavorite(Long tourId) {
        User user = getCurrentUser();
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new AppException(ErrorCode.TOUR_NOT_FOUND));
        
        return favoriteTourRepository.existsByUserAndTour(user, tour);
    }

    public List<Long> getMyFavoriteIds() {
        User user = getCurrentUser();
        return favoriteTourRepository.findTourIdsByUser(user);
    }

    private TourResponse mapToResponse(Tour tour) {
        List<TourResponse.TourPointResponse> pointResponses = tour.getTourPoints() != null
                ? tour.getTourPoints().stream()
                        .map(point -> {
                            Location loc = point.getLocation();
                            return TourResponse.TourPointResponse.builder()
                                    .id(point.getId())
                                    .orderIndex(point.getOrderIndex())
                                    .note(point.getNote())
                                    .stayDurationMinutes(point.getStayDurationMinutes())
                                    .dayNumber(point.getDayNumber())
                                    .startTime(point.getStartTime())
                                    .activity(point.getActivity())
                                    .imageUrl(point.getImageUrl())
                                    .locationId(loc != null ? loc.getId() : null)
                                    .locationName(loc != null ? loc.getName() : null)
                                    .locationAddress(loc != null ? loc.getAddress() : null)
                                    .latitude(loc != null ? loc.getLatitude() : null)
                                    .longitude(loc != null ? loc.getLongitude() : null)
                                    .build();
                        })
                        .collect(Collectors.toList())
                : List.of();

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
                .imageUrl(tour.getImageUrl())
                .points(pointResponses)
                .createdByUsername(tour.getCreatedBy() != null ? tour.getCreatedBy().getUsername() : null)
                .createdById(tour.getCreatedBy() != null ? tour.getCreatedBy().getId() : null)
                .createdByAvatar(tour.getCreatedBy() != null ? tour.getCreatedBy().getAvatar() : null)
                .createdByFirstName(tour.getCreatedBy() != null ? tour.getCreatedBy().getFirstName() : null)
                .createdByLastName(tour.getCreatedBy() != null ? tour.getCreatedBy().getLastName() : null)
                .createdAt(tour.getCreatedAt())
                .isActive(tour.getIsActive())
                .status(tour.getStatus() != null ? tour.getStatus().name() : null)
                .rejectionReason(tour.getRejectionReason())
                .averageRating(reviewRepository.findAverageRatingByTourId(tour.getId()))
                .reviewCount(reviewRepository.countByTourId(tour.getId()))
                .build();
    }
}
