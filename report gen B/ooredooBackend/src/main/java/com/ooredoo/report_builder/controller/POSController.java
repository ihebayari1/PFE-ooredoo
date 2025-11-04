package com.ooredoo.report_builder.controller;

import com.ooredoo.report_builder.entity.POS;
import com.ooredoo.report_builder.services.PosService;
import com.ooredoo.report_builder.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pos")
@CrossOrigin(origins = "*")
public class POSController {

    @Autowired
    private PosService posService;

    @GetMapping
    public ResponseEntity<Page<POS>> getAllPOS(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(posService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<POS> getPOSById(@PathVariable Integer id) {
        Optional<POS> pos = posService.findById(id);
        return pos.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/posBySector/sector/{sectorId}")
    public ResponseEntity<List<POS>> getPOSBySectorId(@PathVariable Integer sectorId) {
        return ResponseEntity.ok(posService.findBySectorId(sectorId));
    }

    @GetMapping("/users/{headOfPOSId}")
    public ResponseEntity<Optional<POS>> getPOSByHeadId(@PathVariable Integer headOfPOSId) {
        return ResponseEntity.ok(posService.findByHeadOfPOSId(headOfPOSId));
    }

    @GetMapping("/without-head")
    public ResponseEntity<List<POS>> getPOSWithoutHead() {
        return ResponseEntity.ok(posService.findPOSWithoutHead());
    }

    @PostMapping("/create-POS")
    public ResponseEntity<?> createPOS(@RequestBody POS pos) {
        try {
            POS savedPOS = posService.save(pos);
            return ResponseEntity.ok(savedPOS);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error creating POS: " + e.getMessage()));
        }
    }

    @PutMapping("/updatePOS/{id}")
    public ResponseEntity<?> updatePOS(@PathVariable Integer id, @RequestBody POS pos) {
        try {
            if (!posService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            pos.setId(id);
            POS updatedPOS = posService.save(pos);
            return ResponseEntity.ok(updatedPOS);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error updating POS: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePOS(@PathVariable Integer id) {
        try {
            if (!posService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            posService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // === USER ASSIGNMENT TO POS ===

    @PutMapping("/{posId}/users/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_MAIN_ADMIN', 'ROLE_ENTERPRISE_ADMIN')")
    public ResponseEntity<?> assignUserToPOS(
            @PathVariable Integer posId,
            @PathVariable Integer userId) {
        try {
            POS pos = posService.assignUserToPOS(posId, userId);
            return ResponseEntity.ok(Map.of("message", "User assigned to POS successfully", "pos", pos));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error assigning user to POS: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{posId}/users/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_MAIN_ADMIN', 'ROLE_ENTERPRISE_ADMIN')")
    public ResponseEntity<?> unassignUserFromPOS(
            @PathVariable Integer posId,
            @PathVariable Integer userId) {
        try {
            POS pos = posService.unassignUserFromPOS(posId, userId);
            return ResponseEntity.ok(Map.of("message", "User unassigned from POS successfully", "pos", pos));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error unassigning user from POS: " + e.getMessage()));
        }
    }

    @PostMapping("/{posId}/users")
    @PreAuthorize("hasAnyAuthority('ROLE_MAIN_ADMIN', 'ROLE_ENTERPRISE_ADMIN')")
    public ResponseEntity<?> assignUsersToPOS(
            @PathVariable Integer posId,
            @RequestBody List<Integer> userIds) {
        try {
            POS pos = posService.assignUsersToPOS(posId, userIds);
            return ResponseEntity.ok(Map.of("message", "Users assigned to POS successfully", "pos", pos));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Error assigning users to POS: " + e.getMessage()));
        }
    }

    @GetMapping("/{posId}/users")
    public ResponseEntity<List<User>> getUsersByPOS(@PathVariable Integer posId) {
        try {
            List<User> users = posService.getUsersByPOS(posId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
