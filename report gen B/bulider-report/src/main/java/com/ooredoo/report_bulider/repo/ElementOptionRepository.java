package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.ElementOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElementOptionRepository extends JpaRepository<ElementOption, Long> {

    List<ElementOption> findByComponentIdOrderByDisplayOrderAsc(Long elementId);
}
