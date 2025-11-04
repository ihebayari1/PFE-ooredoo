package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "points_of_sale")
public class POS extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String location;

    // POS Manager
    @OneToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    // Users assigned to this POS
    @OneToMany(mappedBy = "pos")
    private Set<User> users = new HashSet<>();

    // Enterprise this POS belongs to
    @ManyToOne
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    // Region this POS belongs to
    @ManyToOne
    @JoinColumn(name = "region_id")
    private Region region;


    public POS(String name, String description, String location, User manager, Set<User> users, Enterprise enterprise, Region region) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.manager = manager;
        this.users = users;
        this.enterprise = enterprise;
        this.region = region;
    }

    public POS() {
    }

    protected POS(POSBuilder<?, ?> b) {
        super(b);
        this.name = b.name;
        this.description = b.description;
        this.location = b.location;
        this.manager = b.manager;
        this.users = b.users;
        this.enterprise = b.enterprise;
        this.region = b.region;
    }

    public static POSBuilder<?, ?> builder() {
        return new POSBuilderImpl();
    }

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public String getLocation() {
        return this.location;
    }

    public User getManager() {
        return this.manager;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public Enterprise getEnterprise() {
        return this.enterprise;
    }

    public Region getRegion() {
        return this.region;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setManager(User manager) {
        this.manager = manager;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public void setEnterprise(Enterprise enterprise) {
        this.enterprise = enterprise;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public static abstract class POSBuilder<C extends POS, B extends POSBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private String name;
        private String description;
        private String location;
        private User manager;
        private Set<User> users;
        private Enterprise enterprise;
        private Region region;

        public B name(String name) {
            this.name = name;
            return self();
        }

        public B description(String description) {
            this.description = description;
            return self();
        }

        public B location(String location) {
            this.location = location;
            return self();
        }

        public B manager(User manager) {
            this.manager = manager;
            return self();
        }

        public B users(Set<User> users) {
            this.users = users;
            return self();
        }

        public B enterprise(Enterprise enterprise) {
            this.enterprise = enterprise;
            return self();
        }

        public B region(Region region) {
            this.region = region;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "POS.POSBuilder(super=" + super.toString() + ", name=" + this.name + ", description=" + this.description + ", location=" + this.location + ", manager=" + this.manager + ", users=" + this.users + ", enterprise=" + this.enterprise + ", region=" + this.region + ")";
        }
    }

    private static final class POSBuilderImpl extends POSBuilder<POS, POSBuilderImpl> {
        private POSBuilderImpl() {
        }

        protected POSBuilderImpl self() {
            return this;
        }

        public POS build() {
            return new POS(this);
        }
    }
}