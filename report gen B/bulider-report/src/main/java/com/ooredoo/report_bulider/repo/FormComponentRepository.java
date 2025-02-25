package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.FormComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormComponentRepository extends JpaRepository<FormComponent, Long> {

    List<FormComponent> findByFormIdOrderByOrderIndexAsc(Long formId);
}
