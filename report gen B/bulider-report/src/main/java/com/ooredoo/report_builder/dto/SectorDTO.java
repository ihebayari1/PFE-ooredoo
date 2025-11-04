package com.ooredoo.report_builder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class SectorDTO {
    private Integer id;

    @NotBlank(message = "Sector name is required")
    private String name;

    private String description;
    private Integer sectorHeadId;

    @NotNull(message = "Enterprise ID is required")
    private Integer enterpriseId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SectorDTO(Integer id, @NotBlank(message = "Sector name is required") String name, String description, Integer sectorHeadId, @NotNull(message = "Enterprise ID is required") Integer enterpriseId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sectorHeadId = sectorHeadId;
        this.enterpriseId = enterpriseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public SectorDTO() {
    }

    public static SectorDTOBuilder builder() {
        return new SectorDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Sector name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public Integer getSectorHeadId() {
        return this.sectorHeadId;
    }

    public @NotNull(message = "Enterprise ID is required") Integer getEnterpriseId() {
        return this.enterpriseId;
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

    public void setName(@NotBlank(message = "Sector name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSectorHeadId(Integer sectorHeadId) {
        this.sectorHeadId = sectorHeadId;
    }

    public void setEnterpriseId(@NotNull(message = "Enterprise ID is required") Integer enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class SectorDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Sector name is required") String name;
        private String description;
        private Integer sectorHeadId;
        private @NotNull(message = "Enterprise ID is required") Integer enterpriseId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        SectorDTOBuilder() {
        }

        public SectorDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public SectorDTOBuilder name(@NotBlank(message = "Sector name is required") String name) {
            this.name = name;
            return this;
        }

        public SectorDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public SectorDTOBuilder sectorHeadId(Integer sectorHeadId) {
            this.sectorHeadId = sectorHeadId;
            return this;
        }

        public SectorDTOBuilder enterpriseId(@NotNull(message = "Enterprise ID is required") Integer enterpriseId) {
            this.enterpriseId = enterpriseId;
            return this;
        }

        public SectorDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SectorDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public SectorDTO build() {
            return new SectorDTO(this.id, this.name, this.description, this.sectorHeadId, this.enterpriseId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "SectorDTO.SectorDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", sectorHeadId=" + this.sectorHeadId + ", enterpriseId=" + this.enterpriseId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}