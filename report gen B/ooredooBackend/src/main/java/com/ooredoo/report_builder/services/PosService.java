package com.ooredoo.report_builder.services;

import com.ooredoo.report_builder.entity.POS;
import com.ooredoo.report_builder.entity.Sector;
import com.ooredoo.report_builder.enums.RoleType;
import com.ooredoo.report_builder.handler.ResourceNotFoundException;
import com.ooredoo.report_builder.repo.POSRepository;
import com.ooredoo.report_builder.repo.SectorRepository;
import com.ooredoo.report_builder.repo.UserRepository;
import com.ooredoo.report_builder.user.User;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class PosService {
    @Autowired
    private POSRepository posRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SectorRepository sectorRepository;
    @Autowired
    private UserService userService;

    public PosService() {
    }

    public List<POS> findAll() {
        return posRepository.findAll();
    }

    public Page<POS> findAll(Pageable pageable) {
        return posRepository.findAll(pageable);
    }

    public Optional<POS> findById(Integer id) {
        return posRepository.findById(id);
    }

    public List<POS> findBySectorId(Integer sectorId) {
        return posRepository.findBySectorId(sectorId);
    }

    public Optional<POS> findByHeadOfPOSId(Integer headOfPOSId) {
        return posRepository.findByHeadOfPOSId(headOfPOSId);
    }

    public POS save(POS pos) {
        // Validate required fields
        if (pos.getPosName() == null || pos.getPosName().trim().isEmpty()) {
            throw new IllegalArgumentException("POS name is required");
        }
        
        if (pos.getCodeOfPOS() == null || pos.getCodeOfPOS().trim().isEmpty()) {
            throw new IllegalArgumentException("POS code is required");
        }
        
        if (pos.getSector() == null || pos.getSector().getId() == null) {
            throw new IllegalArgumentException("Sector is required");
        }
        
        Sector sector = sectorRepository.findById(pos.getSector().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found"));
        
        User manager = null;
        if (pos.getHeadOfPOS() != null && pos.getHeadOfPOS().getId() != null) {
            manager = userRepository.findById(pos.getHeadOfPOS().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        }
        
        // Check if it's an update or create
        if (pos.getId() != null) {
            // Update existing POS
            POS existingPos = posRepository.findById(pos.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("POS not found with id: " + pos.getId()));
            
            existingPos.setPosName(pos.getPosName());
            existingPos.setCodeOfPOS(pos.getCodeOfPOS());
            existingPos.setHeadOfPOS(manager);
            existingPos.setSector(sector);
            
            if (manager != null) {
                validatePOSHead(existingPos);
            }
            
            log.info("Updating POS: {}", pos.getPosName());
            return posRepository.save(existingPos);
        } else {
            // Create new POS
            POS newPos = POS.builder()
                    .pos_Name(pos.getPosName())
                    .code_Of_POS(pos.getCodeOfPOS())
                    .headOfPOS(manager)
                    .sector(sector)
                    .build();
            
            if (manager != null) {
                validatePOSHead(newPos);
            }
            
            log.info("Creating POS: {}", pos.getPosName());
            return posRepository.save(newPos);
        }
    }

    public void deleteById(Integer id) {
        validatePOSDeletion(id);
        posRepository.deleteById(id);
    }

    public List<POS> findPOSWithoutHead() {
        return posRepository.findByHeadOfPOSIsNull();
    }

    private void validatePOSHead(POS pos) {
        if (pos.getHeadOfPOS().getId() != null) {
            User manager = userRepository.findById(pos.getHeadOfPOS().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            if (!manager.hasRole(RoleType.HEAD_OF_POS.getValue())) {
                throw new IllegalArgumentException("User must have HEAD_OF_POS type to be assigned as head of POS");
            }

            if (pos.getId() == null || !pos.getId().equals(getCurrentPOSIdForHead(pos.getHeadOfPOS().getId()))) {
                if (posRepository.existsByHeadOfPOSId(pos.getHeadOfPOS().getId())) {
                    throw new IllegalStateException("User is already assigned as head of another POS");
                }
            }
        }
    }

    private Integer getCurrentPOSIdForHead(Integer headId) {
        List<POS> posList = posRepository.findAll();
        return posList.stream()
                .filter(p -> p.getHeadOfPOS() != null && p.getHeadOfPOS().getId().equals(headId))
                .map(POS::getId)
                .findFirst()
                .orElse(null);
    }

    private void validatePOSDeletion(Integer posId) {
        Optional<POS> pos = findById(posId);
        if (pos.isPresent() && pos.get().getHeadOfPOS() != null) {
            throw new IllegalStateException("Cannot delete POS: has users assigned. Reassign users first.");
        }
    }

    // === USER ASSIGNMENT TO POS ===

    /**
     * Assign a user to a POS
     * Only MAIN_ADMIN or ENTERPRISE_ADMIN (managing the user's enterprise) can perform this action
     */
    @Transactional
    public POS assignUserToPOS(Integer posId, Integer userId) {
        // Get current authenticated user
        User currentUser = userService.getCurrentAuthenticatedUser();
        
        // Check authorization
        validateUserAssignmentAuthorization(currentUser, userId);
        
        // Find POS and user
        POS pos = posRepository.findById(posId)
                .orElseThrow(() -> new ResourceNotFoundException("POS not found with id: " + posId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Check if user is already assigned to this POS
        if (pos.getUsers().contains(user)) {
            throw new IllegalArgumentException("User is already assigned to this POS");
        }
        
        // Assign user to POS
        user.setPos(pos);
        user.setPos_Code(pos.getCodeOfPOS());
        userRepository.save(user);
        pos.getUsers().add(user);
        
        log.info("User {} assigned to POS {} by user {}", userId, posId, currentUser.getId());
        return posRepository.save(pos);
    }

    /**
     * Unassign a user from a POS
     * Only MAIN_ADMIN or ENTERPRISE_ADMIN (managing the user's enterprise) can perform this action
     */
    @Transactional
    public POS unassignUserFromPOS(Integer posId, Integer userId) {
        // Get current authenticated user
        User currentUser = userService.getCurrentAuthenticatedUser();
        
        // Check authorization
        validateUserAssignmentAuthorization(currentUser, userId);
        
        // Find POS and user
        POS pos = posRepository.findById(posId)
                .orElseThrow(() -> new ResourceNotFoundException("POS not found with id: " + posId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Check if user is assigned to this POS
        if (!pos.getUsers().contains(user)) {
            throw new IllegalArgumentException("User is not assigned to this POS");
        }
        
        // Unassign user from POS
        user.setPos(null);
        user.setPos_Code(null);
        userRepository.save(user);
        pos.getUsers().remove(user);
        
        log.info("User {} unassigned from POS {} by user {}", userId, posId, currentUser.getId());
        return posRepository.save(pos);
    }

    /**
     * Assign multiple users to a POS
     * Only MAIN_ADMIN or ENTERPRISE_ADMIN (managing the users' enterprise) can perform this action
     */
    @Transactional
    public POS assignUsersToPOS(Integer posId, List<Integer> userIds) {
        // Get current authenticated user
        User currentUser = userService.getCurrentAuthenticatedUser();
        
        // Find POS
        POS pos = posRepository.findById(posId)
                .orElseThrow(() -> new ResourceNotFoundException("POS not found with id: " + posId));
        
        // Find all users and validate authorization for each
        List<User> users = userRepository.findAllById(userIds);
        if (users.size() != userIds.size()) {
            throw new ResourceNotFoundException("Some users not found");
        }
        
        // Validate authorization for each user
        for (User user : users) {
            validateUserAssignmentAuthorization(currentUser, user.getId());
            
            // Check if user is already assigned to this POS
            if (!pos.getUsers().contains(user)) {
                user.setPos(pos);
                user.setPos_Code(pos.getCodeOfPOS());
                userRepository.save(user);
                pos.getUsers().add(user);
            }
        }
        
        log.info("Users {} assigned to POS {} by user {}", userIds, posId, currentUser.getId());
        return posRepository.save(pos);
    }

    /**
     * Get all users assigned to a POS
     */
    public List<User> getUsersByPOS(Integer posId) {
        POS pos = posRepository.findById(posId)
                .orElseThrow(() -> new ResourceNotFoundException("POS not found with id: " + posId));
        return pos.getUsers().stream().toList();
    }

    /**
     * Validate that the current user has permission to assign/unassign the target user
     * MAIN_ADMIN can assign any user
     * ENTERPRISE_ADMIN can only assign users from their enterprise
     */
    private void validateUserAssignmentAuthorization(User currentUser, Integer targetUserId) {
        // Check if user has MAIN_ADMIN role
        if (currentUser.hasRole(RoleType.MAIN_ADMIN.getValue())) {
            return; // MAIN_ADMIN can assign any user
        }
        
        // Check if user has ENTERPRISE_ADMIN role
        if (!currentUser.hasRole(RoleType.ENTERPRISE_ADMIN.getValue())) {
            throw new AccessDeniedException("Only MAIN_ADMIN or ENTERPRISE_ADMIN can assign users to POS");
        }
        
        // ENTERPRISE_ADMIN can only assign users from their enterprise
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));
        
        if (targetUser.getEnterprise() == null || currentUser.getEnterprise() == null) {
            throw new AccessDeniedException("ENTERPRISE_ADMIN can only assign users from their enterprise");
        }
        
        if (!targetUser.getEnterprise().getId().equals(currentUser.getEnterprise().getId())) {
            throw new AccessDeniedException("ENTERPRISE_ADMIN can only assign users from their enterprise");
        }
    }
}
