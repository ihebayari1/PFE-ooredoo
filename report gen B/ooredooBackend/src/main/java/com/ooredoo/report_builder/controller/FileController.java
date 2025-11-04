package com.ooredoo.report_builder.controller;

import com.ooredoo.report_builder.dto.MessageResponse;
import com.ooredoo.report_builder.dto.UploadedFilesDTO;
import com.ooredoo.report_builder.services.FileService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;
    private static final String UPLOAD_DIR = "./uploads";

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadedFilesDTO> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            UploadedFilesDTO uploadedFile = fileService.storeFile(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(uploadedFile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UploadedFilesDTO> getFile(@PathVariable Integer id) {
        try {
            UploadedFilesDTO file = fileService.getFileById(id);
            return ResponseEntity.ok(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer id) {
        try {
            UploadedFilesDTO fileDTO = fileService.getFileById(id);
            Path filePath = Paths.get(fileDTO.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + fileDTO.getOriginalFileName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFile(@PathVariable Integer id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok(new MessageResponse("File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to delete file: " + e.getMessage()));
        }
    }
}

