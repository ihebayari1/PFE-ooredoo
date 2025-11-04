package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Set;

public class AnimatorDTO {
    private Integer id;

    @NotBlank(message = "PIN is required")
    private String pin;

    private String description;

    @NotNull(message = "Role ID is required")
    private Integer roleId;

    private Integer posId;

    private Set<Integer> userIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnimatorDTO(Integer id, @NotBlank(message = "PIN is required") String pin, String description, @NotNull(message = "Role ID is required") Integer roleId, Integer posId, Set<Integer> userIds, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.pin = pin;
        this.description = description;
        this.roleId = roleId;
        this.posId = posId;
        this.userIds = userIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public AnimatorDTO() {
    }

    public static AnimatorDTOBuilder builder() {
        return new AnimatorDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "PIN is required") String getPin() {
        return this.pin;
    }

    public String getDescription() {
        return this.description;
    }

    public @NotNull(message = "Role ID is required") Integer getRoleId() {
        return this.roleId;
    }

    public Integer getPosId() {
        return this.posId;
    }

    public Set<Integer> getUserIds() {
        return this.userIds;
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

    public void setPin(@NotBlank(message = "PIN is required") String pin) {
        this.pin = pin;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRoleId(@NotNull(message = "Role ID is required") Integer roleId) {
        this.roleId = roleId;
    }

    public void setPosId(Integer posId) {
        this.posId = posId;
    }

    public void setUserIds(Set<Integer> userIds) {
        this.userIds = userIds;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class AnimatorDTOBuilder {
        private Integer id;
        private @NotBlank(message = "PIN is required") String pin;
        private String description;
        private @NotNull(message = "Role ID is required") Integer roleId;
        private Integer posId;
        private Set<Integer> userIds;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        AnimatorDTOBuilder() {
        }

        public AnimatorDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AnimatorDTOBuilder pin(@NotBlank(message = "PIN is required") String pin) {
            this.pin = pin;
            return this;
        }

        public AnimatorDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public AnimatorDTOBuilder roleId(@NotNull(message = "Role ID is required") Integer roleId) {
            this.roleId = roleId;
            return this;
        }

        public AnimatorDTOBuilder posId(Integer posId) {
            this.posId = posId;
            return this;
        }

        public AnimatorDTOBuilder userIds(Set<Integer> userIds) {
            this.userIds = userIds;
            return this;
        }

        public AnimatorDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AnimatorDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public AnimatorDTO build() {
            return new AnimatorDTO(this.id, this.pin, this.description, this.roleId, this.posId, this.userIds, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "AnimatorDTO.AnimatorDTOBuilder(id=" + this.id + ", pin=" + this.pin + ", description=" + this.description + ", roleId=" + this.roleId + ", posId=" + this.posId + ", userIds=" + this.userIds + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}