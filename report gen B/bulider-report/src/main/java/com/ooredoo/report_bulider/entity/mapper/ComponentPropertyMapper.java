package com.ooredoo.report_bulider.entity.mapper;

import com.ooredoo.report_bulider.entity.ComponentProperty;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.dto.ComponentPropertyDTO;
import com.ooredoo.report_bulider.repo.FormComponentRepository;

import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ComponentPropertyMapper {

    @Mapping(target = "componentId", expression = "java(property.getComponent() != null ? property.getComponent().getId() : null)")
    ComponentPropertyDTO toComponentPropertyDTO(ComponentProperty property);

    @Mapping(target = "component", ignore = true)
    ComponentProperty toComponentProperty(ComponentPropertyDTO componentPropertyDTO);

    @AfterMapping
    default void setComponent(@MappingTarget ComponentProperty componentProperty,
                              ComponentPropertyDTO componentPropertyDTO,
                              @Context FormComponentRepository formComponentRepository) {
        if (componentPropertyDTO.getComponentId() != null) {
            FormComponent component = formComponentRepository.findById(componentPropertyDTO.getComponentId())
                    .orElseThrow(() -> new RuntimeException("FormComponent not found"));
            componentProperty.setComponent(component);
        }
    }
}
