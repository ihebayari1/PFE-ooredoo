package com.ooredoo.report_builder.service;

import com.ooredoo.report_builder.dto.request.CreateZoneRequest;
import com.ooredoo.report_builder.dto.request.UpdateZoneRequest;
import com.ooredoo.report_builder.dto.response.ZoneResponse;
import com.ooredoo.report_builder.entity.Zone;
import com.ooredoo.report_builder.entity.Sector;
import com.ooredoo.report_builder.entity.Region;
import com.ooredoo.report_builder.exception.UnauthorizedException;
import com.ooredoo.report_builder.handler.ResourceNotFoundException;
import com.ooredoo.report_builder.mapper.EntityMapper;
import com.ooredoo.report_builder.repo.RegionRepository;
import com.ooredoo.report_builder.repo.SectorRepository;
import com.ooredoo.report_builder.repo.UserRepository;
import com.ooredoo.report_builder.repo.ZoneRepository;
import com.ooredoo.report_builder.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final SectorRepository sectorRepository;
    private final RegionRepository regionRepository;
    private final UserRepository userRepository;
    private final EntityMapper zoneMapper;
    private final SecurityService securityService;

    public ZoneResponse createZone(CreateZoneRequest request) {
        log.info("Creating zone with name: {}", request.getName());
        
        // Security check - only system admin or enterprise admin can create zones
        User currentUser = securityService.getCurrentUser();
        if (!securityService.isSystemAdmin(currentUser)) {
            Sector sector = sectorRepository.findById(request.getSectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + request.getSectorId()));
            
            if (!securityService.isEnterpriseAdmin(currentUser, sector.getEnterprise().getId())) {
                throw new UnauthorizedException("Only system admin or enterprise admin can create zones");
            }
        }
        
        // Validate sector exists
        Sector sector = sectorRepository.findById(request.getSectorId())
            .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + request.getSectorId()));
        
        // Validate zone head if provided
        User zoneHead = null;
        if (request.getZoneHeadId() != null) {
            zoneHead = userRepository.findById(request.getZoneHeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone head not found with id: " + request.getZoneHeadId()));
        }
        
        Zone zone = Zone.builder()
            .name(request.getName())
            .description(request.getDescription())
            .sector(sector)
            .zoneHead(zoneHead)
            .build();
        
        Zone savedZone = zoneRepository.save(zone);
        log.info("Zone created successfully with id: {}", savedZone.getId());
        
        return zoneMapper.toResponse(savedZone);
    }

    @Transactional(readOnly = true)
    public ZoneResponse getZoneById(Integer id) {
        log.info("Fetching zone with id: {}", id);
        
        Zone zone = zoneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        
        // Security check - verify access to zone
        User currentUser = securityService.getCurrentUser();
        if (!securityService.hasAccessToZone(currentUser, id)) {
            throw new UnauthorizedException("Access denied to zone with id: " + id);
        }
        
        return zoneMapper.toResponse(zone);
    }

    @Transactional(readOnly = true)
    public Page<ZoneResponse> getAllZones(Pageable pageable) {
        log.info("Fetching all zones with pagination");
        
        User currentUser = securityService.getCurrentUser();
        Page<Zone> zones;
        
        if (securityService.isSystemAdmin(currentUser)) {
            zones = zoneRepository.findAll(pageable);
        } else {
            // Get zones based on user's enterprise access
            zones = zoneRepository.findByUserAccess(currentUser.getId(), pageable);
        }
        
        return zones.map(zoneMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ZoneResponse> getZonesBySectorId(Integer sectorId) {
        log.info("Fetching zones for sector id: {}", sectorId);
        
        // Validate sector exists
        Sector sector = sectorRepository.findById(sectorId)
            .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + sectorId));
        
        // Security check - verify access to sector
        User currentUser = securityService.getCurrentUser();
        if (!securityService.hasAccessToSector(currentUser, sectorId)) {
            throw new UnauthorizedException("Access denied to sector with id: " + sectorId);
        }
        
        List<Zone> zones = zoneRepository.findBySectorId(sectorId);
        return zones.stream()
            .map(zoneMapper::toResponse)
            .toList();
    }

    public ZoneResponse updateZone(UpdateZoneRequest request) {
        log.info("Updating zone with id: {}", request.getId());
        
        Zone existingZone = zoneRepository.findById(request.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getId()));
        
        // Security check - only system admin or enterprise admin can update zones
        User currentUser = securityService.getCurrentUser();
        if (!securityService.isSystemAdmin(currentUser)) {
            if (!securityService.isEnterpriseAdmin(currentUser, existingZone.getSector().getEnterprise().getId())) {
                throw new UnauthorizedException("Only system admin or enterprise admin can update zones");
            }
        }
        
        // Update basic fields
        if (request.getName() != null) {
            existingZone.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existingZone.setDescription(request.getDescription());
        }
        
        // Update zone head if provided
        if (request.getZoneHeadId() != null) {
            User zoneHead = userRepository.findById(request.getZoneHeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone head not found with id: " + request.getZoneHeadId()));
            existingZone.setZoneHead(zoneHead);
        }
        
        // Update sector if provided
        if (request.getSectorId() != null) {
            Sector sector = sectorRepository.findById(request.getSectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Sector not found with id: " + request.getSectorId()));
            existingZone.setSector(sector);
        }
        
        // Update user assignments
        if (request.getUserIds() != null) {
            Set<User> users = userRepository.findByIdIn(request.getUserIds());
            existingZone.setUsers(users);
        }
        
        // Update region assignments
        if (request.getRegionIds() != null) {
            Set<Region> regions = regionRepository.findByIdIn(request.getRegionIds());
            existingZone.setRegions(regions);
        }
        
        Zone updatedZone = zoneRepository.save(existingZone);
        log.info("Zone updated successfully with id: {}", updatedZone.getId());
        
        return zoneMapper.toResponse(updatedZone);
    }

    public void deleteZone(Integer id) {
        log.info("Deleting zone with id: {}", id);
        
        Zone zone = zoneRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        
        // Security check - only system admin or enterprise admin can delete zones
        User currentUser = securityService.getCurrentUser();
        if (!securityService.isSystemAdmin(currentUser)) {
            if (!securityService.isEnterpriseAdmin(currentUser, zone.getSector().getEnterprise().getId())) {
                throw new UnauthorizedException("Only system admin or enterprise admin can delete zones");
            }
        }
        
        // Handle cascade operations
        // 1. Delete all regions in this zone
        List<Region> regions = regionRepository.findByZoneId(id);
        for (Region region : regions) {
            regionRepository.delete(region);
        }
        
        // 2. Unassign users from this zone
        zone.getUsers().clear();
        zoneRepository.save(zone);
        
        // 3. Delete the zone
        zoneRepository.delete(zone);
        log.info("Zone deleted successfully with id: {}", id);
    }

    public void assignUsersToZone(Integer zoneId, Set<Integer> userIds) {
        log.info("Assigning users to zone with id: {}", zoneId);
        
        Zone zone = zoneRepository.findById(zoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
        
        // Security check
        User currentUser = securityService.getCurrentUser();
        if (!securityService.isSystemAdmin(currentUser)) {
            if (!securityService.isEnterpriseAdmin(currentUser, zone.getSector().getEnterprise().getId())) {
                throw new UnauthorizedException("Only system admin or enterprise admin can assign users to zones");
            }
        }
        
        Set<User> users = userRepository.findByIdIn(userIds);
        zone.setUsers(users);
        zoneRepository.save(zone);
        
        log.info("Users assigned successfully to zone with id: {}", zoneId);
    }

    public void unassignUsersFromZone(Integer zoneId, Set<Integer> userIds) {
        log.info("Unassigning users from zone with id: {}", zoneId);
        
        Zone zone = zoneRepository.findById(zoneId)
            .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + zoneId));
        
        // Security check
        User currentUser = securityService.getCurrentUser();
        if (!securityService.isSystemAdmin(currentUser)) {
            if (!securityService.isEnterpriseAdmin(currentUser, zone.getSector().getEnterprise().getId())) {
                throw new UnauthorizedException("Only system admin or enterprise admin can unassign users from zones");
            }
        }
        
        Set<User> usersToRemove = userRepository.findByIdIn(userIds);
        zone.getUsers().removeAll(usersToRemove);
        zoneRepository.save(zone);
        
        log.info("Users unassigned successfully from zone with id: {}", zoneId);
    }
}