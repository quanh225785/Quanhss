package com.devteria.identityservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.devteria.identityservice.dto.response.VietmapAutocompleteResponse;
import com.devteria.identityservice.dto.response.VietmapPlaceResponse;

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
}
