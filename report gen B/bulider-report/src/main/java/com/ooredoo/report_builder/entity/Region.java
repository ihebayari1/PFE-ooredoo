package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BasedGeoSpace;
import com.ooredoo.report_builder.user.User;
import jakarta.persistence.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "regions")
@SuperBuilder
public class Region extends BasedGeoSpace {

    // Head of Region
    @OneToOne
    @JoinColumn(name = "head_id")
    private User regionHead;

    // Users assigned to this region
    @OneToMany(mappedBy = "region")
    private Set<User> users = new HashSet<>();

    // Zone this region belongs to
    @ManyToOne
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    // Points of Sale in this region
    @OneToMany(mappedBy = "region")
    private Set<POS> pointsOfSale = new HashSet<>();

    public Region(User regionHead, Set<User> users, Zone zone, Set<POS> pointsOfSale) {
        this.regionHead = regionHead;
        this.users = users;
        this.zone = zone;
        this.pointsOfSale = pointsOfSale;
    }

    public Region() {
    }

    public User getRegionHead() {
        return this.regionHead;
    }

    public Set<User> getUsers() {
        return this.users;
    }

    public Zone getZone() {
        return this.zone;
    }

    public Set<POS> getPointsOfSale() {
        return this.pointsOfSale;
    }

    public void setRegionHead(User regionHead) {
        this.regionHead = regionHead;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }

    public void setPointsOfSale(Set<POS> pointsOfSale) {
        this.pointsOfSale = pointsOfSale;
    }
}