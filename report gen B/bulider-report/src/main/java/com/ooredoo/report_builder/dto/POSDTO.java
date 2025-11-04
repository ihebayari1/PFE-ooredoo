package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class POSDTO {
    private Integer id;

    @NotBlank(message = "POS name is required")
    private String name;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    private Integer managerId;

    @NotNull(message = "Enterprise ID is required")
    private Integer enterpriseId;

    private Integer regionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public POSDTO(Integer id, @NotBlank(message = "POS name is required") String name, String description, @NotBlank(message = "Location is required") String location, Integer managerId, @NotNull(message = "Enterprise ID is required") Integer enterpriseId, Integer regionId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.managerId = managerId;
        this.enterpriseId = enterpriseId;
        this.regionId = regionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public POSDTO() {
    }

    public static POSDTOBuilder builder() {
        return new POSDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "POS name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public @NotBlank(message = "Location is required") String getLocation() {
        return this.location;
    }

    public Integer getManagerId() {
        return this.managerId;
    }

    public @NotNull(message = "Enterprise ID is required") Integer getEnterpriseId() {
        return this.enterpriseId;
    }

    public Integer getRegionId() {
        return this.regionId;
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

    public void setName(@NotBlank(message = "POS name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocation(@NotBlank(message = "Location is required") String location) {
        this.location = location;
    }

    public void setManagerId(Integer managerId) {
        this.managerId = managerId;
    }

    public void setEnterpriseId(@NotNull(message = "Enterprise ID is required") Integer enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public void setRegionId(Integer regionId) {
        this.regionId = regionId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class POSDTOBuilder {
        private Integer id;
        private @NotBlank(message = "POS name is required") String name;
        private String description;
        private @NotBlank(message = "Location is required") String location;
        private Integer managerId;
        private @NotNull(message = "Enterprise ID is required") Integer enterpriseId;
        private Integer regionId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        POSDTOBuilder() {
        }

        public POSDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public POSDTOBuilder name(@NotBlank(message = "POS name is required") String name) {
            this.name = name;
            return this;
        }

        public POSDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public POSDTOBuilder location(@NotBlank(message = "Location is required") String location) {
            this.location = location;
            return this;
        }

        public POSDTOBuilder managerId(Integer managerId) {
            this.managerId = managerId;
            return this;
        }

        public POSDTOBuilder enterpriseId(@NotNull(message = "Enterprise ID is required") Integer enterpriseId) {
            this.enterpriseId = enterpriseId;
            return this;
        }

        public POSDTOBuilder regionId(Integer regionId) {
            this.regionId = regionId;
            return this;
        }

        public POSDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public POSDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public POSDTO build() {
            return new POSDTO(this.id, this.name, this.description, this.location, this.managerId, this.enterpriseId, this.regionId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "POSDTO.POSDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", location=" + this.location + ", managerId=" + this.managerId + ", enterpriseId=" + this.enterpriseId + ", regionId=" + this.regionId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}