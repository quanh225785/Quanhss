package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(User user);
    List<Tour> findByIsActiveTrueOrderByCreatedAtDesc();
}
