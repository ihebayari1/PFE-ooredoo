package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.UploadedFiles;
import com.ooredoo.report_bulider.entity.dto.UploadedFilesDTO;
import com.ooredoo.report_bulider.entity.mapper.UploadedFilesMapper;
import com.ooredoo.report_bulider.repo.UploadedFileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    public static final String UPLOADED_DIR = "./uploads"; // 🔥 FIXED: removed the extra space

    private final UploadedFileRepository fileRepository;
    private final UploadedFilesMapper uploadedFilesMapper;

    public FileService(UploadedFileRepository fileRepository, UploadedFilesMapper uploadedFilesMapper) {
        this.fileRepository = fileRepository;
        this.uploadedFilesMapper = uploadedFilesMapper;
    }

    @Transactional
    public UploadedFilesDTO storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOADED_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String storedFileName = UUID.randomUUID().toString() + fileExtension;

        Path filePath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING); // 🔥 better

        UploadedFiles uploadedFile = new UploadedFiles();
        uploadedFile.setOriginalFileName(originalFileName);
        uploadedFile.setStoredFileName(storedFileName);
        uploadedFile.setFileType(file.getContentType());
        uploadedFile.setFileSize(file.getSize());
        uploadedFile.setFilePath(filePath.toString());

        UploadedFiles savedFile = fileRepository.save(uploadedFile);
        return uploadedFilesMapper.toUploadedFilesDTO(savedFile);
    }

    public UploadedFilesDTO getFileById(Long id) {
        UploadedFiles uploadedFile = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return uploadedFilesMapper.toUploadedFilesDTO(uploadedFile);
    }
}
