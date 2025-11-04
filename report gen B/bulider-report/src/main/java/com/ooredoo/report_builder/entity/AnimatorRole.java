package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "animator_roles")
public class AnimatorRole extends BaseEntity {


    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    // Actions associated with this role
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private Set<RoleAction> actions = new HashSet<>();

    // Animators using this role
    @OneToMany(mappedBy = "role")
    private Set<Animator> animators = new HashSet<>();


    public AnimatorRole() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<RoleAction> getActions() {
        return actions;
    }

    public void setActions(Set<RoleAction> actions) {
        this.actions = actions;
    }

    public Set<Animator> getAnimators() {
        return animators;
    }

    public void setAnimators(Set<Animator> animators) {
        this.animators = animators;
    }

}