package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.FormSubmission;
import com.ooredoo.report_bulider.entity.SubmissionValue;
import com.ooredoo.report_bulider.entity.dto.SubmissionValueDTO;
import com.ooredoo.report_bulider.entity.mapper.SubmissionValueMapper;
import com.ooredoo.report_bulider.repo.FormComponentRepository;
import com.ooredoo.report_bulider.repo.FormSubmissionRepository;
import com.ooredoo.report_bulider.repo.SubmissionValueRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SubmissionValueService {
    private final SubmissionValueRepository valueRepository;
    private final FormSubmissionRepository submissionRepository;
    private final FormComponentRepository componentRepository;
    private final SubmissionValueMapper valueMapper;

    public SubmissionValueService(SubmissionValueRepository valueRepository,
                                  FormSubmissionRepository submissionRepository,
                                  FormComponentRepository componentRepository,
                                  SubmissionValueMapper valueMapper) {
        this.valueRepository = valueRepository;
        this.submissionRepository = submissionRepository;
        this.componentRepository = componentRepository;
        this.valueMapper = valueMapper;
    }

    // Get all submission values
    public List<SubmissionValueDTO> getAllValues() {
        List<SubmissionValue> values = valueRepository.findAll();
        return values.stream()
                .map(valueMapper::toSubmissionValueDTO)
                .collect(Collectors.toList());
    }

    // Get value by ID
    public Optional<SubmissionValueDTO> getValueById(Long id) {
        return valueRepository.findById(id)
                .map(valueMapper::toSubmissionValueDTO);
    }

    // Create a new value
    @Transactional
    public SubmissionValueDTO createValue(SubmissionValueDTO valueDTO, Long submissionId, Long componentId) {
        FormSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        FormComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        SubmissionValue value = valueMapper.toSubmissionValue(valueDTO);
        value.setSubmission(submission);
        value.setComponent(component);
        SubmissionValue savedValue = valueRepository.save(value);
        return valueMapper.toSubmissionValueDTO(savedValue);
    }

    // Update an existing value
    @Transactional
    public SubmissionValueDTO updateValue(Long id, String inputValue) {
        SubmissionValue value = valueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Value not found"));

        value.setValue(inputValue);
        SubmissionValue updatedValue = valueRepository.save(value);
        return valueMapper.toSubmissionValueDTO(updatedValue);
    }

    // Delete a value
    @Transactional
    public void deleteValue(Long id) {
        valueRepository.deleteById(id);
    }

    // Batch create values
    @Transactional
    public List<SubmissionValueDTO> batchCreateValues(List<SubmissionValueDTO> valueDTOs, Long submissionId) {
        FormSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<SubmissionValue> values = new ArrayList<>();
        for (SubmissionValueDTO valueDTO : valueDTOs) {
            FormComponent component = componentRepository.findById(valueDTO.getComponentId())
                    .orElseThrow(() -> new RuntimeException("Component not found"));

            SubmissionValue value = valueMapper.toSubmissionValue(valueDTO);
            value.setSubmission(submission);
            value.setComponent(component);
            values.add(value);
        }

        List<SubmissionValue> savedValues = valueRepository.saveAll(values);
        return savedValues.stream()
                .map(valueMapper::toSubmissionValueDTO)
                .collect(Collectors.toList());
    }


}
