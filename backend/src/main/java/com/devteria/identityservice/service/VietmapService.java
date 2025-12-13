package com.devteria.identityservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.devteria.identityservice.dto.response.VietmapAutocompleteResponse;
import com.devteria.identityservice.dto.response.VietmapPlaceResponse;
import com.devteria.identityservice.dto.response.VietmapRouteResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VietmapService {
    RestClient restClient = RestClient.create();

    @NonFinal
    @Value("${vietmap.api.key}")
    String apiKey;

    @NonFinal
    @Value("${vietmap.api.base-url:https://maps.vietmap.vn/api}")
    String baseUrl;

    /**
     * Search locations using Vietmap Autocomplete API v3
     */
    public List<VietmapAutocompleteResponse> autocomplete(String query, String focus) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/autocomplete/v3")
                .queryParam("apikey", apiKey)
                .queryParam("text", query)
                .queryParamIfPresent("focus", focus != null ? java.util.Optional.of(focus) : java.util.Optional.empty())
                .toUriString();

        try {
            log.info("Calling Vietmap Autocomplete API for query: {}", query);
            List<VietmapAutocompleteResponse> results = restClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<VietmapAutocompleteResponse>>() {
                    });

            log.info("Received {} results from Vietmap", results != null ? results.size() : 0);
            return results;
        } catch (Exception e) {
            log.error("Error calling Vietmap Autocomplete API", e);
            throw new RuntimeException("Failed to search locations", e);
        }
    }

    /**
     * Get place details using Vietmap Place API v3
     */
    public VietmapPlaceResponse getPlaceDetails(String refId) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/place/v3")
                .queryParam("apikey", apiKey)
                .queryParam("refid", refId)
                .toUriString();

        try {
            log.info("Calling Vietmap Place API for refId: {}", refId);
            VietmapPlaceResponse response = restClient.get().uri(url).retrieve().body(VietmapPlaceResponse.class);

            log.info("Received place details for: {}", response != null ? response.getName() : "null");
            return response;
        } catch (Exception e) {
            log.error("Error calling Vietmap Place API", e);
            throw new RuntimeException("Failed to get place details", e);
        }
    }

    /**
     * Reverse geocoding using Vietmap Reverse API v3
     */
    public List<VietmapAutocompleteResponse> reverseGeocode(Double lat, Double lng) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/reverse/v3")
                .queryParam("apikey", apiKey)
                .queryParam("lat", lat)
                .queryParam("lng", lng)
                .toUriString();

        try {
            log.info("Calling Vietmap Reverse API for lat: {}, lng: {}", lat, lng);
            List<VietmapAutocompleteResponse> results = restClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<VietmapAutocompleteResponse>>() {
                    });

            log.info("Received {} results from Vietmap Reverse", results != null ? results.size() : 0);
            return results;
        } catch (Exception e) {
            log.error("Error calling Vietmap Reverse API", e);
            throw new RuntimeException("Failed to reverse geocode", e);
        }
    }

    /**
     * Calculate route between points using Vietmap Route API v3
     * Points are visited in the order provided
     */
    public VietmapRouteResponse getRoute(List<String> points, String vehicle) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/route/v3")
                .queryParam("apikey", apiKey)
                .queryParam("points_encoded", true);

        // Add each point as a separate query param
        for (String point : points) {
            builder.queryParam("point", point);
        }

        if (vehicle != null && !vehicle.isEmpty()) {
            builder.queryParam("vehicle", vehicle);
        }

        String url = builder.toUriString();

        try {
            log.info("Calling Vietmap Route API with {} points, vehicle: {}", points.size(), vehicle);
            VietmapRouteResponse response = restClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(VietmapRouteResponse.class);

            log.info("Route API response code: {}", response != null ? response.getCode() : "null");
            return response;
        } catch (Exception e) {
            log.error("Error calling Vietmap Route API", e);
            throw new RuntimeException("Failed to get route", e);
        }
    }

    /**
     * Calculate optimized route using Vietmap TSP API v3
     * Points are reordered to minimize total travel distance
     */
    public VietmapRouteResponse getTspRoute(List<String> points, String vehicle, boolean roundtrip) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + "/tsp/v3")
                .queryParam("apikey", apiKey)
                .queryParam("points_encoded", true)
                .queryParam("roundtrip", roundtrip);

        // Add each point as a separate query param
        for (String point : points) {
            builder.queryParam("point", point);
        }

        if (vehicle != null && !vehicle.isEmpty()) {
            builder.queryParam("vehicle", vehicle);
        }

        String url = builder.toUriString();

        try {
            log.info("Calling Vietmap TSP API with {} points, vehicle: {}, roundtrip: {}", 
                    points.size(), vehicle, roundtrip);
            VietmapRouteResponse response = restClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .body(VietmapRouteResponse.class);

            log.info("TSP API response code: {}", response != null ? response.getCode() : "null");
            return response;
        } catch (Exception e) {
            log.error("Error calling Vietmap TSP API", e);
            throw new RuntimeException("Failed to get TSP route", e);
        }
    }
}
