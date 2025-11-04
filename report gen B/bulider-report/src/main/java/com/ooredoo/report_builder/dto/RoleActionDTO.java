package com.ooredoo.report_builder.dto;

import com.ooredoo.report_builder.entity.RoleAction.ActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class RoleActionDTO {
    private Integer id;

    @NotBlank(message = "Action name is required")
    private String name;

    private String description;

    @NotNull(message = "Action type is required")
    private ActionType actionType;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    @NotNull(message = "Role ID is required")
    private Integer roleId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoleActionDTO(Integer id, @NotBlank(message = "Action name is required") String name, String description, @NotNull(message = "Action type is required") ActionType actionType, @NotBlank(message = "Resource type is required") String resourceType, @NotNull(message = "Role ID is required") Integer roleId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.actionType = actionType;
        this.resourceType = resourceType;
        this.roleId = roleId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public RoleActionDTO() {
    }

    public static RoleActionDTOBuilder builder() {
        return new RoleActionDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Action name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public @NotNull(message = "Action type is required") ActionType getActionType() {
        return this.actionType;
    }

    public @NotBlank(message = "Resource type is required") String getResourceType() {
        return this.resourceType;
    }

    public @NotNull(message = "Role ID is required") Integer getRoleId() {
        return this.roleId;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setName(@NotBlank(message = "Action name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActionType(@NotNull(message = "Action type is required") ActionType actionType) {
        this.actionType = actionType;
    }

    public void setResourceType(@NotBlank(message = "Resource type is required") String resourceType) {
        this.resourceType = resourceType;
    }

    public void setRoleId(@NotNull(message = "Role ID is required") Integer roleId) {
        this.roleId = roleId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class RoleActionDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Action name is required") String name;
        private String description;
        private @NotNull(message = "Action type is required") ActionType actionType;
        private @NotBlank(message = "Resource type is required") String resourceType;
        private @NotNull(message = "Role ID is required") Integer roleId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RoleActionDTOBuilder() {
        }

        public RoleActionDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public RoleActionDTOBuilder name(@NotBlank(message = "Action name is required") String name) {
            this.name = name;
            return this;
        }

        public RoleActionDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RoleActionDTOBuilder actionType(@NotNull(message = "Action type is required") ActionType actionType) {
            this.actionType = actionType;
            return this;
        }

        public RoleActionDTOBuilder resourceType(@NotBlank(message = "Resource type is required") String resourceType) {
            this.resourceType = resourceType;
            return this;
        }

        public RoleActionDTOBuilder roleId(@NotNull(message = "Role ID is required") Integer roleId) {
            this.roleId = roleId;
            return this;
        }

        public RoleActionDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RoleActionDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RoleActionDTO build() {
            return new RoleActionDTO(this.id, this.name, this.description, this.actionType, this.resourceType, this.roleId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "RoleActionDTO.RoleActionDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", actionType=" + this.actionType + ", resourceType=" + this.resourceType + ", roleId=" + this.roleId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}