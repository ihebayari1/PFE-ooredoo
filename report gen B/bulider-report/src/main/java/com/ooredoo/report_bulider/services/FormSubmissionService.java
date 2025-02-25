package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.*;
import com.ooredoo.report_bulider.repo.*;
import com.ooredoo.report_bulider.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class FormSubmissionService {


    private final FormRepository formRepository;

    private final FormComponentRepository elementRepository;

    private final FormSubmissionRepository submissionRepository;

    private final SubmissionValueRepository valueRepository;
    private final UploadedFileRepository fileRepository;
    private FileService fileService;


    public FormSubmissionService(FormRepository formRepository, FormComponentRepository elementRepository, FormSubmissionRepository submissionRepository, SubmissionValueRepository valueRepository, UploadedFileRepository fileRepository) {
        this.formRepository = formRepository;
        this.elementRepository = elementRepository;
        this.submissionRepository = submissionRepository;
        this.valueRepository = valueRepository;
        this.fileRepository = fileRepository;
    }

    public List<FormSubmission> getFormSubmissions(Long formId) {
        return submissionRepository.findByFormId(formId);
    }

    public List<FormSubmission> getUserSubmissions(User user) {
        return submissionRepository.findBySubmittedBy(user);
    }

    public FormSubmission getSubmission(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    @Transactional
    public FormSubmission submitForm(Long formId, User submitter, Map<Long, String> textValues,
                                     Map<Long, List<MultipartFile>> fileValues) throws IOException {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        // Check if user is assigned to this form
        if (!form.getAssignedUsers().contains(submitter) && !form.getCreator().equals(submitter)) {
            throw new RuntimeException("User is not authorized to submit this form");
        }

        // Create new submission
        FormSubmission submission = new FormSubmission();
        submission.setForm(form);
        submission.setSubmittedBy(submitter);

        submission = submissionRepository.save(submission);

        // Process text values
        for (Map.Entry<Long, String> entry : textValues.entrySet()) {
            Long elementId = entry.getKey();
            String value = entry.getValue();

            FormComponent element = elementRepository.findById(elementId)
                    .orElseThrow(() -> new RuntimeException("Element not found: " + elementId));

            SubmissionValue submissionValue = new SubmissionValue();
            submissionValue.setSubmission(submission);
            submissionValue.setComponent(element);
            submissionValue.setValue(value);

            valueRepository.save(submissionValue);
        }

        // Process file uploads
        for (Map.Entry<Long, List<MultipartFile>> entry : fileValues.entrySet()) {
            Long elementId = entry.getKey();
            List<MultipartFile> files = entry.getValue();

            FormComponent element = elementRepository.findById(elementId)
                    .orElseThrow(() -> new RuntimeException("Element not found: " + elementId));

            // For file uploads, we create a submission value to link files to
            SubmissionValue submissionValue = new SubmissionValue();
            submissionValue.setSubmission(submission);
            submissionValue.setComponent(element);
            submissionValue.setValue("FILE_UPLOAD"); // Marker indicating files are attached

            submissionValue = valueRepository.save(submissionValue);

            // Now store all files and link them to this submission value
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    UploadedFiles uploadedFile = fileService.storeFile(file);
                    uploadedFile.setSubmissionValue(submissionValue);
                    fileRepository.save(uploadedFile);
                }
            }
        }

        return submission;
    }


}
