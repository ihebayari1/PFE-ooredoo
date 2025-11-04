package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BasedGeoSpace;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@SuperBuilder
@Table(name = "sectors")
public class Sector extends BasedGeoSpace {


    // Head of Sector
    @OneToOne
    @JoinColumn(name = "head_id")
    private User sectorHead;

    // Users assigned to this sector
    @OneToMany(mappedBy = "sector")
    private Set<User> users = new HashSet<>();

    // Enterprise this sector belongs to
    @ManyToOne
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    // Zones in this sector
    @OneToMany(mappedBy = "sector", cascade = CascadeType.ALL)
    private Set<Zone> zones = new HashSet<>();

    public Sector(User sectorHead, Set<User> users, Enterprise enterprise, Set<Zone> zones) {
        this.sectorHead = sectorHead;
        this.users = users;
        this.enterprise = enterprise;
        this.zones = zones;
    }

    public Sector() {
    }

    public User getSectorHead() {
        return this.sectorHead;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public Enterprise getEnterprise() {
        return this.enterprise;
    }

    public Set<Zone> getZones() {
        return this.zones;
    }

    public void setSectorHead(User sectorHead) {
        this.sectorHead = sectorHead;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public void setEnterprise(Enterprise enterprise) {
        this.enterprise = enterprise;
    }

    public void setZones(Set<Zone> zones) {
        this.zones = zones;
    }

    public static abstract class SectorBuilder<C extends Sector, B extends SectorBuilder<C, B>> {
        private User sectorHead;
        private Set<User> users;
        private Enterprise enterprise;
        private Set<Zone> zones;

        public B sectorHead(User sectorHead) {
            this.sectorHead = sectorHead;
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

        public B zones(Set<Zone> zones) {
            this.zones = zones;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "Sector.SectorBuilder(super=" + super.toString() + ", sectorHead=" + this.sectorHead + ", users=" + this.users + ", enterprise=" + this.enterprise + ", zones=" + this.zones + ")";
        }
    }

    private static final class SectorBuilderImpl extends SectorBuilder<Sector, SectorBuilderImpl> {
        private SectorBuilderImpl() {
        }

        protected SectorBuilderImpl self() {
            return this;
        }

        public Sector build() {
            return new Sector(this);
        }
    }
}