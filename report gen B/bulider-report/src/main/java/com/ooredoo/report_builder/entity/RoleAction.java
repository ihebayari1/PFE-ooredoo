package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "role_actions")

public class RoleAction extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;


    // Action type (e.g., READ, WRITE, DELETE, etc.)
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    // Resource type this action applies to (e.g., FORM, USER, REPORT)
    @Column(nullable = false)
    private String resourceType;

    // Role this action belongs to
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private AnimatorRole role;

    public RoleAction(String name, String description, ActionType actionType, String resourceType, AnimatorRole role) {
        this.name = name;
        this.description = description;
        this.actionType = actionType;
        this.resourceType = resourceType;
        this.role = role;
    }

    public RoleAction() {
    }

    protected RoleAction(RoleActionBuilder<?, ?> b) {
        super(b);
        this.name = b.name;
        this.description = b.description;
        this.actionType = b.actionType;
        this.resourceType = b.resourceType;
        this.role = b.role;
    }

    public static RoleActionBuilder<?, ?> builder() {
        return new RoleActionBuilderImpl();
    }

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public ActionType getActionType() {
        return this.actionType;
    }

    public String getResourceType() {
        return this.resourceType;
    }

    public AnimatorRole getRole() {
        return this.role;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public void setRole(AnimatorRole role) {
        this.role = role;
    }


    public enum ActionType {
        READ,
        WRITE,
        UPDATE,
        DELETE,
        EXECUTE,
        ASSIGN
    }


    public static abstract class RoleActionBuilder<C extends RoleAction, B extends RoleActionBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private String name;
        private String description;
        private ActionType actionType;
        private String resourceType;
        private AnimatorRole role;

        public B name(String name) {
            this.name = name;
            return self();
        }

        public B description(String description) {
            this.description = description;
            return self();
        }

        public B actionType(ActionType actionType) {
            this.actionType = actionType;
            return self();
        }

        public B resourceType(String resourceType) {
            this.resourceType = resourceType;
            return self();
        }

        public B role(AnimatorRole role) {
            this.role = role;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "RoleAction.RoleActionBuilder(super=" + super.toString() + ", name=" + this.name + ", description=" + this.description + ", actionType=" + this.actionType + ", resourceType=" + this.resourceType + ", role=" + this.role + ")";
        }
    }

    private static final class RoleActionBuilderImpl extends RoleActionBuilder<RoleAction, RoleActionBuilderImpl> {
        private RoleActionBuilderImpl() {
        }

        protected RoleActionBuilderImpl self() {
            return this;
        }

        public RoleAction build() {
            return new RoleAction(this);
        }
    }
}