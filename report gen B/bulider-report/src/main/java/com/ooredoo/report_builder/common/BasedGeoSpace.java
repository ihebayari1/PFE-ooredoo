package com.ooredoo.report_builder.common;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.MappedSuperclass;
import lombok.experimental.SuperBuilder;

@Entity
@MappedSuperclass
@SuperBuilder
public class BasedGeoSpace extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    public BasedGeoSpace(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public BasedGeoSpace() {
    }

    public String getName() {
        return this.name;
    }

    public String getDescription() {
        return this.description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
