package com.devteria.identityservice.dto.request;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RouteRequest {
    List<String> points;  // ["lat,lng", "lat,lng", ...]
    String vehicle;       // car, motorcycle, truck
    Boolean roundtrip;    // only for TSP - return to start point
}
