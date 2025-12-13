package com.devteria.identityservice.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VietmapRouteResponse {
    String code;
    String license;
    List<RoutePath> paths;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoutePath {
        Double distance;      // meters
        Double weight;
        Long time;            // milliseconds
        Integer transfers;
        
        @JsonProperty("points_encoded")
        Boolean pointsEncoded;
        
        List<Double> bbox;    // [minLon, minLat, maxLon, maxLat]
        String points;        // encoded polyline (Google Polyline 5)
        
        @JsonProperty("snapped_waypoints")
        String snappedWaypoints;
        
        List<RouteInstruction> instructions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RouteInstruction {
        Double distance;      // meters until next instruction
        Integer heading;
        Integer sign;         // direction sign
        List<Integer> interval;
        String text;          // instruction text
        Long time;            // milliseconds
        
        @JsonProperty("street_name")
        String streetName;
        
        @JsonProperty("last_heading")
        Integer lastHeading;
    }
}
