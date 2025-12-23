package com.devteria.identityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.enums.TourStatus;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByCreatedByAndIsActiveTrueOrderByCreatedAtDesc(User user);

    List<Tour> findByIsActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "tourPoints", "tourPoints.location" })
    @Query("SELECT DISTINCT t FROM Tour t " +
            "LEFT JOIN t.tourPoints tp " +
            "LEFT JOIN tp.location l " +
            "WHERE t.isActive = true " +
            "AND t.status = :status " +
            "AND (:keyword IS NULL OR " +
            "     LOWER(t.name) LIKE CONCAT('%', LOWER(:keyword), '%') " +
            "     OR (t.description IS NOT NULL AND LOWER(t.description) LIKE CONCAT('%', LOWER(:keyword), '%')) " +
            "     OR (l IS NOT NULL AND LOWER(l.name) LIKE CONCAT('%', LOWER(:keyword), '%'))) " +
            "AND (:minPrice IS NULL OR t.price IS NULL OR t.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR t.price IS NULL OR t.price <= :maxPrice) " +
            "AND (:numberOfDays IS NULL OR t.numberOfDays = :numberOfDays) " +
            "AND (:vehicle IS NULL OR LOWER(t.vehicle) = LOWER(:vehicle)) " +
            "AND (:locationId IS NULL OR l.id = :locationId) " +
            "ORDER BY t.createdAt DESC")
    List<Tour> searchTours(
            @Param("status") TourStatus status,
            @Param("keyword") String keyword,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("numberOfDays") Integer numberOfDays,
            @Param("vehicle") String vehicle,
            @Param("locationId") Long locationId);

    @EntityGraph(attributePaths = { "tourPoints", "tourPoints.location", "createdBy" })
    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN t.trips tr " +
            "LEFT JOIN Booking b ON b.trip = tr " +
            "WHERE t.isActive = true " +
            "AND t.status = com.devteria.identityservice.enums.TourStatus.APPROVED " +
            "GROUP BY t " +
            "ORDER BY COUNT(b) DESC")
    List<Tour> findTrendingTours();

    // Find approved tours by agent
    @EntityGraph(attributePaths = { "tourPoints", "tourPoints.location", "createdBy" })
    @Query("SELECT t FROM Tour t WHERE t.isActive = true AND t.status = com.devteria.identityservice.enums.TourStatus.APPROVED AND t.createdBy.id = :agentId ORDER BY t.createdAt DESC")
    List<Tour> findApprovedToursByAgentId(@Param("agentId") String agentId);

    long countByStatusAndIsActiveTrue(TourStatus status);
}
