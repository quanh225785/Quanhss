package com.devteria.identityservice.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String username;

    String password;
    String firstName;
    LocalDate dob;
    String lastName;
    String email;
    String avatar;
    Boolean isVerified;
    Boolean isLocked;
    @Column(columnDefinition = "TEXT")
    String lockReason;
    @ManyToMany
    Set<Role> roles;

    LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isVerified == null) isVerified = false;
        if (isLocked == null) isLocked = false;
    }
}
