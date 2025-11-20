package com.devteria.identityservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VietmapPlaceResponse {
    String display;
    String name;

    @JsonProperty("hs_num")
    String hsNum;

    String street;
    String address;

    @JsonProperty("city_id")
    Integer cityId;

    String city;

    @JsonProperty("district_id")
    Integer districtId;

    String district;

    @JsonProperty("ward_id")
    Integer wardId;

    String ward;

    Double lat;
    Double lng;
}
