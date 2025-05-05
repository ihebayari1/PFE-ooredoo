package com.ooredoo.report_bulider.entity.mapper;


import com.ooredoo.report_bulider.entity.SubmissionValue;
import com.ooredoo.report_bulider.entity.UploadedFiles;
import com.ooredoo.report_bulider.entity.dto.UploadedFilesDTO;
import com.ooredoo.report_bulider.repo.SubmissionValueRepository;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UploadedFilesMapper {



    @Mapping(target = "submissionValueId", expression = "java(uploadedFiles.getSubmissionValue() != null ? uploadedFiles.getSubmissionValue().getId(): null)")
    UploadedFilesDTO toUploadedFilesDTO(UploadedFiles uploadedFiles);

    @Mapping(target = "submissionValue", ignore = true) // Ignore the submissionValue field in automatic mapping
    UploadedFiles toUploadedFiles(UploadedFilesDTO uploadedFilesDTO);



}
