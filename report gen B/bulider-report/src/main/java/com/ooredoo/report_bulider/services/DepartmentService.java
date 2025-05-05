package com.ooredoo.report_bulider.services;

import com.ooredoo.report_bulider.controller.department.AdminChangeRequest;
import com.ooredoo.report_bulider.controller.department.DepartmentCreationRequest;
import com.ooredoo.report_bulider.controller.department.DepartmentResponse;
import com.ooredoo.report_bulider.controller.department.DepartmentUpdateRequest;
import com.ooredoo.report_bulider.entity.Department;
import com.ooredoo.report_bulider.entity.mapper.DepartmentMapper;
import com.ooredoo.report_bulider.entity.mapper.UserSummaryMapper;
import com.ooredoo.report_bulider.enums.RoleType;
import com.ooredoo.report_bulider.handler.ResourceNotFoundException;
import com.ooredoo.report_bulider.repo.DepartmentRepository;
import com.ooredoo.report_bulider.repo.RoleRepository;
import com.ooredoo.report_bulider.repo.UserRepository;
import com.ooredoo.report_bulider.user.Role;
import com.ooredoo.report_bulider.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentMapper departmentMapper;
    private final UserSummaryMapper userSummaryMapper;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository, RoleRepository roleRepository, DepartmentMapper departmentMapper, UserSummaryMapper userSummaryMapper) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentMapper = departmentMapper;
        this.userSummaryMapper = userSummaryMapper;
    }

    public DepartmentResponse createDepartment(DepartmentCreationRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            throw new RuntimeException("Department with this name already exists");
        }

        Department department = departmentMapper.toEntity(request);

        User admin = userRepository.findById(request.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        // Assign department admin role if not already assigned
        Role deptAdminRole = roleRepository.findByName(RoleType.DEPARTMENT_ADMIN.getValue())
                .orElseThrow(() -> new RuntimeException("Department admin role not found"));

        if (!admin.getRoles().contains(deptAdminRole)) {
            admin.getRoles().add(deptAdminRole);
            userRepository.save(admin);
        }

        department.setDepartmentAdmin(admin);

        department = departmentRepository.save(department);

        // Update admin's department if not set
        if (admin.getDepartment() == null || !admin.getDepartment().equals(department)) {
            admin.setDepartment(department);
            userRepository.save(admin);
        }

        return departmentMapper.toResponse(department, userSummaryMapper);
    }

    public DepartmentResponse updateDepartment(Integer departmentId, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        departmentMapper.updateFromRequest(request, department);
        return departmentMapper.toResponse(departmentRepository.save(department), userSummaryMapper);
    }

    public void deleteDepartment(Integer departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        for (User user : department.getUsers()) {
            user.setDepartment(null);
            userRepository.save(user);
        }

        departmentRepository.delete(department);
    }

    public void addUserToDepartment(Integer userId, Integer departmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        user.setDepartment(department);
        userRepository.save(user);
    }

    public DepartmentResponse changeDepartmentAdmin(Integer departmentId, AdminChangeRequest request) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        User newAdmin = userRepository.findById(request.getNewAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        department.setDepartmentAdmin(newAdmin);
        departmentRepository.save(department);

        return departmentMapper.toResponse(department, userSummaryMapper);
    }

    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(dept -> departmentMapper.toResponse(dept, userSummaryMapper))
                .collect(Collectors.toList());
    }
}
