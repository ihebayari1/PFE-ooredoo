package com.ooredoo.report_builder.dto;

import com.ooredoo.report_builder.user.User;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class EnterpriseDTO {
    private Integer id;

    @NotBlank(message = "Enterprise name is required")
    private String name;

    private String description;
    private String logo;
    private String primaryColor;
    private String secondaryColor;
    private User enterpriseAdmin;
    private Integer enterpriseAdminId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EnterpriseDTO(Integer id, @NotBlank(message = "Enterprise name is required") String name, String description, String logo, String primaryColor, String secondaryColor, User enterpriseAdmin, Integer enterpriseAdminId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.enterpriseAdmin = enterpriseAdmin;
        this.enterpriseAdminId = enterpriseAdminId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public EnterpriseDTO() {
    }

    public static EnterpriseDTOBuilder builder() {
        return new EnterpriseDTOBuilder();
    }

    public Integer getId() {
        return this.id;
    }

    public @NotBlank(message = "Enterprise name is required") String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public String getLogo() {
        return this.logo;
    }

    public String getPrimaryColor() {
        return this.primaryColor;
    }

    public String getSecondaryColor() {
        return this.secondaryColor;
    }

    public User getEnterpriseAdmin() {
        return this.enterpriseAdmin;
    }

    public Integer getEnterpriseAdminId() {
        return this.enterpriseAdminId;
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

    public void setName(@NotBlank(message = "Enterprise name is required") String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public void setEnterpriseAdmin(User enterpriseAdmin) {
        this.enterpriseAdmin = enterpriseAdmin;
    }

    public void setEnterpriseAdminId(Integer enterpriseAdminId) {
        this.enterpriseAdminId = enterpriseAdminId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class EnterpriseDTOBuilder {
        private Integer id;
        private @NotBlank(message = "Enterprise name is required") String name;
        private String description;
        private String logo;
        private String primaryColor;
        private String secondaryColor;
        private User enterpriseAdmin;
        private Integer enterpriseAdminId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        EnterpriseDTOBuilder() {
        }

        public EnterpriseDTOBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public EnterpriseDTOBuilder name(@NotBlank(message = "Enterprise name is required") String name) {
            this.name = name;
            return this;
        }

        public EnterpriseDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public EnterpriseDTOBuilder logo(String logo) {
            this.logo = logo;
            return this;
        }

        public EnterpriseDTOBuilder primaryColor(String primaryColor) {
            this.primaryColor = primaryColor;
            return this;
        }

        public EnterpriseDTOBuilder secondaryColor(String secondaryColor) {
            this.secondaryColor = secondaryColor;
            return this;
        }

        public EnterpriseDTOBuilder enterpriseAdmin(User enterpriseAdmin) {
            this.enterpriseAdmin = enterpriseAdmin;
            return this;
        }

        public EnterpriseDTOBuilder enterpriseAdminId(Integer enterpriseAdminId) {
            this.enterpriseAdminId = enterpriseAdminId;
            return this;
        }

        public EnterpriseDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public EnterpriseDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public EnterpriseDTO build() {
            return new EnterpriseDTO(this.id, this.name, this.description, this.logo, this.primaryColor, this.secondaryColor, this.enterpriseAdmin, this.enterpriseAdminId, this.createdAt, this.updatedAt);
        }

        public String toString() {
            return "EnterpriseDTO.EnterpriseDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", logo=" + this.logo + ", primaryColor=" + this.primaryColor + ", secondaryColor=" + this.secondaryColor + ", enterpriseAdmin=" + this.enterpriseAdmin + ", enterpriseAdminId=" + this.enterpriseAdminId + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ")";
        }
    }
}