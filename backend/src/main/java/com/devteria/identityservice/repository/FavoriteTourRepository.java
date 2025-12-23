package com.devteria.identityservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.FavoriteTour;
import com.devteria.identityservice.entity.Tour;
import com.devteria.identityservice.entity.User;

@Repository
public interface FavoriteTourRepository extends JpaRepository<FavoriteTour, Long> {
    
    @Query("SELECT f FROM FavoriteTour f JOIN FETCH f.tour t LEFT JOIN FETCH t.tourPoints WHERE f.user = :user ORDER BY f.createdAt DESC")
    List<FavoriteTour> findByUserWithTour(@Param("user") User user);
    
    Optional<FavoriteTour> findByUserAndTour(User user, Tour tour);
    
    boolean existsByUserAndTour(User user, Tour tour);
    
    void deleteByUserAndTour(User user, Tour tour);
    
    @Query("SELECT f.tour.id FROM FavoriteTour f WHERE f.user = :user")
    List<Long> findTourIdsByUser(@Param("user") User user);
}
