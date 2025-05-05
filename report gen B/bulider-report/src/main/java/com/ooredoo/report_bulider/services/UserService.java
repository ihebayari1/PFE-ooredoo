package com.ooredoo.report_bulider.services;

import com.ooredoo.report_bulider.controller.user.UserCreateRequest;
import com.ooredoo.report_bulider.controller.user.UserMapper;
import com.ooredoo.report_bulider.controller.user.UserResponse;
import com.ooredoo.report_bulider.controller.user.UserUpdateRequest;
import com.ooredoo.report_bulider.entity.Department;
import com.ooredoo.report_bulider.repo.DepartmentRepository;
import com.ooredoo.report_bulider.repo.RoleRepository;
import com.ooredoo.report_bulider.repo.TokenRepository;
import com.ooredoo.report_bulider.repo.UserRepository;
import com.ooredoo.report_bulider.services.services.email.EmailService;
import com.ooredoo.report_bulider.services.services.email.EmailTemplateName;
import com.ooredoo.report_bulider.user.Role;
import com.ooredoo.report_bulider.user.Token;
import com.ooredoo.report_bulider.user.User;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public static final String ACTIVATION_URL = "//localhost:4200/activation-account";

    public UserService(UserRepository userRepository, DepartmentRepository departmentRepository, RoleRepository roleRepository, TokenRepository tokenRepository, EmailService emailService, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }


    public UserResponse createUser(UserCreateRequest request) throws MessagingException {
        User user = userMapper.toEntity(request);

        // Set encoded password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        user.setDepartment(department);

        // Set roles
        List<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName("ROLE_" + roleName.toUpperCase())
                        .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                .collect(Collectors.toList());
        user.setRoles(roles);

        // Save user first (needed before sending email)
        user = userRepository.save(user);

        // Send Activation Email
        sendValidationEmail(user);

        return userMapper.toDto(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByDepartment(int departmentId) {
        return userRepository.findByDepartmentId(departmentId).stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstname() != null) user.setFirstname(request.getFirstname());
        if (request.getLastname() != null) user.setLastname(request.getLastname());
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            user.setDepartment(department);
        }

        return userMapper.toDto(userRepository.save(user));
    }

    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }

    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSaveActivationToken(user);

        emailService.sendEmail(
                user.getEmail(),
                user.fullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                ACTIVATION_URL,
                newToken,
                "Account Activation"
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expirationAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder(length);
        SecureRandom secureRandom = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }

    @Transactional
    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (LocalDateTime.now().isAfter(savedToken.getExpirationAt())) {
            sendValidationEmail(savedToken.getUser());
            throw new RuntimeException("Token expired. New token has been sent to your email.");
        }

        User user = userRepository.findById(savedToken.getUser().getId_user())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setEnabled(true);
        userRepository.save(user);

        savedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(savedToken);
    }

    public User getCurrentAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(email);
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
