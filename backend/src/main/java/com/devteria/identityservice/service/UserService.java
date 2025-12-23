package com.devteria.identityservice.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identityservice.constant.PredefinedRole;
import com.devteria.identityservice.dto.request.UserCreationRequest;
import com.devteria.identityservice.dto.request.UserUpdateRequest;
import com.devteria.identityservice.dto.response.UserResponse;
import com.devteria.identityservice.entity.Role;
import com.devteria.identityservice.entity.User;
import com.devteria.identityservice.entity.VerificationToken;
import com.devteria.identityservice.exception.AppException;
import com.devteria.identityservice.exception.ErrorCode;
import com.devteria.identityservice.mapper.UserMapper;
import com.devteria.identityservice.repository.RoleRepository;
import com.devteria.identityservice.repository.UserRepository;
import com.devteria.identityservice.repository.VerificationTokenRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    VerificationTokenRepository verificationTokenRepository;
    EmailVerify emailVerify;

    @NonFinal
    @Value("${app.verification-token-expiry:24}")
    long tokenExpiryHours;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        
        // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsVerified(false); // User not verified by default

        HashSet<Role> roles = new HashSet<>();
        // Xác định role từ request, mặc định là USER
        String selectedRole = request.getRole();
        if (PredefinedRole.AGENT_ROLE.equals(selectedRole)) {
            roleRepository.findById(PredefinedRole.AGENT_ROLE).ifPresent(roles::add);
            log.info("Creating new user with AGENT role: {}", user.getUsername());
        } else {
            roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
            log.info("Creating new user with USER role: {}", user.getUsername());
        }

        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Generate verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiryDate(LocalDateTime.now().plusHours(tokenExpiryHours))
                .build();

        verificationTokenRepository.save(verificationToken);

        // Send verification email async - không cần đợi
        emailVerify.sendVerificationEmail(user, token);
        log.info("Verification email task queued for user: {}", user.getUsername());

        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);

        var roles = roleRepository.findAllById(request.getRoles());
        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INVALID);
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public UserResponse getUser(String id) {
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse lockUser(String userId, String lockReason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        user.setIsLocked(true);
        user.setLockReason(lockReason);
        
        user = userRepository.save(user);
        log.info("User {} has been locked. Reason: {}", user.getUsername(), lockReason);
        
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse unlockUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        user.setIsLocked(false);
        user.setLockReason(null);
        
        user = userRepository.save(user);
        log.info("User {} has been unlocked", user.getUsername());
        
        return userMapper.toUserResponse(user);
    }

    /**
     * Get public profile of an agent (accessible by all authenticated users)
     */
    @Transactional(readOnly = true)
    public User getAgentById(String agentId) {
        return userRepository.findById(agentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
