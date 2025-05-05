package com.ooredoo.report_bulider.entity.mapper;


import com.ooredoo.report_bulider.entity.Form;
import com.ooredoo.report_bulider.entity.dto.FormDTO;
import com.ooredoo.report_bulider.entity.dto.FormRequestDTO;
import com.ooredoo.report_bulider.entity.dto.FormResponseDTO;
import com.ooredoo.report_bulider.repo.UserRepository;
import com.ooredoo.report_bulider.user.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = FormComponentMapper.class)
public interface FormMapper {

    @Mapping(target = "creatorId", expression = "java(form.getCreator() != null ? form.getCreator().getId_user() : null)")
    @Mapping(target = "components", source = "components")
    // @Mapping(target = "assignedUserIds", expression = "java(form.getAssignedUsers().stream().map(com.ooredoo.report_bulider.user.User::getId_user).collect(java.util.stream.Collectors.toSet()))")
    FormResponseDTO toFormResponseDTO(Form form);

    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "components", ignore = true)
    @Mapping(target = "assignedUsers", ignore = true)
    Form toEntity(FormRequestDTO dto);

    @AfterMapping
    default void setCreator(@MappingTarget Form form, FormDTO formDTO, @Context UserRepository userRepository) {
        if (formDTO.getCreatorId() != null) {
            User creator = userRepository.findById(formDTO.getCreatorId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            form.setCreator(creator);
        }
    }
}


