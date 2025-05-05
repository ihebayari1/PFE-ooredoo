package com.ooredoo.report_bulider.controller.user;

import com.ooredoo.report_bulider.user.Role;
import com.ooredoo.report_bulider.user.User;

import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface UserMapper {

    @Mapping(source = "department.name", target = "departmentName")
    @Mapping(source = "roles", target = "roles", qualifiedByName = "roleListToNames")
    UserResponse toDto(User user);

    @Mapping(target = "id_user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "assignedForms", ignore = true)
    @Mapping(target = "createdForms", ignore = true)
    @Mapping(target = "submissions", ignore = true)
    @Mapping(target = "enabled", constant = "false")
    @Mapping(target = "accountLocked", constant = "false")
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "department", ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "firstname", source = "firstname")
    @Mapping(target = "lastname", source = "lastname")
    @Mapping(target = "department", ignore = true)
    void updateUserFromDto(UserUpdateRequest dto, @MappingTarget User user);

    @Named("roleListToNames")
    static List<String> mapRoleNames(List<Role> roles) {
        return roles != null ? roles.stream()
                .map(Role::getName)
                .map(r -> r.replace("ROLE_", ""))
                .collect(Collectors.toList()) : new ArrayList<>();
    }
}
