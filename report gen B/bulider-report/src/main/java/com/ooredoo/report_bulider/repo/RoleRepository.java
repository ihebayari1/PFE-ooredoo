package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository <Role, Integer>{

    Optional<Role> findByName(String role);
}
