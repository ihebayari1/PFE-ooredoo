package com.ooredoo.report_bulider.entity.mapper;

import com.ooredoo.report_bulider.controller.department.DepartmentCreationRequest;
import com.ooredoo.report_bulider.controller.department.DepartmentResponse;
import com.ooredoo.report_bulider.controller.department.DepartmentUpdateRequest;
import com.ooredoo.report_bulider.entity.Department;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = UserSummaryMapper.class)
public interface DepartmentMapper {

    @Mapping(target = "admin", expression = "java(department.getDepartmentAdmin() != null ? userSummaryMapper.toSummary(department.getDepartmentAdmin()) : null)")
    @Mapping(target = "users", expression = "java(department.getUsers() != null ? userSummaryMapper.toUserSummaryList(department.getUsers()) : null)")
    DepartmentResponse toResponse(Department department, @Context UserSummaryMapper userSummaryMapper);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departmentAdmin", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Department toEntity(DepartmentCreationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "departmentAdmin", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(DepartmentUpdateRequest request, @MappingTarget Department department);
}
