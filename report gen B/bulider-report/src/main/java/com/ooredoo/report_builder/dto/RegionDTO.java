package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class RegionDTO {
    private Integer id;

    @NotBlank(message = "Region name is required")
    private String name;

    private String description;
    private Integer regionHeadId;

    @NotNull(message = "Zone ID is required")
    private Integer zoneId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RegionDTO(Integer id, @NotBlank(message = "Region name is required") String name, String description, Integer regionHeadId, @NotNull(message = "Zone ID is required") Integer zoneId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.regionHeadId = regionHeadId;
        this.zoneId = zoneId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public RegionDTO() {
    }

    public static RegionDTOBuilder builder() {
        return new RegionDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Region name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public Integer getRegionHeadId() {
        return this.regionHeadId;
    }

    public @NotNull(message = "Zone ID is required") Integer getZoneId() {
        return this.zoneId;
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

    public void setName(@NotBlank(message = "Region name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRegionHeadId(Integer regionHeadId) {
        this.regionHeadId = regionHeadId;
    }

    public void setZoneId(@NotNull(message = "Zone ID is required") Integer zoneId) {
        this.zoneId = zoneId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class RegionDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Region name is required") String name;
        private String description;
        private Integer regionHeadId;
        private @NotNull(message = "Zone ID is required") Integer zoneId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RegionDTOBuilder() {
        }

        public RegionDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public RegionDTOBuilder name(@NotBlank(message = "Region name is required") String name) {
            this.name = name;
            return this;
        }

        public RegionDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RegionDTOBuilder regionHeadId(Integer regionHeadId) {
            this.regionHeadId = regionHeadId;
            return this;
        }

        public RegionDTOBuilder zoneId(@NotNull(message = "Zone ID is required") Integer zoneId) {
            this.zoneId = zoneId;
            return this;
        }

        public RegionDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RegionDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RegionDTO build() {
            return new RegionDTO(this.id, this.name, this.description, this.regionHeadId, this.zoneId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "RegionDTO.RegionDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", regionHeadId=" + this.regionHeadId + ", zoneId=" + this.zoneId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}