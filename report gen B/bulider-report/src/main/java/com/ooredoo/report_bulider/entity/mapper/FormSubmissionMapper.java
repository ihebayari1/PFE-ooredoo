package com.ooredoo.report_bulider.entity.mapper;


import com.ooredoo.report_bulider.entity.Form;
import com.ooredoo.report_bulider.entity.FormSubmission;
import com.ooredoo.report_bulider.entity.dto.FormSubmissionDTO;
import com.ooredoo.report_bulider.repo.FormRepository;
import com.ooredoo.report_bulider.repo.UserRepository;
import com.ooredoo.report_bulider.user.User;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = SubmissionValueMapper.class)
public interface FormSubmissionMapper {

    @Mapping(target = "formId", expression = "java(submission.getForm() != null ? submission.getForm().getId() : null)")
    @Mapping(target = "submittedById", expression = "java(submission.getSubmittedBy() != null ? submission.getSubmittedBy().getId_user() : null)")
    @Mapping(target = "values", source = "values")
    FormSubmissionDTO toFormSubmissionDTO(FormSubmission submission);

    @Mapping(target = "form", ignore = true) // Ignore the form field in automatic mapping
    @Mapping(target = "submittedBy", ignore = true) // Ignore the submittedBy field in automatic mapping
    FormSubmission toFormSubmission(FormSubmissionDTO formSubmissionDTO);

    @AfterMapping
    default void setFormAndSubmittedBy(@MappingTarget FormSubmission formSubmission, FormSubmissionDTO formSubmissionDTO,
                                       @Context FormRepository formRepository, @Context UserRepository userRepository) {
        if (formSubmissionDTO.getFormId() != null) {
            Form form = formRepository.findById(formSubmissionDTO.getFormId())
                    .orElseThrow(() -> new RuntimeException("Form not found"));
            formSubmission.setForm(form);
        }
        if (formSubmissionDTO.getSubmittedById() != null) {
            User submittedBy = userRepository.findById(formSubmissionDTO.getSubmittedById())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            formSubmission.setSubmittedBy(submittedBy);
        }
    }
}
