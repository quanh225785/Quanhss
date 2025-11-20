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
public class VietmapAutocompleteResponse {
    @JsonProperty("ref_id")
    String refId;

    Double distance;
    String address;
    String name;
    String display;

    List<Boundary> boundaries;
    List<String> categories;

    @JsonProperty("entry_points")
    List<Object> entryPoints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Boundary {
        Integer type;
        Integer id;
        String name;
        String prefix;

        @JsonProperty("full_name")
        String fullName;
    }
}
