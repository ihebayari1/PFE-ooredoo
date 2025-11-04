package com.ooredoo.report_builder.controller;

import com.ooredoo.report_builder.dto.EnterpriseRequestDTO;
import com.ooredoo.report_builder.dto.EnterpriseUpdateRequestDTO;
import com.ooredoo.report_builder.dto.EnterpriseResponseDTO;
import com.ooredoo.report_builder.entity.Enterprise;
import com.ooredoo.report_builder.services.EnterpriseService;
import com.ooredoo.report_builder.user.User;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/enterprises")
@CrossOrigin(origins = "*")
@Slf4j
public class EnterpriseController {

    @Autowired
    private EnterpriseService enterpriseService;

    @GetMapping
    public ResponseEntity<Page<EnterpriseResponseDTO>> getAllEnterprises(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(enterpriseService.findAllWithDetails(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnterpriseResponseDTO> getEnterpriseById(@PathVariable Integer id) {
        return ResponseEntity.ok(enterpriseService.findByIdWithDetails(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Enterprise> getEnterpriseByName(@PathVariable String name) {
        Optional<Enterprise> enterprise = enterpriseService.findByName(name);
        return enterprise.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/getAllUserInEnterprise/{enterpriseId}")
    public ResponseEntity<Page<User>> geUsersIntEnterprise(
            @PathVariable Integer enterpriseId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(enterpriseService.getUserInEnterprise(enterpriseId, pageable));
    }

    @PostMapping("/createEnterprise")
    public ResponseEntity<?> createEnterprise(@Valid @RequestBody EnterpriseRequestDTO request) {
        try {
            log.info("Received enterprise request: {}", request);
            log.info("Manager ID from request: {}", request.getManagerId());
            
            if (enterpriseService.existsByName(request.getEnterpriseName())) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("error", "Enterprise with name '" + request.getEnterpriseName() + "' already exists"));
            }
            Enterprise savedEnterprise = enterpriseService.createEnterprise(request);
            EnterpriseResponseDTO responseDTO = enterpriseService.findByIdWithDetails(savedEnterprise.getId());
            return ResponseEntity.ok(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error creating enterprise: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEnterprise(@PathVariable Integer id, @Valid @RequestBody EnterpriseUpdateRequestDTO request) {
        try {
            log.info("Received enterprise update request: {}", request);
            log.info("Manager ID from request: {}", request.getManagerId());
            
            Enterprise existingEnterprise = enterpriseService.findById(id);
            if (existingEnterprise == null) {
                return ResponseEntity.notFound().build();
            }
            
            Enterprise updatedEnterprise = enterpriseService.updateEnterprise(id, request);
            EnterpriseResponseDTO responseDTO = enterpriseService.findByIdWithDetails(updatedEnterprise.getId());
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error updating enterprise: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnterprise(@PathVariable Integer id) {
        try {
            Enterprise existingEnterprise = enterpriseService.findById(id);
            if (existingEnterprise == null) {
                return ResponseEntity.notFound().build();
            }
            enterpriseService.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Enterprise deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error deleting enterprise: " + e.getMessage()));
        }
    }

    @PutMapping("/{enterpriseId}/users/{userId}")
    public ResponseEntity<?> addUserToEnterprise(
            @PathVariable Integer enterpriseId,
            @PathVariable Integer userId) {
        try {
            enterpriseService.assignUserToEnterprise(enterpriseId, userId);
            return ResponseEntity.ok(java.util.Map.of("message", "User added to enterprise successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error adding user to enterprise: " + e.getMessage()));
        }
    }

    @PutMapping("/removeFromEntreprise/{enterpriseId}/users/{userId}")
    public ResponseEntity<?> removeUserFromEnterprise(
            @PathVariable Integer enterpriseId,
            @PathVariable Integer userId) {
        try {
            enterpriseService.unassignUserFromEnterprise(enterpriseId, userId);
            return ResponseEntity.ok(java.util.Map.of("message", "User removed from enterprise successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error removing user from enterprise: " + e.getMessage()));
        }
    }


    @GetMapping("/search")
    public ResponseEntity<Page<Enterprise>> searchEnterprises(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<Enterprise> enterprises = enterpriseService.searchEnterprises(query, pageable);
            return ResponseEntity.ok(enterprises);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDeleteEnterprises(@RequestBody List<Integer> enterpriseIds) {
        try {
            enterpriseService.bulkDeleteEnterprises(enterpriseIds);
            return ResponseEntity.ok(java.util.Map.of("message", "Enterprises deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Error deleting enterprises: " + e.getMessage()));
        }
    }
}