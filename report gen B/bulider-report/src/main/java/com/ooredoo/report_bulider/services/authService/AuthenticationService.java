package com.ooredoo.report_bulider.services.authService;

import com.ooredoo.report_bulider.controller.auth.RegistrationRequest;
import com.ooredoo.report_bulider.repo.RoleRepository;
import com.ooredoo.report_bulider.repo.TokenRepository;
import com.ooredoo.report_bulider.repo.UserRepository;
import com.ooredoo.report_bulider.user.Token;
import com.ooredoo.report_bulider.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private  final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    public void register(RegistrationRequest request) {

    var userRole = roleRepository.findByName("USER")
            .orElseThrow(() -> new IllegalStateException("Role user not initialized"));


    var user = User.builder()
            .firstname(request.getFirstname())
            .lastname(request.getLastname())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .accountLocked(false)
            .enabled(false)
            .roles(List.of(userRole))
            .build();
    userRepository.save(user);
    sendValidationEmail(user);
    }

    private void sendValidationEmail(User user) {
        var newToken = generateAndSaveActivationToken(user);
        //send Email

    }

    private String generateAndSaveActivationToken(User user) {
        //generate a Token
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
                .token(generatedToken).createdAt(LocalDateTime.now())
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
}

