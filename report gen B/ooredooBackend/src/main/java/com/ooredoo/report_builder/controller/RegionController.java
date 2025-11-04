package com.ooredoo.report_builder.controller;

import com.ooredoo.report_builder.entity.Region;
import com.ooredoo.report_builder.entity.Zone;
import com.ooredoo.report_builder.repo.ZoneRepository;
import com.ooredoo.report_builder.services.RegionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/regions")
@CrossOrigin(origins = "*")
public class RegionController {

    @Autowired
    private RegionService regionService;
    @Autowired
    private ZoneRepository zoneRepository;


    @GetMapping
    public ResponseEntity<Page<Region>> getAllRegions(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(regionService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Region> getRegionById(@PathVariable Integer id) {
        Optional<Region> region = regionService.findById(id);
        return region.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/zoneByRegion/{regionId}")
    public ResponseEntity<List<Zone>> getZonesByRegionId(@PathVariable Integer regionId) {
        return ResponseEntity.ok(zoneRepository.findByRegionId(regionId));
    }

    @GetMapping("/zoneByRegion/{regionId}/paginated")
    public ResponseEntity<Page<Zone>> getZonesByRegionIdPaginated(
            @PathVariable Integer regionId,
            @PageableDefault(size = 20) Pageable pageable) {
        // Note: This requires adding a paginated method to ZoneRepository if needed
        // For now, keeping the original endpoint and adding paginated version
        return ResponseEntity.ok(zoneRepository.findByRegionId(regionId, pageable));
    }

    /*@GetMapping("/without-head")
    public ResponseEntity<List<Region>> getRegionsWithoutHead() {
        return ResponseEntity.ok(regionService.findRegionsWithoutHead());
    }*/

    @PostMapping("/createRegion")
    public ResponseEntity<?> createRegion(@RequestBody Region region) {
        try {
            Region savedRegion = regionService.save(region);
            return ResponseEntity.ok(savedRegion);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error creating region: " + e.getMessage()));
        }
    }

    @PutMapping("/updateRegion/{id}")
    public ResponseEntity<?> updateRegion(@PathVariable Integer id, @RequestBody Region region) {
        try {
            if (!regionService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            region.setId(id);
            Region updatedRegion = regionService.save(region);
            return ResponseEntity.ok(updatedRegion);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error updating region: " + e.getMessage()));
        }
    }

    @DeleteMapping("/deleteRegion/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable Integer id) {
        try {
            if (!regionService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            regionService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
