package com.devteria.identityservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByRefId(String refId);

    boolean existsByName(String name);

    Optional<Location> findByName(String name);
}
