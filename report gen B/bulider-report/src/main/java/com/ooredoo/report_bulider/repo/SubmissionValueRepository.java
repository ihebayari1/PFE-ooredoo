package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.SubmissionValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionValueRepository extends JpaRepository<SubmissionValue, Long> {

    List<SubmissionValue> findBySubmissionId(Long submissionId);
}
