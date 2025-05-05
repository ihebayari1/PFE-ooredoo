package com.ooredoo.report_bulider.entity.mapper;

import com.ooredoo.report_bulider.entity.Form;
import com.ooredoo.report_bulider.entity.FormComponent;
import com.ooredoo.report_bulider.entity.dto.FormComponentDTO;
import com.ooredoo.report_bulider.repo.FormRepository;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;
@Mapper(componentModel = "spring", uses = { ComponentPropertyMapper.class, ElementOptionMapper.class })
public interface FormComponentMapper {

    @Mapping(target = "formId", expression = "java(formComponent.getForm() != null ? formComponent.getForm().getId() : null)")
    FormComponentDTO toFormComponentDTO(FormComponent formComponent);

    @Mapping(target = "form", ignore = true)
    FormComponent toFormComponent(FormComponentDTO formComponentDTO);

    @AfterMapping
    default void setForm(@MappingTarget FormComponent formComponent, FormComponentDTO formComponentDTO, @Context FormRepository formRepository) {
        if (formComponentDTO.getFormId() != null) {
            Form form = formRepository.findById(formComponentDTO.getFormId())
                    .orElseThrow(() -> new RuntimeException("Form not found"));
            formComponent.setForm(form);
        }
    }
}
