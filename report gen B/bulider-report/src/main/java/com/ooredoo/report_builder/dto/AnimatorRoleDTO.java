package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.Set;

public class AnimatorRoleDTO {
    private Integer id;

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    private Set<Integer> actionIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnimatorRoleDTO(Integer id, @NotBlank(message = "Role name is required") String name, String description, Set<Integer> actionIds, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.actionIds = actionIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public AnimatorRoleDTO() {
    }

    public static AnimatorRoleDTOBuilder builder() {
        return new AnimatorRoleDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Role name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public Set<Integer> getActionIds() {
        return this.actionIds;
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

    public void setName(@NotBlank(message = "Role name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActionIds(Set<Integer> actionIds) {
        this.actionIds = actionIds;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class AnimatorRoleDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Role name is required") String name;
        private String description;
        private Set<Integer> actionIds;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        AnimatorRoleDTOBuilder() {
        }

        public AnimatorRoleDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AnimatorRoleDTOBuilder name(@NotBlank(message = "Role name is required") String name) {
            this.name = name;
            return this;
        }

        public AnimatorRoleDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public AnimatorRoleDTOBuilder actionIds(Set<Integer> actionIds) {
            this.actionIds = actionIds;
            return this;
        }

        public AnimatorRoleDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AnimatorRoleDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public AnimatorRoleDTO build() {
            return new AnimatorRoleDTO(this.id, this.name, this.description, this.actionIds, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "AnimatorRoleDTO.AnimatorRoleDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", actionIds=" + this.actionIds + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}