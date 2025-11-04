package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BasedGeoSpace;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@SuperBuilder
@Table(name = "zones")
public class Zone extends BasedGeoSpace {

    // Head of Zone
    @OneToOne
    @JoinColumn(name = "head_id")
    private User zoneHead;

    // Users assigned to this zone
    @OneToMany(mappedBy = "zone")
    private Set<User> users = new HashSet<>();

    // Sector this zone belongs to
    @ManyToOne
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    // Regions in this zone
    @OneToMany(mappedBy = "zone", cascade = CascadeType.ALL)
    private Set<Region> regions = new HashSet<>();


    public Zone(User zoneHead, Set<User> users, Sector sector, Set<Region> regions) {
        this.zoneHead = zoneHead;
        this.users = users;
        this.sector = sector;
        this.regions = regions;
    }

    public Zone() {
    }

    public User getZoneHead() {
        return this.zoneHead;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public Sector getSector() {
        return this.sector;
    }

    public Set<Region> getRegions() {
        return this.regions;
    }

    public void setZoneHead(User zoneHead) {
        this.zoneHead = zoneHead;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public void setSector(Sector sector) {
        this.sector = sector;
    }

    public void setRegions(Set<Region> regions) {
        this.regions = regions;
    }

    public static abstract class ZoneBuilder<C extends Zone, B extends ZoneBuilder<C, B>> {
        private User zoneHead;
        private Set<User> users;
        private Sector sector;
        private Set<Region> regions;

        public B zoneHead(User zoneHead) {
            this.zoneHead = zoneHead;
            return self();
        }

        public B users(Set<User> users) {
            this.users = users;
            return self();
        }

        public B sector(Sector sector) {
            this.sector = sector;
            return self();
        }

        public B regions(Set<Region> regions) {
            this.regions = regions;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "Zone.ZoneBuilder(super=" + super.toString() + ", zoneHead=" + this.zoneHead + ", users=" + this.users + ", sector=" + this.sector + ", regions=" + this.regions + ")";
        }
    }

    private static final class ZoneBuilderImpl extends ZoneBuilder<Zone, ZoneBuilderImpl> {
        private ZoneBuilderImpl() {
        }

        protected ZoneBuilderImpl self() {
            return this;
        }

        public Zone build() {
            return new Zone(this);
        }
    }
}