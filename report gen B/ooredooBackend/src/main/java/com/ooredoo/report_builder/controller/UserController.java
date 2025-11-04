package com.ooredoo.report_builder.controller;

import com.ooredoo.report_builder.entity.POS;
import com.ooredoo.report_builder.enums.UserType;
import com.ooredoo.report_builder.handler.ResourceNotFoundException;
import com.ooredoo.report_builder.services.UserService;
import com.ooredoo.report_builder.user.User;
import com.ooredoo.report_builder.dto.MessageResponse;
import com.ooredoo.report_builder.dto.PinVerificationResponse;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {


    @Autowired
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/regions/{regionId}")
    public ResponseEntity<Page<User>> getAllUsersInRegion(
            @PathVariable Integer regionId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.findAllFromRegion(regionId, pageable));
    }


    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{userType}")
    public ResponseEntity<Page<User>> getUsersByType(
            @PathVariable UserType userType,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.findByUserType(userType, pageable));
    }

    @GetMapping("/available-heads/{userType}")
    public ResponseEntity<Page<User>> getAvailableHeads(
            @PathVariable UserType userType,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.findAvailableHeads(userType, pageable));
    }

    @GetMapping("/available-heads-by-role/{roleName}")
    public ResponseEntity<Page<User>> getAvailableHeadsByRole(
            @PathVariable String roleName,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.findAvailableHeadsByRole(roleName, pageable));
    }

    @PostMapping("/addUser")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> createUser(@RequestBody @Valid User user) throws MessagingException {
        try {
            log.info("Creating user with email: {}", user.getEmail());
            User createdUser = userService.save(user);
            log.info("User created successfully with ID: {}", createdUser.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal error, please contact the administrator"));
        }
    }

    @PutMapping("/updateUser/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody @Valid User user) {
        try {
            if (!userService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            user.setId(id);
            User updatedUser = userService.save(user);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ADDED: Separate endpoint for password updates
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password is required"));
            }

            userService.updatePassword(id, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update password"));
        }
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            if (!userService.findById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            userService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PIN Verification Endpoints
    @PostMapping("/verify-pin")
    public ResponseEntity<PinVerificationResponse> verifyPin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String pin = request.get("pin");

        PinVerificationResponse response = userService.verifyPinWithEnterprise(email, pin);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/pin")
    public ResponseEntity<Map<String, String>> updatePin(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String newPin = request.get("newPin");
            if (newPin == null || newPin.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New PIN is required"));
            }

            userService.updatePin(id, newPin);
            return ResponseEntity.ok(Map.of("message", "PIN updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to update PIN"));
        }
    }

    @GetMapping("/pos/{posId}")
    public ResponseEntity<Page<User>> getUsersByPOS(
            @PathVariable int posId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(userService.getUsersByPOS(posId, pageable));
    }

    @PostMapping("/activate")
    public ResponseEntity<MessageResponse> activateAccount(@RequestParam("token") String token) throws MessagingException {
        userService.activateAccount(token);
        return ResponseEntity.ok(new MessageResponse("OTP SEND successfully"));
    }

    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<User> assignRoleToUser(
            @PathVariable Integer userId,
            @PathVariable Integer roleId) {
        try {
            User updatedUser = userService.assignRoleToUser(userId, roleId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/roles")
    public ResponseEntity<User> assignRolesToUser(
            @PathVariable Integer userId,
            @RequestBody List<Integer> roleIds) {
        try {
            User updatedUser = userService.assignRolesToUser(userId, roleIds);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // to test it's better
    @PostMapping("/{userId}/roles/add")
    public ResponseEntity<User> addRoleToUser(
            @PathVariable Integer userId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer roleId = request.get("roleId");
            User updatedUser = userService.assignRoleToUser(userId, roleId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<User> removeRoleFromUser(
            @PathVariable Integer userId,
            @PathVariable Integer roleId) {
        try {
            User updatedUser = userService.removeRoleFromUser(userId, roleId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @DeleteMapping("/{userId}/roles")
    public ResponseEntity<User> removeRolesFromUser(
            @PathVariable Integer userId,
            @RequestBody List<Integer> roleIds) {
        try {
            User updatedUser = userService.removeRolesFromUser(userId, roleIds);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/roles/all")
    public ResponseEntity<User> removeAllRolesFromUser(@PathVariable Integer userId) {
        try {
            User updatedUser = userService.removeAllRolesFromUser(userId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{userId}/link-pos")
    public ResponseEntity<User> linkUserToPOS(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request) {
        try {
            String posCode = request.get("posCode");
            if (posCode == null || posCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            User updatedUser = userService.linkUserToPOS(userId, posCode);
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/unlink-pos")
    public ResponseEntity<User> unlinkUserFromPOS(@PathVariable Integer userId) {
        try {
            User updatedUser = userService.unlinkUserFromPOS(userId);
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }


    @GetMapping("/by-pos-code/{posCode}")
    public ResponseEntity<Page<User>> getUsersByPOSCode(
            @PathVariable String posCode,
            @PageableDefault(size = 20) Pageable pageable) {
        Optional<POS> pos = userService.getPOSByCode(posCode);
        if (!pos.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Page<User> users = userService.getUsersByPOS(pos.get().getId(), pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-role/{roleName}")
    public ResponseEntity<Page<User>> getUsersByRole(
            @PathVariable String roleName,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<User> users = userService.findByRoleName(roleName, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Page<User>> searchUsers(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        try {
            Page<User> users = userService.searchUsers(query, pageable);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDeleteUsers(@RequestBody List<Integer> userIds) {
        try {
            userService.bulkDeleteUsers(userIds);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/bulk-update-status")
    public ResponseEntity<Void> bulkUpdateUserStatus(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> userIds = (List<Integer>) request.get("userIds");
            Boolean enabled = (Boolean) request.get("enabled");
            userService.bulkUpdateUserStatus(userIds, enabled);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
