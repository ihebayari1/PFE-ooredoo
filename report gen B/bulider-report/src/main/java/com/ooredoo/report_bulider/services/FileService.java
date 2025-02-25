package com.ooredoo.report_bulider.services;


import com.ooredoo.report_bulider.entity.UploadedFiles;
import com.ooredoo.report_bulider.repo.UploadedFileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {


    //@Value("${file.upload-dir}")
    //private String uploadDir;

    public static final String UPLOADED_DIR = "./uploads ";

    private final UploadedFileRepository fileRepository;

    public FileService(UploadedFileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }


    @Transactional
    public UploadedFiles storeFile(MultipartFile file) throws IOException {
        // Create the upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOADED_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            Files.createDirectories(uploadPath);
        }

        // Generate a unique file name
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String storedFileName = UUID.randomUUID().toString() + fileExtension;

        // Save the file to the server
        Path filePath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath);

        // Create and save file metadata
        UploadedFiles uploadedFile = new UploadedFiles();
        uploadedFile.setOriginalFileName(originalFileName);
        uploadedFile.setStoredFileName(storedFileName);
        uploadedFile.setFileType(file.getContentType());
        uploadedFile.setFileSize(file.getSize());
        uploadedFile.setFilePath(filePath.toString());

        return fileRepository.save(uploadedFile);
    }
}
