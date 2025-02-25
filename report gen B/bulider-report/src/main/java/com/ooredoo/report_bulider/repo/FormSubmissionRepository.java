package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.FormSubmission;
import com.ooredoo.report_bulider.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {

    List<FormSubmission> findByFormId(Long formId);
    List<FormSubmission> findBySubmittedBy(User user);
}
