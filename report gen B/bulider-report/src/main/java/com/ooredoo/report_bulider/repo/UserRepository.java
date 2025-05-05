package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository <User, Integer> {

    List<User> findByDepartmentId(Integer departmentId);
    Optional<User> findByEmail(String email);
}
