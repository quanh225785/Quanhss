package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.LocationSuggestion;
import com.devteria.identityservice.enums.SuggestionStatus;

@Repository
public interface LocationSuggestionRepository extends JpaRepository<LocationSuggestion, Long> {
    List<LocationSuggestion> findByStatus(SuggestionStatus status);

    List<LocationSuggestion> findBySuggestedBy_Id(String userId);

    List<LocationSuggestion> findBySuggestedBy_IdAndStatus(String userId, SuggestionStatus status);
}
