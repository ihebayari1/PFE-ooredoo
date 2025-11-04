package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "animators")
public class Animator extends BaseEntity {


    @Column(nullable = false, unique = true)
    private String pin;

    private String description;

    // Role associated with this animator PIN
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private AnimatorRole role;

    // Users assigned this animator PIN
    @ManyToMany
    @JoinTable(
        name = "user_animators",
        joinColumns = @JoinColumn(name = "animator_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users = new HashSet<>();
    
    // Point of Sale this animator is assigned to
    @ManyToOne
    @JoinColumn(name = "pos_id")
    private POS pos;


    public Animator() {
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AnimatorRole getRole() {
        return role;
    }

    public void setRole(AnimatorRole role) {
        this.role = role;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public POS getPos() {
        return pos;
    }
    
    public void setPos(POS pos) {
        this.pos = pos;
    }
}