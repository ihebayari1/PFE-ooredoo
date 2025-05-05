package com.ooredoo.report_bulider.controller;

import com.ooredoo.report_bulider.controller.user.UserCreateRequest;
import com.ooredoo.report_bulider.controller.user.UserResponse;
import com.ooredoo.report_bulider.controller.user.UserUpdateRequest;
import com.ooredoo.report_bulider.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MAIN_ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) throws MessagingException {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MAIN_ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasAnyAuthority('MAIN_ADMIN', 'DEPARTMENT_ADMIN')")
    public List<UserResponse> getUsersByDepartment(@PathVariable int departmentId) {
        return userService.getUsersByDepartment(departmentId);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('MAIN_ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Integer userId, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('MAIN_ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }

    @PostMapping("/activate")
    public ResponseEntity<MessageResponse> activateAccount(@RequestParam("token") String token) throws MessagingException {
        userService.activateAccount(token);
        return ResponseEntity.ok(new MessageResponse("Account activated successfully"));
    }
}
