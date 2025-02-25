package com.ooredoo.report_bulider.repo;

import com.ooredoo.report_bulider.entity.UploadedFiles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFiles, Long> {


    List<UploadedFiles> findBySubmissionValueId(Long submissionValueId);
}
