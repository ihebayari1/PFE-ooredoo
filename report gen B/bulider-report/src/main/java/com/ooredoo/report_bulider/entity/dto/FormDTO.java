package com.ooredoo.report_bulider.entity.dto;

import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.FormSubmission;
import com.ooredoo.report_bulider.user.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class FormDTO {


    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer creatorId;
    private List<FormComponent> components;
    private List<FormSubmission> submissions;
    private Set<User> assignedUsers;


    public FormDTO() {
    }

    public FormDTO(Long id, String name, String description, LocalDateTime createdAt, LocalDateTime updatedAt, Integer creatorId, List<FormComponent> components, List<FormSubmission> submissions, Set<User> assignedUsers) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.creatorId = creatorId;
        this.components = components;
        this.submissions = submissions;
        this.assignedUsers = assignedUsers;
    }

    public static FormDTOBuilder builder() {
        return new FormDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public Integer getCreatorId() {
        return this.creatorId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setCreatorId(Integer creatorId) {
        this.creatorId = creatorId;
    }

    public List<FormComponent> getComponents() {
        return this.components;
    }

    public List<FormSubmission> getSubmissions() {
        return this.submissions;
    }

    public Set<User> getAssignedUsers() {
        return this.assignedUsers;
    }

    public void setComponents(List<FormComponent> components) {
        this.components = components;
    }

    public void setSubmissions(List<FormSubmission> submissions) {
        this.submissions = submissions;
    }

    public void setAssignedUsers(Set<User> assignedUsers) {
        this.assignedUsers = assignedUsers;
    }

    public static class FormDTOBuilder {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer creatorId;
        private List<FormComponent> components;
        private List<FormSubmission> submissions;
        private Set<User> assignedUsers;

        FormDTOBuilder() {
        }

        public FormDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FormDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public FormDTOBuilder description(String description) {
            this.description = description;
            return this;
        }

        public FormDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public FormDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public FormDTOBuilder creatorId(Integer creatorId) {
            this.creatorId = creatorId;
            return this;
        }

        public String toString() {
            return "FormDTO.FormDTOBuilder(id=" + this.id + ", name=" + this.name + ", description=" + this.description + ", createdAt=" + this.createdAt + ", updatedAt=" + this.updatedAt + ", creatorId=" + this.creatorId + ")";
        }

        public FormDTOBuilder components(List<FormComponent> components) {
            this.components = components;
            return this;
        }

        public FormDTOBuilder submissions(List<FormSubmission> submissions) {
            this.submissions = submissions;
            return this;
        }

        public FormDTOBuilder assignedUsers(Set<User> assignedUsers) {
            this.assignedUsers = assignedUsers;
            return this;
        }

        public FormDTO build() {
            return new FormDTO(this.id, this.name, this.description, this.createdAt, this.updatedAt, this.creatorId, this.components, this.submissions, this.assignedUsers);
        }
    }
}
