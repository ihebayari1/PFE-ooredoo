package com.ooredoo.report_bulider.entity.mapper;

import com.ooredoo.report_bulider.controller.department.UserSummaryResponse;
import com.ooredoo.report_bulider.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserSummaryMapper {

    @Named("toSummary")
    default UserSummaryResponse toSummary(User user) {
        if (user == null) return null;

        UserSummaryResponse dto = new UserSummaryResponse();
        dto.setId(user.getId_user());
        dto.setFirstname(user.getFirstname());
        dto.setLastname(user.getLastname());
        dto.setEmail(user.getEmail());
        return dto;
    }

    @Named("toSummaryList")
    default List<UserSummaryResponse> toUserSummaryList(Set<User> users) {
        if (users == null) return null;

        return users.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }
}

