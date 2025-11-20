package com.devteria.identityservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.devteria.identityservice.dto.request.LocationSuggestionRequest;
import com.devteria.identityservice.dto.response.LocationResponse;
import com.devteria.identityservice.dto.response.LocationSuggestionResponse;
import com.devteria.identityservice.entity.Location;
import com.devteria.identityservice.entity.LocationSuggestion;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "suggestedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    LocationSuggestion toLocationSuggestion(LocationSuggestionRequest request);

    @Mapping(source = "suggestedBy.username", target = "suggestedByUsername")
    @Mapping(source = "suggestedBy.id", target = "suggestedByUserId")
    @Mapping(source = "reviewedBy.username", target = "reviewedByUsername")
    LocationSuggestionResponse toLocationSuggestionResponse(LocationSuggestion suggestion);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "approvedFromSuggestion", ignore = true)
    Location toLocation(LocationSuggestion suggestion);

    @Mapping(source = "createdBy.username", target = "createdByUsername")
    @Mapping(source = "approvedFromSuggestion.id", target = "approvedFromSuggestionId")
    LocationResponse toLocationResponse(Location location);
}
