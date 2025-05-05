package com.ooredoo.report_bulider.entity.dto;

import com.ooredoo.report_bulider.entity.SubmissionValue;

public class UploadedFilesDTO {

    private Long id;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;
    private String filePath;
    private Long submissionValueId;


    public UploadedFilesDTO(Long id, String originalFileName, String storedFileName, String fileType, Long fileSize, String filePath, Long submissionValueId) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.submissionValueId = submissionValueId;
    }

    public UploadedFilesDTO() {
    }

    public static UploadedFilesDTOBuilder builder() {
        return new UploadedFilesDTOBuilder();
    }

    public Long getId() {
        return this.id;
    }

    public String getOriginalFileName() {
        return this.originalFileName;
    }

    public String getStoredFileName() {
        return this.storedFileName;
    }

    public String getFileType() {
        return this.fileType;
    }

    public Long getFileSize() {
        return this.fileSize;
    }

    public String getFilePath() {
        return this.filePath;
    }

    public Long getSubmissionValueId() {
        return this.submissionValueId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setSubmissionValue(SubmissionValue submissionValue) {
        this.submissionValueId = submissionValue.getId();
    }

    public static class UploadedFilesDTOBuilder {
        private Long id;
        private String originalFileName;
        private String storedFileName;
        private String fileType;
        private Long fileSize;
        private String filePath;
        private Long submissionValueId;

        UploadedFilesDTOBuilder() {
        }

        public UploadedFilesDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UploadedFilesDTOBuilder originalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return this;
        }

        public UploadedFilesDTOBuilder storedFileName(String storedFileName) {
            this.storedFileName = storedFileName;
            return this;
        }

        public UploadedFilesDTOBuilder fileType(String fileType) {
            this.fileType = fileType;
            return this;
        }

        public UploadedFilesDTOBuilder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public UploadedFilesDTOBuilder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public UploadedFilesDTOBuilder submissionValueId(Long submissionValueId) {
            this.submissionValueId = submissionValueId;
            return this;
        }

        public UploadedFilesDTO build() {
            return new UploadedFilesDTO(this.id, this.originalFileName, this.storedFileName, this.fileType, this.fileSize, this.filePath, this.submissionValueId);
        }

        public String toString() {
            return "UploadedFilesDTO.UploadedFilesDTOBuilder(id=" + this.id + ", originalFileName=" + this.originalFileName + ", storedFileName=" + this.storedFileName + ", fileType=" + this.fileType + ", fileSize=" + this.fileSize + ", filePath=" + this.filePath + ", submissionValue=" + this.submissionValueId + ")";
        }
    }
}
