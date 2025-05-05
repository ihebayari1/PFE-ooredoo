package com.ooredoo.report_bulider.entity.mapper;


import com.ooredoo.report_bulider.entity.ElementOption;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.dto.ElementOptionDTO;
import com.ooredoo.report_bulider.repo.FormComponentRepository;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ElementOptionMapper {

    @Mapping(target = "componentId", expression = "java(elementOption.getComponent() != null ? elementOption.getComponent().getId() : null)")
    ElementOptionDTO toElementOptionDTO(ElementOption elementOption);

    @Mapping(target = "component", ignore = true) // Ignore the component field in automatic mapping
    ElementOption toElementOption(ElementOptionDTO elementOptionDTO);

    @AfterMapping
    default void setComponent(@MappingTarget ElementOption elementOption, ElementOptionDTO elementOptionDTO,
                              @Context FormComponentRepository formComponentRepository) {
        if (elementOptionDTO.getComponentId() != null) {
            FormComponent component = formComponentRepository.findById(elementOptionDTO.getComponentId())
                    .orElseThrow(() -> new RuntimeException("FormComponent not found"));
            elementOption.setComponent(component);
        }
    }

}
