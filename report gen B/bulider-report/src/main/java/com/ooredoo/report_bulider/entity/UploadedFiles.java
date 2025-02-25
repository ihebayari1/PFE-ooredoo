package com.ooredoo.report_bulider.entity;

import jakarta.persistence.*;

@Entity
public class UploadedFiles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Long fileSize;
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "submission_value_id")
    private SubmissionValue submissionValue;

    public UploadedFiles(Long id, String originalFileName, String storedFileName, String fileType, Long fileSize, String filePath, SubmissionValue submissionValue) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.submissionValue = submissionValue;
    }

    public UploadedFiles() {
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

    public SubmissionValue getSubmissionValue() {
        return this.submissionValue;
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
        this.submissionValue = submissionValue;
    }
}
