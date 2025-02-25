package com.ooredoo.report_bulider.repo;


import com.ooredoo.report_bulider.entity.ComponentProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComponentPropertyRepository extends JpaRepository<ComponentProperty, Long> {

    List<ComponentProperty> findByComponentId(Long elementId);
}
