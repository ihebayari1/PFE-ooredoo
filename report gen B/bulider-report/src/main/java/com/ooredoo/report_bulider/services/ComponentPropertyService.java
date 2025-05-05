package com.ooredoo.report_bulider.services;

import com.ooredoo.report_bulider.entity.ComponentProperty;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.dto.ComponentPropertyDTO;
import com.ooredoo.report_bulider.entity.mapper.ComponentPropertyMapper;

import com.ooredoo.report_bulider.repo.ComponentPropertyRepository;
import com.ooredoo.report_bulider.repo.FormComponentRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComponentPropertyService {

    private static final Logger log = org.slf4j.LoggerFactory.getLogger(ComponentPropertyService.class);
    private final ComponentPropertyRepository propertyRepository;
    private final FormComponentRepository componentRepository;
    private final ComponentPropertyMapper componentPropertyMapper;



    public ComponentPropertyService(ComponentPropertyRepository propertyRepository,
                                    FormComponentRepository componentRepository, ComponentPropertyMapper  componentPropertyMapper) {
        this.propertyRepository = propertyRepository;
        this.componentRepository = componentRepository;
        this.componentPropertyMapper = componentPropertyMapper;
    }



    // Get all properties
    public List<ComponentPropertyDTO> getAllProperties() {
        List<ComponentProperty> properties = propertyRepository.findAll();
        return properties.stream()
                .map(componentPropertyMapper::toComponentPropertyDTO)
                .collect(Collectors.toList());
    }

    // Get property by ID
    public Optional<ComponentPropertyDTO> getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .map(componentPropertyMapper::toComponentPropertyDTO);
    }

    // Create a new property
    @Transactional
    public ComponentPropertyDTO createProperty(ComponentPropertyDTO propertyDTO, Long componentId) {
        FormComponent component = componentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        ComponentProperty property = componentPropertyMapper.toComponentProperty(propertyDTO);
        property.setComponent(component);
        ComponentProperty savedProperty = propertyRepository.save(property);
        return componentPropertyMapper.toComponentPropertyDTO(savedProperty);
    }

    // Update an existing property
    @Transactional
    public ComponentPropertyDTO updateProperty(Long id, String propertyValue) {
        ComponentProperty property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setPropertyValue(propertyValue);
        ComponentProperty updatedProperty = propertyRepository.save(property);
        return componentPropertyMapper.toComponentPropertyDTO(updatedProperty);
    }

    // Delete a property
    @Transactional
    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }

    // Batch update properties
    @Transactional
    public List<ComponentPropertyDTO> batchUpdateProperties(List<ComponentPropertyDTO> propertyDTOs) {
        List<ComponentProperty> updatedProperties = new ArrayList<>();

        for (ComponentPropertyDTO dto : propertyDTOs) {
            ComponentProperty property = propertyRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Property not found: " + dto.getId()));

            property.setPropertyValue(dto.getPropertyValue());
            updatedProperties.add(property);
        }

        List<ComponentProperty> savedProperties = propertyRepository.saveAll(updatedProperties);
        return savedProperties.stream()
                .map(componentPropertyMapper::toComponentPropertyDTO)
                .collect(Collectors.toList());
    }

}
