package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.ElementOption;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.dto.ElementOptionDTO;
import com.ooredoo.report_bulider.entity.mapper.ElementOptionMapper;

import com.ooredoo.report_bulider.repo.ElementOptionRepository;
import com.ooredoo.report_bulider.repo.FormComponentRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ElementOptionService {
    private final ElementOptionRepository optionRepository;
    private final FormComponentRepository componentRepository;
    private final ElementOptionMapper elementOptionMapper;

    public ElementOptionService(ElementOptionRepository optionRepository, FormComponentRepository componentRepository, ElementOptionMapper elementOptionMapper) {
        this.optionRepository = optionRepository;
        this.componentRepository = componentRepository;
        this.elementOptionMapper = elementOptionMapper;
    }

    // Get all options
    public List<ElementOptionDTO> getAllOptions() {
        List<ElementOption> options = optionRepository.findAll();
        return options.stream()
                .map(elementOptionMapper::toElementOptionDTO)
                .collect(Collectors.toList());
    }

    // Get option by ID
    public Optional<ElementOptionDTO> getOptionById(Long id) {
        return optionRepository.findById(id)
                .map(elementOptionMapper::toElementOptionDTO);
    }

    // Create a new option
    @Transactional
    public ElementOptionDTO createOption(ElementOptionDTO optionDTO, Long componentId) {
        FormComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        ElementOption option = elementOptionMapper.toElementOption(optionDTO);
        option.setComponent(component);

        // Get the highest current display order and add 1
        Integer maxDisplayOrder = optionRepository.findByComponentIdOrderByDisplayOrderAsc(componentId)
                .stream()
                .map(ElementOption::getDisplayOrder)
                .max(Integer::compareTo)
                .orElse(0);

        option.setDisplayOrder(maxDisplayOrder + 1);
        ElementOption savedOption = optionRepository.save(option);
        return elementOptionMapper.toElementOptionDTO(savedOption);
    }

    // Update an existing option
    @Transactional
    public ElementOptionDTO updateOption(Long id, ElementOptionDTO optionDTO) {
        ElementOption option = optionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        option.setLabel(optionDTO.getLabel());
        option.setValue(optionDTO.getValue());
        ElementOption updatedOption = optionRepository.save(option);
        return elementOptionMapper.toElementOptionDTO(updatedOption);
    }

    // Delete an option
    @Transactional
    public void deleteOption(Long id) {
        optionRepository.deleteById(id);
    }

    // Reorder options
    @Transactional
    public void reorderOptions(Long componentId, List<Long> optionIds) {
        for (int i = 0; i < optionIds.size(); i++) {
            ElementOption option = optionRepository.findById(optionIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Option not found"));
            option.setDisplayOrder(i + 1);
            optionRepository.save(option);
        }
    }

    // Batch create options
    @Transactional
    public List<ElementOptionDTO> batchCreateOptions(List<ElementOptionDTO> optionDTOs, Long componentId) {
        FormComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        Integer maxDisplayOrder = optionRepository.findByComponentIdOrderByDisplayOrderAsc(componentId)
                .stream()
                .map(ElementOption::getDisplayOrder)
                .max(Integer::compareTo)
                .orElse(0);

        List<ElementOption> options = new ArrayList<>();
        for (int i = 0; i < optionDTOs.size(); i++) {
            ElementOption option = elementOptionMapper.toElementOption(optionDTOs.get(i));
            option.setComponent(component);
            option.setDisplayOrder(maxDisplayOrder + i + 1);
            options.add(option);
        }

        List<ElementOption> savedOptions = optionRepository.saveAll(options);
        return savedOptions.stream()
                .map(elementOptionMapper::toElementOptionDTO)
                .collect(Collectors.toList());
    }


}
