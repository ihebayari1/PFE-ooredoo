package com.ooredoo.report_builder.service;

import com.ooredoo.report_builder.dto.request.CreateSectorRequest;
import com.ooredoo.report_builder.dto.request.UpdateSectorRequest;
import com.ooredoo.report_builder.dto.response.EnterpriseResponse;
import com.ooredoo.report_builder.dto.response.SectorResponse;
import com.ooredoo.report_builder.entity.Enterprise;
import com.ooredoo.report_builder.entity.Sector;
import com.ooredoo.report_builder.exception.UnauthorizedException;
import com.ooredoo.report_builder.handler.ResourceNotFoundException;
import com.ooredoo.report_builder.mapper.EntityMapper;
import com.ooredoo.report_builder.repo.SectorRepository;
import com.ooredoo.report_builder.repo.UserRepository;
import com.ooredoo.report_builder.services.EnterpriseService;
import com.ooredoo.report_builder.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SectorService {

    private final SectorRepository sectorRepository;
    private final UserRepository userRepository;
    private final EntityMapper sectorMapper;
    private final SecurityService securityService;
    private final EnterpriseService enterpriseService;

    /**
     * Get all sectors for a specific enterprise with pagination
     */
    public Page<SectorResponse> getSectorsByEnterprise(Integer enterpriseId, Pageable pageable) {
        securityService.checkPermission("SECTOR", "READ");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        return sectorRepository.findByEnterpriseId(enterpriseId, pageable)
                .map(sectorMapper::toResponse);
    }

    /**
     * Get sector by ID within enterprise context
     */
    public SectorResponse getSectorById(Integer enterpriseId, Integer sectorId) {
        securityService.checkPermission("SECTOR", "READ");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        Sector sector = findSectorByIdAndEnterprise(sectorId, enterpriseId);
        return sectorMapper.toResponse(sector);
    }

    /**
     * Create new sector within enterprise
     */
    @Transactional
    public SectorResponse createSector(Integer enterpriseId, CreateSectorRequest request) {
        securityService.checkPermission("SECTOR", "WRITE");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        log.info("Creating new sector: {} for enterprise: {}", request.getName(), enterpriseId);
        
        // Verify enterprise exists
        Enterprise enterprise = enterpriseService.getEnterpriseById(enterpriseId);
        
        Sector sector = sectorMapper.toEntity(request);
        sector.setEnterprise(enterprise);
        
        // Set sector head if provided
        if (request.getSectorHeadId() != null) {
            User sectorHead = userRepository.findById(request.getSectorHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sector head not found with id: " + request.getSectorHeadId()));
            
            // Validate sector head belongs to the same enterprise
            if (!sectorHead.getEnterprise().getId().equals(enterpriseId)) {
                throw new IllegalArgumentException("Sector head must belong to the same enterprise");
            }
            
            sector.setSectorHead(sectorHead);
        }
        
        Sector savedSector = sectorRepository.save(sector);
        log.info("Sector created successfully with id: {}", savedSector.getId());
        
        return sectorMapper.toResponse(savedSector);
    }

    /**
     * Update existing sector
     */
    @Transactional
    public SectorResponse updateSector(Integer enterpriseId, Integer sectorId, UpdateSectorRequest request) {
        securityService.checkPermission("SECTOR", "UPDATE");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        log.info("Updating sector with id: {} in enterprise: {}", sectorId, enterpriseId);
        
        Sector sector = findSectorByIdAndEnterprise(sectorId, enterpriseId);
        sectorMapper.updateEntityFromRequest(request, sector);
        
        // Update sector head if provided
        if (request.getSectorHeadId() != null) {
            User sectorHead = userRepository.findById(request.getSectorHeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sector head not found with id: " + request.getSectorHeadId()));
            
            // Validate sector head belongs to the same enterprise
            if (!sectorHead.getEnterprise().getId().equals(enterpriseId)) {
                throw new IllegalArgumentException("Sector head must belong to the same enterprise");
            }
            
            sector.setSectorHead(sectorHead);
        }
        
        Sector updatedSector = sectorRepository.save(sector);
        log.info("Sector updated successfully with id: {}", updatedSector.getId());
        
        return sectorMapper.toResponse(updatedSector);
    }

    /**
     * Delete sector
     */
    @Transactional
    public void deleteSector(Integer enterpriseId, Integer sectorId) {
        securityService.checkPermission("SECTOR", "DELETE");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        log.info("Deleting sector with id: {} from enterprise: {}", sectorId, enterpriseId);
        
        Sector sector = findSectorByIdAndEnterprise(sectorId, enterpriseId);
        
        // Check if sector has zones - cascade delete or unassign based on business rules
        if (!sector.getZones().isEmpty()) {
            log.info("Sector has {} zones, performing cascade delete", sector.getZones().size());
            // Zones will be cascade deleted due to JPA relationship
        }
        
        // Check if sector has users - unassign them
        if (!sector.getUsers().isEmpty()) {
            log.info("Unassigning {} users from sector", sector.getUsers().size());
            sector.getUsers().forEach(user -> user.setSector(null));
            userRepository.saveAll(sector.getUsers());
        }
        
        sectorRepository.delete(sector);
        log.info("Sector deleted successfully with id: {}", sectorId);
    }

    /**
     * Get sectors accessible to current user
     */
    public List<SectorResponse> getAccessibleSectors() {
        securityService.checkPermission("SECTOR", "READ");
        
        if (securityService.hasSystemAdminRole()) {
            return sectorRepository.findAll().stream()
                    .map(sectorMapper::toResponse)
                    .toList();
        }
        
        List<Integer> accessibleEnterpriseIds = securityService.getAccessibleEnterpriseIds();
        if (accessibleEnterpriseIds.isEmpty()) {
            return sectorRepository.findAll().stream()
                    .map(sectorMapper::toResponse)
                    .toList();
        }
        
        return sectorRepository.findByEnterpriseIdIn(accessibleEnterpriseIds).stream()
                .map(sectorMapper::toResponse)
                .toList();
    }

    /**
     * Assign users to sector
     */
    @Transactional
    public void assignUsersToSector(Integer enterpriseId, Integer sectorId, List<Integer> userIds) {
        securityService.checkPermission("SECTOR", "UPDATE");
        
        if (!securityService.canAccessEnterprise(enterpriseId)) {
            throw new UnauthorizedException("Access denied to enterprise: " + enterpriseId);
        }
        
        log.info("Assigning {} users to sector: {}", userIds.size(), sectorId);
        
        Sector sector = findSectorByIdAndEnterprise(sectorId, enterpriseId);
        
        List<User> users = userRepository.findAllById(userIds);
        
        // Validate all users belong to the same enterprise
        users.forEach(user -> {
            if (!user.getEnterprise().getId().equals(enterpriseId)) {
                throw new IllegalArgumentException("User " + user.getId_user() + " does not belong to enterprise " + enterpriseId);
            }
        });
        
        // Assign users to sector
        users.forEach(user -> user.setSector(sector));
        userRepository.saveAll(users);
        
        log.info("Successfully assigned {} users to sector: {}", users.size(), sectorId);
    }

    /**
     * Internal method to find sector by ID and enterprise
     */
    public Sector findSectorByIdAndEnterprise(Integer sectorId, Integer enterpriseId) {
        return sectorRepository.findByIdAndEnterpriseId(sectorId, enterpriseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    String.format("Sector not found with id: %d in enterprise: %d", sectorId, enterpriseId)
                ));
    }

    /**
     * Internal method to find sector by ID
     */
    public Sector findSectorById(Integer sectorId) {
        return sectorRepository.findById(sectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + sectorId));
    }

    /**
     * Check if user has access to sector
     */
    public boolean hasAccessToSector(Integer sectorId) {
        return securityService.canAccessSector(sectorId);
    }
}