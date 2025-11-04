package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ZoneDTO {
    private Integer id;

    @NotBlank(message = "Zone name is required")
    private String name;

    private String description;
    private Integer zoneHeadId;

    @NotNull(message = "Sector ID is required")
    private Integer sectorId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ZoneDTO(Integer id, @NotBlank(message = "Zone name is required") String name, String description, Integer zoneHeadId, @NotNull(message = "Sector ID is required") Integer sectorId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.zoneHeadId = zoneHeadId;
        this.sectorId = sectorId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public ZoneDTO() {
    }

    public static ZoneDTOBuilder builder() {
        return new ZoneDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Zone name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public Integer getZoneHeadId() {
        return this.zoneHeadId;
    }

    public @NotNull(message = "Sector ID is required") Integer getSectorId() {
        return this.sectorId;
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

    public void setName(@NotBlank(message = "Zone name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setZoneHeadId(Integer zoneHeadId) {
        this.zoneHeadId = zoneHeadId;
    }

    public void setSectorId(@NotNull(message = "Sector ID is required") Integer sectorId) {
        this.sectorId = sectorId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class ZoneDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Zone name is required") String name;
        private String description;
        private Integer zoneHeadId;
        private @NotNull(message = "Sector ID is required") Integer sectorId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ZoneDTOBuilder() {
        }

        public ZoneDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public ZoneDTOBuilder name(@NotBlank(message = "Zone name is required") String name) {
            this.name = name;
            return this;
        }

        public ZoneDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ZoneDTOBuilder zoneHeadId(Integer zoneHeadId) {
            this.zoneHeadId = zoneHeadId;
            return this;
        }

        public ZoneDTOBuilder sectorId(@NotNull(message = "Sector ID is required") Integer sectorId) {
            this.sectorId = sectorId;
            return this;
        }

        public ZoneDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ZoneDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ZoneDTO build() {
            return new ZoneDTO(this.id, this.name, this.description, this.zoneHeadId, this.sectorId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "ZoneDTO.ZoneDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", zoneHeadId=" + this.zoneHeadId + ", sectorId=" + this.sectorId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}