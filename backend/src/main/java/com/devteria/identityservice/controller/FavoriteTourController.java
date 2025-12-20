package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.response.TourResponse;
import com.devteria.identityservice.service.FavoriteTourService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FavoriteTourController {
    FavoriteTourService favoriteTourService;

    /**
     * Add a tour to favorites
     * POST /favorites/{tourId}
     */
    @PostMapping("/{tourId}")
    ApiResponse<Void> addFavorite(@PathVariable Long tourId) {
        log.info("Adding tour {} to favorites", tourId);
        favoriteTourService.addFavorite(tourId);
        return ApiResponse.<Void>builder()
                .message("Tour added to favorites")
                .build();
    }

    /**
     * Remove a tour from favorites
     * DELETE /favorites/{tourId}
     */
    @DeleteMapping("/{tourId}")
    ApiResponse<Void> removeFavorite(@PathVariable Long tourId) {
        log.info("Removing tour {} from favorites", tourId);
        favoriteTourService.removeFavorite(tourId);
        return ApiResponse.<Void>builder()
                .message("Tour removed from favorites")
                .build();
    }

    /**
     * Get all favorite tours for current user
     * GET /favorites
     */
    @GetMapping
    ApiResponse<List<TourResponse>> getMyFavorites() {
        return ApiResponse.<List<TourResponse>>builder()
                .result(favoriteTourService.getMyFavorites())
                .build();
    }

    /**
     * Check if a tour is in favorites
     * GET /favorites/check/{tourId}
     */
    @GetMapping("/check/{tourId}")
    ApiResponse<Boolean> isFavorite(@PathVariable Long tourId) {
        return ApiResponse.<Boolean>builder()
                .result(favoriteTourService.isFavorite(tourId))
                .build();
    }

    /**
     * Get all favorite tour IDs for current user
     * GET /favorites/ids
     */
    @GetMapping("/ids")
    ApiResponse<List<Long>> getMyFavoriteIds() {
        return ApiResponse.<List<Long>>builder()
                .result(favoriteTourService.getMyFavoriteIds())
                .build();
    }
}
