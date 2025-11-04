package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "forms")
public class Form extends BaseEntity {

    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL)
    private List<FormComponent> components;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL)
    private List<FormSubmission> submissions;

    @ManyToMany
    @JoinTable(
            name = "form_assigned_users",
            joinColumns = @JoinColumn(name = "form_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignedUsers;

    public Form(String name, String description, User creator, List<FormComponent> components, List<FormSubmission> submissions, Set<User> assignedUsers) {
        this.name = name;
        this.description = description;
        this.creator = creator;
        this.components = components;
        this.submissions = submissions;
        this.assignedUsers = assignedUsers;
    }

    public Form() {
    }

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public User getCreator() {
        return this.creator;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCreator(User creator) {
        this.creator = creator;
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
}
