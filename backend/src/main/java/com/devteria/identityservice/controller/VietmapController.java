package com.devteria.identityservice.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import com.devteria.identityservice.dto.request.ApiResponse;
import com.devteria.identityservice.dto.request.RouteRequest;
import com.devteria.identityservice.dto.response.VietmapAutocompleteResponse;
import com.devteria.identityservice.dto.response.VietmapPlaceResponse;
import com.devteria.identityservice.dto.response.VietmapRouteResponse;
import com.devteria.identityservice.service.VietmapService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/vietmap")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VietmapController {
    VietmapService vietmapService;
    RestClient restClient = RestClient.create();

    @NonFinal
    @Value("${vietmap.api.key}")
    String apiKey;

    /**
     * Autocomplete search for locations
     * GET /vietmap/autocomplete?query=hanoi&focus=21.028511,105.804817
     * Focus parameter (user's current location) is now required for better accuracy
     */
    @GetMapping("/autocomplete")
    ApiResponse<List<VietmapAutocompleteResponse>> autocomplete(
            @RequestParam String query,
            @RequestParam(required = true) String focus) {
        return ApiResponse.<List<VietmapAutocompleteResponse>>builder()
                .result(vietmapService.autocomplete(query, focus))
                .build();
    }

    /**
     * Get place details by reference ID
     * GET /vietmap/place/{refId}
     */
    @GetMapping("/place/{refId}")
    ApiResponse<VietmapPlaceResponse> getPlaceDetails(@PathVariable String refId) {
        return ApiResponse.<VietmapPlaceResponse>builder()
                .result(vietmapService.getPlaceDetails(refId))
                .build();
    }

    /**
     * Reverse geocoding
     * GET /vietmap/reverse?lat=21.028511&lng=105.804817
     */
    @GetMapping("/reverse")
    ApiResponse<List<VietmapAutocompleteResponse>> reverseGeocode(
            @RequestParam Double lat, @RequestParam Double lng) {
        return ApiResponse.<List<VietmapAutocompleteResponse>>builder()
                .result(vietmapService.reverseGeocode(lat, lng))
                .build();
    }

    /**
     * Proxy map tiles to hide API key from frontend
     * GET /vietmap/tiles/{z}/{x}/{y}.png
     * Tiles are cached for 7 days to reduce API calls
     */
    @GetMapping("/tiles/{z}/{x}/{y}.png")
    @org.springframework.cache.annotation.Cacheable(
            value = "vietmapTiles",
            key = "#z + '-' + #x + '-' + #y")
    ResponseEntity<byte[]> getTile(
            @PathVariable int z,
            @PathVariable int x,
            @PathVariable int y) {
        try {
            String tileUrl = String.format(
                    "https://maps.vietmap.vn/maps/tiles/tm/%d/%d/%d@2x.png?apikey=%s",
                    z, x, y, apiKey);

            log.debug("Fetching tile from Vietmap: z={}, x={}, y={}", z, x, y);

            byte[] imageBytes = restClient
                    .get()
                    .uri(tileUrl)
                    .retrieve()
                    .body(byte[].class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setCacheControl("public, max-age=604800"); // Cache for 7 days (browser cache)
            headers.set("X-Cache-Status", "MISS"); // Indicate this was fetched from Vietmap

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(imageBytes);

        } catch (Exception e) {
            log.error("Error proxying tile: z={}, x={}, y={}", z, x, y, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Calculate route between points (manual ordering)
     * POST /vietmap/route
     */
    @PostMapping("/route")
    ApiResponse<VietmapRouteResponse> getRoute(@RequestBody RouteRequest request) {
        return ApiResponse.<VietmapRouteResponse>builder()
                .result(vietmapService.getRoute(
                        request.getPoints(),
                        request.getVehicle() != null ? request.getVehicle() : "car"))
                .build();
    }

    /**
     * Calculate optimized route using TSP (automatic ordering)
     * POST /vietmap/tsp
     */
    @PostMapping("/tsp")
    ApiResponse<VietmapRouteResponse> getTspRoute(@RequestBody RouteRequest request) {
        return ApiResponse.<VietmapRouteResponse>builder()
                .result(vietmapService.getTspRoute(
                        request.getPoints(),
                        request.getVehicle() != null ? request.getVehicle() : "car",
                        request.getRoundtrip() != null ? request.getRoundtrip() : false))
                .build();
    }
}
