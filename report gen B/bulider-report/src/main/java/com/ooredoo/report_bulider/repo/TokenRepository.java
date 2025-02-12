package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.user.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository <Token, Integer> {

    Optional<Token> findByToken(String token);
}
