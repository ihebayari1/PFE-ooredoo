package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.*;
import com.ooredoo.report_bulider.entity.dto.FormSubmissionDTO;
import com.ooredoo.report_bulider.entity.dto.UploadedFilesDTO;
import com.ooredoo.report_bulider.entity.mapper.FormSubmissionMapper;
import com.ooredoo.report_bulider.entity.dto.SubmissionValueDTO;
import com.ooredoo.report_bulider.entity.mapper.SubmissionValueMapper;
import com.ooredoo.report_bulider.entity.mapper.UploadedFilesMapper;

import com.ooredoo.report_bulider.handler.ResourceNotFoundException;
import com.ooredoo.report_bulider.repo.*;
import com.ooredoo.report_bulider.user.User;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FormSubmissionService {


    private final FormSubmissionRepository submissionRepository;
    private final FormRepository formRepository;
    private final SubmissionValueRepository valueRepository;
    private final FormSubmissionMapper submissionMapper;
    private final SubmissionValueMapper valueMapper;
    private final FormComponentRepository elementRepository;
    private final UploadedFileRepository uploadedFilesRepository;
    private FileService fileService;
    private final UploadedFilesMapper uploadedFilesMapper;
    private final FormComponentRepository componentRepository;
    private final UserRepository userRepository;


    public FormSubmissionService(FormRepository formRepository, FormComponentRepository elementRepository,
                                 FormSubmissionRepository submissionRepository,
                                 SubmissionValueRepository valueRepository,
                                 FormSubmissionMapper submissionMapper,
                                 SubmissionValueMapper valueMapper,
                                 UploadedFileRepository fileRepository,
                                 UploadedFilesMapper uploadedFilesMapper, FormComponentRepository componentRepository,
                                 UserRepository userRepository ) {

        this.formRepository = formRepository;
        this.elementRepository = elementRepository;
        this.submissionRepository = submissionRepository;
        this.valueRepository = valueRepository;
        this.submissionMapper = submissionMapper;
        this.valueMapper = valueMapper;
        this.uploadedFilesRepository = fileRepository;
        this.uploadedFilesMapper = uploadedFilesMapper;
        this.componentRepository = componentRepository;
        this.userRepository = userRepository;

    }
    public List<FormSubmissionDTO> getAllSubmissions() {
        List<FormSubmission> submissions = submissionRepository.findAll();
        return submissions.stream()
                .map(submissionMapper::toFormSubmissionDTO)
                .collect(Collectors.toList());
    }

    public List<FormSubmissionDTO> getSubmissionsByForm(Long formId) {
        return submissionRepository.findByFormId(formId).stream()
                .map(submissionMapper::toFormSubmissionDTO)
                .collect(Collectors.toList());
    }

    public Optional<FormSubmissionDTO> getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .map(submissionMapper::toFormSubmissionDTO);
    }
    public List<FormSubmissionDTO> getUserSubmissions(User user) {
        return submissionRepository.findBySubmittedBy(user)
                .stream()
                .map(submissionMapper::toFormSubmissionDTO)
                .collect(Collectors.toList());
    }

    public FormSubmissionDTO getSubmission(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .map(submissionMapper::toFormSubmissionDTO)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    @Transactional
    public FormSubmissionDTO updateSubmissionStatus(Long id) {
        FormSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        FormSubmission updatedSubmission = submissionRepository.save(submission);
        return submissionMapper.toFormSubmissionDTO(updatedSubmission);
    }

    // Delete a submission
    @Transactional
    public void deleteSubmission(Long id) {
        submissionRepository.deleteById(id);
    }

    // Get submission values by submission ID
    public List<SubmissionValueDTO> getSubmissionValues(Long submissionId) {
        List<SubmissionValue> values = valueRepository.findBySubmissionId(submissionId);
        return values.stream()
                .map(valueMapper::toSubmissionValueDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public FormSubmissionDTO submitForm(Long formId, User submitter,
                                        Map<Long, String> textValues,
                                        Map<Long, List<MultipartFile>> fileValues) throws IOException {
        Form form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));

        if (!form.getAssignedUsers().contains(submitter) && !form.getCreator().equals(submitter)) {
            throw new RuntimeException("User is not authorized to submit this form");
        }

        FormSubmission submission = new FormSubmission();
        submission.setForm(form);
        submission.setSubmittedBy(submitter);
        submission = submissionRepository.save(submission);

        // Process Text Values
        if (textValues != null) {
            for (Map.Entry<Long, String> entry : textValues.entrySet()) {
                Long elementId = entry.getKey();
                String value = entry.getValue();

                FormComponent element = componentRepository.findById(elementId)
                        .orElseThrow(() -> new ResourceNotFoundException("Component not found: " + elementId));

                SubmissionValue submissionValue = new SubmissionValue();
                submissionValue.setSubmission(submission);
                submissionValue.setComponent(element);
                submissionValue.setValue(value);

                valueRepository.save(submissionValue);
            }
        }

        // Process File Uploads
        if (fileValues != null) {
            for (Map.Entry<Long, List<MultipartFile>> entry : fileValues.entrySet()) {
                Long elementId = entry.getKey();
                List<MultipartFile> files = entry.getValue();

                FormComponent element = componentRepository.findById(elementId)
                        .orElseThrow(() -> new ResourceNotFoundException("Component not found: " + elementId));

                SubmissionValue submissionValue = new SubmissionValue();
                submissionValue.setSubmission(submission);
                submissionValue.setComponent(element);
                submissionValue.setValue("FILE_UPLOAD");

                submissionValue = valueRepository.save(submissionValue);

                for (MultipartFile file : files) {
                    if (file != null && !file.isEmpty()) {
                        UploadedFilesDTO uploadedFile = fileService.storeFile(file);
                        uploadedFile.setSubmissionValue(submissionValue);
                        uploadedFilesRepository.save(uploadedFilesMapper.toUploadedFiles(uploadedFile));
                    }
                }
            }
        }

        return submissionMapper.toFormSubmissionDTO(submission);
    }


    public List<FormSubmissionDTO> getSubmissionsByUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return submissionRepository.findBySubmittedBy(user).stream()
                .map(submissionMapper::toFormSubmissionDTO)
                .collect(Collectors.toList());
    }
}