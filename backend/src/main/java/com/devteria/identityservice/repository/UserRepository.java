package com.devteria.identityservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
    Long countByRoleName(@Param("roleName") String roleName);
}
