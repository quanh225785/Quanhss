package com.devteria.identityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByRefId(String refId);

    boolean existsByName(String name);

    Optional<Location> findByName(String name);

    // Get distinct city names for filter dropdown
    @Query("SELECT DISTINCT l.cityName FROM Location l WHERE l.cityName IS NOT NULL ORDER BY l.cityName")
    List<String> findDistinctCityNames();
}
