package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.Department;
import com.ooredoo.report_bulider.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);

    boolean existsByDepartmentAdminAndIdNot(User admin, Integer departmentId);
}
