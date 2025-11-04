package com.ooredoo.report_builder.service;

import com.ooredoo.report_builder.entity.Animator;
import com.ooredoo.report_builder.entity.AnimatorRole;
import com.ooredoo.report_builder.entity.RoleAction;
import com.ooredoo.report_builder.exception.UnauthorizedException;
import com.ooredoo.report_builder.repo.AnimatorRepository;
import com.ooredoo.report_builder.repo.RoleActionRepository;
import com.ooredoo.report_builder.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SecurityService {

    private final AnimatorRepository animatorRepository;
    private final RoleActionRepository roleActionRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get current authenticated user
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("No authenticated user found");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            if (userDetails instanceof User) {
                return (User) userDetails;
            }
        }
        
        throw new UnauthorizedException("Invalid user authentication");
    }

    /**
     * Verify Animator PIN for additional security
     */
    @Transactional
    public boolean verifyAnimatorPin(String pin) {
        User currentUser = getCurrentUser();
        
        log.info("Verifying PIN for user: {}", currentUser.getEmail());
        
        // Find animator associated with current user
        Optional<Animator> animatorOpt = animatorRepository.findByUsersContaining(currentUser);
        
        if (animatorOpt.isEmpty()) {
            log.warn("No animator found for user: {}", currentUser.getEmail());
            throw new UnauthorizedException("User is not associated with any animator");
        }
        
        Animator animator = animatorOpt.get();
        
        // Verify PIN
        boolean pinValid = passwordEncoder.matches(pin, animator.getPin());
        
        if (!pinValid) {
            log.warn("Invalid PIN attempt for animator: {}", animator.getId());
            throw new UnauthorizedException("Invalid PIN");
        }
        
        log.info("PIN verified successfully for animator: {}", animator.getId());
        return true;
    }

    /**
     * Check if current user has specific permission
     */
    public boolean hasPermission(String resourceType, String actionType) {
        try {
            User currentUser = getCurrentUser();
            
            // System admin has all permissions
            if (hasSystemAdminRole()) {
                return true;
            }
            
            // Find animator and check role permissions
            Optional<Animator> animatorOpt = animatorRepository.findByUsersContaining(currentUser);
            
            if (animatorOpt.isEmpty()) {
                return false;
            }
            
            Animator animator = animatorOpt.get();
            AnimatorRole role = animator.getRole();
            
            if (role == null) {
                return false;
            }
            
            // Check if role has the required action
            return role.getActions().stream()
                    .anyMatch(action -> 
                        action.getResourceType().equalsIgnoreCase(resourceType) &&
                        action.getActionType().name().equalsIgnoreCase(actionType)
                    );
                    
        } catch (Exception e) {
            log.error("Error checking permission for resource: {} action: {}", resourceType, actionType, e);
            return false;
        }
    }

    /**
     * Check permission and throw exception if not authorized
     */
    public void checkPermission(String resourceType, String actionType) {
        if (!hasPermission(resourceType, actionType)) {
            throw new UnauthorizedException(
                String.format("Access denied. Required permission: %s:%s", resourceType, actionType)
            );
        }
    }

    /**
     * Check if current user has system admin role
     */
    public boolean hasSystemAdminRole() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getRoles().stream()
                    .anyMatch(role -> "SYSTEM_ADMIN".equals(role.getName()) || "ADMIN".equals(role.getName()));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Check if current user has enterprise admin role
     */
    public boolean hasEnterpriseAdminRole() {
        try {
            User currentUser = getCurrentUser();
            return currentUser.getRoles().stream()
                    .anyMatch(role -> "ENTERPRISE_ADMIN".equals(role.getName()));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get current user's animator
     */
    public Optional<Animator> getCurrentAnimator() {
        try {
            User currentUser = getCurrentUser();
            return animatorRepository.findByUsersContaining(currentUser);
        } catch (Exception e) {
            log.error("Error getting current animator", e);
            return Optional.empty();
        }
    }

    /**
     * Check if user can access specific enterprise
     */
    public boolean canAccessEnterprise(Integer enterpriseId) {
        if (hasSystemAdminRole()) {
            return true;
        }
        
        User currentUser = getCurrentUser();
        return currentUser.getEnterprise() != null && 
               currentUser.getEnterprise().getId().equals(enterpriseId);
    }

    /**
     * Check if user can access specific sector
     */
    public boolean canAccessSector(Integer sectorId) {
        if (hasSystemAdminRole()) {
            return true;
        }
        
        User currentUser = getCurrentUser();
        
        // Check if user belongs to the sector
        if (currentUser.getSector() != null && currentUser.getSector().getId().equals(sectorId)) {
            return true;
        }
        
        // Check if user is enterprise admin of the sector's enterprise
        if (hasEnterpriseAdminRole() && currentUser.getEnterprise() != null) {
            return currentUser.getEnterprise().getSectors().stream()
                    .anyMatch(sector -> sector.getId().equals(sectorId));
        }
        
        return false;
    }

    /**
     * Check if user can access specific zone
     */
    public boolean canAccessZone(Integer zoneId) {
        if (hasSystemAdminRole()) {
            return true;
        }
        
        User currentUser = getCurrentUser();
        
        // Check if user belongs to the zone
        if (currentUser.getZone() != null && currentUser.getZone().getId().equals(zoneId)) {
            return true;
        }
        
        // Check through sector access
        if (currentUser.getSector() != null) {
            return currentUser.getSector().getZones().stream()
                    .anyMatch(zone -> zone.getId().equals(zoneId));
        }
        
        return false;
    }

    /**
     * Check if user can access specific region
     */
    public boolean canAccessRegion(Integer regionId) {
        if (hasSystemAdminRole()) {
            return true;
        }
        
        User currentUser = getCurrentUser();
        
        // Check if user belongs to the region
        if (currentUser.getRegion() != null && currentUser.getRegion().getId().equals(regionId)) {
            return true;
        }
        
        // Check through zone access
        if (currentUser.getZone() != null) {
            return currentUser.getZone().getRegions().stream()
                    .anyMatch(region -> region.getId().equals(regionId));
        }
        
        return false;
    }

    /**
     * Check if user can access specific POS
     */
    public boolean canAccessPOS(Integer posId) {
        if (hasSystemAdminRole()) {
            return true;
        }
        
        User currentUser = getCurrentUser();
        
        // Check if user belongs to the POS
        return currentUser.getPointsOfSale().stream()
                .anyMatch(pos -> pos.getId().equals(posId));
    }

    /**
     * Get accessible enterprise IDs for current user
     */
    public List<Integer> getAccessibleEnterpriseIds() {
        if (hasSystemAdminRole()) {
            return List.of(); // Empty list means access to all
        }
        
        User currentUser = getCurrentUser();
        if (currentUser.getEnterprise() != null) {
            return List.of(currentUser.getEnterprise().getId());
        }
        
        return List.of();
    }
}